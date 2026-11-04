'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle
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

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      
      {/* Voice Chat Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span>Sarvam Voice Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Saaras STT • Sarvam-105B • Bulbul TTS
            </p>
          </div>
        </div>

        {/* Global Active Audio Controls */}
        {(isPlayingAudio || isAudioPaused) && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-orange-400 rounded-full wave-bar"></span>
              <span className="w-1 bg-orange-400 rounded-full wave-bar"></span>
              <span className="w-1 bg-orange-400 rounded-full wave-bar"></span>
              <span className="w-1 bg-orange-400 rounded-full wave-bar"></span>
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`flex gap-2.5 max-w-[88%] sm:max-w-[80%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                    isUser
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : '🇮🇳'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-orange-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Audio Playback pill for Assistant responses */}
                  {!isUser && msg.audioUrl && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                      <button
                        onClick={() =>
                          activeAudioUrl === msg.audioUrl && isPlayingAudio
                            ? pauseAudio()
                            : replayAudio(msg.audioUrl!)
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold hover:bg-orange-100 transition-colors border border-orange-200/60"
                      >
                        {activeAudioUrl === msg.audioUrl && isPlayingAudio ? (
                          <>
                            <Pause className="w-3 h-3 text-orange-600" />
                            <span>Pause Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-orange-600" />
                            <span>Listen to Voice</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-up question chips */}
              {!isUser && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5">
                  {msg.followUpQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFollowUp?.(q)}
                      className="text-xs px-3 py-1 rounded-full bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-200 shadow-sm transition-all text-left"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 max-w-sm shadow-sm text-xs text-slate-600">
            <Loader2 className="w-4 h-4 text-orange-600 animate-spin shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {statusMessage || 'Processing with Sarvam AI...'}
              </span>
              <span className="text-[10px] text-slate-400">
                Saaras • Sarvam-105B • Bulbul
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recording Pulse Overlay (When user is actively speaking) */}
      {isRecording && (
        <div className="p-4 bg-orange-50 border-t border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 text-white shadow-md animate-pulse">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-orange-950">
                  Listening to your voice... ({recordingDuration}s)
                </span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              </div>
              <p className="text-xs text-orange-700">
                Speak in Hindi, Marathi, English, or mixed language
              </p>
            </div>
          </div>

          <button
            onClick={stopRecording}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md hover:bg-orange-700 active:scale-95 transition-all"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Mic Error Banner */}
      {micError && (
        <div className="p-2.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-rose-600 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmitText} className="flex items-center gap-2">
          
          {/* Big Microphone Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-4 ring-rose-200 scale-105'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95'
            } disabled:opacity-50`}
            title={isRecording ? 'Click to stop recording' : 'Click to speak (Saaras STT)'}
          >
            {isRecording ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
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
                : 'Type here or click mic to speak (Hindi, Marathi, English)...'
            }
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:opacity-60"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isRecording}
            className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
