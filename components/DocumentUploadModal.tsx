'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Check,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { CitizenProfile, ExtractedDocument } from '@/types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CitizenProfile;
  onConfirmDocument: (extracted: ExtractedDocument) => void;
  onOpenAudit?: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onConfirmDocument,
  onOpenAudit,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedDocument | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selected.type) && !selected.name.match(/\.(pdf|jpe?g|png)$/i)) {
        setUploadError('Unsupported file type. Please upload a PDF, JPG, JPEG, or PNG document.');
        return;
      }
      setUploadError(null);
      setFile(selected);
      processLiveFile(selected);
    }
  };

  // Send uploaded file to Sarvam Vision API
  const processLiveFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    setUploadError(null);
    setExtractedResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('currentProfile', JSON.stringify(currentProfile));

      const res = await fetch('/api/sarvam/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sarvam Vision document extraction failed.');
      }

      setExtractedResult(data.document);
    } catch (err: any) {
      console.error('Vision processing error:', err);
      setUploadError(err.message || 'Failed to extract document information.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Demo sample selector
  const handleTestDemoSample = async (sampleType: 'income_certificate' | 'ration_card' | 'aadhaar_card') => {
    setIsProcessing(true);
    setUploadError(null);
    setExtractedResult(null);

    try {
      const res = await fetch('/api/sarvam/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDemoSample: true,
          sampleType,
          currentProfile
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze sample document.');
      }

      setExtractedResult(data.document);
    } catch (err: any) {
      setUploadError(err.message || 'Sample test failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (extractedResult) {
      onConfirmDocument(extractedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E8E5DE] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E5DE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 shrink-0">
              <UploadCloud className="w-5 h-5 text-forest-800" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Document Upload &amp; Sarvam Vision OCR
              </h3>
              <p className="text-xs text-slate-500">
                Extract certificate numbers, income fields, and issuing authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-ivory-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* Quick Demo Previews Buttons */}
          <div className="p-3.5 bg-ivory-100 rounded-xl border border-[#E2DFD7]">
            <span className="text-xs font-bold text-slate-800 block mb-2">
              Instant Test Samples (Click to test Sarvam Vision without uploading):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTestDemoSample('income_certificate')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-forest-50 border border-[#D8D4CA] text-xs font-semibold text-slate-800 shadow-xs transition-all"
              >
                📄 Tahsildar Income Certificate (₹2 Lakh)
              </button>
              <button
                type="button"
                onClick={() => handleTestDemoSample('ration_card')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-forest-50 border border-[#D8D4CA] text-xs font-semibold text-slate-800 shadow-xs transition-all"
              >
                📄 Priority Ration Card (Orange)
              </button>
              <button
                type="button"
                onClick={() => handleTestDemoSample('aadhaar_card')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-forest-50 border border-[#D8D4CA] text-xs font-semibold text-slate-800 shadow-xs transition-all"
              >
                📄 Aadhaar Card
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D4CEBE] hover:border-forest-700 rounded-xl p-6 text-center cursor-pointer bg-ivory-50 hover:bg-ivory-100 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-[#D8D4CA] text-slate-500 group-hover:text-forest-800 flex items-center justify-center mx-auto mb-2 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {file ? file.name : 'Click to select or drop your government document'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports PDF, JPG, JPEG, PNG (Max 10MB)
            </p>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-5 bg-white border border-[#E8E5DE] rounded-xl flex flex-col items-center justify-center gap-2 text-center">
              <Loader2 className="w-6 h-6 text-forest-700 animate-spin" />
              <span className="text-xs font-bold text-slate-900">
                Sarvam Vision is analyzing document structure...
              </span>
              <p className="text-[11px] text-slate-500">
                Extracting seal, certificate numbers, income fields, and issuing authority
              </p>
            </div>
          )}

          {/* Extracted Fields Display */}
          {extractedResult && !isProcessing && (
            <div className="bg-[#FBFBFA] border border-[#E8E5DE] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DE]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Document Extracted
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200 font-bold text-[10px]">
                    {Math.round(extractedResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <span className="text-xs font-semibold text-forest-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                  <span>Verified Fields Found</span>
                </span>
              </div>

              {/* Extracted Fields List */}
              <div className="space-y-1.5 text-xs">
                {Object.entries(extractedResult.found_fields).map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-[#F0ECE1] last:border-0">
                    <span className="text-slate-500 font-medium">{label}:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{String(val)}</span>
                      <Check className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    </span>
                  </div>
                ))}
              </div>

              {/* Inconsistencies Warning (if any) */}
              {extractedResult.inconsistencies.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Potential Profile Mismatch Detected:</span>
                  </span>
                  {extractedResult.inconsistencies.map((inc, i) => (
                    <p key={i} className="text-[11px] text-amber-800 pl-4.5">
                      • {inc}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3.5 border-t border-[#E8E5DE] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-ivory-200 transition-colors"
          >
            Cancel
          </button>
          
          {onOpenAudit && extractedResult && (
            <button
              type="button"
              onClick={() => { onClose(); onOpenAudit(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-slate-800 font-bold text-xs border border-[#DBD7CE] transition-all active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Cross-Audit</span>
            </button>
          )}

          <button
            type="button"
            disabled={!extractedResult || isProcessing}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-forest-800 text-white font-bold text-xs shadow-xs hover:bg-forest-900 disabled:opacity-50 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm &amp; Update Ledger</span>
          </button>
        </div>

      </div>
    </div>
  );
};
