'use client';



import { useState } from 'react';
import { useCheckInStore } from '@/lib/store/check-in';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';
import { ExternalLink, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';

export function RegisterStep() {
    const { booking, setStep } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);
    const [isChecking, setIsChecking] = useState(false);

    // Placeholder Google Form URL - In production, this should be configurable
    // Pre-fill logic: ?usp=pp_url&entry.123456=${booking.id}
    const GOOGLE_FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfPk-dummy-id/viewform";
    const formUrl = booking ? `${GOOGLE_FORM_BASE_URL}?usp=pp_url&entry.123456789=${booking.id}` : GOOGLE_FORM_BASE_URL;

    const handleCheckCompletion = async () => {
        setIsChecking(true);

        // Mock API check
        // In reality, this would hit: GET /api/reservations/{id}/check-registration-status
        setTimeout(() => {
            setIsChecking(false);
            // Simulate success for now
            const isComplete = true;

            if (isComplete) {
                setStep('payment');
            } else {
                alert(language === 'ja' ? '登録が確認できませんでした。' : 'Registration not confirmed yet.');
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2">{t.checkIn.register.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">
                {language === 'ja'
                    ? '法令に基づき、宿泊者名簿の記入が必要です。以下のフォームより入力をお願いします。'
                    : 'Required by law. Please complete the guest registration via the form below.'}
            </p>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-4">

                {/* Google Form Link Button */}
                <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full max-w-sm bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-[0.98]"
                >
                    <ExternalLink className="w-6 h-6" />
                    <span className="text-lg">
                        {language === 'ja' ? '名簿入力フォームを開く' : 'Open Registration Form'}
                    </span>
                </a>

                <div className="text-center space-y-2 max-w-xs mx-auto">
                    <p className="text-sm text-gray-500">
                        {language === 'ja'
                            ? 'フォーム送信後、以下のボタンを押してください。'
                            : 'After submitting, please click the button below.'}
                    </p>
                </div>

            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 pt-4 bg-white/95 backdrop-blur-sm border-t border-gray-100">
                <button
                    onClick={handleCheckCompletion}
                    disabled={isChecking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isChecking ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{language === 'ja' ? '確認中...' : 'Checking...'}</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            <span>{language === 'ja' ? '入力完了（次へ）' : 'I have completed registration'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
