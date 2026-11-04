import { SarvamAIClient } from 'sarvamai';
import { CitizenProfile, SchemeMatchResult } from '@/types';

export interface LLMChatOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  currentProfile: CitizenProfile;
  matchedSchemes?: SchemeMatchResult[];
  language?: 'hi-IN' | 'mr-IN' | 'en-IN';
}

export interface LLMChatResponse {
  reply: string;
  profileUpdates: Partial<CitizenProfile>;
  followUpQuestions: string[];
}

/**
 * Extracts citizen profile fields mentioned naturally in user text (Hindi, Marathi, English, Hinglish).
 */
export function extractProfileFromText(text: string): Partial<CitizenProfile> {
  const updates: Partial<CitizenProfile> = {};
  const lower = text.toLowerCase();

  // Income detection: e.g. "2 lakh", "200000", "1.5 lakh", "50000", "दो लाख"
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/i);
  if (lakhMatch) {
    updates.annualHouseholdIncome = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const rawIncomeMatch = lower.match(/(?:income|aamdani|kamai|आय|वेतन|पगार)[\s\w:=]*?(?:rs\.?|₹)?\s*(\d{4,7})/i);
    if (rawIncomeMatch) {
      updates.annualHouseholdIncome = parseInt(rawIncomeMatch[1], 10);
    }
  }

  // Children count detection: e.g. "2 bachche", "दो बच्चे", "3 children", "2 kids"
  const childMatch = lower.match(/(\d+)\s*(?:bachche|bachha|bache|children|kids|mul|मुले|मुलं|बच्चे)/i);
  if (childMatch) {
    updates.childrenCount = parseInt(childMatch[1], 10);
  } else if (lower.includes('do bachche') || lower.includes('two children') || lower.includes('दोन मुले')) {
    updates.childrenCount = 2;
  } else if (lower.includes('ek bachcha') || lower.includes('one child') || lower.includes('एक मूल')) {
    updates.childrenCount = 1;
  }

  // Age detection: e.g. "age 38", "38 saal", "38 years", "३८ वर्षे"
  const ageMatch = lower.match(/(?:age|umra|umar|वय|उम्र)[\s:=]*?(\d{2})/i) || lower.match(/(\d{2})\s*(?:saal|sal|years|varsh|वर्षे|साल)/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (age >= 18 && age <= 100) {
      updates.age = age;
    }
  }

  // State detection
  if (lower.includes('maharashtra') || lower.includes('महाराष्ट्र')) {
    updates.state = 'Maharashtra';
  } else if (lower.includes('uttar pradesh') || lower.includes('up') || lower.includes('उत्तर प्रदेश')) {
    updates.state = 'Uttar Pradesh';
  } else if (lower.includes('bihar') || lower.includes('बिहार')) {
    updates.state = 'Bihar';
  } else if (lower.includes('madhya pradesh') || lower.includes('mp') || lower.includes('मध्य प्रदेश')) {
    updates.state = 'Madhya Pradesh';
  } else if (lower.includes('rajasthan') || lower.includes('राजस्थान')) {
    updates.state = 'Rajasthan';
  } else if (lower.includes('delhi') || lower.includes('दिल्ली')) {
    updates.state = 'Delhi';
  }

  // District detection (e.g. Pune, Mumbai, Nagpur, Nashik)
  if (lower.includes('pune') || lower.includes('पुणे')) {
    updates.district = 'Pune';
    updates.state = 'Maharashtra';
  } else if (lower.includes('mumbai') || lower.includes('मुंबई')) {
    updates.district = 'Mumbai';
    updates.state = 'Maharashtra';
  }

  // Occupation detection
  if (lower.includes('delivery') || lower.includes('zomato') || lower.includes('swiggy') || lower.includes('डिलीवरी')) {
    updates.occupation = 'Delivery worker';
    updates.farmerStatus = false;
  } else if (lower.includes('kisan') || lower.includes('farmer') || lower.includes('kheti') || lower.includes('शेतकरी') || lower.includes('किसान')) {
    updates.occupation = 'Farmer';
    updates.farmerStatus = true;
  } else if (lower.includes('vendor') || lower.includes('thela') || lower.includes('feriwala') || lower.includes('रेहड़ी') || lower.includes('विक्रेता')) {
    updates.occupation = 'Street vendor';
    updates.farmerStatus = false;
  } else if (lower.includes('student') || lower.includes('padhai') || lower.includes('विद्यार्थी') || lower.includes('छात्र')) {
    updates.studentStatus = true;
  }

  // Document mentions
  const docs: string[] = [];
  if (lower.includes('aadhaar') || lower.includes('आधार')) docs.push('Aadhaar Card');
  if (lower.includes('income cert') || lower.includes('aamdani praman') || lower.includes('उत्पन्न')) docs.push('Income Certificate');
  if (lower.includes('ration') || lower.includes('रेशन') || lower.includes('राशन')) docs.push('Ration Card');
  if (lower.includes('bank') || lower.includes('passbook') || lower.includes('खाते')) docs.push('Bank Passbook');
  if (lower.includes('7/12') || lower.includes('khatauni') || lower.includes('जमीन')) docs.push('Land Record (7/12)');

  if (docs.length > 0) {
    updates.documentsAvailable = docs;
  }

  return updates;
}

