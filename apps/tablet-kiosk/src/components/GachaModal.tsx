'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GachaModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLang: string;
}

export default function GachaModal({ isOpen, onClose, selectedLang }: GachaModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex flex-col bg-neutral-900/95 backdrop-blur-xl p-10 items-center justify-center"
            >
                <div className="max-w-4xl w-full flex flex-col items-center space-y-12">
                    {/* 準備中メッセージ */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-8"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                        >
                            <Sparkles size={64} className="text-white" />
                        </motion.div>

                        <div className="space-y-4">
                            <h2 className="text-5xl font-bold text-white tracking-tight">
                                {selectedLang === 'ja' ? '現在準備中です' : 'Currently in Preparation'}
                            </h2>
                            <p className="text-2xl text-neutral-400">
                                {selectedLang === 'ja' 
                                    ? 'Discovery ガチャ機能は近日公開予定です' 
                                    : 'The Discovery Gacha feature will be available soon'}
                            </p>
                        </div>
                    </motion.div>

                    {/* 閉じるボタン */}
                    <button
                        onClick={onClose}
                        className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xl font-medium transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                        {selectedLang === 'ja' ? 'ダッシュボードに戻る' : 'Back to Dashboard'}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
