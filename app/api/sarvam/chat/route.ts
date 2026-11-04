import { NextRequest, NextResponse } from 'next/server';
import { chatWithSarvam, explainSchemeSimply } from '@/lib/sarvam/llm';
import { textToSpeech } from '@/lib/sarvam/tts';
import { matchSchemes } from '@/lib/schemes/matcher';
import { db } from '@/lib/db';
import { CitizenProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      currentProfile = { documentsAvailable: [] },
      language = 'hi-IN',
      sessionId = 'default-session',
      action = 'chat', // 'chat' or 'explain_scheme'
      schemeDetails,
      autoSpeak = true
    } = body;

    // Handle "Explain simply" request for a scheme
    if (action === 'explain_scheme' && schemeDetails) {
      const explanation = await explainSchemeSimply(
        schemeDetails.name,
        schemeDetails.benefit,
        schemeDetails.eligibility,
        language
      );

      let audioUrl = undefined;
      if (autoSpeak) {
        try {
          const ttsRes = await textToSpeech({
            text: explanation,
            languageCode: language
          });
          audioUrl = ttsRes.dataUrl;
        } catch (ttsErr) {
          console.warn('TTS failed for scheme explanation:', ttsErr);
        }
      }

      return NextResponse.json({
        success: true,
        reply: explanation,
        audioUrl
      });
    }

    // Default chat flow
    const currentMatches = matchSchemes(currentProfile);

    // Call Sarvam-105B
    const llmResult = await chatWithSarvam({
      messages,
      currentProfile,
      matchedSchemes: currentMatches,
      language
    });

    // Merge newly extracted profile attributes with existing profile
    const updatedProfile: CitizenProfile = {
      ...currentProfile,
      ...llmResult.profileUpdates,
      documentsAvailable: Array.from(
        new Set([
          ...(currentProfile.documentsAvailable || []),
          ...(llmResult.profileUpdates?.documentsAvailable || [])
        ])
      )
    };

    // Calculate updated deterministic scheme matches
    const updatedMatches = matchSchemes(updatedProfile);

    // Persist in DB
    if (sessionId) {
      db.saveProfile(sessionId, updatedProfile);
      const userLastMsg = messages[messages.length - 1];
      if (userLastMsg && userLastMsg.role === 'user') {
        db.saveMessage(sessionId, {
          id: 'user-' + Date.now(),
          role: 'user',
          content: userLastMsg.content,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate Bulbul TTS audio for the response if requested
    let audioUrl = undefined;
    if (autoSpeak && llmResult.reply) {
      try {
        const ttsRes = await textToSpeech({
          text: llmResult.reply,
          languageCode: language
        });
        audioUrl = ttsRes.dataUrl;
      } catch (ttsErr: any) {
        console.warn('Auto TTS audio generation failed (non-critical):', ttsErr?.message);
      }
    }

    if (sessionId) {
      db.saveMessage(sessionId, {
        id: 'asst-' + Date.now(),
        role: 'assistant',
        content: llmResult.reply,
        timestamp: new Date().toISOString(),
        audioUrl,
        followUpQuestions: llmResult.followUpQuestions,
        matchedSchemesCount: updatedMatches.filter((m) => m.status === 'eligible').length
      });
    }

    return NextResponse.json({
      success: true,
      reply: llmResult.reply,
      profileUpdates: llmResult.profileUpdates,
      updatedProfile,
      matchedSchemes: updatedMatches,
      followUpQuestions: llmResult.followUpQuestions,
      audioUrl
    });
  } catch (error: any) {
    console.error('API /api/sarvam/chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Chat assistant encountered an error'
      },
      { status: 500 }
    );
  }
}
