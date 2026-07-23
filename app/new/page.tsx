import CreateRoomComp from '@/components/CreateRoomComponent'
import { Metadata } from 'next'
import { BASE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: "Create Room — Wick Chat",
  description: "Create a new chat room",
  keywords: [
    'create room',
    'new chat room',
    'temporary chat room',
    'ephemeral chat',
    'instant messaging room',
    'private chat room',
    'anonymous chat room'
  ],

  openGraph: {
    title: "Create Room — Wick Chat",
    description: "Create a new chat room",
    url: `${BASE_URL}/new`,
    siteName: "Wick Chat",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Room — Wick Chat",
    description: "Set up your anonymous chat space in seconds. No signup required.",
    creator: '@Nehanahmed988'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${BASE_URL}/new`,
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Create Room', item: `${BASE_URL}/new` },
  ],
}

const Page = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CreateRoomComp />
    </>
  )
}

export default Page