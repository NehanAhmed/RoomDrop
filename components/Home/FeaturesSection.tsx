'use client'

import { IconShield, IconClock, IconUsers, IconLock, IconBolt, IconShare } from '@tabler/icons-react'

const features = [
  {
    icon: IconShield,
    title: 'Anonymous',
    description: 'No sign-up required. Join any room with just a username — your identity stays private.',
    wide: true,
  },
  {
    icon: IconClock,
    title: 'Ephemeral',
    description: 'Rooms auto-destruct after their time limit. Conversations vanish, leaving no trace behind.',
    wide: false,
  },
  {
    icon: IconBolt,
    title: 'Instant Setup',
    description: 'Create a room in seconds. Set duration, share the code, and start chatting immediately.',
    wide: true,
  },
  {
    icon: IconUsers,
    title: 'Private Rooms',
    description: 'Each room is isolated with a unique code. Only those with the code can join and participate.',
    wide: false,
  },
  {
    icon: IconLock,
    title: 'End-to-End',
    description: 'Your messages are yours. We prioritize privacy with no message storage beyond room lifetime.',
    wide: false,
  },
  {
    icon: IconShare,
    title: 'Easy Sharing',
    description: 'Share your room code via QR code or direct link. Others join with a single click.',
    wide: true,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative border-l border-r border-b border-border ">
      <div className="p-6">
        <span className="inline-block text-xs font-semibold tracking-widest text-primary/70 uppercase">
          Features
        </span>
        <h2 className="font-heading mt-3 text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Everything you need
        </h2>
        <p className="font-sans mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Built for privacy, speed, and simplicity. No fluff — just the tools you need for ephemeral conversations.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative bg-card p-8 transition-colors hover:bg-muted/50 ${
                feature.wide ? 'lg:col-span-2' : ''
              }`}
            >
              {feature.wide && (
                <span className="absolute top-0 left-0 right-0 h-px bg-primary/20" />
              )}
              <div className="mb-4 flex h-10 w-10 items-center justify-center bg-primary/[0.08] ring-1 ring-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-sm font-semibold tracking-wider text-foreground">{feature.title}</h3>
              <p className="font-sans mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
