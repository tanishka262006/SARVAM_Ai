'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  User,
  Loader2,
  AlertCircle,
  Headphones,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { ChatMessage, CitizenProfile, SupportedLanguage } from '@/types';

interface VoiceChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  currentProfile: CitizenProfile;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  statusMessage?: string;
  onSelectFollowUp?: (question: string) => void;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({
  messages,
  onSendMessage,
  currentProfile,
  currentLanguage,
  isLoading,
  statusMessage,
  onSelectFollowUp
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, statusMessage]);

  // Auto-play new assistant audio if present
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.audioUrl) {
      playAudio(lastMsg.audioUrl);
    }
  }, [messages]);

  // Audio player handlers
  const playAudio = (url: string) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    setActiveAudioUrl(url);
    setIsPlayingAudio(true);
    setIsAudioPaused(false);

    audio.onended = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };

    audio.play().catch((err) => {
      console.warn('Audio autoplay blocked or failed:', err);
      setIsPlayingAudio(false);
    });
  };

  const pauseAudio = () => {
    if (audioPlayerRef.current && isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsAudioPaused(true);
      setIsPlayingAudio(false);
    }
  };

  const resumeAudio = () => {
    if (audioPlayerRef.current && isAudioPaused) {
      audioPlayerRef.current.play();
      setIsAudioPaused(false);
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
      setActiveAudioUrl(null);
    }
  };

  const replayAudio = (url: string) => {
    playAudio(url);
  };

  // Start audio recording with browser MediaRecorder
  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) {
          setMicError('Recording too short. Please speak clearly.');
          return;
        }

        await handleTranscribeAndSend(audioBlob);
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission denied. Please allow microphone access in your browser.');
      } else {
        setMicError('Could not start microphone: ' + (err.message || 'Unknown error'));
      }
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Transcribe recorded audio with Sarvam Saaras, then send transcript to Sarvam-105B
  const handleTranscribeAndSend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'citizen_voice.webm');
      formData.append('language_code', currentLanguage || 'unknown');

      const res = await fetch('/api/sarvam/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to transcribe speech');
      }

      const transcript = (data.transcript || '').trim();
      if (!transcript) {
        setMicError('No speech detected. Please speak louder and try again.');
        return;
      }

      // Send the transcribed text through our chat flow
      await onSendMessage(transcript);
    } catch (err: any) {
      console.error('STT failed:', err);
      setMicError(err.message || 'Speech recognition failed. Please try again or type instead.');
    }
  };

  // Handle manual text submission
  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-2xl border border-[#E8E5DE] shadow-xs overflow-hidden">
      
      {/* Console Header */}
      <div className="px-5 py-3.5 bg-forest-900 text-white flex items-center justify-between border-b border-forest-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest-800 border border-forest-700/80 flex items-center justify-center text-white shrink-0">
            <Mic className="w-4 h-4 text-forest-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-white">
                Citizen Voice Terminal
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-forest-800 text-[10px] font-semibold text-forest-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active</span>
              </span>
            </div>
            <p className="text-[11px] text-forest-300 font-medium">
              Sarvam Saaras STT • Sarvam-105B Reasoning • Bulbul TTS
            </p>
          </div>
        </div>

        {/* Global Active Audio Playback Pill */}
        {(isPlayingAudio || isAudioPaused) && (
          <div className="flex items-center gap-2.5 bg-forest-950/80 px-3 py-1.5 rounded-lg border border-forest-800">
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-1 bg-amber-400 rounded-full acoustic-bar"></span>
              <span className="w-1 bg-amber-400 rounded-full acoustic-bar"></span>
              <span className="w-1 bg-amber-400 rounded-full acoustic-bar"></span>
              <span className="w-1 bg-amber-400 rounded-full acoustic-bar"></span>
            </div>
            {isPlayingAudio ? (
              <button onClick={pauseAudio} className="text-slate-300 hover:text-white" title="Pause audio">
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={resumeAudio} className="text-slate-300 hover:text-white" title="Resume audio">
                <Play className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={stopAudio} className="text-slate-400 hover:text-rose-400" title="Stop audio">
              <Square className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FBFBFA]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Stamp / Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-forest-800 text-white'
                      : 'bg-white border border-[#DBD7CE] text-forest-900 font-serif'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : 'सं'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'bg-white border border-[#E8E5DE] text-slate-800 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {/* Audio Playback pill for Assistant responses */}
                  {!isUser && msg.audioUrl && (
                    <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] flex items-center gap-2">
                      <button
                        onClick={() =>
                          activeAudioUrl === msg.audioUrl && isPlayingAudio
                            ? pauseAudio()
                            : replayAudio(msg.audioUrl!)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-forest-50 hover:bg-forest-100 text-forest-900 font-semibold text-xs transition-colors border border-forest-200"
                      >
                        {activeAudioUrl === msg.audioUrl && isPlayingAudio ? (
                          <>
                            <Pause className="w-3 h-3 text-forest-700" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-forest-700" />
                            <span>Listen in Audio (Bulbul)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-up question chips */}
              {!isUser && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                <div className="mt-2.5 ml-10 flex flex-wrap gap-1.5">
                  {msg.followUpQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFollowUp?.(q)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-forest-50 text-slate-700 hover:text-forest-900 border border-[#D8D4CA] hover:border-forest-300 shadow-xs transition-all text-left"
                    >
                      <span className="text-forest-700 mr-1.5 font-bold">↳</span>
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E8E5DE] max-w-sm shadow-xs text-xs text-slate-600">
            <Loader2 className="w-4 h-4 text-forest-700 animate-spin shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {statusMessage || 'Processing with Sarvam AI...'}
              </span>
              <span className="text-[10px] text-slate-400">
                Saaras STT • Sarvam-105B Reasoning • Bulbul TTS
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recording State Overlay */}
      {isRecording && (
        <div className="p-4 bg-forest-50 border-t border-forest-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-forest-800 text-white shadow-sm animate-mic-pulse">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest-900 uppercase tracking-wide">
                  Listening carefully... ({formatSeconds(recordingDuration)})
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              </div>
              <p className="text-xs text-forest-700">
                Speak naturally in Hindi, Marathi, English, or mixed language
              </p>
            </div>
          </div>

          <button
            onClick={stopRecording}
            className="px-4 py-2 rounded-lg bg-forest-800 text-white font-bold text-xs shadow-xs hover:bg-forest-900 active:scale-95 transition-all"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Mic Error Banner */}
      {micError && (
        <div className="p-2.5 bg-rose-50 border-t border-rose-200 text-rose-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-rose-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Action Console */}
      <div className="p-3 bg-white border-t border-[#E8E5DE]">
        <form onSubmit={handleSubmitText} className="flex items-center gap-2">
          
          {/* Prominent Tactile Microphone Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs ${
              isRecording
                ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-300'
                : 'bg-forest-800 hover:bg-forest-900 text-white shadow-xs'
            } disabled:opacity-50 active:scale-95`}
            title={isRecording ? 'Click to stop recording' : 'Click to speak (Saaras STT)'}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Tap to Speak</span>
              </>
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading || isRecording}
            placeholder={
              isRecording
                ? 'Listening to microphone...'
                : 'Or type your family situation (Hindi, Marathi, English)...'
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-[#D8D4CA] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700 transition-all disabled:opacity-60"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isRecording}
            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-forest-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-xs"
            title="Send text message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
