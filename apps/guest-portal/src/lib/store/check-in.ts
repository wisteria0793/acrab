import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Reservation } from '@/types';

export type CheckInStep = 'identify' | 'verify' | 'register' | 'payment' | 'complete';

interface Guest {
    name: string;
    email: string;
    phone: string;
    address: string;
    occupation: string;
    nationality: string;
    passportNumber?: string;
    passportImage?: string;
}

interface CheckInState {
    currentStep: CheckInStep;
    isCheckedIn: boolean; // Flag to track if check-in is fully completed
    booking: Reservation | null;
    guestDetails: Guest;

    setStep: (step: CheckInStep) => void;
    setBooking: (booking: Reservation) => void;
    updateGuestDetails: (details: Partial<Guest>) => void;
    completeCheckIn: () => void;
    reset: () => void;
}

export const useCheckInStore = create<CheckInState>()(
    persist(
        (set) => ({
            currentStep: 'identify',
            isCheckedIn: false,
            booking: null,
            guestDetails: {
                name: '',
                email: '',
                phone: '',
                address: '',
                occupation: '',
                nationality: 'Japan',
            },

            setStep: (step) => set({ currentStep: step }),
            setBooking: (booking) => set({ booking }),
            updateGuestDetails: (details) =>
                set((state) => ({ guestDetails: { ...state.guestDetails, ...details } })),
            completeCheckIn: () => set({ isCheckedIn: true, currentStep: 'complete' }),
            reset: () => set({
                currentStep: 'identify',
                isCheckedIn: false,
                booking: null,
                guestDetails: {
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    occupation: '',
                    nationality: 'Japan',
                }
            }),
        }),
        {
            name: 'guest-portal-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
