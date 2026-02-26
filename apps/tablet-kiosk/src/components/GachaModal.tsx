'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin, ChevronRight, RefreshCw } from 'lucide-react';

interface GachaItem {
    id: number;
    title: { ja: string; en: string };
    description: { ja: string; en: string };
    type: 'gourmet' | 'spot' | 'mission';
    rarity: 'common' | 'rare' | 'legendary';
}

const GACHA_ITEMS: GachaItem[] = [
    {
        id: 1,
        type: 'gourmet',
        rarity: 'rare',
        title: { ja: '幻の塩パンを狙え', en: 'The Legendary Salt Bread' },
        description: {
            ja: '近所のパン屋さん「ベーカリー海」では、午前10時に数個だけ焼き上がる塩パンがあります。地元の人も並ぶ絶品をぜひ。',
            en: 'At "Bakery Umi" nearby, only a few salt breads are baked at 10 AM. It is a masterpiece that locals line up for.'
        }
    },
    {
        id: 2,
        type: 'mission',
        rarity: 'common',
        title: { ja: '波の音を聞く5分間', en: '5 Minutes of Ocean Waves' },
        description: {
            ja: 'テラスの椅子に座り、目を閉じて波の音だけを聴いてみてください。リラックス効果は抜群です。',
            en: 'Sit in a terrace chair, close your eyes, and just listen to the sound of the waves. It is incredibly relaxing.'
        }
    },
    {
        id: 3,
        type: 'spot',
        rarity: 'legendary',
        title: { ja: '秘密の夕陽スポット', en: 'Secret Sunset Viewpoint' },
        description: {
            ja: '宿から左に3分歩いた先にある小さな鳥居。そこから見る夕陽は、このエリアでも指折りの美しさです。',
            en: 'Walk left from the facility for 3 minutes to find a small torii gate. The sunset from there is one of the most beautiful in this area.'
        }
    },
    {
        id: 4,
        type: 'gourmet',
        rarity: 'common',
        title: { ja: '朝市の干物', en: 'Morning Market Dried Fish' },
        description: {
            ja: '土曜日限定の朝市。買ったばかりの干物をその場で焼いてくれる体験は、旅の最高の思い出になります。',
            en: 'The Saturday morning market. The experience of having fresh dried fish grilled on the spot is the best memory of your trip.'
        }
    },
    {
        id: 5,
        type: 'mission',
        rarity: 'rare',
        title: { ja: '一番綺麗な貝殻探し', en: 'Find the Best Seashell' },
        description: {
            ja: '目の前の砂浜で、今日一番「これだ！」と思う貝殻を1つだけ見つけてみてください。',
            en: 'Go to the beach in front of you and find just one seashell that you think is the best "this is it!" choice today.'
        }
    }
];

interface GachaModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLang: string;
}

export default function GachaModal({ isOpen, onClose, selectedLang }: GachaModalProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<GachaItem | null>(null);
    const [tempIndex, setTempIndex] = useState(0);

    const handleSpin = () => {
        setIsSpinning(true);
        setResult(null);

        // Shuffle animation
        let count = 0;
        const interval = setInterval(() => {
            setTempIndex(Math.floor(Math.random() * GACHA_ITEMS.length));
            count++;
            if (count > 20) {
                clearInterval(interval);
                const finalResult = GACHA_ITEMS[Math.floor(Math.random() * GACHA_ITEMS.length)];
                setResult(finalResult);
                setIsSpinning(false);
            }
        }, 80);
    };

    if (!isOpen) return null;

    const lang: 'ja' | 'en' = selectedLang === 'ja' ? 'ja' : 'en';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex flex-col bg-neutral-900/95 backdrop-blur-xl p-10 items-center justify-center"
            >
                <div className="max-w-4xl w-full flex flex-col items-center">
                    {!result && !isSpinning ? (
                        <div className="text-center space-y-12">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-48 h-48 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[48px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(168,85,247,0.4)]"
                            >
                                <Sparkles size={80} className="text-white" />
                            </motion.div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-bold text-white tracking-tight">
                                    {selectedLang === 'ja' ? '今日の Discovery ガチャ' : 'Today\'s Discovery'}
                                </h2>
                                <p className="text-2xl text-neutral-400">
                                    {selectedLang === 'ja' ? 'スタッフ厳選の隠れた名所や体験をランダムで提案します' : 'Discover hidden gems and experiences curated by our staff'}
                                </p>
                            </div>

                            <button
                                onClick={handleSpin}
                                className="px-16 py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[32px] text-3xl font-bold transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
                            >
                                {selectedLang === 'ja' ? 'ガチャを回す' : 'Discover Now'}
                                <ChevronRight size={32} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            {/* Result Area */}
                            <motion.div
                                layout
                                className={`w-full max-w-2xl bg-neutral-800 border border-white/10 rounded-[48px] p-12 shadow-2xl overflow-hidden relative ${result ? 'ring-4 ring-blue-500/30' : ''}`}
                            >
                                <AnimatePresence mode="wait">
                                    {isSpinning ? (
                                        <motion.div
                                            key="spinning"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.1 }}
                                            className="flex flex-col items-center justify-center h-64 space-y-6"
                                        >
                                            <RefreshCw className="animate-spin text-blue-400" size={64} />
                                            <div className="text-3xl font-mono text-white tracking-tighter capitalize">
                                                {GACHA_ITEMS[tempIndex].title[lang]}
                                            </div>
                                        </motion.div>
                                    ) : result && (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="px-5 py-2 bg-blue-500/20 text-blue-400 rounded-full text-lg font-bold uppercase tracking-widest border border-blue-500/30">
                                                    {result.type}
                                                </div>
                                                <div className={`px-5 py-2 rounded-full text-lg font-bold uppercase tracking-widest border ${result.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                                                    result.rarity === 'rare' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                        'bg-neutral-700 text-neutral-400 border-neutral-600'
                                                    }`}>
                                                    {result.rarity}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-5xl font-bold text-white leading-tight">
                                                    {result.title[lang]}
                                                </h3>
                                                <p className="text-2xl text-neutral-400 leading-relaxed whitespace-pre-line">
                                                    {result.description[lang]}
                                                </p>
                                            </div>

                                            <div className="pt-8 border-t border-white/5 flex items-center gap-4 text-blue-400">
                                                <MapPin size={28} />
                                                <span className="text-xl font-medium">Google Maps で場所を見る（スマートフォンでスキャン）</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {result && !isSpinning && (
                                <button
                                    onClick={handleSpin}
                                    className="mt-12 flex items-center gap-3 text-neutral-500 hover:text-white transition-colors text-xl font-medium"
                                >
                                    <RefreshCw size={24} />
                                    {selectedLang === 'ja' ? 'もう一度引く' : 'Try Again'}
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="mt-20 px-10 py-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl text-xl transition-all border border-neutral-700"
                            >
                                {selectedLang === 'ja' ? 'ダッシュボードに戻る' : 'Back to Dashboard'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
