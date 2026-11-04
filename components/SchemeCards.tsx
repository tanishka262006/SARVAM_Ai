'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  HelpCircle,
  Sparkles,
  Loader2,
  IndianRupee,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SchemeMatchResult, SupportedLanguage } from '@/types';

interface SchemeCardsProps {
  matches: SchemeMatchResult[];
  onExplainScheme: (scheme: SchemeMatchResult) => void;
  onSpeakScheme: (scheme: SchemeMatchResult) => void;
  currentLanguage: SupportedLanguage;
  isExplainingId?: string;
  isSpeakingId?: string;
}

export const SchemeCards: React.FC<SchemeCardsProps> = ({
  matches,
  onExplainScheme,
  onSpeakScheme,
  currentLanguage,
  isExplainingId,
  isSpeakingId,
}) => {
  const [filter, setFilter] = useState<'all' | 'eligible' | 'possibly_eligible' | 'not_eligible'>('all');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);
  const [activeTabPerScheme, setActiveTabPerScheme] = useState<Record<string, 'steps' | 'docs' | 'reasons'>>({});

  const eligibleCount = matches.filter((m) => m.status === 'eligible').length;
  const possibleCount = matches.filter((m) => m.status === 'possibly_eligible').length;
  const notEligibleCount = matches.filter((m) => m.status === 'not_eligible').length;

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const toggleExpand = (id: string) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  const setSchemeTab = (id: string, tab: 'steps' | 'docs' | 'reasons') => {
    setActiveTabPerScheme((prev) => ({ ...prev, [id]: tab }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Discovered Government Schemes</span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
              {matches.length} Schemes
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Evaluated with deterministic government eligibility criteria
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({matches.length})
          </button>
          <button
            onClick={() => setFilter('eligible')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'eligible'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Eligible ({eligibleCount})</span>
          </button>
          <button
            onClick={() => setFilter('possibly_eligible')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'possibly_eligible'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Possible ({possibleCount})</span>
          </button>
          <button
            onClick={() => setFilter('not_eligible')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'not_eligible'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Ineligible ({notEligibleCount})</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 gap-5">
        {filteredMatches.map((item) => {
          const { scheme, status, matchScore, reasons, missingInformation, missingDocuments } = item;
          const isExpanded = expandedSchemeId === scheme.id;
          const currentTab = activeTabPerScheme[scheme.id] || 'steps';

          // Status Badge styling
          const statusConfig = {
            eligible: {
              badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20',
              dotClass: 'bg-emerald-500',
              label: '🟢 High Eligibility',
              borderCard: 'hover:border-emerald-300 border-slate-200'
            },
            possibly_eligible: {
              badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/20',
              dotClass: 'bg-amber-500',
              label: '🟡 Possible Eligibility',
              borderCard: 'hover:border-amber-300 border-slate-200'
            },
            not_eligible: {
              badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
              dotClass: 'bg-rose-500',
              label: '🔴 Not Eligible',
              borderCard: 'hover:border-slate-300 border-slate-200 opacity-80'
            }
          }[status];

          // Language-specific native title
          const nativeTitle =
            currentLanguage === 'mr-IN'
              ? scheme.nativeNames.mr
              : scheme.nativeNames.hi;

          return (
            <div
              key={scheme.id}
              className={`bg-white rounded-3xl border ${statusConfig.borderCard} shadow-sm hover:shadow-md transition-all p-5 sm:p-6`}
            >
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${statusConfig.badgeClass} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`}></span>
                      <span>{statusConfig.label}</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      {scheme.type}
                    </span>
                    {scheme.state && scheme.state !== 'All India' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
                        📍 {scheme.state}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 pt-1">
                    {scheme.name}
                  </h3>
                  {nativeTitle && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      {nativeTitle}
                    </p>
                  )}
                </div>

                {/* Match Score Badge */}
                <div className="sm:text-right shrink-0">
                  <span className="text-xs text-slate-400 block font-medium">Rule Match</span>
                  <span className="text-xl font-black text-slate-900">{matchScore}%</span>
                </div>
              </div>

              {/* Benefit Highlight Box */}
              <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-100/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  ₹
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-900 uppercase tracking-wider block">
                    Key Benefit ({scheme.benefitAmount || 'Financial Support'})
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {scheme.benefit}
                  </p>
                </div>
              </div>

              {/* Short Summary & Why Qualified */}
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {scheme.description}
              </p>

              {/* Why Citizen Qualifies / Disqualifies Snippet */}
              <div className="mt-3 text-xs space-y-1">
                {reasons.slice(0, 2).map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
                {missingInformation.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Needed to confirm: {missingInformation.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Explain Simply Button (Sarvam-105B) */}
                  <button
                    onClick={() => onExplainScheme(item)}
                    disabled={isExplainingId === scheme.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-semibold text-xs border border-slate-200 transition-all disabled:opacity-50"
                  >
                    {isExplainingId === scheme.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    )}
                    <span>Explain simply</span>
                  </button>

                  {/* Speak This Button (Bulbul TTS) */}
                  <button
                    onClick={() => onSpeakScheme(item)}
                    disabled={isSpeakingId === scheme.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs border border-slate-200 transition-all disabled:opacity-50"
                  >
                    {isSpeakingId === scheme.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Speak this</span>
                  </button>

                  {/* Official Portal Link */}
                  {scheme.officialSource && (
                    <a
                      href={scheme.officialSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-800 font-medium text-xs border border-slate-200 transition-all"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Accordion Toggle Button */}
                <button
                  onClick={() => toggleExpand(scheme.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <span>{isExpanded ? 'Hide details' : 'Application steps & docs'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expandable Accordion Body */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 rounded-b-3xl">
                  
                  {/* Sub-tabs: Application Steps | Required Documents | Detailed Reasons */}
                  <div className="flex gap-2 border-b border-slate-200 pb-2 mb-4 text-xs font-semibold">
                    <button
                      onClick={() => setSchemeTab(scheme.id, 'steps')}
                      className={`pb-1 px-1 transition-all ${
                        currentTab === 'steps'
                          ? 'border-b-2 border-orange-600 text-orange-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Application Steps ({scheme.applicationSteps.length})
                    </button>
                    <button
                      onClick={() => setSchemeTab(scheme.id, 'docs')}
                      className={`pb-1 px-1 transition-all ${
                        currentTab === 'docs'
                          ? 'border-b-2 border-orange-600 text-orange-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Required Documents ({scheme.requiredDocuments.length})
                    </button>
                    <button
                      onClick={() => setSchemeTab(scheme.id, 'reasons')}
                      className={`pb-1 px-1 transition-all ${
                        currentTab === 'reasons'
                          ? 'border-b-2 border-orange-600 text-orange-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Rule Evaluation Details
                    </button>
                  </div>

                  {/* Application Steps Content */}
                  {currentTab === 'steps' && (
                    <ol className="space-y-2.5 text-xs text-slate-700">
                      {scheme.applicationSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="leading-snug pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Documents Content */}
                  {currentTab === 'docs' && (
                    <div className="space-y-2 text-xs">
                      {scheme.requiredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {doc.name} {doc.isMandatory && <span className="text-rose-600">*</span>}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {doc.description}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                            {doc.isMandatory ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rule Evaluation Reasons */}
                  {currentTab === 'reasons' && (
                    <div className="space-y-1.5 text-xs">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                      {missingInformation.map((info, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Missing data: {info}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
