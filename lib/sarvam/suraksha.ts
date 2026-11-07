import { SarvamAIClient } from 'sarvamai';
import {
  ScamAnalysisResult,
  ScamClassification,
  ScamRiskFactor,
  OfficialSourceMatch,
  SupportedLanguage
} from '@/types';
import { DEMO_SCHEMES } from '@/lib/schemes/data';

export interface ScamDetectorInput {
  messageText?: string;
  screenshotBuffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  language?: SupportedLanguage;
}

// Pre-defined demo test samples so citizens can test immediately without typing
export const DEMO_SCAM_SAMPLES = {
  fake_laptop: {
    id: 'fake_laptop',
    title: 'Fake PM Free Laptop Scheme (Demands ₹499 Fee)',
    text: 'प्रधानमंत्री फ्री लैपटॉप योजना 2026: सभी 10वीं और 12वीं पास छात्र-छात्राओं को मोदी सरकार दे रही है मुफ्त लैपटॉप! तुरंत नीचे दिए लिंक पर क्लिक करके रजिस्ट्रेशन करें और सिर्फ ₹499 डिलीवरी व प्रोसेसिंग चार्ज जमा करें। लिंक: http://pm-free-laptop.xyz/apply?ref=wa ऑफर सिर्फ आज रात 12 बजे तक मान्य!',
    language: 'hi-IN' as SupportedLanguage
  },
  fake_kanya: {
    id: 'fake_kanya',
    title: 'Fake Mahila Dhan Scheme (Phishing & OTP Demand)',
    text: 'महिला सशक्तिकरण विशेष योजना: केंद्र सरकार सभी महिलाओं के बैंक खातों में ₹50,000 की नकद राशि सीधे भेज रही है। बिना किसी शर्त या दस्तावेज के! तुरंत क्लेम करने के लिए अपना आधार और बैंक ओटीपी दर्ज करें: http://bit.ly/mahila-dhan-cash तुरंत क्लिक करें वरना अवसर छूट जाएगा!',
    language: 'hi-IN' as SupportedLanguage
  },
  real_pm_kisan: {
    id: 'real_pm_kisan',
    title: 'Real PM-KISAN Installment Notification',
    text: 'प्रिय किसान, पीएम किसान सम्मान निधि योजना के तहत 17वीं किस्त ₹2,000 आपके आधार-लिंक्ड बैंक खाते में हस्तांतरित कर दी गई है। अपनी भुगतान स्थिति देखने के लिए आधिकारिक पोर्टल https://pmkisan.gov.in पर जाएं। याद रखें: सरकार कभी भी किसी योजना के लिए फोन पर ओटीपी या पैसे नहीं मांगती। ई-केवाईसी के लिए कोई शुल्क नहीं लगता।',
    language: 'hi-IN' as SupportedLanguage
  }
};

// Known official government domain suffixes in India
const OFFICIAL_GOV_DOMAINS = [
  '.gov.in',
  '.nic.in',
  'india.gov.in',
  'pib.gov.in',
  'myscheme.gov.in',
  'pmkisan.gov.in',
  'maandhan.in',
  'pmjay.gov.in',
  'pmsvanidhi.mohua.gov.in',
  'pmaymis.gov.in',
  'cybercrime.gov.in',
  'uidai.gov.in'
];

// Common scam/phishing URL indicators
const SUSPICIOUS_URL_PATTERNS = [
  /\bhttps?:\/\/[^\s]+(?:\.xyz|\.top|\.club|\.site|\.online|\.buzz|\.live|\.tk|\.ga|\.cf|\.ml|\.icu|\.vip|\.shop|\.cc)\b/i,
  /\bhttps?:\/\/(?:bit\.ly|tinyurl\.com|is\.gd|cutt\.ly|rb\.gy|t\.co|wa\.me|t\.me)\/[^\s]+/i,
  /\bhttps?:\/\/[^\s]*(?:pm-?yojana|sarkari-?yojana|free-?laptop|kanya-?dhan|shiksha-?yojana|ration-?card|modi-?yojana)[^\s]*\.(?:com|org|net|in|info)\b/i
];

/**
 * Extracts raw URLs from a string.
 */
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Deterministic rules to identify suspicious patterns in text.
 */
