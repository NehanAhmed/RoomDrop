'use client'

import { useTheme } from 'next-themes'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { useSyncExternalStore } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  if (!mounted) {
    return <div className="w-[180px] h-9 bg-muted/50 rounded-lg" />
  }

  return (
    <Tabs value={theme} onValueChange={setTheme}>
      <TabsList>
        <TabsTrigger value="light" className="active:scale-[0.95] transition-transform duration-150 ease-out-strong">
          <IconSun size={16} />
          Light
        </TabsTrigger>
        <TabsTrigger value="dark" className="active:scale-[0.95] transition-transform duration-150 ease-out-strong">
          <IconMoon size={16} />
          Dark
        </TabsTrigger>
        <TabsTrigger value="system" className="active:scale-[0.95] transition-transform duration-150 ease-out-strong">
          <IconDeviceDesktop size={16} />
          System
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
