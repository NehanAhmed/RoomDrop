'use client'

import Link from 'next/link'
import { IconBrandGithub, IconHeart } from '@tabler/icons-react'

export function FooterSection() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <span className="text-xs font-bold text-primary">R</span>
            </div>
            <span className="font-heading text-sm font-semibold tracking-wide text-foreground">
              RoomDrop
            </span>
          </div>

          <div className="font-sans flex items-center gap-1 text-xs text-muted-foreground">
            <span>Built with</span>
            <IconHeart className="h-3 w-3 text-primary/60" />
            <span>by</span>
            <Link
              href="https://github.com/NehanAhmed"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Nehan Ahmed
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/NehanAhmed/roomdrop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconBrandGithub className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </Link>
            <span className="text-xs text-muted-foreground/40">/</span>
            <span className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} RoomDrop
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