/**
 * Computes progressive follow-up questions tailored to what information is still missing.
 */
export function generateFollowUpQuestions(
  profile: CitizenProfile,
  language: 'hi-IN' | 'mr-IN' | 'en-IN' = 'hi-IN'
): string[] {
  const questions: string[] = [];

  if (language === 'mr-IN') {
    if (!profile.state) questions.push('तुम्ही कोणत्या राज्यात किंवा जिल्ह्यात राहता?');
    if (!profile.occupation) questions.push('तुमचा मुख्य व्यवसाय किंवा काम काय आहे?');
    if (!profile.annualHouseholdIncome) questions.push('तुमचे वार्षिक कौटुंबिक उत्पन्न अंदाजे किती आहे?');
    if (profile.childrenCount === undefined) questions.push('तुमच्या घरात लहान मुले किंवा शिकणारे विद्यार्थी आहेत का?');
    if (!profile.documentsAvailable?.some(d => d.includes('Income'))) {
      questions.push('तुमच्याकडे तहसीलदारांचे उत्पन्नाचे प्रमाणपत्र (Income Certificate) आहे का?');
    }
  } else if (language === 'en-IN') {
    if (!profile.state) questions.push('Which state and district do you live in?');
    if (!profile.occupation) questions.push('What is your primary occupation or source of livelihood?');
    if (!profile.annualHouseholdIncome) questions.push('What is your approximate annual household income?');
    if (profile.childrenCount === undefined) questions.push('Do you have school-going children in your family?');
    if (!profile.documentsAvailable?.some(d => d.includes('Income'))) {
      questions.push('Do you have a valid government Income Certificate?');
    }
  } else {
    // Hindi / Hinglish default
    if (!profile.state) questions.push('Aap kis rajya (state) aur zille mein rehte hain?');
    if (!profile.occupation) questions.push('Aapka mukhya vyavsay ya kam kya hai (jaise delivery, kheti, majdoori)?');
    if (!profile.annualHouseholdIncome) questions.push('Aapki lagbhag varshik parivarik aamdani kitni hai?');
    if (profile.childrenCount === undefined) questions.push('Aapke parivar mein bachchon ki sankhya aur umra kya hai?');
    if (!profile.documentsAvailable?.some(d => d.includes('Income'))) {
      questions.push('Kya aapke paas Tehsildar dwara jaari aamdani praman patra (Income Certificate) hai?');
    }
  }

  return questions.slice(0, 3);
}

/**
 * Executes multi-turn reasoning and conversational guidance with Sarvam-105B.
 */
