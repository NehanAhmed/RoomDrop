'use client'

import { Button } from '@/components/ui/button'
import { IconMessageCircle, IconRefresh } from '@tabler/icons-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background selection:bg-primary/20">
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-16 text-center">
        <div className="p-[3px] rounded-2xl bg-destructive/15 w-fit mx-auto mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-[calc(2rem-3px)] bg-destructive/10">
            <IconMessageCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-[clamp(2.25rem,4vw,3rem)] font-semibold tracking-tighter leading-[1.1] text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-[32ch] mx-auto">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="secondary" className="group">
            <span className="flex items-center gap-2">
              <IconRefresh className="w-4 h-4" />
              Try Again
            </span>
          </Button>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
