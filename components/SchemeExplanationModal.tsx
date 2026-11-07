'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Square,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E8E5DE] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E5DE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-200 text-forest-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-forest-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                Sarvam-105B Plain Explanation
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {scheme.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-ivory-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* Explanation Text */}
          <div className="p-4 rounded-xl bg-ivory-100 border border-[#E2DFD7] text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {explanation}
          </div>

          {/* Audio Controls */}
          {audioUrl && (
            <div className="p-3 bg-forest-900 text-white rounded-xl flex items-center justify-between border border-forest-950">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center text-white">
                  <Volume2 className="w-4 h-4 text-forest-200" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {isPlaying ? 'Playing Bulbul Voice...' : 'Voice Explanation Ready'}
                  </span>
                  <span className="text-[10px] text-forest-300">
                    Indian Language Speech Synthesis (Bulbul)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-forest-800 text-white hover:bg-forest-700 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-2 rounded-lg bg-forest-950 text-slate-300 hover:text-white transition-all"
                  title="Stop"
                >
                  <Square className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Details */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E8E5DE]">
              <span className="text-slate-400 block font-medium text-[11px]">Scheme Benefit</span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm leading-snug block mt-0.5">{scheme.benefit}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E8E5DE]">
              <span className="text-slate-400 block font-medium text-[11px]">Eligibility Criteria</span>
              <span className="font-medium text-slate-700 leading-relaxed block mt-0.5">{scheme.eligibilitySummary}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-[#E8E5DE] flex items-center justify-between">
          <a
            href={scheme.officialSource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-forest-800 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Visit Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
