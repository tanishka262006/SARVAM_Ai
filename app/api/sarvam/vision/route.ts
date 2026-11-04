import { NextRequest, NextResponse } from 'next/server';
import { analyzeGovernmentDocument } from '@/lib/sarvam/vision';
import { db } from '@/lib/db';
import { ExtractedDocument, CitizenProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer | undefined;
    let fileName = 'document.pdf';
    let mimeType = 'application/pdf';
    let currentProfile: CitizenProfile | undefined;
    let sessionId = 'default-session';
    let isDemoSample = false;
    let sampleType = 'income_certificate';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
      }

      fileName = file.name;
      mimeType = file.type || 'application/octet-stream';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      const profileStr = formData.get('currentProfile') as string | null;
      if (profileStr) {
        try {
          currentProfile = JSON.parse(profileStr);
        } catch {}
      }
      sessionId = (formData.get('sessionId') as string) || sessionId;
    } else {
      const body = await req.json();
      fileName = body.fileName || fileName;
      mimeType = body.mimeType || mimeType;
      currentProfile = body.currentProfile;
      sessionId = body.sessionId || sessionId;
      isDemoSample = Boolean(body.isDemoSample);
      sampleType = body.sampleType || sampleType;

      if (body.base64Data) {
        const cleanBase64 = body.base64Data.replace(/^data:[^;]+;base64,/, '');
        fileBuffer = Buffer.from(cleanBase64, 'base64');
      }
    }

    // Support instant testing of demo documents (e.g. Ramesh Kumar's Tahsildar Income Certificate)
    let extractedDoc: ExtractedDocument;

    if (isDemoSample) {
      if (sampleType === 'income_certificate') {
        extractedDoc = {
          document_type: 'income_certificate',
          name: 'Ramesh Kumar',
          annual_income: 200000,
          certificate_number: 'MAHA/INC/2026/89412',
          issuing_authority: 'Office of the Tahsildar, Haveli, District Pune',
          issue_date: '12/05/2026',
          state: 'Maharashtra',
          district: 'Pune',
          confidence: 0.96,
          found_fields: {
            'Document Type': 'Income Certificate (उत्पन्नाचे प्रमाणपत्र)',
            'Name of Applicant': 'Ramesh Kumar (रमेश कुमार)',
            'Certified Annual Income': '₹2,00,000 (Two Lakh Rupees Only)',
            'Certificate Number': 'MAHA/INC/2026/89412',
            'Issuing Authority': 'Tahsildar, Pune Division, Government of Maharashtra',
            'Date of Issue': '12/05/2026',
            'Valid Through': '31/03/2027'
          },
          missing_fields: [],
          inconsistencies: [],
          status: 'verified'
        };
      } else if (sampleType === 'ration_card') {
        extractedDoc = {
          document_type: 'ration_card',
          name: 'Ramesh Kumar',
          annual_income: 200000,
          certificate_number: 'RC-MAHA-PUN-55418',
          issuing_authority: 'Food, Civil Supplies and Consumer Protection Dept, Maharashtra',
          issue_date: '18/02/2024',
          state: 'Maharashtra',
          district: 'Pune',
          confidence: 0.94,
          found_fields: {
            'Document Type': 'Priority Household (Orange) Ration Card',
            'Head of Household': 'Ramesh Kumar',
            'Family Members Count': '4 (Self, Wife, 2 Children)',
            'Ration Card No.': 'RC-MAHA-PUN-55418',
            'Fair Price Shop No.': 'FPS-PUNE-402'
          },
          missing_fields: [],
          inconsistencies: [],
          status: 'verified'
        };
      } else {
        extractedDoc = {
          document_type: 'aadhaar_card',
          name: 'Ramesh Kumar',
          certificate_number: 'XXXX-XXXX-4912',
          issuing_authority: 'Unique Identification Authority of India (UIDAI)',
          issue_date: '10/08/2022',
          state: 'Maharashtra',
          district: 'Pune',
          confidence: 0.98,
          found_fields: {
            'Document Type': 'Aadhaar Identity Card',
            'Name': 'Ramesh Kumar',
            'Year of Birth': '1988 (Age 38)',
            'Gender': 'Male',
            'Address': 'Shivajinagar, Pune, Maharashtra - 411005'
          },
          missing_fields: [],
          inconsistencies: [],
          status: 'verified'
        };
      }
    } else {
      // Analyze live uploaded document using Sarvam Document Intelligence
      extractedDoc = await analyzeGovernmentDocument({
        fileBuffer,
        fileName,
        mimeType,
        currentProfile
      });
    }

    // Persist verified document in DB
    if (sessionId) {
      db.saveDocument(sessionId, extractedDoc);
    }

    return NextResponse.json({
      success: true,
      document: extractedDoc
    });
  } catch (error: any) {
    console.error('API /api/sarvam/vision error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Document extraction failed'
      },
      { status: 500 }
    );
  }
}
