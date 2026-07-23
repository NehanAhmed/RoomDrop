'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'Do I need to create an account?',
    a: 'No. Wick Chat is completely anonymous. Just pick a username and join any room. No email, no password, no personal data required.',
  },
  {
    q: 'How long do rooms last?',
    a: 'You choose the duration when creating a room — from 1 minute to 24 hours. After the time expires, the room and all its messages are permanently deleted.',
  },
  {
    q: 'Who can see my messages?',
    a: 'Only people who have the room code can join and see messages. Each room is completely isolated. We don\'t store messages beyond the room\'s lifetime.',
  },
  {
    q: 'Is there a limit on participants?',
    a: 'You can set a limit of 2 to 50 participants when creating a room. This gives you control over how many people can join your conversation.',
  },
  {
    q: 'Can I share images in chat?',
    a: 'Yes. You can upload images (JPEG, PNG, GIF, WebP) up to 10MB. Images are hosted securely and are deleted when the room expires.',
  },
  {
    q: 'Is Wick Chat free?',
    a: 'Yes, completely free. No premium tiers, no hidden costs. Wick Chat is an open-source project built for private, ephemeral communication.',
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="relative border-l border-r  border-border">
      <div className="p-6">
        <span className="inline-block text-xs font-semibold tracking-widest text-primary/70 uppercase">
          FAQ
        </span>
        <h2 className="font-heading mt-3 text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Frequently asked questions
        </h2>
        <p className="font-sans mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Everything you need to know about Wick Chat.
        </p>

        <div className="mt-16">
          <Accordion className="divide-y divide-border border border-border bg-card">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="font-sans px-6 py-5 text-sm font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
