import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/sarvam/stt';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let audioBuffer: Buffer;
    let fileName = 'recording.wav';
    let languageCode = 'unknown';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No audio file provided in request.' }, { status: 400 });
      }

      fileName = file.name || 'recording.wav';
      const arrayBuffer = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
      languageCode = (formData.get('language_code') as string) || 'unknown';
    } else {
      // JSON base64 payload
      const body = await req.json();
      if (!body.audio) {
        return NextResponse.json({ error: 'No audio data provided in request.' }, { status: 400 });
      }
      // Remove data:audio/...;base64, prefix if present
      const base64Data = body.audio.replace(/^data:audio\/\w+;base64,/, '');
      audioBuffer = Buffer.from(base64Data, 'base64');
      fileName = body.fileName || 'recording.wav';
      languageCode = body.language_code || 'unknown';
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'Empty audio buffer received.' }, { status: 400 });
    }

    const result = await transcribeAudio(audioBuffer, fileName, languageCode);

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      language_code: result.language_code,
      confidence: result.confidence
    });
  } catch (error: any) {
    console.error('API /api/sarvam/transcribe error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to transcribe audio'
      },
      { status: 500 }
    );
  }
}
