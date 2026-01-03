'use client'

import { useTheme } from 'next-themes'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[180px] h-9 bg-muted rounded-md animate-pulse" />
    )
  }

  return (
    <Tabs 
      value={theme} 
      onValueChange={setTheme}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="light" className="gap-2">
          <IconSun size={16} />
          <span className="hidden sm:inline">Light</span>
        </TabsTrigger>
        <TabsTrigger value="dark" className="gap-2">
          <IconMoon size={16} />
          <span className="hidden sm:inline">Dark</span>
        </TabsTrigger>
        <TabsTrigger value="system" className="gap-2">
          <IconDeviceDesktop size={16} />
          <span className="hidden sm:inline">System</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}