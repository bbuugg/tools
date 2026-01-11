import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocaleState {
    locale: string;
    setLocale: (locale: string) => void;
}

export const useLocaleStore = create<LocaleState>()(
    persist(
        (set) => ({
            locale: navigator.language === 'zh-CN' ? 'zh-CN' : 'en-US',
            setLocale: (locale: string) => set({ locale }),
        }),
        {
            name: 'as-locale-storage',
        }
    )
);
