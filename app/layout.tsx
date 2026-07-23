import type { Metadata, Viewport } from 'next'
import { Nunito_Sans, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { ThemeVariantProvider } from '@/components/theme-variant-provider'
import { BASE_URL } from '@/lib/constants'

const bebasNeueHeading = Bebas_Neue({subsets:['latin'],weight:'400',variable:'--font-heading'})
const nunitoSans = Nunito_Sans({subsets:['latin'],variable:'--font-sans'})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  colorScheme: 'dark light',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Wick Chat — Anonymous Chat Rooms',
    template: '%s — Wick Chat',
  },
  description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Wick Chat',
    title: 'Wick Chat — Anonymous Chat Rooms',
    description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
    url: BASE_URL,
    locale: 'en_US',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Wick Chat — Anonymous Chat Rooms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wick Chat — Anonymous Chat Rooms',
    description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
    creator: '@Nehanahmed988',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Wick Chat',
      alternateName: 'Wick Chat — Anonymous Chat Rooms',
      url: BASE_URL,
      description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
      founder: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#person`,
        name: 'Nehan Ahmed',
        url: 'https://github.com/NehanAhmed',
      },
      sameAs: [
        'https://github.com/NehanAhmed/Wick',
        'https://github.com/NehanAhmed',
        'https://x.com/Nehanahmed988',
        'https://www.nehan.site',
        'https://www.instagram.com/__nehanahmed',
        'https://www.facebook.com/profile.php?id=61557055856757',
      ],
    },
    {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: 'Nehan Ahmed',
      url: 'https://github.com/NehanAhmed',
      sameAs: [
        'https://github.com/NehanAhmed',
        'https://x.com/Nehanahmed988',
        'https://www.nehan.site',
        'https://www.instagram.com/__nehanahmed',
        'https://www.facebook.com/profile.php?id=61557055856757',
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/#webapplication`,
      name: 'Wick Chat',
      alternateName: 'Wick Chat — Anonymous Chat Rooms',
      url: BASE_URL,
      description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
      applicationCategory: 'Communication',
      operatingSystem: 'Any',
      browserRequirements: 'JavaScript enabled',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: { '@id': `${BASE_URL}/#person` },
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(nunitoSans.variable, bebasNeueHeading.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
        />
      </head>
      <body className="antialiased w-full min-h-screen bg-background selection:bg-primary/20">
      <ThemeVariantProvider>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <Toaster position="top-right" richColors closeButton duration={3000} />
            <ErrorBoundary>
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
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </ThemeVariantProvider>
      </body>
    </html>
  )
}
