'use client';

import { CheckCircle2, Home, Wifi, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useCheckInStore } from '@/lib/store/check-in';
import { useEffect } from 'react';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';

export function CompleteStep() {
    const { completeCheckIn } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);

    useEffect(() => {
        completeCheckIn();
    }, [completeCheckIn]);

    return (
        <div className="flex flex-col h-full bg-transparent items-center justify-center text-center">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                <div className="glass-panel w-24 h-24 rounded-full flex items-center justify-center relative z-10 mx-auto shadow-lg shadow-blue-500/20 border-2 border-white">
                    <CheckCircle2 className="w-12 h-12 text-blue-500" />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-3 text-gray-900">{t.checkIn.complete.title}</h2>
            <p className="text-muted-foreground mb-8 text-lg">
                {t.checkIn.complete.desc}
            </p>

            <div className="w-full max-w-sm glass-panel p-6 rounded-2xl mb-8 text-left space-y-4 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs mb-4">{t.checkIn.complete.access}</h3>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
                        <LockKeyhole className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">{t.checkIn.complete.doorCode}</p>
                        <p className="text-xl font-bold font-mono tracking-widest text-gray-900">8092</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
                        <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">{t.checkIn.complete.wifi}</p>
                        <p className="text-lg font-bold text-gray-900">Hotel_Guest_5G</p>
                    </div>
                </div>
            </div>

            <Link href="/" className="w-full">
                <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-gray-900/10 transition-all active:scale-[0.98]">
                    <Home className="w-5 h-5" />
                    {t.checkIn.complete.dashboard}
                </button>
            </Link>
        </div>
    );
}
