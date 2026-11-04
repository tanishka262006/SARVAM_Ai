'use client';

import React from 'react';
import { Mic, MessageSquare, FileText, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '@/types';

interface HeroSectionProps {
  onStartVoice: () => void;
  onStartTyping: () => void;
  onOpenUpload: () => void;
  currentLanguage: SupportedLanguage;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartVoice,
  onStartTyping,
  onOpenUpload,
  currentLanguage,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-14 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/50 via-white to-slate-50">
      
      {/* Background subtle decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="absolute bottom-5 right-10 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Top Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 text-xs font-medium text-slate-700">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Powered by official <strong>Sarvam AI</strong> (Saaras STT, Sarvam-105B, Bulbul TTS, Sarvam Vision)</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Sarkari <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Sahayak</span>
        </h1>

        {/* Prompt required subtitle */}
        <p className="mt-4 text-xl sm:text-2xl font-semibold text-slate-700 max-w-3xl mx-auto leading-snug">
          &ldquo;Government schemes samajhna aur apply karna ab simple hai.&rdquo;
        </p>

        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
          Apni bhasha mein baat karein. AI aapki sthiti samajhkar sahi sarkari yojana batayega aur documents check karega.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
          {/* Primary Voice CTA */}
          <button
            onClick={onStartVoice}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all group"
          >
            <span className="p-1 rounded-full bg-white/20 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </span>
            <span>🎙 Talk to Sarkari Sahayak</span>
          </button>

          {/* Secondary Type CTA */}
          <button
            onClick={onStartTyping}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>⌨ Type instead</span>
          </button>

          {/* Secondary Upload CTA */}
          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>📄 Upload document</span>
          </button>
        </div>

        {/* Mandatory Safety / Trust Disclaimer */}
        <div className="mt-8 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-left sm:text-center font-medium">
            <strong>Disclaimer:</strong> Initial eligibility assessment only. Please verify final eligibility with the official government department before applying.
          </span>
        </div>

      </div>
    </section>
  );
};
