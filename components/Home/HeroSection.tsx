'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconArrowRight, IconUsers, IconShield, IconClock, IconSparkles, IconMessage } from '@tabler/icons-react'

const features = [
  { icon: IconShield, label: 'Anonymous' },
  { icon: IconClock, label: 'Ephemeral' },
  { icon: IconUsers, label: 'Private' },
]

export function HeroSection() {
  return (
    <section className="relative border-r border-l border-b border-border min-h-[calc(100dvh-4rem)] flex items-center   overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, black, transparent)' }} />
        <div className="absolute top-1/4 left-0 w-[600px] h-[300px] bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full  p-6">
        <div className="mb-8 inline-flex items-center gap-2 border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
          <IconSparkles className="h-3 w-3" />
          Now in public beta
        </div>

        <h1 className="font-heading text-[clamp(3rem,8vw,5.5rem)] font-bold leading-[1.02] tracking-wide text-foreground max-w-3xl">
          <span>Chat without</span>
          <br />
          <span className="relative inline-block text-primary">
            boundaries
            <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-primary/30" />
          </span>
        </h1>

        <p className="font-sans mt-8 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
          RoomDrop is a private, ephemeral chat platform — create instant, signup-free
          chat rooms and start talking with complete privacy. No accounts. No traces.
        </p>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
          <Link href="/new">
            <Button className="group h-12 gap-3 px-8 text-xs">
              <span>Create a Room</span>
              <span className="flex h-5 w-5 items-center justify-center bg-white/15 group-hover:bg-white/25 transition-colors">
                <IconArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Button>
          </Link>
          <Link href="/join">
            <Button variant="secondary" className="group h-12 gap-3 px-8 text-xs">
              <IconUsers className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Join Room</span>
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-8">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <span className="flex h-6 w-6 items-center justify-center bg-primary/[0.06]">
                <f.icon className="h-3 w-3 text-primary/50" />
              </span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

     
    </section>
  )
}
