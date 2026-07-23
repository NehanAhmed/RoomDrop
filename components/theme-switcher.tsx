'use client'

import { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Palette } from 'lucide-react'
import { themes, type ThemeId } from '../lib/themes'
import { useThemeVariant } from './theme-variant-provider'

const emptySubscribe = () => () => {}

export function ThemeVariantSwitcher() {
  const [open, setOpen] = useState(false)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const { themeId, setThemeVariant } = useThemeVariant()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id: ThemeId) => {
    setThemeVariant(id)
    setOpen(false)
  }

  if (!mounted) return null

  return (
    <div ref={ref} className="relative z-100">
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className="group relative inline-flex items-center justify-center h-8 w-8 border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Switch theme variant"
      >
        <Palette className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-44 border border-border bg-card p-1.5 shadow-sm z-50"
          >
            {themes.map((theme) => {
              const active = theme.id === themeId
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  }`}
                >
                  <span
                    className="h-4 w-4 shrink-0 border border-border"
                    style={theme.id === 'default' ? undefined : { backgroundColor: theme.color }}
                  />
                  <span className="flex-1 text-left font-sans text-sm">{theme.name}</span>
                  {active && (
                    <motion.span
                      layoutId="activeTheme"
                      className="h-1.5 w-1.5 shrink-0 bg-foreground"
                    />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
