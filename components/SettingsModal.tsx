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

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your experience
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Accordion className="w-full">
            {/* Appearance Section */}
            <AccordionItem value="appearance">
              <AccordionTrigger className="text-sm font-medium">
                Appearance
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Customize how the app looks and feels
                  </p>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-xs text-muted-foreground">
                        Switch between light and dark mode
                      </p>
                    </div>
                    {/* Theme switcher will go here */}
                    <div className="flex items-center gap-2">
                      {/* Add your theme switcher component here */}
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>


            {/* Privacy Section */}
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-sm font-medium">
                Privacy & Security
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Control your privacy and security settings
                  </p>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Link href={'/privacy'}>
                        Privacy & Policy's
                      </Link>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* About Section */}
            <AccordionItem value="about">
              <AccordionTrigger className="text-sm font-medium">
                About
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Version</span>
                      <span className="text-sm font-mono">1.0.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Build</span>
                      <span className="text-sm font-mono">2025.01.03</span>

                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Creator</span>
                      <span className="text-sm font-mono "><Link className="hover:underline" target="_blank" href={'https://github.com/NehanAhmed'} >Nehan Ahmed</Link></span>

                    </div>
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