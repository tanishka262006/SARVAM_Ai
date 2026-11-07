'use client';

import React, { useState } from 'react';
import {
  Mic,
  MessageSquare,
  FileText,
  ShieldAlert,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  Volume2,
  Scale
} from 'lucide-react';
import { SupportedLanguage } from '@/types';

interface HeroSectionProps {
  onStartVoice: () => void;
  onStartTyping: () => void;
  onOpenUpload: () => void;
  onOpenAudit: () => void;
  onOpenSuraksha?: () => void;
  onSearchCategory?: (category: string) => void;
  onSearchQuery?: (query: string) => void;
  currentLanguage: SupportedLanguage;
}

const HERO_CONTENT = {
  'en-IN': {
    badge: 'National Citizen Service Engine',
    headline: 'Government benefits, made accessible to everyone.',
    catchphrase: 'Government schemes samajhna aur apply karna ab simple hai.',
    subtext:
      'Speak in Hindi, Marathi, or English. Our AI analyzes your situation, matches you with eligible central and state schemes using deterministic government rules, and audits your documents before you apply.',
    talkBtn: 'Talk to Sarkari Sahayak',
    typeBtn: 'Type situation instead',
    uploadBtn: 'Verify document (OCR)',
    auditBtn: 'Audit document consistency',
    searchPlaceholder: 'Search schemes by name, keyword or benefit (e.g. Kisan, Pension, Ayushman)...',
    stat1: '12+ Demo Schemes',
    stat1Sub: 'Verified with official criteria',
    stat2: 'Deterministic Rules',
    stat2Sub: 'Zero AI hallucinations on eligibility',
    stat3: '3 Indian Languages',
    stat3Sub: 'Hindi, Marathi & English speech',
    categories: [
      { id: 'farmer', label: 'Agriculture & Farmers' },
      { id: 'health', label: 'Healthcare & Insurance' },
      { id: 'women_child', label: 'Women & Child' },
      { id: 'pension', label: 'Pension & Senior Citizens' },
      { id: 'livelihood', label: 'Gig & Street Vendors' },
      { id: 'housing', label: 'Housing & Energy' }
    ],
    step1Title: '1. Explain in your own words',
    step1Desc: 'Speak or type your income, family, and occupation naturally.',
    step2Title: '2. Deterministic Eligibility',
    step2Desc: 'Calculated using official ministry rules without guessing.',
    step3Title: '3. Verified Application Steps',
    step3Desc: 'Check required documents and listen to explanations in simple language.'
  },
  'hi-IN': {
    badge: 'राष्ट्रीय नागरिक सेवा इंजन',
    headline: 'सरकारी योजनाएं और लाभ, अब हर नागरिक की पहुंच में।',
    catchphrase: 'Government schemes samajhna aur apply karna ab simple hai.',
    subtext:
      'अपनी भाषा (हिंदी, मराठी या अंग्रेजी) में बोलें। एआई आपकी स्थिति को समझकर आधिकारिक सरकारी नियमों से सटीक योजनाएं ढूंढेगा और आपके दस्तावेजों की पहले से जांच करेगा।',
    talkBtn: '🎙 सरकारी सहायक से बोलकर बात करें',
    typeBtn: 'लिखकर बताएं',
    uploadBtn: 'दस्तावेज़ जांचें (OCR)',
    auditBtn: 'क्रॉस-डॉक्यूमेंट ऑडिट',
    searchPlaceholder: 'योजना का नाम, कीवर्ड या लाभ खोजें (जैसे किसान, पेंशन, आयुष्मान)...',
    stat1: '12+ प्रमाणित योजनाएं',
    stat1Sub: 'आधिकारिक स्रोतों से सत्यापित',
    stat2: 'नियम आधारित पात्रता',
    stat2Sub: 'पात्रता में बिना किसी मनगढ़ंत दावे के',
    stat3: '3 भारतीय भाषाएं',
    stat3Sub: 'हिंदी, मराठी और अंग्रेजी वाणी',
    categories: [
      { id: 'farmer', label: 'किसान व कृषि' },
      { id: 'health', label: 'स्वास्थ्य व बीमा' },
      { id: 'women_child', label: 'महिला व बाल विकास' },
      { id: 'pension', label: 'पेंशन व वरिष्ठ नागरिक' },
      { id: 'livelihood', label: 'असंगठित व पटरी विक्रेता' },
      { id: 'housing', label: 'आवास व ऊर्जा' }
    ],
    step1Title: '1. अपनी सरल भाषा में बताएं',
    step1Desc: 'अपनी आय, परिवार और काम के बारे में बोलें या लिखें।',
    step2Title: '2. सटीक नियम-आधारित जांच',
    step2Desc: 'सरकारी दिशानिर्देशों के अनुसार पात्रता निर्धारित की जाती है।',
    step3Title: '3. आवेदन चेकलिस्ट व आवाज़',
    step3Desc: 'आवश्यक कागजात देखें और सरल आवाज़ में पूरी प्रक्रिया समझें।'
  },
  'mr-IN': {
    badge: 'राष्ट्रीय नागरिक सेवा मंच',
    headline: 'सरकारी योजना आणि लाभ, आता प्रत्येक नागरिकासाठी सोपे.',
    catchphrase: 'Government schemes samajhna aur apply karna ab simple hai.',
    subtext:
      'मराठी, हिंदी किंवा इंग्रजीत बोला. एआय तुमची परिस्थिती समजून अधिकृत नियमांनुसार पात्र योजना शोधेल आणि कागदपत्रांमधील चुका आधीच तपासेल.',
    talkBtn: '🎙 सरकारी सहायकाशी बोला',
    typeBtn: 'टाइप करून सांगा',
    uploadBtn: 'कागदपत्र तपासा (OCR)',
    auditBtn: 'कागदपत्रांचे ऑडिट',
    searchPlaceholder: 'योजनेचे नाव किंवा लाभ शोधा (उदा. शेतकरी, पेन्शन, लाडकी बहीण)...',
    stat1: '12+ प्रमाणित योजना',
    stat1Sub: 'अधिकृत नियमांनुसार पडताळणी',
    stat2: 'नियम-आधारित पात्रता',
    stat2Sub: 'कोणत्याही खोट्या दाव्यांशिवाय',
    stat3: '3 भाषांमध्ये संवाद',
    stat3Sub: 'मराठी, हिंदी व इंग्रजी आवाज',
    categories: [
      { id: 'farmer', label: 'शेतकरी व कृषी' },
      { id: 'health', label: 'आरोग्य व विमा' },
      { id: 'women_child', label: 'महिला व बाल विकास' },
      { id: 'pension', label: 'पेन्शन व ज्येष्ठ नागरिक' },
      { id: 'livelihood', label: 'रोजगार व फेरीवाले' },
      { id: 'housing', label: 'गृहनिर्माण व ऊर्जा' }
    ],
    step1Title: '1. आपल्या भाषेत सांगा',
    step1Desc: 'तुमचे उत्पन्न, कुटुंब आणि व्यवसाय मोकळेपणाने सांगा.',
    step2Title: '2. अचूक पात्रता तपासणी',
    step2Desc: 'सरकारी नियमांच्या आधारे नेमकी पात्रता ठरवली जाते.',
    step3Title: '3. अर्ज प्रक्रिया व मार्गदर्शन',
    step3Desc: 'कागदपत्रांची यादी तपासा आणि सोप्या आवाजात माहिती ऐका.'
  }
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartVoice,
  onStartTyping,
  onOpenUpload,
  onOpenAudit,
  onOpenSuraksha,
  onSearchCategory,
  onSearchQuery,
  currentLanguage,
}) => {
  const content = HERO_CONTENT[currentLanguage] || HERO_CONTENT['en-IN'];
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery && searchTerm.trim()) {
      onSearchQuery(searchTerm.trim());
      document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (catId: string) => {
    if (onSearchCategory) {
      onSearchCategory(catId);
      document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#FBFBFA] border-b border-[#E8E5DE] pt-8 pb-12 sm:pt-14 sm:pb-16">
      
      {/* Editorial Decorative Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:4rem_4rem]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Civic Authority Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-forest-700 animate-pulse" />
            <span className="text-xs font-semibold text-forest-900 tracking-wide uppercase">
              {content.badge}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-forest-800 font-medium hidden sm:inline">
              Powered by Sarvam AI (Saaras, Sarvam-105B, Bulbul, Vision)
            </span>
          </div>
        </div>

        {/* Primary Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            {content.headline}
          </h1>

          <p className="text-base sm:text-lg font-semibold text-forest-800 tracking-normal italic max-w-2xl mx-auto">
            &ldquo;{content.catchphrase}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {content.subtext}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
          {/* Main Voice Intake Button */}
          <button
            onClick={onStartVoice}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm sm:text-base shadow-sm transition-all hover:scale-[1.01] active:scale-98"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span>{content.talkBtn}</span>
          </button>

          {/* Type instead */}
          <button
            onClick={onStartTyping}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-ivory-100 text-slate-700 font-semibold text-xs sm:text-sm border border-[#D8D4CA] shadow-xs transition-all active:scale-98"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>{content.typeBtn}</span>
          </button>

          {/* Document Verification */}
          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-ivory-100 text-slate-700 font-semibold text-xs sm:text-sm border border-[#D8D4CA] shadow-xs transition-all active:scale-98"
          >
            <FileText className="w-4 h-4 text-forest-700" />
            <span>{content.uploadBtn}</span>
          </button>

          {/* Audit CTA */}
          <button
            onClick={onOpenAudit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-rose-50/50 text-slate-700 hover:text-rose-900 font-semibold text-xs sm:text-sm border border-[#D8D4CA] hover:border-rose-200 shadow-xs transition-all active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>{content.auditBtn}</span>
          </button>
        </div>

        {/* Scheme Search Input Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={content.searchPlaceholder}
              className="w-full pl-10 pr-24 py-3 rounded-xl bg-white border border-[#D8D4CA] focus:border-forest-700 focus:ring-1 focus:ring-forest-700 text-slate-900 text-xs sm:text-sm placeholder-slate-400 outline-none shadow-xs transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs rounded-lg transition-all"
            >
              Search
            </button>
          </form>

          {/* Popular Category Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular:</span>
            {content.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="px-2.5 py-1 rounded-md bg-ivory-100 hover:bg-forest-50 hover:text-forest-800 border border-[#E2DFD7] text-[11px] font-medium text-slate-600 transition-all"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Step Process Flow (Clean Fintech/Civic Architecture) */}
        <div className="mt-12 pt-8 border-t border-[#E8E5DE] grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 rounded-xl bg-white border border-[#E8E5DE] shadow-xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 font-bold text-xs">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {content.step1Title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {content.step1Desc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E5DE] shadow-xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 font-bold text-xs">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {content.step2Title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {content.step2Desc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E5DE] shadow-xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 font-bold text-xs">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {content.step3Title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {content.step3Desc}
            </p>
          </div>
        </div>

        {/* Mandatory Civic Trust Disclaimer */}
        <div className="mt-8 p-3 rounded-xl bg-ivory-100 border border-[#DBD7CE] text-slate-700 text-xs flex items-center justify-center gap-2.5 max-w-3xl mx-auto">
          <Scale className="w-4 h-4 text-forest-700 shrink-0" />
          <span className="text-center font-medium">
            <strong>Official Verification Notice:</strong> Initial eligibility assessment only. Always verify your final eligibility and submit formal applications directly through official government portals (.gov.in).
          </span>
        </div>

      </div>
    </section>
  );
};