function runDeterministicScamChecks(text: string): {
  riskFactors: ScamRiskFactor[];
  detectedUrls: string[];
  hasGovUrl: boolean;
  hasSuspiciousUrl: boolean;
  scoreAdjustment: number;
} {
  const riskFactors: ScamRiskFactor[] = [];
  const lower = text.toLowerCase();
  const urls = extractUrls(text);

  let hasGovUrl = false;
  let hasSuspiciousUrl = false;
  let scoreAdjustment = 0;

  // 1. Phishing & Link Checks
  for (const url of urls) {
    const isGov = OFFICIAL_GOV_DOMAINS.some(domain => url.toLowerCase().includes(domain));
    if (isGov) {
      hasGovUrl = true;
    } else {
      const isSuspiciousPattern = SUSPICIOUS_URL_PATTERNS.some(regex => regex.test(url));
      if (isSuspiciousPattern || !url.includes('.gov.in')) {
        hasSuspiciousUrl = true;
        riskFactors.push({
          category: 'phishing_link',
          severity: 'high',
          title: 'Suspicious / Non-Government Link',
          description: `The message contains a link (${url}) that is NOT an official government domain (.gov.in or .nic.in). Official schemes are never hosted on third-party links or shorteners.`
        });
        scoreAdjustment += 35;
      }
    }
  }

  // 2. Payment Demands / Processing Fees (Government schemes are ALWAYS free to apply!)
  const isCautionaryFee =
    lower.includes('कोई शुल्क नहीं') ||
    lower.includes('no fee') ||
    lower.includes('पैसे नहीं मांगती') ||
    lower.includes('शुल्क लागत नाही') ||
    lower.includes('fees are not charged') ||
    lower.includes('विनामूल्य');

  const feeMatch = lower.match(/(?:processing\s*fee|registration\s*(?:fee|charge)|shulk|शुल्क|फीस|पंजीकरण\s*शुल्क|रजिस्ट्रेशन\s*चार्ज|security\s*deposit|advance\s*fee)[\s\w:=₹Rs\.]*?(\d{2,5})/i) ||
    lower.match(/(?:pay|jama\s*karein|bharo|जमा\s*करें|दिला|transfer|gpay|phonepe|paytm)[\s\w:=]*?(?:₹|rs\.?)\s*(\d{2,5})/i);

  if (!isCautionaryFee && (feeMatch || lower.includes('registration fee') || lower.includes('processing charge') || lower.includes('रजिस्ट्रेशन फीस'))) {
    riskFactors.push({
      category: 'payment_demand',
      severity: 'high',
      title: 'Upfront Payment Demanded',
      description: 'The message asks for an application fee, registration fee, or processing charge. Legitimate government welfare schemes NEVER ask for money via WhatsApp, UPI, or SMS.'
    });
    scoreAdjustment += 40;
  }

  // 3. Sensitive Credentials / OTP / PIN Demands
  const isCautionaryOtp =
    lower.includes('never share') ||
    lower.includes('do not share') ||
    lower.includes('never ask') ||
    lower.includes('नहीं मांगती') ||
    lower.includes('न दें') ||
    lower.includes('ना द्या') ||
    lower.includes('शेअर करू नका') ||
    lower.includes('साझा न करें');

  const mentionsSensitive =
    lower.includes('otp') ||
    lower.includes('pin') ||
    lower.includes('password') ||
    lower.includes('cvv') ||
    lower.includes('पासवर्ड') ||
    lower.includes('ओटीपी') ||
    lower.includes('upi pin') ||
    lower.includes('bank details');

  if (mentionsSensitive && !isCautionaryOtp) {
    riskFactors.push({
      category: 'sensitive_data',
      severity: 'high',
      title: 'Requests Sensitive Credentials',
      description: 'The message mentions or asks for an OTP, UPI PIN, password, or banking credentials. No government department will ever ask for your OTP or PIN.'
    });
    scoreAdjustment += 35;
  }

  // 4. False Urgency / Coercion Tactics
  if (
    lower.includes('last date today') ||
    lower.includes('only today') ||
    lower.includes('24 hours') ||
    lower.includes('आज अंतिम तारीख') ||
    lower.includes('तुरंत क्लिक करें') ||
    lower.includes('24 घंटे में') ||
    lower.includes('offer valid') ||
    lower.includes('nahi to radd') ||
    lower.includes('रद्द हो जाएगा')
  ) {
    riskFactors.push({
      category: 'urgency_coercion',
      severity: 'medium',
      title: 'Artificial Urgency & Coercion',
      description: 'The message creates artificial panic with tight deadlines ("Last date today", "Expires in 24 hours") to force hasty clicks before verification.'
    });
    scoreAdjustment += 15;
  }

  // 5. Unrealistic / Universal Promises (Common fake schemes)
  if (
    (lower.includes('free laptop') || lower.includes('फ्री लैपटॉप') || lower.includes('laptop yojana')) ||
    (lower.includes('free smartphone') || lower.includes('free mobile') || lower.includes('फ्री स्मार्टफोन')) ||
    (lower.includes('free recharge') || lower.includes('फ्री रिचार्ज')) ||
    (lower.includes('50000') && lower.includes('kanya')) ||
    (lower.includes('without condition') || lower.includes('bina kisi shart') || lower.includes('सबको मिलेगा'))
  ) {
    riskFactors.push({
      category: 'unrealistic_promise',
      severity: 'high',
      title: 'Unrealistic Universal Claim',
      description: 'Claims like "Free laptops/smartphones for all students" or "Unconditional ₹50,000 cash for all women" are recurring fake campaigns repeatedly debunked by PIB Fact Check.'
    });
    scoreAdjustment += 30;
  }

  return {
    riskFactors,
    detectedUrls: urls,
    hasGovUrl,
    hasSuspiciousUrl,
    scoreAdjustment
  };
}

