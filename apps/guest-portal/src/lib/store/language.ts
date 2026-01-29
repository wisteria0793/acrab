import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'ja' | 'en' | 'zh' | 'ko' | 'th';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'ja',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'guest-portal-language',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