export async function chatWithSarvam({
  messages,
  currentProfile,
  matchedSchemes = [],
  language = 'hi-IN'
}: LLMChatOptions): Promise<LLMChatResponse> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured on the server. Please add it to your .env file.');
  }

  const client = new SarvamAIClient({
    apiSubscriptionKey: apiKey,
  });

  const languageName = language === 'mr-IN' ? 'Marathi' : language === 'en-IN' ? 'English' : 'Hindi / Hinglish';

  const systemPrompt = `You are "Sarkari Sahayak" (सरकारी सहायक), an empathetic, polite, and knowledgeable AI government scheme assistant for Indian citizens.

GUIDELINES:
1. Speak warmly and naturally in the citizen's preferred language: ${languageName}. Always understand and respond smoothly to code-mixed input (e.g. Hindi mixed with English like "Meri family income 2 lakh hai").
2. PROGRESSIVE INQUIRY:
   - Do NOT immediately guess or dump a list of 10 schemes if key eligibility details are unknown.
   - If the user shares partial information (e.g. "Meri income 2 lakh hai aur do bachche hain"), acknowledge their situation warmly and ask 1 or 2 relevant follow-up questions to help confirm their exact eligibility (e.g. ask which state they reside in, their occupation, or whether they have an income certificate/ration card).
3. If they have already provided state, income, and occupation, explain the top 2-3 most relevant schemes simply (benefits, eligibility, and steps).
4. Always maintain a helpful, respectful, citizen-first tone.

CITIZEN PROFILE SO FAR:
${JSON.stringify(currentProfile, null, 2)}`;

  const formattedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6)
  ];

  try {
    const response = await client.chat.completions({
      model: 'sarvam-105b',
      messages: formattedMessages,
      temperature: 0.5,
      max_tokens: 650
    });

    const reply = response.choices?.[0]?.message?.content?.trim() || '';

    // Extract newly mentioned profile fields from the user's latest messages
    const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const profileUpdates = extractProfileFromText(latestUserMsg);

    const mergedProfile: CitizenProfile = {
      ...currentProfile,
      ...profileUpdates
    };

    const followUpQuestions = generateFollowUpQuestions(mergedProfile, language);

    return {
      reply: reply || 'नमस्ते! मैं आपकी सरकारी योजनाओं में सहायता कर सकता हूँ। कृपया मुझे अपनी वार्षिक आय, राज्य और व्यवसाय के बारे में बताएं।',
      profileUpdates,
      followUpQuestions
    };
  } catch (error: any) {
    console.error('Sarvam-105B Chat API Error:', error);
    throw new Error(`Sarvam-105B reasoning failed: ${error?.message || error}`);
  }
}

/**
 * Generates a simple, jargon-free explanation for a specific scheme using Sarvam-105B.
 */
export async function explainSchemeSimply(
  schemeName: string,
  benefit: string,
  eligibility: string,
  language: 'hi-IN' | 'mr-IN' | 'en-IN' = 'hi-IN'
): Promise<string> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY missing');
  }

  const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
  const langPrompt = language === 'mr-IN' ? 'मराठी (Marathi)' : language === 'en-IN' ? 'English' : 'सरल हिंदी (Hindi)';

  const prompt = `Explain the following Indian government scheme simply in 2-3 short, clear sentences in ${langPrompt} for an ordinary citizen:
Scheme: ${schemeName}
Benefit: ${benefit}
Eligibility: ${eligibility}

Keep it polite, direct, and completely free of bureaucratic jargon.`;

  try {
    const response = await client.chat.completions({
      model: 'sarvam-105b',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 300
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    return content || `${schemeName}: ${benefit}. पात्र नागरिक: ${eligibility}`;
  } catch (e: any) {
    console.warn('explainSchemeSimply fallback:', e?.message);
    return `${schemeName}: ${benefit}. पात्र नागरिक: ${eligibility}`;
  }
}
