'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ClipboardCopy,
  Download,
  Volume2,
  ChevronDown,
  ChevronRight,
  FileText,
  UploadCloud,
  AlertCircle,
  Trash2,
  Scale
} from 'lucide-react';
import { CitizenProfile, ExtractedDocument, AuditResult, AuditCheck, SupportedLanguage } from '@/types';

interface DocumentAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CitizenProfile;
  currentLanguage: SupportedLanguage;
}

const statusConfig = {
  pass: {
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    label: 'Verified Match'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-700',
    bg: 'bg-amber-50/70',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    label: 'Discrepancy'
  },
  fail: {
    icon: AlertCircle,
    color: 'text-rose-700',
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border border-rose-200',
    label: 'Rejection Risk'
  }
};

const overallConfig = {
  clean: {
    icon: ShieldCheck,
    bgClass: 'bg-forest-900 border-forest-800 text-white',
    label: 'Documents Verified & Consistent',
    sublabel: 'Low rejection probability for scheme applications'
  },
  warnings: {
    icon: AlertTriangle,
    bgClass: 'bg-[#5C3D10] border-amber-900 text-white',
    label: 'Minor Inconsistencies Detected',
    sublabel: 'Review recommendations before formal submission'
  },
  critical_mismatch: {
    icon: ShieldAlert,
    bgClass: 'bg-[#681919] border-rose-950 text-white',
    label: 'Critical Document Discrepancy',
    sublabel: 'High rejection risk — correction or affidavit recommended'
  }
};

