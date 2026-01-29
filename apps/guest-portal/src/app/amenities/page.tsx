'use client';

import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const AMENITIES = [
    { id: 1, name: 'Face Towel', icon: '🧴' },
    { id: 2, name: 'Bath Towel', icon: '🛁' },
    { id: 3, name: 'Toothbrush Set', icon: '🪥' },
    { id: 4, name: 'Slippers', icon: '👟' },
    { id: 5, name: 'Coffee Pods', icon: '☕' },
    { id: 6, name: 'Water Bottle', icon: '💧' },
];

export default function AmenitiesPage() {
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [requested, setRequested] = useState(false);

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const handleRequest = () => {
        setRequested(true);
        setTimeout(() => {
            setCart({});
            setRequested(false);
            alert('Amenities requested! Staff will bring them shortly.');
        }, 2000);
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen p-6 pb-32 relative overflow-hidden">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/" className="glass-button w-10 h-10 rounded-full flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold">Amenities</h1>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {AMENITIES.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-4 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 rounded-full p-1">
                            <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-4 text-center font-medium">{cart[item.id] || 0}</span>
                            <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-950 to-transparent">
                <button
                    onClick={handleRequest}
                    disabled={totalItems === 0 || requested}
                    className="w-full glass-button bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 font-semibold py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {requested ? (
                        <>
                            <Check className="w-5 h-5" /> Requesting...
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" /> Request {totalItems > 0 ? `(${totalItems})` : ''}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
