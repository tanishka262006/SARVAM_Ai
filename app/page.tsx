'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { VoiceChat } from '@/components/VoiceChat';
import { SchemeCards } from '@/components/SchemeCards';
import { CitizenProfileCard } from '@/components/CitizenProfileCard';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { SchemeExplanationModal } from '@/components/SchemeExplanationModal';
import { matchSchemes } from '@/lib/schemes/matcher';
import { DEMO_SCHEMES, DEMO_CITIZEN_RAMESH } from '@/lib/schemes/data';
import {
  CitizenProfile,
  ChatMessage,
  SchemeMatchResult,
  SupportedLanguage,
  ExtractedDocument
} from '@/types';

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('hi-IN');
  const [profile, setProfile] = useState<CitizenProfile>({
    documentsAvailable: []
  });
  const [matches, setMatches] = useState<SchemeMatchResult[]>([]);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Explanation Modal state
  const [explanationModal, setExplanationModal] = useState<{
    isOpen: boolean;
    schemeResult: SchemeMatchResult | null;
    explanation: string;
    audioUrl?: string;
  }>({
    isOpen: false,
    schemeResult: null,
    explanation: '',
    audioUrl: undefined
  });

  const [isExplainingId, setIsExplainingId] = useState<string | undefined>(undefined);
  const [isSpeakingId, setIsSpeakingId] = useState<string | undefined>(undefined);

  // Initial greeting message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'नमस्ते! मैं हूँ सरकारी सहायक (Sarkari Sahayak)। आप मुझसे अपनी भाषा में बात करके सरकारी योजनाओं की जानकारी ले सकते हैं।\n\nउदाहरण के लिए, मुझे बताइए कि आपका व्यवसाय क्या है, परिवार में कितने सदस्य हैं, या आपकी वार्षिक आय क्या है?',
      timestamp: new Date().toISOString(),
      followUpQuestions: [
        'Meri family ki income 2 lakh hai aur mere 2 bachche hain.',
        'Main Maharashtra mein delivery worker hoon, kya mujhe koi scheme milegi?',
        'Mujhe ration card aur Ayushman card ke baare mein batao.'
      ]
    }
  ]);

  // Initial calculation of scheme matches on mount
  useEffect(() => {
    const results = matchSchemes(profile, DEMO_SCHEMES);
    setMatches(results);
  }, [profile]);

  // Handle sending a chat message to Sarvam-105B
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStatusMessage('Sarvam-105B is understanding your situation...');

    try {
      const res = await fetch('/api/sarvam/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          })),
          currentProfile: profile,
          language: currentLanguage,
          autoSpeak: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Chat request failed');
      }

      // Update citizen profile with any newly discovered entities
      if (data.updatedProfile) {
        setProfile(data.updatedProfile);
        const newMatches = matchSchemes(data.updatedProfile, DEMO_SCHEMES);
        setMatches(newMatches);
      }

      const assistantMessage: ChatMessage = {
        id: 'asst-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        audioUrl: data.audioUrl,
        followUpQuestions: data.followUpQuestions
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'क्षमा करें, संदेश प्रोसेस करने में त्रुटि हुई: ' + (err.message || 'कृपया दोबारा प्रयास करें।'),
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Load Demo Profile (Ramesh Kumar - Pune Delivery Worker)
  const handleLoadDemo = () => {
    setIsDemoActive(true);
    setProfile(DEMO_CITIZEN_RAMESH);
    const demoMatches = matchSchemes(DEMO_CITIZEN_RAMESH, DEMO_SCHEMES);
    setMatches(demoMatches);

    const demoGreeting: ChatMessage = {
      id: 'demo-' + Date.now(),
      role: 'assistant',
      content: `✅ डेमों मोड सक्रिय: रमेश कुमार (आयु 38 वर्ष, पुणे, महाराष्ट्र)\n• व्यवसाय: डिलीवरी वर्कर\n• वार्षिक पारिवारिक आय: ₹2,00,000\n• परिवार: पत्नी + 2 बच्चे\n• उपलब्ध दस्तावेज़: आधार कार्ड, आय प्रमाण पत्र, राशन कार्ड\n\nमैंने आपकी प्रोफाइल के आधार पर सरकारी योजनाओं की जाँच की है। आप नीचे दी गई योजनाओं (जैसे PM-SYM पेंशन, PM SVANidhi, आयुष्मान भारत, लाडकी बहीण योजना) के लिए योग्य हो सकते हैं।`,
      timestamp: new Date().toISOString(),
      followUpQuestions: [
        'Mujhe PM Shram Yogi Maan-dhan yojana ke baare mein batao',
        'Maharashtra Majhi Ladki Bahin Yojana ke liye kaise apply karein?',
        'Mere bachchon ke liye koi scholarship scheme hai kya?'
      ]
    };

    setMessages((prev) => [...prev, demoGreeting]);
  };

  // Reset conversation and profile
  const handleReset = () => {
    setIsDemoActive(false);
    const freshProfile: CitizenProfile = { documentsAvailable: [] };
    setProfile(freshProfile);
    setMatches(matchSchemes(freshProfile, DEMO_SCHEMES));
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          'नमस्ते! प्रोफाइल रीसेट कर दी गई है। आप अपनी स्थिति बताकर नई योजनाओं की खोज शुरू कर सकते हैं।',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Confirm extracted document from Sarvam Vision
  const handleConfirmDocument = (doc: ExtractedDocument) => {
    const updatedDocs = Array.from(
      new Set([
        ...(profile.documentsAvailable || []),
        doc.document_type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      ])
    );

    const updatedProfile: CitizenProfile = {
      ...profile,
      name: doc.name || profile.name,
      annualHouseholdIncome: doc.annual_income || profile.annualHouseholdIncome,
      state: doc.state || profile.state,
      district: doc.district || profile.district,
      documentsAvailable: updatedDocs
    };

    setProfile(updatedProfile);
    setMatches(matchSchemes(updatedProfile, DEMO_SCHEMES));

    const confirmationMsg: ChatMessage = {
      id: 'doc-' + Date.now(),
      role: 'assistant',
      content: `📄 दस्तावेज़ सत्यापित: ${doc.found_fields['Document Type'] || doc.document_type}\n• नाम: ${doc.name || 'उपलब्ध'}\n• वार्षिक आय: ₹${(doc.annual_income || 200000).toLocaleString('en-IN')}\n• प्रमाण पत्र सं.: ${doc.certificate_number || 'सत्यापित'}\n\nआपकी प्रोफाइल अपडेट कर दी गई है और योजनाओं की पात्रता पुनः जांची गई है!`,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, confirmationMsg]);
  };

  // Explain scheme simply using Sarvam-105B
  const handleExplainScheme = async (item: SchemeMatchResult) => {
    setIsExplainingId(item.scheme.id);
    try {
      const res = await fetch('/api/sarvam/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_scheme',
          schemeDetails: {
            name: item.scheme.name,
            benefit: item.scheme.benefit,
            eligibility: item.scheme.eligibilitySummary
          },
          language: currentLanguage,
          autoSpeak: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Explanation request failed');
      }

      setExplanationModal({
        isOpen: true,
        schemeResult: item,
        explanation: data.reply,
        audioUrl: data.audioUrl
      });
    } catch (err: any) {
      alert('Failed to get simple explanation: ' + err.message);
    } finally {
      setIsExplainingId(undefined);
    }
  };

  // Speak scheme aloud using Bulbul TTS
  const handleSpeakScheme = async (item: SchemeMatchResult) => {
    setIsSpeakingId(item.scheme.id);
    try {
      const textToSpeak = `${item.scheme.name}। लाभ: ${item.scheme.benefit}। पात्रता: ${item.scheme.eligibilitySummary}`;
      const res = await fetch('/api/sarvam/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          languageCode: currentLanguage
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize voice');
      }

      setExplanationModal({
        isOpen: true,
        schemeResult: item,
        explanation: textToSpeak,
        audioUrl: data.dataUrl
      });
    } catch (err: any) {
      alert('Speech failed: ' + err.message);
    } finally {
      setIsSpeakingId(undefined);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        profile={profile}
        isDemoActive={isDemoActive}
      />

      {/* Hero Section */}
      <HeroSection
        onStartVoice={() => {
          // Scroll smoothly to voice assistant
          document.getElementById('voice-assistant-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onStartTyping={() => {
          document.getElementById('voice-assistant-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        currentLanguage={currentLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Top 2-Column Grid: Left Voice Chat Assistant | Right Citizen Profile Card */}
        <div id="voice-assistant-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Voice Chat Assistant (7 cols on lg) */}
          <div className="lg:col-span-7">
            <VoiceChat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentProfile={profile}
              currentLanguage={currentLanguage}
              isLoading={isLoading}
              statusMessage={statusMessage}
              onSelectFollowUp={handleSendMessage}
            />
          </div>

          {/* Right Column: Citizen Profile & Document Verification (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Citizen Profile Card */}
            <CitizenProfileCard
              profile={profile}
              onUpdateProfile={(updated) => {
                setProfile(updated);
                setMatches(matchSchemes(updated, DEMO_SCHEMES));
              }}
              onLoadDemo={handleLoadDemo}
              eligibleCount={matches.filter((m) => m.status === 'eligible').length}
            />

            {/* Document Upload Quick Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-white to-orange-50/40 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider block mb-1">
                    Sarvam Vision Engine
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Verify Your Government Documents
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload Income Certificate, Ration Card, or Aadhaar to automatically confirm scheme eligibility.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>📄 Upload or Test Document</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Section: Matched Government Scheme Cards */}
        <div className="pt-6 border-t border-slate-200">
          <SchemeCards
            matches={matches}
            onExplainScheme={handleExplainScheme}
            onSpeakScheme={handleSpeakScheme}
            currentLanguage={currentLanguage}
            isExplainingId={isExplainingId}
            isSpeakingId={isSpeakingId}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Sarkari Sahayak</span>
            <span>•</span>
            <span>Made with Sarvam AI APIs (Saaras, Sarvam-105B, Bulbul, Sarvam Vision)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            For Indian Citizens • Hindi, Marathi & English • Initial Assessment Only
          </p>
        </div>
      </footer>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentProfile={profile}
        onConfirmDocument={handleConfirmDocument}
      />

      <SchemeExplanationModal
        isOpen={explanationModal.isOpen}
        onClose={() => setExplanationModal({ ...explanationModal, isOpen: false })}
        schemeResult={explanationModal.schemeResult}
        explanation={explanationModal.explanation}
        audioUrl={explanationModal.audioUrl}
        currentLanguage={currentLanguage}
      />

    </div>
  );
}
