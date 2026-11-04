import { NextRequest, NextResponse } from 'next/server';
import { matchSchemes } from '@/lib/schemes/matcher';
import { CitizenProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile: CitizenProfile = body.profile || { documentsAvailable: [] };

    const matches = matchSchemes(profile);

    const eligibleCount = matches.filter((m) => m.status === 'eligible').length;
    const possiblyEligibleCount = matches.filter((m) => m.status === 'possibly_eligible').length;
    const notEligibleCount = matches.filter((m) => m.status === 'not_eligible').length;

    return NextResponse.json({
      success: true,
      total: matches.length,
      eligibleCount,
      possiblyEligibleCount,
      notEligibleCount,
      matches
    });
  } catch (error: any) {
    console.error('API /api/schemes/match error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Scheme matching failed'
      },
      { status: 500 }
    );
  }
}
