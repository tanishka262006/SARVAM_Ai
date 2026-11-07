'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Search,
  Filter,
  Check,
  Building2,
  HelpCircle,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { SchemeMatchResult, SupportedLanguage } from '@/types';

interface SchemeCardsProps {
  matches: SchemeMatchResult[];
  onExplainScheme: (scheme: SchemeMatchResult) => void;
  onSpeakScheme: (scheme: SchemeMatchResult) => void;
  currentLanguage: SupportedLanguage;
  isExplainingId?: string;
  isSpeakingId?: string;
  initialCategory?: string;
  initialQuery?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Schemes' },
  { id: 'farmer', label: 'Agriculture & Farmers' },
  { id: 'health', label: 'Health & Insurance' },
  { id: 'women_child', label: 'Women & Child' },
  { id: 'pension', label: 'Pension & Senior Citizens' },
  { id: 'livelihood', label: 'Livelihood & Gig Workers' },
  { id: 'housing', label: 'Housing & Solar' },
];

export const SchemeCards: React.FC<SchemeCardsProps> = ({
  matches,
  onExplainScheme,
  onSpeakScheme,
  currentLanguage,
  isExplainingId,
  isSpeakingId,
  initialCategory,
  initialQuery
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'possibly_eligible' | 'not_eligible'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);
  const [activeTabPerScheme, setActiveTabPerScheme] = useState<Record<string, 'steps' | 'docs' | 'reasons'>>({});

  // Sync if initial props change
  React.useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
  }, [initialQuery]);

  const eligibleCount = matches.filter((m) => m.status === 'eligible').length;
  const possibleCount = matches.filter((m) => m.status === 'possibly_eligible').length;
  const notEligibleCount = matches.filter((m) => m.status === 'not_eligible').length;

  const filteredMatches = useMemo(() => {
    return matches.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // 2. Category Filter
      if (selectedCategory !== 'all' && item.scheme.category !== selectedCategory) {
        return false;
      }
      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.scheme.name.toLowerCase().includes(q);
        const matchesNativeHi = item.scheme.nativeNames?.hi?.toLowerCase().includes(q);
        const matchesNativeMr = item.scheme.nativeNames?.mr?.toLowerCase().includes(q);
        const matchesDesc = item.scheme.description.toLowerCase().includes(q);
        const matchesBenefit = item.scheme.benefit.toLowerCase().includes(q);
        if (!matchesName && !matchesNativeHi && !matchesNativeMr && !matchesDesc && !matchesBenefit) {
          return false;
        }
      }
      return true;
    });
  }, [matches, statusFilter, selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  const setSchemeTab = (id: string, tab: 'steps' | 'docs' | 'reasons') => {
    setActiveTabPerScheme((prev) => ({ ...prev, [id]: tab }));
  };

  return (
    <div id="schemes-section" className="space-y-6 pt-2">
      
      {/* Directory Header & Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E5DE] p-5 sm:p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Government Scheme Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold">
                {filteredMatches.length} / {matches.length} Schemes
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Deterministic rule evaluation based on official gazette guidelines
            </p>
          </div>

          {/* Status Filter Tabs (High Contrast) */}
          <div className="inline-flex rounded-xl bg-ivory-100 p-1 border border-[#D8D4CA] text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-forest-900 shadow-xs border border-[#E0DCD4]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({matches.length})
            </button>
            <button
              onClick={() => setStatusFilter('eligible')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'eligible'
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'text-forest-800 hover:bg-forest-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Eligible ({eligibleCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('possibly_eligible')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'possibly_eligible'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              <span>Possible ({possibleCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('not_eligible')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'not_eligible'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Ineligible ({notEligibleCount})</span>
            </button>
          </div>
        </div>

        {/* Search & Category Pills Row */}
        <div className="pt-2 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border-t border-[#F0ECE1]">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-forest-800 text-white border-forest-900 shadow-xs'
                    : 'bg-ivory-50 text-slate-600 hover:text-slate-900 border-[#E2DFD7] hover:bg-ivory-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search in schemes */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700 bg-ivory-50 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-[#E8E5DE] text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schemes found matching this filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching category to &quot;All Schemes&quot; or clearing your search keywords.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Schemes List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMatches.map((item) => {
          const { scheme, status, matchScore, reasons, missingInformation } = item;
          const isExpanded = expandedSchemeId === scheme.id;
          const currentTab = activeTabPerScheme[scheme.id] || 'steps';

          // Status Badge styling
          const statusConfig = {
            eligible: {
              badgeClass: 'bg-forest-50 text-forest-800 border-forest-300',
              dotClass: 'bg-forest-700',
              label: 'High Eligibility',
              cardBorder: 'border-[#E8E5DE] hover:border-forest-300'
            },
            possibly_eligible: {
              badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
              dotClass: 'bg-amber-500',
              label: 'Possible Eligibility',
              cardBorder: 'border-[#E8E5DE] hover:border-amber-300'
            },
            not_eligible: {
              badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
              dotClass: 'bg-rose-500',
              label: 'Not Eligible',
              cardBorder: 'border-[#E8E5DE] opacity-85'
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
              className={`bg-white rounded-2xl border ${statusConfig.cardBorder} shadow-xs transition-all p-5 sm:p-6`}
            >
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  
                  {/* Status & Level Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold border ${statusConfig.badgeClass} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`}></span>
                      <span>{statusConfig.label}</span>
                    </span>
                    
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-ivory-100 text-slate-600 font-semibold border border-[#E2DFD7]">
                      {scheme.type}
                    </span>

                    {scheme.state && scheme.state !== 'All India' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                        {scheme.state}
                      </span>
                    )}
                  </div>

                  {/* Scheme Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-0.5">
                    {scheme.name}
                  </h3>
                  {nativeTitle && (
                    <p className="text-xs text-slate-500 font-medium">
                      {nativeTitle}
                    </p>
                  )}
                </div>

                {/* Match Score Badge */}
                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block font-medium">Eligibility Match</span>
                  <span className="text-lg font-black text-slate-900">{matchScore}%</span>
                </div>
              </div>

              {/* Benefit Highlight Box */}
              <div className="mt-3.5 p-3 rounded-xl bg-ivory-100 border border-[#E2DFD7] flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-forest-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ₹
                </div>
                <div>
                  <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">
                    Verified Benefit ({scheme.benefitAmount || 'Financial Grant'})
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 leading-snug">
                    {scheme.benefit}
                  </p>
                </div>
              </div>

              {/* Summary Description */}
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {scheme.description}
              </p>

              {/* Reasons / Qualification Criteria */}
              <div className="mt-3 text-xs space-y-1">
                {reasons.slice(0, 2).map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
                {missingInformation.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Needed to confirm: {missingInformation.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-4 pt-3.5 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-2.5">
                
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Explain Simply Button (Sarvam-105B) */}
                  <button
                    onClick={() => onExplainScheme(item)}
                    disabled={isExplainingId === scheme.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory-100 hover:bg-forest-50 text-slate-700 hover:text-forest-900 font-semibold text-xs border border-[#D8D4CA] transition-all disabled:opacity-50"
                  >
                    {isExplainingId === scheme.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-700" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                    )}
                    <span>Explain Simply</span>
                  </button>

                  {/* Speak This Button (Bulbul TTS) */}
                  <button
                    onClick={() => onSpeakScheme(item)}
                    disabled={isSpeakingId === scheme.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory-100 hover:bg-forest-50 text-slate-700 hover:text-forest-900 font-semibold text-xs border border-[#D8D4CA] transition-all disabled:opacity-50"
                  >
                    {isSpeakingId === scheme.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-700" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-forest-700" />
                    )}
                    <span>Speak Audio</span>
                  </button>

                  {/* Official Portal Link */}
                  {scheme.officialSource && (
                    <a
                      href={scheme.officialSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 font-medium text-xs border border-[#D8D4CA] transition-all"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>

                {/* Accordion Toggle */}
                <button
                  onClick={() => toggleExpand(scheme.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-950"
                >
                  <span>{isExpanded ? 'Hide details' : 'Application steps & checklist'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Accordion Body */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#E8E5DE] bg-ivory-50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 rounded-b-2xl">
                  
                  {/* Sub-tabs: Application Steps | Required Documents | Detailed Reasons */}
                  <div className="flex gap-4 border-b border-[#D8D4CA] pb-2 mb-4 text-xs font-semibold">
                    <button
                      onClick={() => setSchemeTab(scheme.id, 'steps')}
                      className={`pb-1 transition-all ${
                        currentTab === 'steps'
                          ? 'border-b-2 border-forest-800 text-forest-900 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Application Steps ({scheme.applicationSteps.length})
                    </button>
                    <button
                      onClick={() => setSchemeTab(scheme.id, 'docs')}
                      className={`pb-1 transition-all ${
                        currentTab === 'docs'
                          ? 'border-b-2 border-forest-800 text-forest-900 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Required Documents ({scheme.requiredDocuments.length})
                    </button>
                    <button
                      onClick={() => setSchemeTab(scheme.id, 'reasons')}
                      className={`pb-1 transition-all ${
                        currentTab === 'reasons'
                          ? 'border-b-2 border-forest-800 text-forest-900 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Rule Evaluation Details
                    </button>
                  </div>

                  {/* Application Steps Content */}
                  {currentTab === 'steps' && (
                    <ol className="space-y-2 text-xs text-slate-700">
                      {scheme.applicationSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-forest-800 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed pt-0.5">{step}</span>
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
                          className="p-3 rounded-xl bg-white border border-[#E8E5DE] flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {doc.name} {doc.isMandatory && <span className="text-rose-600">*</span>}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {doc.description}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-ivory-100 text-slate-700 font-semibold shrink-0 border border-[#DBD7CE]">
                            {doc.isMandatory ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rule Evaluation Reasons */}
                  {currentTab === 'reasons' && (
                    <div className="space-y-2 text-xs">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                      {missingInformation.map((info, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
