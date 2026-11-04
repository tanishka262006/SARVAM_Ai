import fs from 'fs';
import { SarvamAIClient } from 'sarvamai';

// Load .env manually if process.env.SARVAM_API_KEY is not set
if (!process.env.SARVAM_API_KEY && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (key && val) {
          process.env[key] = val;
        }
      }
    }
  }
}

const apiKey = process.env.SARVAM_API_KEY?.trim();

if (!apiKey) {
  console.error('❌ Error: SARVAM_API_KEY is empty or missing in .env');
  console.error('Please open .env and set your key: SARVAM_API_KEY=your_key_here');
  process.exit(1);
}

async function main() {
  console.log('Connecting to Sarvam AI Chat Completions (Sarvam-105B)...');

  const client = new SarvamAIClient({
    apiSubscriptionKey: apiKey,
  });

  const response = await client.chat.completions({
    model: 'sarvam-105b',
    messages: [
      {
        role: 'user',
        content: 'नमस्ते! Sarkari Sahayak में आपका स्वागत है। मुझे संक्षेप में 2 वाक्यों में बताइए कि आप नागरिकों की सरकारी योजनाओं को खोजने में कैसे मदद कर सकते हैं?'
      }
    ],
    temperature: 0.5,
    maxTokens: 200
  });

  const reply = response.choices?.[0]?.message?.content;
  console.log('\n--- Sarvam-105B Response ---');
  console.log(reply);
  console.log('-----------------------------');
  console.log('✅ First Sarvam API call succeeded!');
}

main().catch((err) => {
  console.error('❌ Sarvam API call failed:', err?.message || err);
  process.exit(1);
});

