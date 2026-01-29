'use client';

import { useState, useEffect } from 'react';
import { useCheckInStore } from '@/lib/store/check-in';
import { Search, Loader2, User, Phone, Plus, ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';
import { useSearchParams } from 'next/navigation';

import { getArrivalReservations, createReservation } from '@/lib/api/client';

import { Reservation } from '@/types';

export function IdentifyStep() {
    const [isLoading, setIsLoading] = useState(true);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [newName, setNewName] = useState('');
    const [newCheckOut, setNewCheckOut] = useState('');
    const [newGuests, setNewGuests] = useState(1);

    const { setStep, setBooking } = useCheckInStore();
    const { language } = useLanguageStore();
    const t = useTranslation(language);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                const fid = searchParams.get('fid');
                const facilityId = fid ? parseInt(fid, 10) : undefined;
                const data = await getArrivalReservations(undefined, facilityId);
                setReservations(data);
            } catch (error) {
                console.error("Failed to fetch reservations", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReservations();
    }, []);

    const handleSelect = (reservation: Reservation) => {
        setBooking(reservation);
        setStep('verify');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const fid = searchParams.get('fid');
            const facilityId = fid ? parseInt(fid, 10) : undefined;
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            // Default checkout to tomorrow if not set? Or required.
            // Let's assume required or default tomorrow.
            const checkout = newCheckOut || new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];

            const newRes = await createReservation({
                guest_name: newName,
                check_in: today,
                check_out: checkout,
                guests: newGuests,
                facility_id: facilityId
            });

            setBooking(newRes);
            setStep('verify'); // Or register? verify is safer to confirm what was just created.
        } catch (error) {
            console.error("Failed to create reservation", error);
            alert(language === 'ja' ? '予約の作成に失敗しました' : 'Failed to create reservation');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCreating) {
        return (
            <div className="flex flex-col h-full justify-center">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                        {language === 'ja' ? '新規予約作成' : 'Create Reservation'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {language === 'ja' ? '予約が見つからない場合、ここで作成できます' : 'Create a new reservation for walk-in guest'}
                    </p>
                </div>

                <form onSubmit={handleCreate} className="glass-panel p-6 rounded-2xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {language === 'ja' ? '代表者名' : 'Guest Name'}
                        </label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'ja' ? 'チェックアウト日' : 'Check-out Date'}
                            </label>
                            <input
                                type="date"
                                value={newCheckOut}
                                onChange={(e) => setNewCheckOut(e.target.value)}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'ja' ? '人数' : 'Guests'}
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={newGuests}
                                onChange={(e) => setNewGuests(parseInt(e.target.value))}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                        >
                            {language === 'ja' ? '戻る' : 'Back'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {language === 'ja' ? '作成して進む' : 'Create & Next'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{t.checkIn.identify.title}</h2>
                <p className="text-sm text-muted-foreground">
                    {language === 'ja'
                        ? '本日の到着予定ゲスト'
                        : "Today's Arrivals"}
                </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4 max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : reservations.length > 0 ? (
                    <div className="space-y-3">
                        {reservations.map((res) => (
                            <button
                                key={res.id}
                                onClick={() => handleSelect(res)}
                                className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all group flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-bold text-gray-900 group-hover:text-blue-700">{res.guest_name}</p>
                                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                        <span>Check-in: {res.check_in}</span>
                                    </div>
                                </div>
                                <User className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        {language === 'ja'
                            ? '本日の予約は見つかりませんでした。'
                            : 'No reservations found for today.'}
                    </div>
                )}

                {/* Create New Reservation Button - Always visible at bottom of list */}
                {!isLoading && (
                    <div className="pt-4 border-t border-gray-100 mt-4">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-4 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{language === 'ja' ? '予約が見つからない場合（新規作成）' : 'Reservation Not Found? Create New'}</span>
                        </button>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
                {language === 'ja'
                    ? 'リストにご自身の名前がない場合はスタッフまで'
                    : 'If not listed, please contact staff'}
            </p>
        </div>
    );
}
