'use client';

import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  UploadCloud,
  FileText,
  Volume2,
  ExternalLink,
  PhoneCall,
  Loader2,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
  X,
  FileSearch,
  Check
} from 'lucide-react';
import {
  ScamAnalysisResult,
  ScamClassification,
  SupportedLanguage
} from '@/types';

interface SarkariSurakshaProps {
  currentLanguage: SupportedLanguage;
}

const UI_STRINGS = {
  'en-IN': {
    badge: 'AI Cyber Safety Officer',
    title: 'Sarkari Suraksha',
    subtitle: 'AI Government Scam Detector: Protect yourself from fake WhatsApp schemes, phishing links, and fraudulent fees.',
    tabText: '💬 Paste Message',
    tabScreenshot: '📷 Upload Screenshot',
    placeholderText: 'Paste suspicious WhatsApp forward, SMS, or Telegram post claiming government scheme benefits here...',
    dropzoneText: 'Click or drop screenshot of WhatsApp forward or SMS',
    dropzoneSubtext: 'Supports JPG, PNG, JPEG screenshots (Max 10MB)',
    trySamples: '🧪 Test with Real-world Scam Samples:',
    sampleFakeLaptop: '🔴 Fake PM Laptop (₹499 Fee)',
    sampleFakeKanya: '🔴 Fake Mahila Cash (OTP Phishing)',
    sampleRealKisan: '🟢 Real PM-KISAN SMS',
    btnAnalyze: 'Analyze with Sarkari Suraksha',
    btnAnalyzing: 'Sarvam AI is analyzing message...',
    speakBtn: 'Listen in Audio (Bulbul TTS)',
    speakingBtn: 'Speaking...',
    verifiedTitle: 'Verified Against Official Source',
    suspiciousTitle: 'Suspicious — Needs Further Verification',
    fraudulentTitle: 'Likely Fraudulent / Scam',
    riskScore: 'Scam Risk Score',
    redFlagsTitle: 'Identified Red Flags & Risk Factors',
    officialSourcesTitle: 'Verified Government Sources & Portals',
    safetyAdviceTitle: 'Citizen Safety Advice',
    helplineText: 'National Cyber Crime Helpline: 1930 (Toll Free) • Report on cybercrime.gov.in',
    clearBtn: 'Clear & Check Another'
  },
  'hi-IN': {
    badge: 'एआई साइबर सुरक्षा अधिकारी',
    title: 'सरकारी सुरक्षा',
    subtitle: 'एआई सरकारी फ्रॉड डिटेक्टर: व्हाट्सएप पर आने वाली फर्जी योजनाओं, फिशिंग लिंक और पैसों की मांग से खुद को सुरक्षित रखें।',
    tabText: '💬 संदेश पेस्ट करें',
    tabScreenshot: '📷 स्क्रीनशॉट अपलोड करें',
    placeholderText: 'यहाँ व्हाट्सएप, एसएमएस या सोशल मीडिया पर आया संदिग्ध सरकारी योजना का संदेश पेस्ट करें...',
    dropzoneText: 'व्हाट्सएप संदेश या एसएमएस का स्क्रीनशॉट यहाँ अपलोड करें',
    dropzoneSubtext: 'JPG, PNG, JPEG फाइलें समर्थित हैं (अधिकतम 10MB)',
    trySamples: '🧪 तुरंत टेस्ट करने के लिए उदाहरण चुनें:',
    sampleFakeLaptop: '🔴 फर्जी पीएम लैपटॉप (₹499 फीस)',
    sampleFakeKanya: '🔴 फर्जी महिला धन (ओटीपी फ्रॉड)',
    sampleRealKisan: '🟢 असली पीएम किसान एसएमएस',
    btnAnalyze: 'सरकारी सुरक्षा से जांच करें',
    btnAnalyzing: 'सर्वम एआई संदेश की जांच कर रहा है...',
    speakBtn: 'आवाज़ में सुनें (बुलबुल टीटीएस)',
    speakingBtn: 'आवाज़ तैयार हो रही है...',
    verifiedTitle: 'आधिकारिक सरकारी स्रोत से सत्यापित',
    suspiciousTitle: 'संदिग्ध — अतिरिक्त सत्यापन आवश्यक',
    fraudulentTitle: 'संभावित फर्जी / धोखाधड़ी से सावधान!',
    riskScore: 'फ्रॉड जोखिम स्कोर',
    redFlagsTitle: 'पाए गए संदिग्ध खतरे व संकेत',
    officialSourcesTitle: 'आधिकारिक सरकारी पोर्टल व स्रोत',
    safetyAdviceTitle: 'नागरिक सुरक्षा सलाह',
    helplineText: 'राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930 (टोल फ्री) • cybercrime.gov.in पर रिपोर्ट करें',
    clearBtn: 'रीसेट करें और दूसरा संदेश जांचें'
  },
  'mr-IN': {
    badge: 'एआय सायबर सुरक्षा अधिकारी',
    title: 'सरकारी सुरक्षा',
    subtitle: 'एआय सरकारी फसवणूक शोधक: व्हॉट्सअॅपवरील खोट्या योजना, बनावट लिंक्स आणि पैशांच्या मागणीपासून सावध राहा.',
    tabText: '💬 संदेश पेस्ट करा',
    tabScreenshot: '📷 स्क्रीनशॉट अपलोड करा',
    placeholderText: 'येथे व्हॉट्सअॅप, एसएमएस किंवा सोशल मीडियावरील संशयास्पद योजनेचा संदेश पेस्ट करा...',
    dropzoneText: 'व्हॉट्सअॅप संदेश किंवा एसएमएसचा स्क्रीनशॉट येथे अपलोड करा',
    dropzoneSubtext: 'JPG, PNG, JPEG फाइल्स समर्थित (कमाल 10MB)',
    trySamples: '🧪 तत्काळ तपासणीसाठी नमुना निवडा:',
    sampleFakeLaptop: '🔴 बनावट पीएम लॅपटॉप (₹499 फी)',
    sampleFakeKanya: '🔴 बनावट महिला धन (ओटीपी फसवणूक)',
    sampleRealKisan: '🟢 खरा पीएम-किसान संदेश',
    btnAnalyze: 'सरकारी सुरक्षेद्वारे तपासा',
    btnAnalyzing: 'सर्वम एआय तपासणी करत आहे...',
    speakBtn: 'आवाजात ऐका (बुलबुल टीटीएस)',
    speakingBtn: 'आवाज तयार होत आहे...',
    verifiedTitle: 'अधिकृत सरकारी स्त्रोताशी सुसंगत',
    suspiciousTitle: 'संशयास्पद — अधिक पडताळणी आवश्यक',
    fraudulentTitle: 'संभाव्य फसवणूक / बनावट योजना!',
    riskScore: 'फसवणूक जोखीम स्कोर',
    redFlagsTitle: 'आढळलेले संशयास्पद धोके',
    officialSourcesTitle: 'अधिकृत सरकारी संकेतस्थळे',
    safetyAdviceTitle: 'नागरिकांसाठी सुरक्षितता सल्ला',
    helplineText: 'राष्ट्रीय सायबर गुन्हे हेल्पलाइन: 1930 (टोल फ्री) • cybercrime.gov.in वर तक्रार करा',
    clearBtn: 'रीसेट करा आणि दुसरा संदेश तपासा'
  }
};

