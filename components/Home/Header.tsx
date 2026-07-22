'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'
import { IconBrandGithub } from '@tabler/icons-react'

export function Header() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  return (
    <header className="border w-full  z-50 h-16">
      <div className="mx-auto flex h-full max-w-243.75 border-r border-l border-border items-center justify-between px-6 lg:px-6">
        <Link href="/">
          <Image
            src="/transparent-logo.png"
            alt="RoomDrop"
            width={100}
            height={28}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          {mounted && <ThemeToggle />}
          <a
            href="https://github.com/NehanAhmed/roomdrop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="View on GitHub"
          >
            <IconBrandGithub className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
