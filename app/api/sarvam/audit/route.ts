import { NextRequest, NextResponse } from 'next/server';
import { runDocumentAudit } from '@/lib/sarvam/audit';
import { ExtractedDocument, CitizenProfile, SupportedLanguage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      documents,
      citizenProfile,
      language = 'hi-IN'
    }: {
      documents: ExtractedDocument[];
      citizenProfile: CitizenProfile;
      language: SupportedLanguage;
    } = body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one extracted document is required for audit.' },
        { status: 400 }
      );
    }

    if (documents.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Maximum 6 documents can be audited at once.' },
        { status: 400 }
      );
    }

    const auditResult = await runDocumentAudit(documents, citizenProfile, language);

    return NextResponse.json({ success: true, audit: auditResult });
  } catch (err: any) {
    console.error('Document Audit API Error:', err);

    if (err.message?.includes('SARVAM_API_KEY')) {
      return NextResponse.json(
        { success: false, error: 'Sarvam API key is not configured. Please add SARVAM_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || 'Document audit failed. Please try again.' },
      { status: 500 }
    );
  }
}

