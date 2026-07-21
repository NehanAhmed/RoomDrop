import JoinPageComp from '@/components/JoinPageComponent'
import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://chat.nehan.site';

export const metadata: Metadata = {
    title: 'Join Room — RoomDrop',
    description: 'Join an existing anonymous chat room with a 6-character code or QR scan. No signup needed.',
    keywords: [
        'join room',
        'existing chat room',
        'temporary chat room',
        'ephemeral chat',
        'instant messaging room',
        'private chat room',
        'anonymous chat room'
    ],
    openGraph: {
        title: "Join Room — RoomDrop",
        description: "Join an existing anonymous chat room with a 6-character code or QR scan. No signup needed.",
        url: `${BASE_URL}/join`,
        siteName: "RoomDrop",
        locale: "en_US",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Join Room — RoomDrop",
        description: "Join an existing anonymous chat room with a 6-character code or QR scan. No signup needed.",
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
        canonical: `${BASE_URL}/join`,
    }
}


const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Join Room', item: `${BASE_URL}/join` },
    ],
}

const Page = () => {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <JoinPageComp />
        </>
    )
}

export default Page