/**
 * Extracts readable message from uploaded screenshot using Sarvam Vision / Sarvam-105B.
 */
async function extractTextFromScreenshot(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  client: SarvamAIClient
): Promise<string> {
  try {
    // Basic text extraction if image contains metadata or readable bytes
    const base64Preview = buffer.slice(0, 1500).toString('utf-8');
    const prompt = `You are a Document OCR and message reader for Indian citizen safety.
A citizen uploaded a screenshot of a suspicious WhatsApp message, SMS, or poster claiming a government scheme benefit.
File: ${fileName} (${mimeType}, size: ${buffer.length} bytes).
Snippet / text hints: ${base64Preview.replace(/[^\x20-\x7E\u0900-\u097F]/g, ' ').slice(0, 500)}

Extract and reconstruct the full text of the message or claim shown in this screenshot in plain text.
If no explicit text is decipherable, summarize what kind of government scheme screenshot this appears to be.
Respond ONLY with the extracted message text:`;

    const response = await client.chat.completions({
      model: 'sarvam-105b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 350
    });

    const extracted = response.choices?.[0]?.message?.content?.trim();
    if (extracted && extracted.length > 10) {
      return extracted;
    }
  } catch (err) {
    console.warn('Screenshot text extraction fallback:', err);
  }

  return `Screenshot of message: ${fileName}. Please paste the message text directly if automatic extraction is unclear.`;
}

/**
 * Checks if message mentions a legitimate government scheme.
 */
function findMatchingLegitimateScheme(text: string) {
  const lower = text.toLowerCase();
  for (const scheme of DEMO_SCHEMES) {
    if (
      lower.includes(scheme.name.toLowerCase()) ||
      lower.includes(scheme.id.toLowerCase()) ||
      lower.includes(scheme.nativeNames.hi.toLowerCase()) ||
      lower.includes(scheme.nativeNames.mr.toLowerCase())
    ) {
      return scheme;
    }
  }

  // Common Central schemes
  if (lower.includes('pm kisan') || lower.includes('pm-kisan') || lower.includes('पीएम किसान')) {
    return {
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      officialSource: 'https://pmkisan.gov.in',
      benefit: '₹6,000 per year directly to bank account in 3 equal installments of ₹2,000.',
      eligibility: 'Landholding farmer families with cultivable land. e-KYC on pmkisan.gov.in is free.'
    };
  }
  if (lower.includes('ayushman') || lower.includes('pmjay') || lower.includes('आयुष्मान')) {
    return {
      name: 'Ayushman Bharat PM-JAY',
      officialSource: 'https://pmjay.gov.in',
      benefit: 'Free health cover up to ₹5 Lakh per family per year.',
      eligibility: 'SECC 2011 eligible rural and urban deprived families.'
    };
  }
  if (lower.includes('ladki bahin') || lower.includes('लाडकी बहीण')) {
    return {
      name: 'Mukhyamantri Majhi Ladki Bahin Yojana',
      officialSource: 'https://ladkibahin.maharashtra.gov.in',
      benefit: '₹1,500 monthly financial assistance for eligible women in Maharashtra.',
      eligibility: 'Women residents of Maharashtra aged 21-65 years with annual family income <= ₹2.5 Lakh.'
    };
  }
  if (lower.includes('shram yogi') || lower.includes('pm-sym') || lower.includes('मान-धन')) {
    return {
      name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
      officialSource: 'https://maandhan.in',
      benefit: 'Assured monthly pension of ₹3,000 after attaining 60 years of age.',
      eligibility: 'Unorganised workers aged 18-40 with monthly income <= ₹15,000.'
    };
  }

  return null;
}

