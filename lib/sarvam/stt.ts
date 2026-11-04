export interface STTResponse {
  transcript: string;
  language_code: string;
  language_probability?: number;
  confidence?: number;
}

/**
 * Transcribes audio using Sarvam Saaras Speech-to-Text.
 * Handles Indian languages (Hindi, Marathi, English, and code-mixed speech).
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string = 'recording.wav',
  languageCode: string = 'unknown'
): Promise<STTResponse> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured on the server. Please add it to your .env file.');
  }

  const formData = new FormData();
  const uint8 = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8], { type: 'audio/wav' });
  formData.append('file', blob, fileName);
  formData.append('model', 'saaras:v3');
  formData.append('language_code', languageCode);
  formData.append('mode', 'transcribe');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey
      },
      body: formData,
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
        throw new Error('Invalid or unauthorized Sarvam API key. Please check your SARVAM_API_KEY in .env.');
      } else if (response.status === 402 || response.status === 429) {
        throw new Error('Sarvam API rate limit or credit quota exceeded.');
      } else {
        throw new Error(`Sarvam Saaras STT Error (${response.status}): ${parsedErr.message || errText}`);
      }
    }

    const data = await response.json();
    return {
      transcript: data.transcript || '',
      language_code: data.language_code || languageCode,
      language_probability: data.language_probability,
      confidence: data.confidence
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Sarvam Speech-to-Text request timed out. Please try speaking again.');
    }
    throw err;
  }
}
