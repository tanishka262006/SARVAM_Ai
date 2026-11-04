import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CitizenProfile } from '@/types';
import { DEMO_CITIZEN_RAMESH } from '@/lib/schemes/data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'default-session';
  const profile = db.getProfile(sessionId);

  return NextResponse.json({
    success: true,
    profile: profile || null
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId || 'default-session';
    const action = body.action || 'save'; // 'save', 'seed_demo', 'reset'

    if (action === 'seed_demo') {
      db.saveProfile(sessionId, DEMO_CITIZEN_RAMESH);
      return NextResponse.json({
        success: true,
        profile: DEMO_CITIZEN_RAMESH,
        message: 'Loaded Demo Citizen (Ramesh Kumar, Pune)'
      });
    }

    if (action === 'reset') {
      db.clearSession(sessionId);
      const emptyProfile: CitizenProfile = { documentsAvailable: [] };
      db.saveProfile(sessionId, emptyProfile);
      return NextResponse.json({
        success: true,
        profile: emptyProfile,
        message: 'Session cleared.'
      });
    }

    // Save provided profile
    const profile: CitizenProfile = body.profile;
    db.saveProfile(sessionId, profile);

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
