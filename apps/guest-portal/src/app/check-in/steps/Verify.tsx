'use client';

import { useCheckInStore } from '@/lib/store/check-in';
import { Calendar, Users, Moon } from 'lucide-react';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';

export function VerifyStep() {
    const { booking, setStep } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);

    if (!booking) return null;

    return (
        <div className="flex flex-col h-full bg-transparent">
            <h2 className="text-2xl font-bold mb-6">{t.checkIn.verify.title}</h2>

            <div className="glass-panel p-6 rounded-2xl space-y-6 flex-1">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t.checkIn.verify.welcome}</p>
                    <p className="text-2xl font-bold text-gray-900">{booking.guest_name}</p>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{t.checkIn.verify.checkIn}</span>
                        </div>
                        <p className="font-semibold text-lg text-gray-900">{booking.check_in}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 space-y-2">
                        <div className="flex items-center gap-2 text-orange-600">
                            <Moon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{t.checkIn.verify.checkOut}</span>
                        </div>
                        <p className="font-semibold text-lg text-gray-900">{booking.check_out}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                        <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-lg font-medium text-gray-900">{booking.num_adult + booking.num_child} {t.checkIn.verify.guests}</span>
                </div>

                <div className="mt-auto pt-6">
                    <button
                        onClick={() => setStep('register')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    >
                        {t.checkIn.verify.yes}
                    </button>

                    <button
                        onClick={() => setStep('identify')}
                        className="w-full mt-3 py-3 text-sm text-muted-foreground hover:text-gray-900 transition-colors font-medium"
                    >
                        {t.checkIn.verify.no}
                    </button>
                </div>
            </div>
        </div>
    );
}
