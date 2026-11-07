import { SarvamAIClient } from 'sarvamai';
import { ExtractedDocument, CitizenProfile } from '@/types';

export interface AuditCheck {
  checkName: string;
  status: 'pass' | 'warning' | 'fail';
  details: string;
  affectedDocuments: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface AuditResult {
  overallStatus: 'clean' | 'warnings' | 'critical_mismatch';
  checks: AuditCheck[];
  rejectionRiskScore: number; // 0-100
  affidavitRequired: boolean;
  affidavitTemplate?: string;
  recommendations: string[];
  summary: string;
}

// --- Deterministic Pre-Checks ---

/**
 * Simple string similarity score (0-1) using Levenshtein distance.
 */
function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const len1 = s1.length;
  const len2 = s2.length;
  const dp: number[][] = Array.from({ length: len1 + 1 }, (_, i) =>
    Array.from({ length: len2 + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      dp[i][j] =
        s1[i - 1] === s2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const dist = dp[len1][len2];
  return 1 - dist / Math.max(len1, len2);
}

/**
 * Parse a date string (DD/MM/YYYY or YYYY-MM-DD) to a Date object.
 */
function parseDocDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  // Try DD/MM/YYYY
  const dm = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dm) return new Date(`${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}`);
  // Try YYYY-MM-DD
  const ym = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ym) return new Date(dateStr);
  // Try Month Name: "12 May 2024"
  const nm = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (nm) return new Date(`${nm[2]} ${nm[1]}, ${nm[3]}`);
  return null;
}

/**
 * Runs deterministic pre-checks BEFORE the LLM call, so the LLM can focus on nuanced analysis.
 */
function runDeterministicChecks(
  documents: ExtractedDocument[]
): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // 1. Name consistency across all documents
  const namesWithDoc: { name: string; docType: string }[] = documents
    .filter((d) => d.name)
    .map((d) => ({ name: d.name!, docType: d.document_type }));

  if (namesWithDoc.length >= 2) {
    let minSimilarity = 1;
    let worstPair: [string, string] = [namesWithDoc[0].name, namesWithDoc[1].name];
    let worstDocPair: [string, string] = [namesWithDoc[0].docType, namesWithDoc[1].docType];

    for (let i = 0; i < namesWithDoc.length; i++) {
      for (let j = i + 1; j < namesWithDoc.length; j++) {
        const sim = stringSimilarity(namesWithDoc[i].name, namesWithDoc[j].name);
        if (sim < minSimilarity) {
          minSimilarity = sim;
          worstPair = [namesWithDoc[i].name, namesWithDoc[j].name];
          worstDocPair = [namesWithDoc[i].docType, namesWithDoc[j].docType];
        }
      }
    }

    if (minSimilarity < 0.7) {
      checks.push({
        checkName: 'Name Consistency',
        status: 'fail',
        details: `Critical name mismatch: "${worstPair[0]}" vs "${worstPair[1]}". This will likely cause application rejection.`,
        affectedDocuments: [worstDocPair[0], worstDocPair[1]],
        severity: 'high'
      });
    } else if (minSimilarity < 0.9) {
      checks.push({
        checkName: 'Name Consistency',
        status: 'warning',
        details: `Minor name spelling variation: "${worstPair[0]}" vs "${worstPair[1]}". Recommend aligning spelling across all documents.`,
        affectedDocuments: [worstDocPair[0], worstDocPair[1]],
        severity: 'medium'
      });
    } else {
      checks.push({
        checkName: 'Name Consistency',
        status: 'pass',
        details: `Name matches consistently across all ${namesWithDoc.length} documents.`,
        affectedDocuments: namesWithDoc.map((n) => n.docType),
        severity: 'low'
      });
    }
  }

  // 2. Income certificate expiry (must be < 6 months old for most schemes)
  const incomeDoc = documents.find((d) => d.document_type === 'income_certificate');
  if (incomeDoc) {
    const issueDate = parseDocDate(incomeDoc.issue_date);
    if (issueDate) {
      const ageMonths = (Date.now() - issueDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (ageMonths > 12) {
        checks.push({
          checkName: 'Income Certificate Validity',
          status: 'fail',
          details: `Income certificate issued on ${incomeDoc.issue_date} is more than 12 months old. Most government schemes require a certificate issued within the last 6 months.`,
          affectedDocuments: ['income_certificate'],
          severity: 'high'
        });
      } else if (ageMonths > 6) {
        checks.push({
          checkName: 'Income Certificate Validity',
          status: 'warning',
          details: `Income certificate issued on ${incomeDoc.issue_date} is 6-12 months old. Some schemes may require a fresh certificate within 6 months. Verify with the concerned department.`,
          affectedDocuments: ['income_certificate'],
          severity: 'medium'
        });
      } else {
        checks.push({
          checkName: 'Income Certificate Validity',
          status: 'pass',
          details: `Income certificate is recent (issued ${Math.round(ageMonths)} months ago). Valid for most scheme applications.`,
          affectedDocuments: ['income_certificate'],
          severity: 'low'
        });
      }
    } else {
      checks.push({
        checkName: 'Income Certificate Validity',
        status: 'warning',
        details: `Could not detect issue date on the income certificate. Please verify the certificate is not older than 6 months.`,
        affectedDocuments: ['income_certificate'],
        severity: 'medium'
      });
    }
  }

  // 3. Address / State consistency between Aadhaar and Ration Card
  const aadhaar = documents.find((d) => d.document_type === 'aadhaar_card');
  const rationCard = documents.find((d) => d.document_type === 'ration_card');
  if (aadhaar && rationCard && aadhaar.state && rationCard.state) {
    const stateSim = stringSimilarity(aadhaar.state, rationCard.state);
    if (stateSim < 0.7) {
      checks.push({
        checkName: 'State/Address Consistency',
        status: 'fail',
        details: `State mismatch: Aadhaar shows "${aadhaar.state}" but Ration Card shows "${rationCard.state}". This may disqualify you from state-specific schemes.`,
        affectedDocuments: ['aadhaar_card', 'ration_card'],
        severity: 'high'
      });
    } else {
      checks.push({
        checkName: 'State/Address Consistency',
        status: 'pass',
        details: `State/address is consistent between Aadhaar (${aadhaar.state}) and Ration Card (${rationCard.state}).`,
        affectedDocuments: ['aadhaar_card', 'ration_card'],
        severity: 'low'
      });
    }
  }

  // 4. Bank seeding check — look in raw_text
  const bankMentionDocs = documents.filter(
    (d) =>
      d.raw_text?.toLowerCase().includes('bank') ||
      d.raw_text?.toLowerCase().includes('dbt') ||
      d.raw_text?.toLowerCase().includes('ifsc') ||
      d.raw_text?.toLowerCase().includes('account')
  );
  if (bankMentionDocs.length === 0) {
    checks.push({
      checkName: 'DBT Bank Linking',
      status: 'warning',
      details:
        'No bank account or DBT seeding information found in uploaded documents. Many Central schemes (PM-KISAN, PM-SYM, Ayushman) require Aadhaar-linked bank accounts for direct benefit transfer.',
      affectedDocuments: documents.map((d) => d.document_type),
      severity: 'medium'
    });
  } else {
    checks.push({
      checkName: 'DBT Bank Linking',
      status: 'pass',
      details: 'Bank/DBT information detected. Ensure your bank account is Aadhaar-seeded for smooth benefit transfer.',
      affectedDocuments: bankMentionDocs.map((d) => d.document_type),
      severity: 'low'
    });
  }

  return checks;
}

