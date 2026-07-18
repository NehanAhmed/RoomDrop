import type { Metadata } from 'next'
import { Space_Grotesk, Geist_Mono, DM_Sans, Noto_Serif } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { Suspense } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const notoSerifHeading = Noto_Serif({ subsets: ['latin'], variable: '--font-heading' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoomDrop - Anonymous Chat Rooms',
  description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geistMono.variable, 'font-sans', dmSans.variable, notoSerifHeading.variable)} suppressHydrationWarning>
      <body className="font-mono antialiased w-full min-h-screen bg-background selection:bg-primary/20">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <Toaster position="top-right" richColors closeButton duration={3000} />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-background">
                <div
                  className="flex flex-col items-center gap-3"
                  style={{ animation: 'fade-up 700ms cubic-bezier(0.32,0.72,0,1) both' }}
                >
                  <div className="p-[3px] rounded-2xl bg-primary/10">
                    <div className="flex items-center justify-center w-10 h-10 rounded-[calc(1.25rem-3px)] bg-primary/10">
                      <IconLoader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            }>
              {children}
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
