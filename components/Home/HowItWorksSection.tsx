'use client'

import { IconPlus, IconLink, IconMessage, IconEraser } from '@tabler/icons-react'

const steps = [
  {
    icon: IconPlus,
    step: '01',
    title: 'Create a Room',
    description: 'Set a name, duration, and participant limit. Your room gets a unique code instantly.',
  },
  {
    icon: IconLink,
    step: '02',
    title: 'Share the Code',
    description: 'Send the room code or share the direct link. Others join with a single click — no sign-up needed.',
  },
  {
    icon: IconMessage,
    step: '03',
    title: 'Chat Freely',
    description: 'Messages appear in real-time. Everyone is anonymous — just the name you choose.',
  },
  {
    icon: IconEraser,
    step: '04',
    title: 'Auto-Vanishes',
    description: 'When time runs out, the room and all its messages are permanently deleted.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative border-l border-r border-b border-border">
      <div className="p-6">
        <span className="inline-block text-xs font-semibold tracking-widest text-primary/70 uppercase">
          How It Works
        </span>
        <h2 className="font-heading mt-3 text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Start chatting in seconds
        </h2>
        <p className="font-sans mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Four simple steps to private, ephemeral conversations.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.step} className="group relative">
              <div className="relative border border-border bg-card p-6 transition-colors hover:border-primary/20">
                <span className="text-4xl font-bold tracking-tighter text-primary/10">
                  {step.step}
                </span>
                <div className="mt-2 flex h-10 w-10 items-center justify-center bg-primary/[0.08] ring-1 ring-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading mt-4 text-sm font-semibold tracking-wider text-foreground">
                  {step.title}
                </h3>
                <p className="font-sans mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 z-10 h-px w-6 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
