'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, MicOff, MessageSquare } from 'lucide-react';
import { useLiveAPI } from '@/hooks/useLiveAPI';

interface VoiceChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLang: string;
}

export default function VoiceChatModal({ isOpen, onClose, selectedLang }: VoiceChatModalProps) {
    const { status, transcript, isSpeaking, connect, disconnect, sendAudioChunk } = useLiveAPI();
    const [isMicOn, setIsMicOn] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const [audioVolume, setAudioVolume] = useState(0);

    const systemInstruction = `
    You are an exclusive, warm, and highly professional concierge for this premium vacation rental facility.
    Your goal is to provide the ultimate hospitality experience to our guests using the tablet kiosk in their room.
    
    CRITICAL: Voice UI Guidelines
    1. Hospitality First: Always be extremely polite, welcoming, and empathetic. Response should be clear and professional.
    2. Concise: Keep answers SHORT and directly to the point (under 2 sentences if possible). Since this is a flowing conversation, do not use long lists or complex markdown formatting. 
    3. STRICT LANGUAGE REQUIREMENT: You must respond ONLY in the language associated with the code: "${selectedLang}". 
       - If "${selectedLang}" is "ja", you MUST speak ONLY Japanese.
       - If "${selectedLang}" is "en", you MUST speak ONLY English.
       - NEVER mix multiple languages in a single response. Switching or mixing languages is STRICTLY FORBIDDEN.
  `;

    const handleMicClick = async () => {
        if (status === 'disconnected') {
            try {
                await connect(systemInstruction);
                startMic();
            } catch (err) {
                console.error('Failed to start AI Concierge session', err);
            }
        } else {
            toggleMic();
        }
    };

    async function startMic() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioCtx = new AudioContextCtor({ sampleRate: 16000 });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Calculate volume (RMS)
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                const vol = Math.min(100, Math.round(rms * 100 * 5));
                setAudioVolume(vol);

                const int16Buffer = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                const uint8Array = new Uint8Array(int16Buffer.buffer);
                let binary = '';
                for (let i = 0; i < uint8Array.byteLength; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                sendAudioChunk(window.btoa(binary));
            };

            source.connect(analyser);
            analyser.connect(processor);
            processor.connect(audioCtx.destination);
            setIsMicOn(true);
        } catch (err) {
            console.error('Mic access error', err);
        }
    }

    function stopMic() {
        setIsMicOn(false);
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (analyserRef.current) {
            analyserRef.current.disconnect();
            analyserRef.current = null;
        }
        setAudioVolume(0);
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }

    function toggleMic() {
        if (isMicOn) stopMic();
        else startMic();
    }

    useEffect(() => {
        if (!isOpen) {
            stopMic();
            disconnect();
        }
    }, [isOpen, disconnect]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col bg-neutral-900"
                >
                    <div className="w-full h-full flex flex-col relative overflow-hidden">

                        {/* Header */}
                        <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-gradient-to-r from-purple-900/40 to-transparent">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-purple-500/20 rounded-full text-purple-400">
                                    <MessageSquare size={36} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-wide">AIコンシェルジュ</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'}`}></span>
                                        <p className="text-neutral-400 text-lg">
                                            {status === 'connected' ? 'Live Session Active' : status === 'connecting' ? '接続中...' : '待機中'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Controls Overlay in Header */}
                            <div className="flex items-center gap-8">
                                <div className="relative">
                                    {/* Pulse effect when listening */}
                                    {isMicOn && !isSpeaking && (
                                        <motion.div
                                            animate={{
                                                scale: [1, 1 + (audioVolume / 100) * 0.4, 1],
                                                opacity: [0.3, 0.1, 0.3],
                                            }}
                                            transition={{ duration: 0.2, repeat: Infinity }}
                                            className="absolute inset-0 bg-emerald-500 rounded-full"
                                        />
                                    )}
                                    <button
                                        onClick={handleMicClick}
                                        className={`relative z-10 p-6 rounded-full transition-all duration-300 shadow-xl border-2 ${status === 'disconnected'
                                                ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700'
                                                : isMicOn
                                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                                    : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                                            }`}
                                    >
                                        {status === 'disconnected' ? (
                                            <Mic size={40} />
                                        ) : isMicOn ? (
                                            <Mic size={40} />
                                        ) : (
                                            <MicOff size={40} />
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10"
                                >
                                    <X size={36} />
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col p-16 overflow-hidden">
                            {status === 'disconnected' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                    <div className="w-40 h-40 mx-auto mb-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Mic size={72} />
                                    </div>
                                    <h3 className="text-4xl text-white mb-6 font-medium">マイクボタンを押して会話を始めます</h3>
                                    <p className="text-2xl text-neutral-400">周辺のご案内や施設について、声でお答えします</p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col max-w-6xl mx-auto">

                                    {/* Visualizer */}
                                    <div className="h-32 flex items-center justify-center gap-2 mb-16">
                                        {[...Array(50)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    height: isMicOn && !isSpeaking
                                                        ? `${Math.max(10, (audioVolume * (0.3 + Math.random() * 0.7)) * (1 - Math.abs(i - 25) / 25))}%`
                                                        : '10%'
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className={`w-2.5 rounded-full transition-colors duration-300 ${isSpeaking ? 'bg-purple-500/20' : audioVolume > 20 ? 'bg-emerald-400' : 'bg-emerald-500/40'}`}
                                                style={{ height: '10%' }}
                                            />
                                        ))}
                                    </div>

                                    {/* Transcript Bubble - Now larger for Fullscreen */}
                                    <div className="flex-1 bg-neutral-800/40 backdrop-blur-md p-16 rounded-[48px] text-5xl leading-[1.5] text-white border border-neutral-700/30 overflow-y-auto custom-scrollbar shadow-inner">
                                        {transcript || (
                                            <span className="text-neutral-600 flex items-center justify-center h-full italic font-light">
                                                {isSpeaking ? 'AIが回答を生成中...' : 'どうぞ、お話しください'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Bar */}
                                    <div className="mt-12 flex items-center justify-center gap-6 text-neutral-500 font-medium tracking-[0.2em] text-xl uppercase">
                                        {isSpeaking ? (
                                            <div className="flex items-center gap-4 text-purple-400">
                                                <Loader2 className="animate-spin" size={32} />
                                                <span>AI Speaking</span>
                                            </div>
                                        ) : isMicOn ? (
                                            <div className="flex items-center gap-4 text-emerald-400">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                                                <span>Listening...</span>
                                            </div>
                                        ) : (
                                            <span className="text-red-400/60">Microphone Muted</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