/**
 * Affidavit template generator — produces a formal Hindi/Marathi correction-request template.
 */
function generateAffidavitTemplate(
  issues: AuditCheck[],
  citizenName: string,
  language: 'hi-IN' | 'mr-IN' | 'en-IN'
): string {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const issueList = issues
    .filter((c) => c.status !== 'pass')
    .map((c, i) => `${i + 1}. ${c.details}`)
    .join('\n');

  if (language === 'mr-IN') {
    return `शपथपत्र / दुरुस्ती विनंती अर्ज

दिनांक: ${dateStr}
नाव: ${citizenName || '[आपले नाव]'}

मी, ${citizenName || '[नाव]'}, सदर शपथपत्र सादर करतो/करते की माझ्या सरकारी कागदपत्रांमध्ये खालील विसंगती आढळल्या आहेत:

${issueList}

मी यांद्वारे घोषणा करतो/करते की उपरोक्त माहिती खरी आणि अचूक आहे. सक्षम प्राधिकाऱ्यांनी माझ्या कागदपत्रांमधील चुका दुरुस्त कराव्यात अशी नम्र विनंती आहे.

हे शपथपत्र माझ्या स्वेच्छेने आणि पूर्ण जाणिवेने दिले आहे.

घोषणाकर्त्याची स्वाक्षरी: _______________
नाव: ${citizenName || '______________'}
दिनांक: ${dateStr}

नोंद: हे एक नमुना शपथपत्र आहे. कृपया सरकारी दफ्तरात जाऊन योग्य अधिकृत शपथपत्र मिळवा.`;
  }

  if (language === 'en-IN') {
    return `AFFIDAVIT / CORRECTION REQUEST

Date: ${dateStr}
Name: ${citizenName || '[Your Name]'}

I, ${citizenName || '[Name]'}, hereby submit this affidavit stating that the following discrepancies have been identified in my government documents:

${issueList}

I hereby declare that the above information is true and correct to the best of my knowledge. I respectfully request the concerned authority to correct the discrepancies in my documents.

This affidavit is submitted voluntarily and with full awareness.

Signature of Declarant: _______________
Name: ${citizenName || '______________'}
Date: ${dateStr}

Note: This is a sample affidavit template. Please obtain a legally attested affidavit from the appropriate government office or notary.`;
  }

  // Default: Hindi
  return `शपथ पत्र / सुधार आवेदन

दिनांक: ${dateStr}
नाम: ${citizenName || '[आपका नाम]'}

मैं, ${citizenName || '[नाम]'}, इस शपथ पत्र के माध्यम से घोषित करता/करती हूँ कि मेरे सरकारी दस्तावेज़ों में निम्नलिखित विसंगतियाँ पाई गई हैं:

${issueList}

मैं यह घोषित करता/करती हूँ कि उपरोक्त जानकारी मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है। मैं सक्षम प्राधिकारी से विनम्र निवेदन करता/करती हूँ कि मेरे दस्तावेज़ों में पाई गई त्रुटियों को शीघ्र सुधारा जाए।

यह शपथ पत्र मेरी स्वेच्छा से और पूर्ण जागरूकता के साथ प्रस्तुत किया गया है।

घोषणाकर्ता के हस्ताक्षर: _______________
नाम: ${citizenName || '______________'}
दिनांक: ${dateStr}

नोट: यह एक नमूना शपथ पत्र है। कृपया संबंधित सरकारी कार्यालय या नोटरी से विधिवत शपथ पत्र प्राप्त करें।`;
}

