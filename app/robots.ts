import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: '/api/',
            },
            {
                userAgent: 'OAI-SearchBot',
                allow: '/',
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
            },
            {
                userAgent: 'Claude-SearchBot',
                allow: '/',
            },
            {
                userAgent: 'Claude-User',
                allow: '/',
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
            },
            {
                userAgent: 'Perplexity-User',
                allow: '/',
            },
            {
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                userAgent: 'ClaudeBot',
                disallow: '/',
            },
            {
                userAgent: 'Google-Extended',
                disallow: '/',
            },
            {
                userAgent: 'Applebot-Extended',
                disallow: '/',
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
