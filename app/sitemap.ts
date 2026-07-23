import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
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