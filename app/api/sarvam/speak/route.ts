import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/sarvam/tts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, languageCode = 'hi-IN', speaker = 'shubh', pace = 1.0 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required for speech synthesis.' }, { status: 400 });
    }

    const result = await textToSpeech({
      text,
      languageCode,
      speaker,
      pace
    });

    return NextResponse.json({
      success: true,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      dataUrl: result.dataUrl
    });
  } catch (error: any) {
    console.error('API /api/sarvam/speak error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to synthesize speech with Bulbul'
      },
      { status: 500 }
    );
  }
}
