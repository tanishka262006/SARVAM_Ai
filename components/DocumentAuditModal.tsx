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
  Trash2
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
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    label: '✅ Pass'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    label: '⚠️ Warning'
  },
  fail: {
    icon: AlertCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    label: '❌ Issue'
  }
};

const overallConfig = {
  clean: {
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-teal-500',
    label: 'Documents Look Good',
    sublabel: 'Low rejection risk'
  },
  warnings: {
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-500',
    label: 'Some Warnings Found',
    sublabel: 'Review recommendations'
  },
  critical_mismatch: {
    icon: ShieldAlert,
    gradient: 'from-rose-500 to-red-600',
    label: 'Critical Mismatches',
    sublabel: 'High rejection risk — fix before applying'
  }
};

function RiskGauge({ score }: { score: number }) {
  const color = score <= 30 ? '#10b981' : score <= 60 ? '#f59e0b' : '#ef4444';
  const label = score <= 30 ? 'Low Risk' : score <= 60 ? 'Moderate Risk' : 'High Risk';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
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
          <span className="text-lg font-black text-slate-900">{score}%</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function AuditCheckCard({ check, index }: { check: AuditCheck; index: number }) {
  const [expanded, setExpanded] = useState(check.status !== 'pass');
  const cfg = statusConfig[check.status];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
          <span className="text-xs font-bold text-slate-900">{check.checkName}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
            {cfg.label}
          </span>
          {check.severity === 'high' && check.status !== 'pass' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
              HIGH
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-slate-100 pt-2">
          <p className="text-xs text-slate-700 leading-relaxed">{check.details}</p>
          {check.affectedDocuments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {check.affectedDocuments.map((d) => (
                <span key={d} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Document Rejection Predictor</h3>
              <p className="text-xs text-slate-500">Cross-document consistency audit powered by Sarvam AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Demo Samples */}
            <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-2xl">
              <span className="text-xs font-bold text-orange-900 block mb-2">
                🧪 Load Demo Documents (or upload your own below):
              </span>
              <div className="flex flex-wrap gap-2">
                {(['income_certificate', 'ration_card', 'aadhaar_card'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleDemoLoad(s)}
                    disabled={isExtracting || isAuditing}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-orange-100 border border-orange-300 text-xs font-semibold text-orange-900 shadow-sm transition-all disabled:opacity-50"
                  >
                    📄 {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-orange-50/30 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 mx-auto mb-2 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <p className="text-sm font-semibold text-slate-700">Upload multiple documents at once</p>
              <p className="text-xs text-slate-400 mt-0.5">Income Certificate + Ration Card + Aadhaar — PDF, JPG, PNG</p>
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Loaded Documents ({uploadedDocs.length})
                </span>
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        {doc.name && (
                          <span className="text-[11px] text-slate-500 ml-2">— {doc.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${doc.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {Math.round(doc.confidence * 100)}% conf.
                      </span>
                      <button
                        onClick={() => handleRemoveDoc(i)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
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
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <Loader2 className="w-5 h-5 text-orange-600 animate-spin shrink-0" />
                <div>
                  <span className="text-xs font-bold text-orange-900">Sarvam Vision is extracting document fields...</span>
                  <p className="text-[11px] text-orange-700">Reading certificate numbers, names, dates, and income</p>
                </div>
              </div>
            )}

            {/* Error */}
            {auditError && (
              <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{auditError}</span>
              </div>
            )}

            {/* Run Audit Button */}
            {uploadedDocs.length > 0 && !isExtracting && (
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-sm shadow-lg hover:shadow-xl disabled:opacity-60 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sarvam-105B is auditing {uploadedDocs.length} documents...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    <span>🔍 Run Cross-Document Audit ({uploadedDocs.length} docs)</span>
                  </>
                )}
              </button>
            )}

            {/* ---- AUDIT RESULTS ---- */}
            {auditResult && cfg && OverallIcon && (
              <div className="space-y-5 pt-1">

                {/* Overall Status Hero */}
                <div className={`rounded-3xl bg-gradient-to-br ${cfg.gradient} p-5 text-white shadow-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <OverallIcon className="w-5 h-5" />
                        <span className="text-sm font-black">{cfg.label}</span>
                      </div>
                      <p className="text-xs text-white/80 mb-3">{cfg.sublabel}</p>
                      <p className="text-xs text-white/90 leading-relaxed max-w-xs">
                        {auditResult.summary}
                      </p>
                    </div>
                    <RiskGauge score={auditResult.rejectionRiskScore} />
                  </div>

                  {/* Quick Stats Row */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Passed', count: auditResult.checks.filter(c => c.status === 'pass').length, color: 'bg-white/20' },
                      { label: 'Warnings', count: auditResult.checks.filter(c => c.status === 'warning').length, color: 'bg-white/20' },
                      { label: 'Issues', count: auditResult.checks.filter(c => c.status === 'fail').length, color: 'bg-white/20' }
                    ].map((s) => (
                      <div key={s.label} className={`${s.color} rounded-xl p-2 text-center backdrop-blur-sm`}>
                        <div className="text-xl font-black">{s.count}</div>
                        <div className="text-[10px] font-semibold text-white/80">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Speak Audit Button */}
                  <button
                    onClick={handleSpeakAudit}
                    disabled={isSpeakingAudit}
                    className="mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all disabled:opacity-60"
                  >
                    {isSpeakingAudit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>Speak Audit Summary (Bulbul TTS)</span>
                  </button>
                  {auditAudioUrl && (
                    <audio ref={audioRef} src={auditAudioUrl} className="mt-2 w-full h-8 opacity-80" controls />
                  )}
                </div>

                {/* Section Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                  {(['checks', 'recs', 'affidavit'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setExpandedSection(s)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        expandedSection === s
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {s === 'checks' ? '🔍 All Checks' : s === 'recs' ? '💡 Fix It' : '📜 Affidavit'}
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
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                    {auditResult.recommendations.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        ✅ No specific recommendations — your documents look consistent!
                      </p>
                    )}
                  </div>
                )}

                {/* Affidavit Tab */}
                {expandedSection === 'affidavit' && (
                  <div className="space-y-3">
                    {auditResult.affidavitRequired && auditResult.affidavitTemplate ? (
                      <>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-900">
                            An affidavit may be required to correct document mismatches. Use the template below at a notary or government office.
                          </p>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                          {auditResult.affidavitTemplate}
                        </pre>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyAffidavit}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                          >
                            <ClipboardCopy className="w-3.5 h-3.5" />
                            {affidavitCopied ? '✅ Copied!' : 'Copy Text'}
                          </button>
                          <button
                            onClick={handleDownloadAffidavit}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download .txt
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                        <p className="text-sm font-bold text-slate-600">No Affidavit Required</p>
                        <p className="text-xs mt-1">No critical name or address mismatches detected across your documents.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2">
                  🛡️ Initial document audit only. Verify final eligibility and document requirements with the official government department before submitting your application.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/60">
          <span className="text-[10px] text-slate-400">Powered by Sarvam-105B + Sarvam Vision</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

