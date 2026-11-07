import fs from 'fs';
import path from 'path';
import { analyzeScamMessage, DEMO_SCAM_SAMPLES } from './lib/sarvam/suraksha';

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

async function runSurakshaTests() {
  console.log('====================================================');
  console.log('🛡️ TESTING SARKARI SURAKSHA — AI GOV SCAM DETECTOR');
  console.log('====================================================\n');

  // Test 1: Fake PM Free Laptop Scheme (Demands ₹499 fee)
  console.log('Test 1: Fake PM Laptop Scheme with ₹499 upfront fee (Hindi)...');
  const res1 = await analyzeScamMessage({
    messageText: DEMO_SCAM_SAMPLES.fake_laptop.text,
    language: 'hi-IN'
  });

  console.log(`- Classification: ${res1.classification} (Expected: fraudulent)`);
  console.log(`- Risk Score: ${res1.riskScore}/100`);
  console.log(`- Identified Red Flags: ${res1.riskFactors.map(r => r.title).join(', ')}`);
  console.log(`- Summary: ${res1.summary.slice(0, 100)}...`);
  console.log(`- Mandatory Warning: ${res1.mandatoryWarning.slice(0, 70)}...`);

  if (res1.classification !== 'fraudulent') {
    throw new Error(`Test 1 Failed: Expected fraudulent, got ${res1.classification}`);
  }
  if (res1.riskScore < 70) {
    throw new Error(`Test 1 Failed: Expected riskScore >= 70, got ${res1.riskScore}`);
  }
  console.log('✅ Test 1 Passed!\n');

  // Test 2: Fake Mahila Cash Scheme (Phishing & OTP Demand in Marathi)
  console.log('Test 2: Fake Mahila Scheme demanding OTP (Marathi)...');
  const res2 = await analyzeScamMessage({
    messageText: DEMO_SCAM_SAMPLES.fake_kanya.text,
    language: 'mr-IN'
  });

  console.log(`- Classification: ${res2.classification} (Expected: fraudulent)`);
  console.log(`- Risk Score: ${res2.riskScore}/100`);
  console.log(`- Identified Red Flags: ${res2.riskFactors.map(r => r.title).join(', ')}`);
  console.log(`- Summary: ${res2.summary.slice(0, 100)}...`);

  if (res2.classification !== 'fraudulent') {
    throw new Error(`Test 2 Failed: Expected fraudulent, got ${res2.classification}`);
  }
  console.log('✅ Test 2 Passed!\n');

  // Test 3: Real PM-KISAN message (links to pmkisan.gov.in in English)
  console.log('Test 3: Real PM-KISAN Installment SMS (English)...');
  const res3 = await analyzeScamMessage({
    messageText: DEMO_SCAM_SAMPLES.real_pm_kisan.text,
    language: 'en-IN'
  });

  console.log(`- Classification: ${res3.classification} (Expected: verified)`);
  console.log(`- Risk Score: ${res3.riskScore}/100`);
  console.log(`- Matched Official Scheme: ${res3.verifiedSchemeDetails?.name}`);
  console.log(`- Official Portal: ${res3.verifiedSchemeDetails?.officialPortal}`);
  console.log(`- Official Sources: ${res3.officialSources.map(s => s.sourceName).join(' | ')}`);

  if (res3.classification !== 'verified') {
    console.warn(`Note: Got ${res3.classification} instead of verified, checking if riskScore is reasonably low: ${res3.riskScore}`);
  }
  if (res3.riskScore > 35) {
    throw new Error(`Test 3 Failed: Real message should have low risk score, got ${res3.riskScore}`);
  }
  console.log('✅ Test 3 Passed!\n');

  console.log('====================================================');
  console.log('🎉 ALL SARKARI SURAKSHA TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runSurakshaTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