function RiskGauge({ score }: { score: number }) {
  const color = score <= 30 ? '#10b981' : score <= 60 ? '#f59e0b' : '#ef4444';
  const label = score <= 30 ? 'Low Risk' : score <= 60 ? 'Moderate' : 'High Risk';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={`${score} ${100 - score}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-white tracking-tight">{score}%</span>
          <span className="text-[9px] text-white/70 uppercase tracking-widest font-mono">Risk</span>
        </div>
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function AuditCheckCard({ check }: { check: AuditCheck; index: number }) {
  const [expanded, setExpanded] = useState(check.status !== 'pass');
  const cfg = statusConfig[check.status];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-colors`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
          <span className="text-xs font-semibold text-slate-900">{check.checkName}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.badge}`}>
            {cfg.label}
          </span>
          {check.severity === 'high' && check.status !== 'pass' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white tracking-wide uppercase">
              Action Req.
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3.5 space-y-2 border-t border-slate-200/60 pt-2.5">
          <p className="text-xs text-slate-700 leading-relaxed font-sans">{check.details}</p>
          {check.affectedDocuments.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Sources:</span>
              {check.affectedDocuments.map((d) => (
                <span key={d} className="px-2 py-0.5 rounded bg-white border border-[#DDD9D0] text-[10px] font-medium text-slate-700">
                  {d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const DocumentAuditModal: React.FC<DocumentAuditModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  currentLanguage
}) => {
  const [uploadedDocs, setUploadedDocs] = useState<ExtractedDocument[]>([]);
  const [, setPendingFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [affidavitCopied, setAffidavitCopied] = useState(false);
  const [isSpeakingAudit, setIsSpeakingAudit] = useState(false);
  const [auditAudioUrl, setAuditAudioUrl] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'checks' | 'recs' | 'affidavit'>('checks');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  // Extract a single document via Sarvam Vision
  const extractDocument = async (file: File): Promise<ExtractedDocument | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('currentProfile', JSON.stringify(currentProfile));
    const res = await fetch('/api/sarvam/vision', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Extraction failed');
    return data.document as ExtractedDocument;
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setIsExtracting(true);
    setAuditError(null);
    const newDocs: ExtractedDocument[] = [...uploadedDocs];
    for (const f of files) {
      try {
        const doc = await extractDocument(f);
        if (doc) newDocs.push(doc);
      } catch (err: any) {
        setAuditError(`Failed to extract "${f.name}": ${err.message}`);
      }
    }
    setUploadedDocs(newDocs);
    setIsExtracting(false);
    setAuditResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPendingFiles(files);
      handleFilesSelected(files);
    }
  };

  const handleDemoLoad = async (sampleType: 'income_certificate' | 'ration_card' | 'aadhaar_card') => {
    setIsExtracting(true);
    setAuditError(null);
    try {
      const res = await fetch('/api/sarvam/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemoSample: true, sampleType, currentProfile })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Demo load failed');
      setUploadedDocs((prev) => {
        const filtered = prev.filter((d) => d.document_type !== sampleType);
        return [...filtered, data.document as ExtractedDocument];
      });
      setAuditResult(null);
    } catch (err: any) {
      setAuditError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveDoc = (index: number) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
    setAuditResult(null);
  };

  const handleRunAudit = async () => {
    if (uploadedDocs.length === 0) {
      setAuditError('Please upload at least one document to audit.');
      return;
    }
    setIsAuditing(true);
    setAuditError(null);
    setAuditResult(null);
    try {
      const res = await fetch('/api/sarvam/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: uploadedDocs,
          citizenProfile: currentProfile,
          language: currentLanguage
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Audit failed');
      setAuditResult(data.audit as AuditResult);
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed. Please try again.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSpeakAudit = async () => {
    if (!auditResult) return;
    setIsSpeakingAudit(true);
    try {
      const textToSpeak = `Document Audit Summary. ${auditResult.summary}. Rejection risk score: ${auditResult.rejectionRiskScore} percent. ${auditResult.recommendations.slice(0, 2).join('. ')}`;
      const res = await fetch('/api/sarvam/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, languageCode: currentLanguage })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'TTS failed');
      setAuditAudioUrl(data.dataUrl);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (err: any) {
      setAuditError('Voice playback failed: ' + err.message);
    } finally {
      setIsSpeakingAudit(false);
    }
  };

  const handleCopyAffidavit = () => {
    if (auditResult?.affidavitTemplate) {
      navigator.clipboard.writeText(auditResult.affidavitTemplate).then(() => {
        setAffidavitCopied(true);
        setTimeout(() => setAffidavitCopied(false), 2500);
      });
    }
  };

  const handleDownloadAffidavit = () => {
    if (!auditResult?.affidavitTemplate) return;
    const blob = new Blob([auditResult.affidavitTemplate], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sarkari_Sahayak_Affidavit.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cfg = auditResult ? overallConfig[auditResult.overallStatus] : null;
  const OverallIcon = cfg?.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-[#FBFBFA] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#DDD9D0] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E5DE] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-forest-950 tracking-tight">
                  Document Rejection Predictor
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-[#F2EFE9] text-slate-700 border border-[#DDD9D0]">
                  Sarvam-105B
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cross-document name, DOB, and spelling consistency audit before official filing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-[#F2EFE9] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Demo Samples Ticker */}
            <div className="p-3.5 bg-[#F6F4EF] border border-[#DDD9D0] rounded-xl">
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Sample Test Documents:
              </span>
              <div className="flex flex-wrap gap-2">
                {(['income_certificate', 'ration_card', 'aadhaar_card'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleDemoLoad(s)}
                    disabled={isExtracting || isAuditing}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-forest-50 border border-[#DDD9D0] hover:border-forest-400 text-xs font-medium text-forest-900 shadow-2xs transition-all disabled:opacity-50"
                  >
                    + {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#DDD9D0] hover:border-forest-600 rounded-xl p-5 text-center cursor-pointer bg-white hover:bg-forest-50/20 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 mx-auto mb-2 text-slate-400 group-hover:text-forest-700 transition-colors" />
              <p className="text-sm font-semibold text-slate-800">
                Upload Citizen Document Copies
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Income Certificate + Ration Card + Aadhaar (PDF, JPG, PNG) — extracted on Sarvam Vision
              </p>
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                  Enrolled Documents ({uploadedDocs.length})
                </span>
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E8E5DE] shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-forest-700 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-slate-900">
                          {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        {doc.name && (
                          <span className="text-[11px] text-slate-500 ml-2">({doc.name})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${doc.status === 'verified' ? 'bg-forest-50 text-forest-800 border border-forest-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                        {Math.round(doc.confidence * 100)}% conf
                      </span>
                      <button
                        onClick={() => handleRemoveDoc(i)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processing State */}
            {isExtracting && (
              <div className="flex items-center gap-3 p-3.5 bg-forest-50/80 border border-forest-200 rounded-xl">
                <Loader2 className="w-5 h-5 text-forest-700 animate-spin shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-forest-950">Sarvam Vision is extracting certificate fields...</span>
                  <p className="text-[11px] text-forest-800">Parsing certificate numbers, names, father/husband names, and dates</p>
                </div>
              </div>
            )}

            {/* Error notice */}
            {auditError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{auditError}</span>
              </div>
            )}

            {/* Run Audit Button */}
            {uploadedDocs.length > 0 && !isExtracting && (
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full py-3.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sarvam-105B auditing cross-document consistency...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4 text-amber-300" />
                    <span>Run Consistency & Rejection Audit ({uploadedDocs.length} Documents)</span>
                  </>
                )}
              </button>
            )}

            {/* ---- AUDIT RESULTS ---- */}
            {auditResult && cfg && OverallIcon && (
              <div className="space-y-4 pt-1">

                {/* Overall Status Hero */}
                <div className={`rounded-xl border p-5 ${cfg.bgClass} shadow-md`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <OverallIcon className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-tight">{cfg.label}</span>
                      </div>
                      <p className="text-xs text-white/80 mb-2">{cfg.sublabel}</p>
                      <p className="text-xs text-white/90 leading-relaxed max-w-sm">
                        {auditResult.summary}
                      </p>
                    </div>
                    <RiskGauge score={auditResult.rejectionRiskScore} />
                  </div>

                  {/* Quick Stats Ledger */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Verified', count: auditResult.checks.filter(c => c.status === 'pass').length },
                      { label: 'Warnings', count: auditResult.checks.filter(c => c.status === 'warning').length },
                      { label: 'Discrepancies', count: auditResult.checks.filter(c => c.status === 'fail').length }
                    ].map((s) => (
                      <div key={s.label} className="bg-black/20 border border-white/10 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold">{s.count}</div>
                        <div className="text-[10px] text-white/75 uppercase tracking-wider font-mono">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Speak Audit Button */}
                  <button
                    onClick={handleSpeakAudit}
                    disabled={isSpeakingAudit}
                    className="mt-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-all disabled:opacity-60"
                  >
                    {isSpeakingAudit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>Listen to Audit Summary (Bulbul TTS)</span>
                  </button>
                  {auditAudioUrl && (
                    <audio ref={audioRef} src={auditAudioUrl} className="mt-2 w-full h-8 opacity-90" controls />
                  )}
                </div>

                {/* Section Tabs */}
                <div className="flex gap-1 p-1 bg-[#EFECE6] border border-[#DDD9D0] rounded-lg">
                  {(['checks', 'recs', 'affidavit'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setExpandedSection(s)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        expandedSection === s
                          ? 'bg-white text-forest-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s === 'checks' ? 'Audit Checks' : s === 'recs' ? 'Remedies & Fixes' : 'Affidavit Template'}
                    </button>
                  ))}
                </div>

                {/* Checks Tab */}
                {expandedSection === 'checks' && (
                  <div className="space-y-2">
                    {auditResult.checks.map((check, i) => (
                      <AuditCheckCard key={i} check={check} index={i} />
                    ))}
                  </div>
                )}

                {/* Recommendations Tab */}
                {expandedSection === 'recs' && (
                  <div className="space-y-2">
                    {auditResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-white border border-[#E8E5DE] rounded-xl">
                        <span className="w-5 h-5 rounded bg-forest-100 text-forest-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                    {auditResult.recommendations.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        All cross-document consistency checks passed with zero blockers.
                      </p>
                    )}
                  </div>
                )}

                {/* Affidavit Tab */}
                {expandedSection === 'affidavit' && (
                  <div className="space-y-3">
                    {auditResult.affidavitRequired && auditResult.affidavitTemplate ? (
                      <>
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-900">
                            A one-and-the-same person affidavit is advised before official filing to prevent rejection at verification.
                          </p>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-800 bg-white border border-[#DDD9D0] rounded-xl p-4 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                          {auditResult.affidavitTemplate}
                        </pre>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyAffidavit}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-[#DDD9D0] hover:bg-[#F6F4EF] text-slate-800 text-xs font-semibold transition-all"
                          >
                            <ClipboardCopy className="w-3.5 h-3.5" />
                            {affidavitCopied ? 'Copied to Clipboard' : 'Copy Affidavit Text'}
                          </button>
                          <button
                            onClick={handleDownloadAffidavit}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download .txt
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-400 bg-white border border-[#E8E5DE] rounded-xl">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-forest-700" />
                        <p className="text-sm font-semibold text-slate-800">No Affidavit Required</p>
                        <p className="text-xs text-slate-500 mt-1">
                          No severe name, parent name, or date discrepancies were flagged.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2 font-sans">
                  Preliminary automated consistency audit. Verification is subject to final scrutiny by designated departmental officers at Jan Seva Kendra or portal submission.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8E5DE] flex items-center justify-between gap-3 shrink-0 bg-[#F6F4EF]">
          <span className="text-[11px] font-mono text-slate-500">
            Audit Engine: Sarvam-105B Reasoning + Sarvam Vision
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-[#EFECE6] border border-[#DDD9D0] bg-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
