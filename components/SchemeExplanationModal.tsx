'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Square,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SchemeMatchResult, SupportedLanguage } from '@/types';

interface SchemeExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeResult: SchemeMatchResult | null;
  explanation: string;
  audioUrl?: string;
  currentLanguage: SupportedLanguage;
}

export const SchemeExplanationModal: React.FC<SchemeExplanationModalProps> = ({
  isOpen,
  onClose,
  schemeResult,
  explanation,
  audioUrl,
  currentLanguage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl && isOpen) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [audioUrl, isOpen]);

  if (!isOpen || !schemeResult) return null;

  const { scheme } = schemeResult;

  const togglePlay = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">
                Sarvam-105B Simple Explanation
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {scheme.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* Explanation Text */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
            {explanation}
          </div>

          {/* Audio Controls */}
          {audioUrl && (
            <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {isPlaying ? 'Playing Bulbul Voice...' : 'Voice Explanation Ready'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Indian Language TTS (Bulbul)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Details */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block font-medium">Scheme Benefit</span>
              <span className="font-bold text-slate-800 text-sm">{scheme.benefit}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block font-medium">Eligibility Criteria</span>
              <span className="font-medium text-slate-700">{scheme.eligibilitySummary}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <a
            href={scheme.officialSource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Visit Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
