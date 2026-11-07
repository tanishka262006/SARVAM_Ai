'use client';

import React from 'react';
import {
  Globe,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  Sparkles,
  Layers,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { CitizenProfile, SupportedLanguage } from '@/types';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLoadDemo: () => void;
  onReset: () => void;
  onOpenSuraksha?: () => void;
  profile: CitizenProfile;
  isDemoActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoadDemo,
  onReset,
  onOpenSuraksha,
  profile,
  isDemoActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E8E5DE] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-forest-900 shrink-0">
              <span className="font-serif tracking-tighter">सं</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-forest-900">
                  Sarkari<span className="text-forest-700 font-medium">Sahayak</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest-50 border border-forest-200 text-forest-800 text-[10px] font-semibold tracking-wide uppercase">
                  <span>GovTech</span>
                  <span className="w-1 h-1 rounded-full bg-forest-600"></span>
                  <span>Sarvam AI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                सरकारी सहायक • Citizen Scheme & Entitlements Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Shortcuts */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a
              href="#voice-assistant-section"
              className="hover:text-forest-800 transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Voice Intake</span>
            </a>
            <a
              href="#schemes-section"
              className="hover:text-forest-800 transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Scheme Directory</span>
            </a>
            <a
              href="#citizen-profile-section"
              className="hover:text-forest-800 transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Citizen Ledger</span>
            </a>
            <button
              onClick={onOpenSuraksha}
              className="hover:text-rose-700 transition-colors py-1 flex items-center gap-1 text-slate-700"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Scam Detector</span>
            </button>
          </nav>

          {/* Right Controls: Demo Mode, Language Selector, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Mode Button */}
            <button
              onClick={onLoadDemo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isDemoActive
                  ? 'bg-forest-50 text-forest-800 border-forest-300 ring-1 ring-forest-400/20'
                  : 'bg-white hover:bg-forest-50/50 text-slate-700 hover:text-forest-900 border-[#D8D4CA] shadow-sm'
              }`}
              title="Load pre-verified Pune delivery worker profile"
            >
              {isDemoActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                  <span className="hidden sm:inline">Profile:</span>
                  <span>Ramesh Kumar</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-forest-700" />
                  <span>Try Demo Profile</span>
                </>
              )}
            </button>

            {/* Language Selector (High Contrast Segmented Control) */}
            <div className="inline-flex items-center rounded-lg bg-ivory-200 p-0.5 border border-[#DBD7CE]">
              <button
                onClick={() => onLanguageChange('en-IN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentLanguage === 'en-IN'
                    ? 'bg-white text-forest-900 shadow-sm border border-[#E0DCD4]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi-IN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentLanguage === 'hi-IN'
                    ? 'bg-white text-forest-900 shadow-sm border border-[#E0DCD4]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => onLanguageChange('mr-IN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentLanguage === 'mr-IN'
                    ? 'bg-white text-forest-900 shadow-sm border border-[#E0DCD4]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-ivory-200 rounded-lg transition-all"
              title="Reset intake session"
              aria-label="Reset intake session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
