import { create } from 'zustand'

import i18n from '../lib/i18n'

type Language = 'en' | 'zh'

type ShellState = {
  language: Language
  setLanguage: (language: Language) => void
}

export const useShellStore = create<ShellState>((set) => ({
  language: 'zh',
  setLanguage: (language) => {
    void i18n.changeLanguage(language)
    set({ language })
  },
}))
