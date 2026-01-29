'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckInStore, CheckInStep } from '@/lib/store/check-in';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { IdentifyStep } from './steps/Identify';
import { VerifyStep } from './steps/Verify';
import { RegisterStep } from './steps/Register';
import { PaymentStep } from './steps/PaymentStep';
import { CompleteStep } from './steps/Complete';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';

const CheckInContent = () => {
    const { currentStep, setStep, setBooking } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);
    const searchParams = useSearchParams();
    const [isValidating, setIsValidating] = useState(true);
    // Initial Check
    useEffect(() => {
        const idFromUrl = searchParams.get('id');

        if (idFromUrl) {
            setTimeout(() => {
                setBooking({
                    id: parseInt(idFromUrl, 10),
                    facility: 1,
                    beds24_booking_id: 12345,
                    status: 'confirmed',
                    referer: 'manual',
                    api_reference: 'REF123',
                    check_in: '2024-04-01',
                    check_out: '2024-04-03',
                    guest_name: 'Guest User',
                    guest_country: 'Japan',
                    num_adult: 2,
                    num_child: 0,
                    total_price: 20000,
                    comission: 0,
                    accommodation_tax: 400,
                    is_paid: false,
                    booking_time: new Date().toISOString(),
                    create_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    cancelled_at: null,
                });
                setStep('verify');
                setIsValidating(false);
            }, 1000);
        } else {
            // If no ID, we fall back to manual search (Identify Component)
            // But we must assume this is a "Facility QR" access
            setStep('identify'); // Fallback to identify step
            setIsValidating(false);
        }
    }, [searchParams, setBooking, setStep]);

    const steps: Record<CheckInStep, React.ComponentType> = {
        identify: IdentifyStep,
        verify: VerifyStep,
        register: RegisterStep,
        payment: PaymentStep,
        complete: CompleteStep,
    };

    const CurrentComponent = steps[currentStep] || (() => null);

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }


    return (
        <div className="min-h-screen p-6 pb-24 relative flex flex-col bg-gray-50 text-gray-900">
            {/* Clean Background */}

            <header className="flex items-center gap-4 mb-8 z-20">
                <Link href="/" className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors bg-white border border-gray-100 shadow-sm">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">{t.dashboard.checkIn.title}</h1>
                    <div className="flex gap-2 h-2 mt-3">
                        {['verify', 'register', 'payment', 'complete'].map((step) => {
                            const stepIndex = ['verify', 'register', 'payment', 'complete'].indexOf(step);
                            const currentIndex = ['verify', 'register', 'payment', 'complete'].indexOf(currentStep);

                            return (
                                <div
                                    key={step}
                                    className={`flex-1 rounded-full h-full transition-all duration-300 ${stepIndex <= currentIndex ? 'bg-blue-500 shadow-sm' : 'bg-gray-200'
                                        }`}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className="flex-none">
                    <LanguageSelector />
                </div>
            </header>

            <div className="flex-1 flex flex-col relative z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        <CurrentComponent />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function CheckInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <CheckInContent />
        </Suspense>
    );
}
