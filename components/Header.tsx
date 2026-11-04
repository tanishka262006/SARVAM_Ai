'use client';

import React from 'react';
import { Sparkles, Globe, UserCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { CitizenProfile, SupportedLanguage } from '@/types';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLoadDemo: () => void;
  onReset: () => void;
  profile: CitizenProfile;
  isDemoActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoadDemo,
  onReset,
  profile,
  isDemoActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-600 shadow-md shadow-orange-500/20 text-white font-bold text-xl tracking-tight">
              <span>🇮🇳</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Sarkari<span className="text-orange-600">Sahayak</span>
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold border border-orange-200">
                  Sarvam AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                सरकारी सहायक • AI Citizen Scheme Portal
              </p>
            </div>
          </div>

          {/* Center Actions: Demo Mode Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onLoadDemo}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                isDemoActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 active:scale-95 shadow-orange-500/25'
              }`}
              title="Test with pre-configured Pune delivery worker profile"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDemoActive ? 'Demo: Ramesh Kumar' : 'Try Demo Mode'}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <Globe className="w-4 h-4 ml-2 mr-1 text-slate-500 hidden sm:inline" />
              <button
                onClick={() => onLanguageChange('en-IN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentLanguage === 'en-IN'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi-IN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentLanguage === 'hi-IN'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => onLanguageChange('mr-IN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currentLanguage === 'mr-IN'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Reset conversation & profile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
