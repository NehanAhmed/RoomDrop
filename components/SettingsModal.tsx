'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from './ThemeToggle'
import Link from 'next/link'
import { IconPalette, IconShield, IconInfoCircle, IconExternalLink, IconCode, IconCalendar, IconUser } from '@tabler/icons-react'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-[3px] rounded-xl bg-primary/10">
              <div className="flex items-center justify-center w-10 h-10 rounded-[calc(1.25rem-3px)] bg-primary/10">
                <IconPalette className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Customize your experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <Accordion>
            <AccordionItem value="appearance">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-[2px] rounded-lg bg-primary/10">
                    <div className="flex items-center justify-center w-7 h-7 rounded-[calc(0.5rem-2px)] bg-primary/10">
                      <IconPalette className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <span className="text-sm font-medium">Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-xs text-muted-foreground/70">
                        Switch between light and dark mode
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-[2px] rounded-lg bg-primary/10">
                    <div className="flex items-center justify-center w-7 h-7 rounded-[calc(0.5rem-2px)] bg-primary/10">
                      <IconShield className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <span className="text-sm font-medium">Privacy & Security</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  <p className="text-xs text-muted-foreground/70">
                    Control your privacy and security settings
                  </p>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconShield className="w-4 h-4" />
                      No data stored server-side. Room data auto-deletes after expiry.
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="about">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-[2px] rounded-lg bg-primary/10">
                    <div className="flex items-center justify-center w-7 h-7 rounded-[calc(0.5rem-2px)] bg-primary/10">
                      <IconInfoCircle className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <span className="text-sm font-medium">About</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconCode className="w-4 h-4 text-muted-foreground/60" />
                      <span className="text-sm text-muted-foreground">Version</span>
                    </div>
                    <span className="text-sm font-mono">1.0.2</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="w-4 h-4 text-muted-foreground/60" />
                      <span className="text-sm text-muted-foreground">Build</span>
                    </div>
                    <span className="text-sm font-mono">2025.01.03</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconUser className="w-4 h-4 text-muted-foreground/60" />
                      <span className="text-sm text-muted-foreground">Creator</span>
                    </div>
                    <Link
                      href="https://github.com/NehanAhmed"
                      target="_blank"
                      className="text-sm font-mono hover:text-primary transition-colors duration-200 flex items-center gap-1"
                    >
                      Nehan Ahmed
                      <IconExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}
