'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "./ThemeToggle"
import Link from "next/link"
import { motion } from "motion/react"
import { IconPalette, IconShield, IconInfoCircle, IconExternalLink, IconCode, IconCalendar, IconUser } from "@tabler/icons-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <IconPalette className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <DialogTitle className="text-xl">Settings</DialogTitle>
              <DialogDescription>
                Customize your experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <Accordion className="w-full">
            {/* Appearance Section */}
            <AccordionItem value="appearance" className="border-b border-border/50">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconPalette className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Theme</Label>
                      <p className="text-xs text-muted-foreground">
                        Switch between light and dark mode
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Privacy Section */}
            <AccordionItem value="privacy" className="border-b border-border/50">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconShield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Privacy & Security</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  <p className="text-xs text-muted-foreground">
                    Control your privacy and security settings
                  </p>

                  <Link href="/privacy" className="block">
                    <motion.div
                      whileHover={{ x: 2 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        Privacy Policy
                        <IconExternalLink className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </motion.div>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* About Section */}
            <AccordionItem value="about">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconInfoCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">About</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconCode className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Version</span>
                    </div>
                    <span className="text-sm font-mono">1.0.2</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Build</span>
                    </div>
                    <span className="text-sm font-mono">2025.01.03</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconUser className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Creator</span>
                    </div>
                    <Link
                      href="https://github.com/NehanAhmed"
                      target="_blank"
                      className="text-sm font-mono hover:text-primary transition-colors flex items-center gap-1"
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