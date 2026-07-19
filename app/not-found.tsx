import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconMessageCircle, IconArrowLeft } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background selection:bg-primary/20">
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-16 text-center">
        <div className="p-[3px] rounded-2xl bg-primary/10 w-fit mx-auto mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-[calc(2rem-3px)] bg-primary/10">
            <IconMessageCircle className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-[clamp(2.25rem,4vw,3rem)] font-semibold tracking-tighter leading-[1.1] text-foreground mb-3">
          Room not found
        </h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-[28ch] mx-auto">
          This room may have expired or the link is incorrect.
        </p>
        <Link href="/">
          <Button className="group">
            <span className="flex items-center gap-2">
              <IconArrowLeft className="w-4 h-4" />
              Back to Home
            </span>
          </Button>
        </Link>
      </div>
    </main>
  )
}
