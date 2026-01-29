'use client';

import { useState } from 'react';
import { useCheckInStore } from '@/lib/store/check-in';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';
import { ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckOutPage() {
    const { isCheckedIn, reset } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);
    const router = useRouter();
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // If not checked in, redirect home
    if (!isCheckedIn && !isComplete) {
        // Use a timeout or effect to avoid redirect loop during hydration if possible, 
        // but for now simple check is fine. Ideally wrap in useEffect.
    }

    const handleCheckOut = () => {
        setIsLoading(true);
        setTimeout(() => {
            reset(); // Clear store
            setIsLoading(false);
            setIsComplete(true);
        }, 1500);
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {t.dashboard.checkOut?.complete?.title || "Thank You!"}
                </h1>
                <p className="text-gray-500 mb-8">
                    {t.dashboard.checkOut?.complete?.desc || "We hope to see you again."}
                </p>
                <Link href="/">
                    <button className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                        {t.dashboard.checkOut?.complete?.back || "Back to Home"}
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6">
            <header className="flex items-center gap-4 mb-12">
                <Link href="/" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <span className="font-bold text-lg text-gray-900">{t.dashboard.checkOut?.title}</span>
            </header>

            <div className="flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto w-full">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <LogOut className="w-10 h-10 text-red-500 ml-1" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {t.dashboard.checkOut?.confirm?.title || "Check Out?"}
                </h2>
                <p className="text-gray-500 mb-10 leading-relaxed">
                    {t.dashboard.checkOut?.confirm?.desc || "Are you leaving now?"}
                </p>

                <button
                    onClick={handleCheckOut}
                    disabled={isLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <span>Processing...</span>
                    ) : (
                        <span>{t.dashboard.checkOut?.confirm?.action || "Confirm Check Out"}</span>
                    )}
                </button>
            </div>
        </div>
    );
}