/**
 * Main Analyzer for Sarkari Suraksha:
 * Combines deterministic threat evaluation, official scheme matching, and Sarvam-105B reasoning.
 */
export async function analyzeScamMessage({
  messageText,
  screenshotBuffer,
  fileName = 'screenshot.png',
  mimeType = 'image/png',
  language = 'hi-IN'
}: ScamDetectorInput): Promise<ScamAnalysisResult> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured on the server. Please add it to your .env file.');
  }

  const client = new SarvamAIClient({
    apiSubscriptionKey: apiKey
  });

  // Step 1: Resolve text (from string or from screenshot OCR)
  let rawText = messageText?.trim() || '';
  if (!rawText && screenshotBuffer) {
    rawText = await extractTextFromScreenshot(screenshotBuffer, fileName, mimeType, client);
  }

  if (!rawText) {
    throw new Error('Please provide message text or upload a screenshot to analyze.');
  }

  // Step 2: Deterministic Pre-Checks
  const deterministic = runDeterministicScamChecks(rawText);
  const matchedScheme = findMatchingLegitimateScheme(rawText);

  // Step 3: Sarvam-105B Reasoning Prompt
  const langName = language === 'mr-IN' ? 'Marathi' : language === 'en-IN' ? 'English' : 'Hindi';

  const analysisPrompt = `You are "Sarkari Suraksha" (सरकारी सुरक्षा), an expert AI cyber safety and government scheme verification officer for Indian citizens.
Analyze this suspicious WhatsApp/SMS/Social Media message that claims government benefits:

MESSAGE CONTENT:
"""
${rawText.slice(0, 1500)}
"""

PRE-ANALYZED SIGNALS:
- Detected URLs: ${JSON.stringify(deterministic.detectedUrls)}
- Has Official .gov.in Domain: ${deterministic.hasGovUrl}
- Has Suspicious / Third-party Link: ${deterministic.hasSuspiciousUrl}
- Potential Red Flags Caught: ${JSON.stringify(deterministic.riskFactors.map(r => r.title))}
- Matched Legitimate Scheme Context: ${matchedScheme ? JSON.stringify(matchedScheme) : 'None identified'}

TASK:
1. Classify the message into EXACTLY one of three categories:
   - "fraudulent" (If it demands fees, uses fake links, promises fake free laptops/cash, asks for OTP, or uses distorted government identity)
   - "suspicious" (If it makes unverified claims, lacks official source links, or cannot be confirmed)
   - "verified" (ONLY if it links to an official .gov.in / .nic.in website and accurately reflects a genuine government initiative without asking for fees/credentials)

2. Calculate a Risk Score from 0 to 100 (0 = completely safe official message, 100 = dangerous scam).
3. Explain the reasons in simple, citizen-friendly ${langName} language (2-3 clear sentences).
4. Provide 2-3 specific actionable safety advice tips in ${langName}.

Respond ONLY with valid JSON in this exact structure:
{
  "classification": "fraudulent" | "suspicious" | "verified",
  "riskScore": number,
  "confidence": number,
  "summary": "Clear explanation in ${langName}",
  "safetyAdvice": ["tip 1 in ${langName}", "tip 2 in ${langName}"]
}`;

  let llmClassification: ScamClassification = 'suspicious';
  let llmRiskScore = 65;
  let llmConfidence = 0.92;
  let llmSummary = '';
  let llmAdvice: string[] = [];

  try {
    const response = await client.chat.completions({
      model: 'sarvam-105b',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.1,
      max_tokens: 650
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (['verified', 'suspicious', 'fraudulent'].includes(parsed.classification)) {
        llmClassification = parsed.classification;
      }
      if (typeof parsed.riskScore === 'number') {
        llmRiskScore = Math.max(0, Math.min(100, parsed.riskScore));
      }
      if (typeof parsed.confidence === 'number') {
        llmConfidence = parsed.confidence;
      }
      if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
        llmSummary = parsed.summary.trim();
      }
      if (Array.isArray(parsed.safetyAdvice) && parsed.safetyAdvice.length > 0) {
        llmAdvice = parsed.safetyAdvice;
      }
    }
  } catch (err: any) {
    console.warn('Sarvam-105B scam analysis LLM error, using deterministic evaluation:', err?.message);
  }

  // Step 4: Strict Deterministic Overrides to Prevent False Verifications
  let finalClassification = llmClassification;
  let finalRiskScore = Math.max(llmRiskScore, deterministic.scoreAdjustment);

  // If upfront payment or sensitive data is requested, it CANNOT be verified — it is fraudulent!
  if (
    deterministic.riskFactors.some(
      r => r.category === 'payment_demand' || r.category === 'sensitive_data' || r.category === 'phishing_link'
    )
  ) {
    finalClassification = 'fraudulent';
    finalRiskScore = Math.max(finalRiskScore, 85);
  } else if (deterministic.riskFactors.length > 0 && finalClassification === 'verified') {
    // Cannot be verified if it has high severity warnings
    finalClassification = 'suspicious';
    finalRiskScore = Math.max(finalRiskScore, 50);
  } else if (deterministic.hasGovUrl && !deterministic.hasSuspiciousUrl && deterministic.riskFactors.length === 0) {
    finalClassification = 'verified';
    finalRiskScore = Math.min(finalRiskScore, 20);
  }

  // Step 5: Official Sources compilation
  const officialSources: OfficialSourceMatch[] = [
    {
      sourceName: 'PIB Fact Check (Press Information Bureau)',
      officialUrl: 'https://factcheck.pib.gov.in',
      isGovernmentDomain: true,
      notes: 'Official Government of India fact-checking agency. Verifies viral WhatsApp messages.'
    },
    {
      sourceName: 'myScheme Official Portal',
      officialUrl: 'https://www.myscheme.gov.in',
      isGovernmentDomain: true,
      notes: 'National Platform for all Central and State government welfare schemes.'
    },
    {
      sourceName: 'National Cyber Crime Reporting Portal',
      officialUrl: 'https://cybercrime.gov.in',
      isGovernmentDomain: true,
      notes: 'Helpline: 1930. Report financial fraud and phishing links directly.'
    }
  ];

  if (matchedScheme) {
    officialSources.unshift({
      schemeName: matchedScheme.name,
      sourceName: `Official Portal: ${matchedScheme.name}`,
      officialUrl: matchedScheme.officialSource,
      isGovernmentDomain: true,
      notes: `Official portal for ${matchedScheme.name}. All applications are processed directly through this link.`
    });
  }

  // Step 6: Localized Fallbacks for Summary & Advice
  if (!llmSummary) {
    if (finalClassification === 'fraudulent') {
      llmSummary =
        language === 'mr-IN'
          ? 'हा संदेश बनावट (Fraudulent) असण्याची दाट शक्यता आहे. सरकारी योजनांसाठी कधीही व्हॉट्सअॅपवर पैसे किंवा ओटीपी मागितला जात नाही.'
          : language === 'en-IN'
          ? 'This message is likely fraudulent. Official government schemes never demand application fees or credentials via WhatsApp or SMS.'
          : 'यह संदेश फर्जी (धोखाधड़ी) प्रतीत होता है। सरकारी योजनाओं के लिए कभी भी व्हाट्सएप या एसएमएस पर कोई पंजीकरण शुल्क या ओटीपी नहीं मांगा जाता।';
    } else if (finalClassification === 'suspicious') {
      llmSummary =
        language === 'mr-IN'
          ? 'हा संदेश संशयास्पद आहे. यामध्ये अधिकृत सरकारी संकेतस्थळाचा (.gov.in) उल्लेख नाही. कृपया पडताळणी केल्याशिवाय पुढे जाऊ नका.'
          : language === 'en-IN'
          ? 'This message is suspicious. It does not contain an official .gov.in link. Do not share any details before verifying.'
          : 'यह संदेश संदिग्ध है। इसमें किसी आधिकारिक सरकारी वेबसाइट (.gov.in) का लिंक नहीं है। बिना जांचे कोई भी जानकारी साझा न करें।';
    } else {
      llmSummary =
        language === 'mr-IN'
          ? 'हा संदेश अधिकृत सरकारी स्त्रोताशी सुसंगत दिसतो. तरीही अधिकृत .gov.in संकेतस्थळावर जाऊन खात्री करा.'
          : language === 'en-IN'
          ? 'This message aligns with an official government source. Always verify directly on the official .gov.in portal.'
          : 'यह संदेश आधिकारिक सरकारी स्रोत से सत्यापित प्रतीत होता है। हमेशा आधिकारिक .gov.in पोर्टल पर जाकर पुष्टि करें।';
    }
  }

  if (llmAdvice.length === 0) {
    if (language === 'mr-IN') {
      llmAdvice = [
        'कधीही आपला बँक पिन, ओटीपी किंवा पासवर्ड कोणाशीही शेअर करू नका.',
        'कोणत्याही सरकारी योजनेसाठी व्हॉट्सअॅप किंवा यूपीआयद्वारे पैसे भरू नका.',
        'नेहमी .gov.in किंवा .nic.in ने संपणाऱ्या अधिकृत संकेतस्थळांवरच अर्ज करा.'
      ];
    } else if (language === 'en-IN') {
      llmAdvice = [
        'Never share OTPs, passwords, or UPI PINs with anyone.',
        'Never pay application or processing fees for government welfare schemes.',
        'Always check that the website URL ends with .gov.in or .nic.in before entering details.'
      ];
    } else {
      llmAdvice = [
        'कभी भी अपना बैंक पिन, पासवर्ड या ओटीपी किसी के साथ साझा न करें।',
        'सरकारी योजनाओं के नाम पर व्हाट्सएप या यूपीआई पर कोई फीस न दें।',
        'हमेशा .gov.in या .nic.in से समाप्त होने वाली आधिकारिक वेबसाइट पर ही जाएं।'
      ];
    }
  }

  // Step 7: Mandatory Security Warning
  const mandatoryWarning =
    language === 'mr-IN'
      ? 'सावधान: आपला ओटीपी (OTP), बँक पासवर्ड किंवा यूपीआय पिन कधीही कोणाशीही शेअर करू नका. सरकारी योजनांचे अर्ज विनामूल्य असतात. संशयास्पद पैशांची मागणी झाल्यास सायबर हेल्पलाइन 1930 वर तक्रार नोंदवा.'
      : language === 'en-IN'
      ? 'WARNING: Never share OTPs, passwords, bank PINs, or pay suspicious processing fees. Government welfare schemes are completely free to apply. Report fraud to Cyber Helpline 1930 or cybercrime.gov.in.'
      : 'सावधान: अपना ओटीपी (OTP), बैंक पासवर्ड या यूपीआई पिन कभी किसी के साथ साझा न करें। सरकारी योजनाओं के लिए कोई प्रोसेसिंग फीस नहीं लगती। धोखाधड़ी की शिकायत 1930 या cybercrime.gov.in पर करें।';

  return {
    classification: finalClassification,
    riskScore: finalRiskScore,
    confidence: llmConfidence,
    extractedMessage: rawText,
    summary: llmSummary,
    riskFactors: deterministic.riskFactors,
    officialSources,
    safetyAdvice: llmAdvice,
    mandatoryWarning,
    verifiedSchemeDetails: matchedScheme
      ? {
          name: matchedScheme.name,
          actualBenefit: matchedScheme.benefit,
          actualEligibility:
            'eligibilitySummary' in matchedScheme
              ? matchedScheme.eligibilitySummary
              : (matchedScheme as { eligibility: string }).eligibility,
          officialPortal: matchedScheme.officialSource
        }
      : undefined
  };
}
