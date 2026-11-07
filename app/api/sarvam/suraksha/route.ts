import { NextRequest, NextResponse } from 'next/server';
import { analyzeScamMessage, DEMO_SCAM_SAMPLES } from '@/lib/sarvam/suraksha';
import { SupportedLanguage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let messageText = '';
    let screenshotBuffer: Buffer | undefined;
    let fileName = 'screenshot.png';
    let mimeType = 'image/png';
    let language: SupportedLanguage = 'hi-IN';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      language = (formData.get('language') as SupportedLanguage) || 'hi-IN';
      messageText = (formData.get('messageText') as string) || '';

      if (file) {
        fileName = file.name;
        mimeType = file.type || 'image/png';
        const arrayBuffer = await file.arrayBuffer();
        screenshotBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      const body = await req.json();
      language = (body.language as SupportedLanguage) || 'hi-IN';
      messageText = body.messageText || '';

      // Check if a demo sample is requested
      if (body.demoSampleId && DEMO_SCAM_SAMPLES[body.demoSampleId as keyof typeof DEMO_SCAM_SAMPLES]) {
        const sample = DEMO_SCAM_SAMPLES[body.demoSampleId as keyof typeof DEMO_SCAM_SAMPLES];
        messageText = sample.text;
      }

      if (body.base64Data) {
        const cleanBase64 = body.base64Data.replace(/^data:[^;]+;base64,/, '');
        screenshotBuffer = Buffer.from(cleanBase64, 'base64');
        fileName = body.fileName || fileName;
        mimeType = body.mimeType || mimeType;
      }
    }

    if (!messageText && !screenshotBuffer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please paste a suspicious message or upload a screenshot to analyze.'
        },
        { status: 400 }
      );
    }

    const result = await analyzeScamMessage({
      messageText,
      screenshotBuffer,
      fileName,
      mimeType,
      language
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error('API /api/sarvam/suraksha error:', err);

    if (err.message?.includes('SARVAM_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'SARVAM_API_KEY is not configured on the server. Please add it to your .env file.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Scam detector analysis failed. Please try again.'
      },
      { status: 500 }
    );
  }
}
