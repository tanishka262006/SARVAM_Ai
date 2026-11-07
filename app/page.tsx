'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { VoiceChat } from '@/components/VoiceChat';
import { SchemeCards } from '@/components/SchemeCards';
import { CitizenProfileCard } from '@/components/CitizenProfileCard';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { SchemeExplanationModal } from '@/components/SchemeExplanationModal';
import { DocumentAuditModal } from '@/components/DocumentAuditModal';
import { SarkariSuraksha } from '@/components/SarkariSuraksha';
import { matchSchemes } from '@/lib/schemes/matcher';
import { DEMO_SCHEMES, DEMO_CITIZEN_RAMESH } from '@/lib/schemes/data';
import {
  CitizenProfile,
  ChatMessage,
  SchemeMatchResult,
  SupportedLanguage,
  ExtractedDocument
} from '@/types';
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  Scale,
  Award,
  Layers,
  FileText
} from 'lucide-react';

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
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Search & Category synchronization from Hero Section
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<string>('all');
  const [schemeSearchQuery, setSchemeSearchQuery] = useState<string>('');

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
    setSchemeCategoryFilter('all');
    setSchemeSearchQuery('');
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

  // Scroll smoothly to Sarkari Suraksha Scam Detector
  const scrollToSuraksha = () => {
    document.getElementById('sarkari-suraksha-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const eligibleSchemesCount = matches.filter((m) => m.status === 'eligible').length;
  const possibleSchemesCount = matches.filter((m) => m.status === 'possibly_eligible').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        onOpenSuraksha={scrollToSuraksha}
        profile={profile}
        isDemoActive={isDemoActive}
      />

      {/* Hero Section */}
      <HeroSection
        onStartVoice={() => {
          document.getElementById('voice-assistant-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onStartTyping={() => {
          document.getElementById('voice-assistant-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenSuraksha={scrollToSuraksha}
        onSearchCategory={(cat) => setSchemeCategoryFilter(cat)}
        onSearchQuery={(q) => setSchemeSearchQuery(q)}
        currentLanguage={currentLanguage}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Personalized Welcome & Family Entitlements Overview Ticker */}
        <div className="bg-white rounded-2xl border border-[#E8E5DE] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                  Citizen Entitlements Overview
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-forest-700"></span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.name ? `Account: ${profile.name}` : 'Anonymous Intake Mode'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {profile.name ? `Namaste, ${profile.name}` : 'Welcome to Sarkari Sahayak'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Here is your family&apos;s verified eligibility summary across 12 central and state social welfare schemes.
              </p>
            </div>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-center">
                <span className="text-[10px] font-bold uppercase text-forest-800 block">Eligible Schemes</span>
                <span className="text-2xl font-black text-forest-900">{eligibleSchemesCount}</span>
                <span className="text-[10px] text-forest-700 block font-medium">Deterministic Match</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-[#DBD7CE] text-center">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">Under Review</span>
                <span className="text-2xl font-black text-amber-700">{possibleSchemesCount}</span>
                <span className="text-[10px] text-slate-500 block font-medium">More info needed</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-[#DBD7CE] text-center">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">Verified Docs</span>
                <span className="text-2xl font-black text-slate-900">{profile.documentsAvailable?.length || 0}</span>
                <span className="text-[10px] text-slate-500 block font-medium">Ready for portal</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-[#DBD7CE] text-center">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">Direct Transfer</span>
                <span className="text-2xl font-black text-forest-800">DBT</span>
                <span className="text-[10px] text-forest-700 block font-medium">Aadhaar Seeded</span>
              </div>
            </div>

          </div>
        </div>

        {/* Top 2-Column Grid: Left Voice Chat Assistant | Right Citizen Profile & Document Assistant */}
        <div id="voice-assistant-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Voice Terminal Console (7 cols on lg) */}
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

          {/* Right Column: Citizen Profile Ledger & Document Tools (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Citizen Profile Card */}
            <CitizenProfileCard
              profile={profile}
              onUpdateProfile={(updated) => {
                setProfile(updated);
                setMatches(matchSchemes(updated, DEMO_SCHEMES));
              }}
              onLoadDemo={handleLoadDemo}
              eligibleCount={eligibleSchemesCount}
            />

            {/* Document Verification & Rejection Predictor Console */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8E5DE] shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-700"></span>
                    <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider">
                      Sarvam Document Intelligence
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Document Verification & Audit Tools
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Verify Income Certificates, Ration Cards, or Aadhaar with Sarvam Vision OCR. Run cross-document consistency checks to avoid rejection at CSC or Tahsildar offices.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-ivory-100 hover:bg-forest-50 text-slate-800 hover:text-forest-900 font-semibold text-xs border border-[#D8D4CA] hover:border-forest-300 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-forest-700" />
                  <span>Verify Document (OCR)</span>
                </button>

                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-forest-200" />
                  <span>Cross-Document Audit</span>
                </button>
              </div>
            </div>

            {/* Application Progress Checklist Card */}
            <div className="p-4 rounded-2xl bg-ivory-50 border border-[#E8E5DE] text-xs space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
                Application Readiness Roadmap
              </span>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>1. Describe family situation via voice</span>
                  </span>
                  <span className="font-semibold text-forest-800 text-[11px]">Completed</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>2. Deterministic rule eligibility check</span>
                  </span>
                  <span className="font-semibold text-forest-800 text-[11px]">{eligibleSchemesCount} Identified</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>3. Audit documents for name/date mismatches</span>
                  </span>
                  <span className="font-semibold text-amber-700 text-[11px]">Recommended</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>4. Final submission at official .gov.in portal</span>
                  </span>
                  <span className="font-semibold text-slate-500 text-[11px]">Pending</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Scheme Directory Section */}
        <div className="pt-6 border-t border-[#E8E5DE]">
          <SchemeCards
            matches={matches}
            onExplainScheme={handleExplainScheme}
            onSpeakScheme={handleSpeakScheme}
            currentLanguage={currentLanguage}
            isExplainingId={isExplainingId}
            isSpeakingId={isSpeakingId}
            initialCategory={schemeCategoryFilter}
            initialQuery={schemeSearchQuery}
          />
        </div>

        {/* Sarkari Suraksha: AI Government Scam Detector */}
        <div id="sarkari-suraksha-section" className="pt-8 border-t border-[#E8E5DE]">
          <SarkariSuraksha currentLanguage={currentLanguage} />
        </div>

      </main>

      {/* Editorial Civic Footer */}
      <footer className="mt-auto border-t border-[#E8E5DE] bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#F0ECE1]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-forest-800 text-white flex items-center justify-center font-bold text-xs font-serif">
                सं
              </div>
              <span className="font-bold text-slate-900 text-sm">Sarkari Sahayak</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">National Civic Intelligence Platform</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-forest-800 flex items-center gap-1">
                <span>myScheme Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a href="https://factcheck.pib.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-forest-800 flex items-center gap-1">
                <span>PIB Fact Check</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-forest-800 flex items-center gap-1">
                <span>Cyber Crime Portal (1930)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              Powered by Sarvam AI Official APIs: Saaras Speech-to-Text, Sarvam-105B Reasoning, Bulbul Text-to-Speech, and Sarvam Vision.
            </p>
            <p>
              Designed for Indian Citizens • Hindi, Marathi &amp; English • Initial Assessment Only
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentProfile={profile}
        onConfirmDocument={handleConfirmDocument}
        onOpenAudit={() => { setIsUploadModalOpen(false); setIsAuditModalOpen(true); }}
      />

      <DocumentAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        currentProfile={profile}
        currentLanguage={currentLanguage}
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
