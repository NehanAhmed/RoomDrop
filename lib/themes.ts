export type ThemeId = 'default' | 'ocean' | 'rose' | 'neon' | 'sunset' | 'forest'

export interface Theme {
  id: ThemeId
  name: string
  color: string
}

export const themes: Theme[] = [
  { id: 'default', name: 'Default', color: 'oklch(0.555 0.163 48.998)' },
  { id: 'ocean', name: 'Ocean', color: 'oklch(0.488 0.243 264.376)' },
  { id: 'rose', name: 'Rose', color: 'oklch(0.505 0.213 27.518)' },
  { id: 'neon', name: 'Neon', color: 'oklch(0.218 0.008 223.9)' },
  { id: 'sunset', name: 'Sunset', color: 'oklch(0.228 0.013 107.4)' },
  { id: 'forest', name: 'Forest', color: 'oklch(0.527 0.154 150.069)' },
]

export const THEME_STORAGE_KEY = 'wickchat-theme'