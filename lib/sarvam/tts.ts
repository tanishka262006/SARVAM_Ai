export interface TTSRequest {
  text: string;
  languageCode?: 'hi-IN' | 'mr-IN' | 'en-IN' | string;
  speaker?: string;
  pace?: number;
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
  dataUrl: string;
}

/**
 * Converts text into natural Indian voice audio using Sarvam Bulbul TTS.
 */
export async function textToSpeech({
  text,
  languageCode = 'hi-IN',
  speaker = 'shubh',
  pace = 1.0
}: TTSRequest): Promise<TTSResponse> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured on the server. Please check your .env file.');
  }

  // Sanitize and limit text length to Bulbul's optimal range
  const cleanText = text.trim().slice(0, 2000);
  if (!cleanText) {
    throw new Error('Text to speak cannot be empty.');
  }

  // Normalize language code
  let targetLang = 'hi-IN';
  if (languageCode.startsWith('mr') || languageCode.includes('marathi')) {
    targetLang = 'mr-IN';
  } else if (languageCode.startsWith('en') || languageCode.includes('english')) {
    targetLang = 'en-IN';
  } else {
    targetLang = 'hi-IN';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        target_language_code: targetLang,
        speaker: speaker || 'shubh',
        model: 'bulbul:v3',
        pace: pace || 1.0,
        enable_preprocessing: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr: any;
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        parsedErr = { message: errText };
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or unauthorized Sarvam API key in Bulbul TTS.');
      } else if (response.status === 402 || response.status === 429) {
        throw new Error('Sarvam API rate limit or credit quota exceeded.');
      } else {
        throw new Error(`Sarvam Bulbul TTS Error (${response.status}): ${parsedErr.message || errText}`);
      }
    }

    const data = await response.json();
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      throw new Error('Sarvam Bulbul did not return audio data.');
    }

    const mimeType = 'audio/wav';
    const dataUrl = `data:${mimeType};base64,${audioBase64}`;

    return {
      audioBase64,
      mimeType,
      dataUrl
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Sarvam Text-to-Speech request timed out. Please try again.');
    }
    throw err;
  }
}
