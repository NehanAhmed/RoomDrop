'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { THEME_STORAGE_KEY, type ThemeId } from '../lib/themes'

interface ThemeVariantContextType {
  themeId: ThemeId
  setThemeVariant: (id: ThemeId) => void
}

const ThemeVariantContext = createContext<ThemeVariantContextType>({
  themeId: 'default',
  setThemeVariant: () => {},
})

function getInitialTheme(): ThemeId {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    return stored && stored !== 'default' ? stored : 'default'
  }
  return 'default'
}

export function ThemeVariantProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(getInitialTheme)

  useEffect(() => {
    if (themeId !== 'default') {
      document.documentElement.classList.add('theme-' + themeId)
    }
  }, [themeId])

  const setThemeVariant = useCallback((id: ThemeId) => {
    const root = document.documentElement
    for (const cls of Array.from(root.classList)) {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls)
      }
    }
    if (id !== 'default') {
      root.classList.add('theme-' + id)
    }
    setThemeId(id)
    localStorage.setItem(THEME_STORAGE_KEY, id)
  }, [])

  return (
    <ThemeVariantContext.Provider value={{ themeId, setThemeVariant }}>
      {children}
    </ThemeVariantContext.Provider>
  )
}

export function useThemeVariant() {
  return useContext(ThemeVariantContext)
}
