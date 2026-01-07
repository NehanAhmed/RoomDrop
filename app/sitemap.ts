import { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
    const BASE_URl = process.env.NEXT_PUBLIC_BASE_URL || 'https://room-drop.vercel.app';
    return [
        {
            url: BASE_URl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${BASE_URl}/new`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URl}/join`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        }
    ]
}