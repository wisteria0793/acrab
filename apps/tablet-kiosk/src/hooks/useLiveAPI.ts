/**
 * Custom hook to manage WebSocket connection and MediaRecorder for 
 * Google's Gemini Multimodal Live API.
 */
import { useState, useRef, useCallback } from 'react';

// API Key setup
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const HOST = 'generativelanguage.googleapis.com';
const URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

export type LiveAPIStatus = 'disconnected' | 'connecting' | 'connected';

export interface UseLiveAPIResult {
    status: LiveAPIStatus;
    transcript: string;
    isSpeaking: boolean;
    connect: (systemInstruction?: string) => Promise<void>;
    disconnect: () => void;
    sendAudioChunk: (base64PCM: string) => void;
    sendTextMessage: (text: string) => void;
}

export function useLiveAPI(): UseLiveAPIResult {
    const [status, setStatus] = useState<LiveAPIStatus>('disconnected');
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Audio playback scheduling
    const nextPlayTimeRef = useRef<number>(0);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setStatus('disconnected');
        setIsSpeaking(false);
        setIsSetupComplete(false);
        nextPlayTimeRef.current = 0;
    }, []);

    const playAudioChunk = useCallback((base64Data: string) => {
        if (!audioContextRef.current) return;
        const audioCtx = audioContextRef.current;

        const binaryStr = window.atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }

        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.copyToChannel(float32Array, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        let startTime = nextPlayTimeRef.current;
        if (startTime < audioCtx.currentTime) {
            startTime = audioCtx.currentTime + 0.05;
        }

        source.start(startTime);
        nextPlayTimeRef.current = startTime + audioBuffer.duration;

        setIsSpeaking(true);
        source.onended = () => {
            if (audioCtx.currentTime >= nextPlayTimeRef.current - 0.1) {
                setIsSpeaking(false);
            }
        };
    }, []);

    const connect = useCallback((systemInstructionText?: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (status === 'connected' || status === 'connecting') {
                resolve();
                return;
            }
            if (!API_KEY) {
                console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
                reject(new Error('API Key missing'));
                return;
            }

            try {
                setStatus('connecting');

                const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                const audioCtx = new AudioContextCtor({ sampleRate: 24000 });
                audioContextRef.current = audioCtx;

                const wsUrl = `${URL}?key=${API_KEY}`;
                console.log('Connecting to Gemini Live API...');
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    setStatus('connected');
                    console.log('Gemini Live API: WebSocket opened');

                    const setupMessage = {
                        setup: {
                            model: 'models/gemini-2.5-flash-native-audio-latest',
                            generation_config: {
                                response_modalities: ["AUDIO"],
                            },
                            system_instruction: {
                                parts: [{
                                    text: systemInstructionText || "You are a helpful hotel concierge."
                                }]
                            }
                        }
                    };
                    console.log('Gemini Live API: Sending setup message...');
                    ws.send(JSON.stringify(setupMessage));
                    resolve();
                };

                ws.onmessage = async (event) => {
                    let msg;
                    try {
                        if (event.data instanceof Blob) {
                            const textResponse = await event.data.text();
                            msg = JSON.parse(textResponse);
                        } else if (typeof event.data === 'string') {
                            msg = JSON.parse(event.data);
                        } else {
                            return;
                        }

                        if (msg.setupComplete) {
                            console.log('Gemini Live API: Setup complete');
                            setIsSetupComplete(true);
                        }

                        if (msg.serverContent && msg.serverContent.modelTurn) {
                            const parts = msg.serverContent.modelTurn.parts;
                            for (const part of parts) {
                                if (part.text) {
                                    setTranscript(prev => prev + part.text);
                                }
                                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                                    playAudioChunk(part.inlineData.data);
                                }
                            }
                        }

                        if (msg.serverContent && msg.serverContent.interrupted) {
                            console.log('Gemini Live API: Model interrupted');
                            setIsSpeaking(false);
                        }

                    } catch (err) {
                        console.error('Gemini Live API: Failed to parse message', err);
                    }
                };

                ws.onclose = (event) => {
                    setStatus('disconnected');
                    setIsSetupComplete(false);
                    console.warn('Gemini Live API: WebSocket closed', { code: event.code, reason: event.reason });
                };

                ws.onerror = (error) => {
                    console.error('Gemini Live API: WebSocket Error:', error);
                    setStatus('disconnected');
                    reject(error);
                };

            } catch (e) {
                console.error('Failed to connect:', e);
                setStatus('disconnected');
                reject(e);
            }
        });
    }, [status, playAudioChunk]);

    const sendAudioChunk = useCallback((base64PCM: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isSetupComplete) {
            const msg = {
                realtimeInput: {
                    mediaChunks: [{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64PCM
                    }]
                }
            };
            wsRef.current.send(JSON.stringify(msg));
        }
    }, [isSetupComplete]);

    const sendTextMessage = useCallback((text: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            setTranscript('');
            const msg = {
                clientContent: {
                    turns: [
                        {
                            role: "user",
                            parts: [{ text: text }]
                        }
                    ],
                    turnComplete: true
                }
            };
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    return {
        status,
        transcript,
        isSpeaking,
        connect,
        disconnect,
        sendAudioChunk,
        sendTextMessage
    };
}