/**
 * Main audit function: runs deterministic checks + Sarvam-105B cross-document analysis.
 */
export async function runDocumentAudit(
  documents: ExtractedDocument[],
  profile: CitizenProfile,
  language: 'hi-IN' | 'mr-IN' | 'en-IN' = 'hi-IN'
): Promise<AuditResult> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured. Please add it to your .env file.');
  }

  if (documents.length === 0) {
    throw new Error('No documents provided for audit. Please upload at least one document.');
  }

  // Step 1: Run deterministic checks
  const deterministicChecks = runDeterministicChecks(documents);

  // Step 2: LLM-powered cross-document analysis
  const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

  const docSummary = documents.map((d, i) => ({
    index: i + 1,
    type: d.document_type,
    name: d.name,
    income: d.annual_income,
    state: d.state,
    district: d.district,
    category: d.category,
    issue_date: d.issue_date,
    confidence: d.confidence,
    missing_fields: d.missing_fields,
    inconsistencies: d.inconsistencies
  }));

  const auditPrompt = `You are a senior government document verification officer in India. Analyze the following extracted government documents for a citizen applying for social welfare schemes.

CITIZEN PROFILE:
${JSON.stringify(profile, null, 2)}

EXTRACTED DOCUMENTS (${documents.length} total):
${JSON.stringify(docSummary, null, 2)}

PRELIMINARY CHECKS ALREADY RUN (deterministic):
${JSON.stringify(deterministicChecks.map(c => ({ check: c.checkName, status: c.status, details: c.details })), null, 2)}

Your task: Perform an ADDITIONAL intelligent cross-document consistency audit. Look for:
1. Inconsistencies NOT already caught above (e.g. income declared in documents vs. profile, category mismatches, district vs state conflicts)
2. Missing critical fields that are required for common schemes
3. Potential issues with document authenticity or completeness
4. Any red flags that commonly cause application rejection at government offices

Respond ONLY with valid JSON in this exact structure (no markdown, no explanation outside JSON):
{
  "additionalChecks": [
    {
      "checkName": "string (concise, e.g. 'Income vs Ration Card Category')",
      "status": "pass|warning|fail",
      "details": "string (1-2 sentences, plain language, mention specific values)",
      "affectedDocuments": ["document_type1"],
      "severity": "low|medium|high"
    }
  ],
  "recommendations": ["string (actionable, specific)", "..."],
  "summary": "string (2-3 sentences overall audit summary in ${language === 'mr-IN' ? 'Marathi' : language === 'en-IN' ? 'English' : 'Hindi'})"
}`;

  let additionalChecks: AuditCheck[] = [];
  let llmRecommendations: string[] = [];
  let llmSummary = '';

  try {
    const response = await client.chat.completions({
      model: 'sarvam-105b',
      messages: [{ role: 'user', content: auditPrompt }],
      temperature: 0.2,
      max_tokens: 1200
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      additionalChecks = Array.isArray(parsed.additionalChecks) ? parsed.additionalChecks : [];
      llmRecommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      llmSummary = typeof parsed.summary === 'string' ? parsed.summary : '';
    }
  } catch (err: any) {
    console.warn('Sarvam-105B audit analysis failed, using deterministic checks only:', err?.message);
    // Fallback: use deterministic checks only
    llmRecommendations = [
      'Upload all required documents before applying to any scheme.',
      'Ensure your name spelling is identical across all government documents.',
      'Renew your income certificate if it is older than 6 months.',
      'Link your Aadhaar card to your bank account for DBT (Direct Benefit Transfer).'
    ];
    llmSummary = language === 'mr-IN'
      ? 'तुमच्या कागदपत्रांचे विश्लेषण पूर्ण झाले. कृपया सुधारणेच्या शिफारशी पाळा.'
      : language === 'en-IN'
      ? 'Document analysis complete. Please follow the recommendations to minimize rejection risk.'
      : 'दस्तावेज़ विश्लेषण पूर्ण हुआ। कृपया योजनाओं के लिए आवेदन करने से पहले सुझाई गई सुधार करें।';
  }

  // Step 3: Merge all checks
  const allChecks: AuditCheck[] = [...deterministicChecks, ...additionalChecks];

  // Step 4: Calculate rejection risk score
  let riskScore = 0;
  for (const c of allChecks) {
    if (c.status === 'fail') {
      riskScore += c.severity === 'high' ? 30 : c.severity === 'medium' ? 15 : 8;
    } else if (c.status === 'warning') {
      riskScore += c.severity === 'high' ? 15 : c.severity === 'medium' ? 8 : 3;
    }
  }
  riskScore = Math.min(100, riskScore);

  // Step 5: Determine overall status
  const hasCritical = allChecks.some((c) => c.status === 'fail' && c.severity === 'high');
  const hasWarnings = allChecks.some((c) => c.status !== 'pass');
  const overallStatus: AuditResult['overallStatus'] = hasCritical
    ? 'critical_mismatch'
    : hasWarnings
    ? 'warnings'
    : 'clean';

  // Step 6: Determine if affidavit is needed
  const failedChecks = allChecks.filter((c) => c.status !== 'pass');
  const affidavitRequired = allChecks.some(
    (c) => c.status === 'fail' && (c.checkName === 'Name Consistency' || c.checkName === 'State/Address Consistency')
  );

  const citizenName = profile.name || documents.find((d) => d.name)?.name || '';

  const affidavitTemplate = affidavitRequired
    ? generateAffidavitTemplate(failedChecks, citizenName, language)
    : undefined;

  // Step 7: Final recommendations
  const finalRecommendations: string[] = Array.from(new Set(llmRecommendations));
  if (riskScore > 60) {
    finalRecommendations.unshift(
      language === 'mr-IN'
        ? 'तात्काळ: जमा करण्यापूर्वी सर्व कागदपत्रे सुधारा. नकार होण्याचा धोका जास्त आहे.'
        : language === 'en-IN'
        ? 'URGENT: Correct all document discrepancies before submitting. Rejection risk is HIGH.'
        : 'तत्काल: जमा करने से पहले सभी दस्तावेज़ सुधारें। अस्वीकृति का जोखिम अधिक है।'
    );
  }

  const defaultSummary = language === 'mr-IN'
    ? `${allChecks.filter(c => c.status === 'pass').length} तपासण्या उत्तीर्ण, ${allChecks.filter(c => c.status === 'warning').length} इशारे, ${allChecks.filter(c => c.status === 'fail').length} गंभीर समस्या आढळल्या. नकाराचा धोका: ${riskScore}%.`
    : language === 'en-IN'
    ? `${allChecks.filter(c => c.status === 'pass').length} checks passed, ${allChecks.filter(c => c.status === 'warning').length} warnings, ${allChecks.filter(c => c.status === 'fail').length} critical issues. Rejection risk: ${riskScore}%.`
    : `${allChecks.filter(c => c.status === 'pass').length} जाँच पास, ${allChecks.filter(c => c.status === 'warning').length} चेतावनी, ${allChecks.filter(c => c.status === 'fail').length} गंभीर समस्याएं। अस्वीकृति जोखिम: ${riskScore}%.`;

  return {
    overallStatus,
    checks: allChecks,
    rejectionRiskScore: riskScore,
    affidavitRequired,
    affidavitTemplate,
    recommendations: finalRecommendations.slice(0, 6),
    summary: llmSummary || defaultSummary
  };
}

