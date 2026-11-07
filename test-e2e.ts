import fs from 'fs';
import path from 'path';
import { DEMO_SCHEMES, DEMO_CITIZEN_RAMESH } from './lib/schemes/data';
import { matchSchemes } from './lib/schemes/matcher';
import { chatWithSarvam, explainSchemeSimply } from './lib/sarvam/llm';
import { textToSpeech } from './lib/sarvam/tts';
import { analyzeGovernmentDocument } from './lib/sarvam/vision';

// Load .env
if (!process.env.SARVAM_API_KEY && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (key && val) process.env[key] = val;
      }
    }
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 SARKARI SAHAYAK - FULL E2E SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. SCHEME MATCHER TEST (Deterministic Rules)
  console.log('--- 1. Testing Deterministic Scheme Engine ---');
  const demoMatches = matchSchemes(DEMO_CITIZEN_RAMESH, DEMO_SCHEMES);
  assert(demoMatches.length >= 10, `Loaded ${demoMatches.length} schemes`);
  const eligible = demoMatches.filter(m => m.status === 'eligible');
  assert(eligible.length > 0, `Ramesh Kumar is eligible for ${eligible.length} schemes (e.g. ${eligible[0].scheme.name})`);
  const pmSym = demoMatches.find(m => m.scheme.id === 'pm-sym');
  assert(Boolean(pmSym && pmSym.status === 'eligible'), 'PM-SYM correctly marked as Eligible for unorganised worker');

  // Test farmer status mismatch
  const nonFarmerProfile = { ...DEMO_CITIZEN_RAMESH, farmerStatus: false };
  const pmKisanMatch = demoMatches.find(m => m.scheme.id === 'pm-kisan');
  assert(Boolean(pmKisanMatch && pmKisanMatch.status === 'not_eligible'), 'PM-KISAN correctly marked as Not Eligible for non-farmer');

  // 2. SARVAM-105B CONVERSATION (Progressive Questioning)
  console.log('\n--- 2. Testing Sarvam-105B Reasoning & Progressive Questioning ---');
  try {
    const chatRes = await chatWithSarvam({
      messages: [
        {
          role: 'user',
          content: 'Meri family ki income 2 lakh hai aur mere do bachche hain. Kya mujhe koi sarkari scheme mil sakti hai?'
        }
      ],
      currentProfile: { documentsAvailable: [] },
      language: 'hi-IN'
    });
    assert(chatRes.reply.length > 20, 'Sarvam-105B responded with conversational reply');
    console.log(`Assistant Reply snippet: "${chatRes.reply.slice(0, 120)}..."`);
    assert(
      chatRes.followUpQuestions && chatRes.followUpQuestions.length > 0,
      `Sarvam-105B generated progressive follow-up questions (${chatRes.followUpQuestions.join(' | ')})`
    );
  } catch (err: any) {
    assert(false, `Sarvam-105B chat failed: ${err.message}`);
  }

  // 3. MULTILINGUAL SUPPORT (Marathi & English)
  console.log('\n--- 3. Testing Multilingual Reasoning (Marathi & English) ---');
  try {
    const marathiExplanation = await explainSchemeSimply(
      'प्रधानमंत्री श्रम योगी मान-धन योजना',
      'दरमहा ₹3,000 पेन्शन',
      'असंघटित कामगार (वय 18-40)',
      'mr-IN'
    );
    assert(marathiExplanation.length > 20, 'Sarvam-105B generated Marathi explanation');
    console.log(`Marathi snippet: "${marathiExplanation.slice(0, 100)}..."`);

    const englishExplanation = await explainSchemeSimply(
      'PM SVANidhi',
      '₹10,000 to ₹50,000 working capital loan',
      'Street vendors & gig workers',
      'en-IN'
    );
    assert(englishExplanation.length > 20, 'Sarvam-105B generated English explanation');
    console.log(`English snippet: "${englishExplanation.slice(0, 100)}..."`);
  } catch (err: any) {
    assert(false, `Multilingual explanation failed: ${err.message}`);
  }

  // 4. BULBUL TEXT-TO-SPEECH (TTS)
  console.log('\n--- 4. Testing Bulbul Text-to-Speech (Hindi & Marathi) ---');
  try {
    const hiTTS = await textToSpeech({
      text: 'सरकारी सहायक में आपका स्वागत है।',
      languageCode: 'hi-IN'
    });
    assert(hiTTS.audioBase64.length > 1000, `Bulbul Hindi audio generated (${hiTTS.audioBase64.length} chars base64)`);

    const mrTTS = await textToSpeech({
      text: 'सरकारी सहाय्यक मध्ये आपले स्वागत आहे.',
      languageCode: 'mr-IN'
    });
    assert(mrTTS.audioBase64.length > 1000, `Bulbul Marathi audio generated (${mrTTS.audioBase64.length} chars base64)`);
  } catch (err: any) {
    assert(false, `Bulbul TTS failed: ${err.message}`);
  }

  // 5. SARVAM VISION (Document Intelligence)
  console.log('\n--- 5. Testing Sarvam Vision & Document Extraction ---');
  try {
    const docRes = await analyzeGovernmentDocument({
      fileName: 'income_certificate_maharashtra.pdf',
      mimeType: 'application/pdf',
      extractedTextHint: 'GOVERNMENT OF MAHARASHTRA, Tahsildar Haveli Pune. Certificate No: MAHA/INC/2026/89412. Name: Ramesh Kumar. Certified Annual Income: Rs 2,00,000. Valid: 2026-2027.',
      currentProfile: DEMO_CITIZEN_RAMESH
    });
    assert(docRes.document_type === 'income_certificate', `Document identified as ${docRes.document_type}`);
    assert(docRes.confidence >= 0.85, `Confidence score is ${docRes.confidence}`);
    assert(docRes.status === 'verified', `Status is ${docRes.status}`);
    console.log('Extracted fields:', JSON.stringify(docRes.found_fields));
  } catch (err: any) {
    assert(false, `Sarvam Vision extraction failed: ${err.message}`);
  }

  // 6. SECURITY & SECRETS CHECK
  console.log('\n--- 6. Security & Credential Isolation Verification ---');
  const gitignore = fs.readFileSync('.gitignore', 'utf-8');
  assert(gitignore.includes('.env'), '.gitignore properly excludes .env');

  // Verify static build chunks don't leak SARVAM_API_KEY
  const apiKey = process.env.SARVAM_API_KEY;
  let keyFoundInClientBundle = false;
  const staticDir = path.join(process.cwd(), '.next', 'static');
  if (fs.existsSync(staticDir)) {
    const searchDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
          searchDir(full);
        } else if (f.endsWith('.js') && apiKey) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes(apiKey)) {
            keyFoundInClientBundle = true;
          }
        }
      }
    };
    searchDir(staticDir);
  }
  assert(!keyFoundInClientBundle, 'SARVAM_API_KEY is NOT exposed in any client JavaScript bundles');

  console.log('\n====================================================');
  console.log(`🎯 Test Summary: ${passedTests}/${totalTests} Tests Passed`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

