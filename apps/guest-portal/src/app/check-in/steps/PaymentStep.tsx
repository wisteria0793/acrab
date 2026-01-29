'use client';

import { useCheckInStore } from '@/lib/store/check-in';
import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { createPaymentIntent, getReservationStatus } from '@/lib/api/client';
import { Loader2, CreditCard, Check, AlertCircle } from 'lucide-react';

function PaymentForm() {
    const { booking, setStep } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);

    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const verificationAttempts = useRef(0);

    const checkPaymentStatus = async () => {
        if (!booking?.id) return;

        try {
            const status = await getReservationStatus(booking.id);
            console.log('Payment verification status:', status);

            if (status.is_paid) {
                setStep('complete');
            } else {
                // Continue polling
                verificationAttempts.current += 1;
                if (verificationAttempts.current > 20) { // Timeout after ~60s (3s * 20)
                    setErrorMessage("Payment confirmation is taking longer than expected. Please contact support.");
                    setIsVerifyingPayment(false);
                }
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            // Don't stop polling on single error, might be transient
        }
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isVerifyingPayment) {
            // Poll immediately then every 3 seconds
            checkPaymentStatus();
            intervalId = setInterval(checkPaymentStatus, 3000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isVerifyingPayment, booking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !booking) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || 'An unexpected error occurred.');
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Payment successful on Stripe side, now verify with backend
                setIsVerifyingPayment(true);
                // Note: We keep isProcessing=true to show the loading state
            } else {
                setErrorMessage('Payment status unconfirmed.');
                setIsProcessing(false);
            }
        } catch (err: unknown) {
            const message = (err instanceof Error) ? err.message : 'An unexpected error occurred.';
            setErrorMessage(message);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="mb-6">
                <div className="glass-panel p-6 rounded-2xl mb-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">{t.checkIn.payment.total}</span>
                        <span className="text-3xl font-bold text-gray-900">¥{booking?.accommodation_tax}</span>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-200">
                        {t.checkIn.payment.note}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-2 border-blue-500 shadow-md shadow-blue-500/10 bg-white">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">{t.checkIn.payment.card}</p>
                            <p className="text-xs text-gray-500">Powered by Stripe</p>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <PaymentElement />
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-xl flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="mt-auto pt-4 space-y-3">
                <button
                    type="submit"
                    disabled={!stripe || isProcessing || isVerifyingPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {(isProcessing || isVerifyingPayment) ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isVerifyingPayment ? "Verifying Payment..." : t.checkIn.payment.processing}
                        </>
                    ) : (
                        `${t.checkIn.payment.pay} ¥${booking?.accommodation_tax}`
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setStep('complete')}
                    disabled={isProcessing || isVerifyingPayment}
                    className="w-full bg-transparent hover:bg-gray-100 text-gray-500 font-medium py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
                >
                    {t.checkIn.payment.payLocal}
                </button>
            </div>
        </form>
    );
}

export function PaymentStep() {
    const { booking } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClientSecret = async () => {
            if (!booking?.id) return;

            try {
                const data = await createPaymentIntent(booking.id);
                console.log("PaymentIntent response:", data);

                if (data.error) {
                    throw new Error(data.error);
                }
                if (!data.clientSecret) {
                    throw new Error(`Missing clientSecret. Data: ${JSON.stringify(data)}`);
                }

                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error("Failed to init payment", error);
                setInitError("Failed to initialize payment. Please try refreshing.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchClientSecret();
    }, [booking]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500 text-sm">Initializing payment...</p>
            </div>
        );
    }

    if (initError || !clientSecret) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 text-sm mb-6">{initError || "Could not load payment information."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2">{t.checkIn.payment.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">
                {t.checkIn.payment.desc}
            </p>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm />
            </Elements>
        </div>
    );
}
