import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook to record audio from microphone, resample to 16kHz,
 * and stream as Base64 PCM data.
 */
export function useAudioRecorder(onAudioChunk: (base64PCM: string) => void) {
    const [isRecording, setIsRecording] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Gemini Live API requires 16kHz sample rate for input
            const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioCtx = new AudioContextCtor({ sampleRate: 16000 });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);

            // We use a simple ScriptProcessor for wide compatibility to get raw PCM data.
            // (AudioWorklet is better for performance, but ScriptProcessor is easier to inline here without separate files).
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
                const int16Buffer = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert Int16Array to Base64
                const uint8Array = new Uint8Array(int16Buffer.buffer);
                let binary = '';
                const len = uint8Array.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                const base64PCM = window.btoa(binary);

                if (isRecording) {
                    onAudioChunk(base64PCM);
                }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            setIsRecording(true);

        } catch (err) {
            console.error('Microphone access denied or error:', err);
        }
    }, [onAudioChunk, isRecording]);

    const stopRecording = useCallback(() => {
        setIsRecording(false);

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    return {
        isRecording,
        startRecording,
        stopRecording
    };
}
