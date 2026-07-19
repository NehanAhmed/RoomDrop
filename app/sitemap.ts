import { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://room-drop.vercel.app';
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${BASE_URL}/new`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/join`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        }
    ]
}