export const SarkariSuraksha: React.FC<SarkariSurakshaProps> = ({ currentLanguage }) => {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS['hi-IN'];
  
  const [activeTab, setActiveTab] = useState<'text' | 'screenshot'>('text');
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ScamAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run analysis
  const handleAnalyze = async (sampleId?: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAudioUrl(null);

    try {
      let res: Response;

      if (sampleId) {
        res = await fetch('/api/sarvam/suraksha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            demoSampleId: sampleId,
            language: currentLanguage
          })
        });
      } else if (activeTab === 'screenshot' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('language', currentLanguage);
        if (messageText) formData.append('messageText', messageText);

        res = await fetch('/api/sarvam/suraksha', {
          method: 'POST',
          body: formData
        });
      } else {
        if (!messageText.trim()) {
          throw new Error('Please enter a message to analyze.');
        }

        res = await fetch('/api/sarvam/suraksha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageText: messageText.trim(),
            language: currentLanguage
          })
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Scam analysis failed. Please try again.');
      }

      setAnalysisResult(data.result);
      if (sampleId) {
        setMessageText(data.result.extractedMessage || '');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Please verify connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Speak explanation using Bulbul TTS
  const handleSpeak = async () => {
    if (!analysisResult) return;
    setIsSpeaking(true);

    try {
      const speechText = `${analysisResult.summary}. ${analysisResult.mandatoryWarning}`;
      const res = await fetch('/api/sarvam/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speechText,
          languageCode: currentLanguage
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize speech');
      }

      setAudioUrl(data.dataUrl);
      setTimeout(() => {
        audioRef.current?.play().catch(e => console.warn('Audio play prevented:', e));
      }, 100);
    } catch (err: any) {
      alert('Speech failed: ' + err.message);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setMessageText('');
    setSelectedFile(null);
    setFilePreview(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setAudioUrl(null);
  };

  // Status Styling Config
  const getStatusConfig = (classification: ScamClassification) => {
    switch (classification) {
      case 'verified':
        return {
          icon: ShieldCheck,
          title: strings.verifiedTitle,
          bg: 'bg-emerald-500',
          gradient: 'from-emerald-500 to-teal-600',
          lightBg: 'bg-emerald-50',
          border: 'border-emerald-200',
          textColor: 'text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          badgeText: 'VERIFIED OFFICIAL'
        };
      case 'suspicious':
        return {
          icon: AlertTriangle,
          title: strings.suspiciousTitle,
          bg: 'bg-amber-500',
          gradient: 'from-amber-500 to-orange-600',
          lightBg: 'bg-amber-50',
          border: 'border-amber-200',
          textColor: 'text-amber-900',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          badgeText: 'SUSPICIOUS / UNVERIFIED'
        };
      case 'fraudulent':
      default:
        return {
          icon: AlertOctagon,
          title: strings.fraudulentTitle,
          bg: 'bg-rose-600',
          gradient: 'from-rose-600 via-red-600 to-rose-700',
          lightBg: 'bg-rose-50',
          border: 'border-rose-200',
          textColor: 'text-rose-900',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          badgeText: 'HIGH RISK SCAM'
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-900/40 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-rose-300 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>{strings.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {strings.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                {strings.subtitle}
              </p>
            </div>
          </div>

          {analysisResult && (
            <button
              onClick={handleReset}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{strings.clearBtn}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">

        {/* Instant Demo Samples Selector */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-slate-800">
              {strings.trySamples}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleAnalyze('fake_laptop')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-800 hover:text-rose-700 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {strings.sampleFakeLaptop}
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleAnalyze('fake_kanya')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-800 hover:text-rose-700 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {strings.sampleFakeKanya}
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleAnalyze('real_pm_kisan')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {strings.sampleRealKisan}
            </button>
          </div>
        </div>

        {/* Input Mode Selector (Tabs) */}
        <div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-md mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {strings.tabText}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('screenshot')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'screenshot'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {strings.tabScreenshot}
            </button>
          </div>

          {/* Tab 1: Textarea */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={strings.placeholderText}
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-slate-900 text-sm leading-relaxed outline-none transition-all resize-y"
                />
                {messageText && (
                  <button
                    type="button"
                    onClick={() => setMessageText('')}
                    className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Screenshot Upload Dropzone */}
          {activeTab === 'screenshot' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-rose-500 rounded-3xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-rose-50/20 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 text-slate-500 group-hover:text-rose-600 flex items-center justify-center mx-auto mb-2 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : strings.dropzoneText}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {strings.dropzoneSubtext}
                </p>
              </div>

              {filePreview && (
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreview}
                      alt="Screenshot Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {selectedFile?.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {Math.round((selectedFile?.size || 0) / 1024)} KB • Ready for Sarvam Vision OCR
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            disabled={isAnalyzing || (activeTab === 'text' && !messageText.trim()) || (activeTab === 'screenshot' && !selectedFile)}
            onClick={() => handleAnalyze()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 active:scale-95 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{strings.btnAnalyzing}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>{strings.btnAnalyze}</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* ================= RESULTS CARD ================= */}
        {analysisResult && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            
            {/* Main Result Banner */}
            {(() => {
              const cfg = getStatusConfig(analysisResult.classification);
              const StatusIcon = cfg.icon;

              return (
                <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${cfg.gradient} text-white shadow-xl relative overflow-hidden`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-white/20 border border-white/30 uppercase">
                          {cfg.badgeText}
                        </span>
                        <span className="text-xs text-white/80 font-medium">
                          Confidence: {Math.round(analysisResult.confidence * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <StatusIcon className="w-7 h-7 shrink-0 text-white" />
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          {cfg.title}
                        </h3>
                      </div>

                      <p className="text-sm text-white/95 leading-relaxed pt-1">
                        {analysisResult.summary}
                      </p>

                      {/* Bulbul TTS Voice explanation button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isSpeaking}
                          onClick={handleSpeak}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition-all disabled:opacity-50"
                        >
                          {isSpeaking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                          <span>{isSpeaking ? strings.speakingBtn : strings.speakBtn}</span>
                        </button>
                      </div>

                      {audioUrl && (
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          controls
                          className="mt-3 w-full max-w-md h-8 rounded-lg opacity-90"
                        />
                      )}
                    </div>

                    {/* Risk Score Circle Gauge */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col items-center justify-center text-center shrink-0 min-w-[140px]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                        {strings.riskScore}
                      </span>
                      <div className="text-4xl font-black my-1 text-white">
                        {analysisResult.riskScore}
                        <span className="text-lg font-bold text-white/70">/100</span>
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">
                        {analysisResult.riskScore >= 70
                          ? '🚨 Critical Scam Risk'
                          : analysisResult.riskScore >= 40
                          ? '⚠️ Moderate Risk'
                          : '✅ Low Risk'}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Identified Red Flags / Risk Factors */}
            {analysisResult.riskFactors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>{strings.redFlagsTitle} ({analysisResult.riskFactors.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.riskFactors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          <span>{rf.title}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 font-bold text-[10px] uppercase">
                          {rf.severity}
                        </span>
                      </div>
                      <p className="text-rose-900/90 leading-relaxed pt-0.5">
                        {rf.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legitimate Scheme Context (if matched) */}
            {analysisResult.verifiedSchemeDetails && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Real Scheme Context: {analysisResult.verifiedSchemeDetails.name}</span>
                  </span>
                  <a
                    href={analysisResult.verifiedSchemeDetails.officialPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-blue-900">
                  <strong>Actual Benefit:</strong> {analysisResult.verifiedSchemeDetails.actualBenefit}
                </p>
                <p className="text-blue-900">
                  <strong>Actual Eligibility:</strong> {analysisResult.verifiedSchemeDetails.actualEligibility}
                </p>
              </div>
            )}

            {/* Official Sources & Verification Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{strings.officialSourcesTitle}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {analysisResult.officialSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs space-y-1 block transition-all group hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                        {source.sourceName}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0 ml-1" />
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      ✓ Official Government Link
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {source.notes}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Citizen Safety Advice */}
            {analysisResult.safetyAdvice.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>{strings.safetyAdviceTitle}</span>
                </span>
                <ul className="space-y-1 text-xs text-amber-950">
                  {analysisResult.safetyAdvice.map((advice, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* MANDATORY WARNING BANNER */}
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-700">
                  Mandatory Citizen Safety Warning / अनिवार्य सुरक्षा चेतावनी
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {analysisResult.mandatoryWarning}
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs font-bold text-rose-800">
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>{strings.helplineText}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

