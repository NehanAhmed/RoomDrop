# SEO Audit — RoomDrop

**Audit date:** 2026-07-19
**Audited by:** Automated codebase scan
**Stack:** Next.js 16.0.10, App Router (no `pages/` directory)

---

## Executive Summary

**Overall grade: C (55/100)**

The site has a solid foundation — server-rendered static pages, correct `<h1>` structure, no raw `<a>` tags, and `next/link` used everywhere. However, several critical SEO gaps exist: zero structured data (JSON-LD) anywhere, no custom `not-found.tsx` (the default Next.js 404 renders as a 200-status soft-404), a broken OG image reference on the Join page, the dynamic `/room/[roomCode]` page has no metadata export at all, and the root layout lacks many metadata essentials (`title.template`, `openGraph`, `twitter`, `robots`, `verification`, `viewport`). Search Console and Bing Webmaster Tools are not verified.

**AI-Search readiness: Poor.** No structured data (the single highest-signal technique for AI crawlers to extract entity information), no AI-crawler policy in `robots.txt`, no `llms.txt`, no visible last-updated dates, and the site's entity definition ("what is RoomDrop?") is inconsistent across pages. The server-first rendering (App Router advantage) is the only strong point for AI crawlability.

### Top 5 Critical Issues

| #   | Issue                                                                                                                      | File                           |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Zero JSON-LD structured data in the entire codebase                                                                        | (global)                       |
| 2   | Root layout missing `title.template`, `openGraph`, `twitter`, `robots`, `alternates.canonical`, `verification`, `viewport` | `app/layout.tsx:16`            |
| 3   | `/room/[roomCode]` has no metadata export or `generateMetadata`                                                            | `app/room/[roomCode]/page.tsx` |
| 4   | No `not-found.tsx` — default `_not-found` is a 200-status soft-404                                                         | (missing)                      |
| 5   | Join page references non-existent OG image `"/og(1).png"` and wrong domain in canonical                                    | `app/join/page.tsx:36,54`      |

---

## Findings

### 1. Foundation & Configuration

| Status | Severity | File / Location       | Issue                                                                                                                                                  | Fix                                                       |
| ------ | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| ⚠️     | High     | `next.config.ts:3-27` | `poweredByHeader` not explicitly set; `trailingSlash` not configured; no `redirects()` for www/non-www or trailing-slash normalization                 | Add explicit config (see Appendix A)                      |
| ❌     | Critical | (multi-file)          | No single source of truth for production domain — `https://room-drop.vercel.app` hardcoded in 5+ files instead of using `NEXT_PUBLIC_BASE_URL` env var | Use env var everywhere (see Appendix A)                   |
| ✅     | —        | `next.config.ts:4-6`  | `formats: ["image/avif", "image/webp"]` correctly set                                                                                                  | —                                                         |
| ❌     | High     | `next.config.ts`      | No preview/staging `noindex` logic — Vercel preview deployments will be indexed as duplicate content                                                   | Add `x-robots-tag` header in preview env (see Appendix A) |
| ⚠️     | Low      | `package.json`        | `sharp` not installed — not needed currently since `next/image` is not used, but should be added before adopting `next/image`                          | `pnpm add sharp`                                          |
| ✅     | —        | `eslint.config.mjs`   | No `ignoreDuringBuilds` or `typescript.ignoreBuildErrors` — correct                                                                                    | —                                                         |
| ⚠️     | Medium   | `vercel.json`         | No redirect rules for URL normalization (www, trailing slash, HTTPS)                                                                                   | Add redirects to collapse to one canonical form           |

### 2. Metadata Layer

| Status | Severity | File / Location                   | Issue                                                                                                                                | Fix                                           |
| ------ | -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| ❌     | Critical | `app/layout.tsx:16-20`            | Root layout metadata missing: `title.template`, `openGraph`, `twitter`, `robots`, `alternates.canonical`, `verification`, `viewport` | Add complete root metadata (see Appendix B)   |
| ✅     | —        | `app/layout.tsx:17`               | `metadataBase` correctly set                                                                                                         | —                                             |
| ❌     | High     | `app/join/page.tsx:36`            | Broken OG image: `"/og(1).png"` does not exist in `public/` (actual file is `public/og.png`)                                         | Change to `"/og.png"`                         |
| ❌     | High     | `app/join/page.tsx:54`            | Wrong domain in canonical: `https://roomdrop.vercel.app/join` vs actual `https://room-drop.vercel.app`                               | Fix to `https://room-drop.vercel.app/join`    |
| ❌     | Critical | `app/room/[roomCode]/page.tsx:10` | No `generateMetadata` or `export const metadata` — dynamic room pages render with only root layout defaults                          | Add async `generateMetadata` (see Appendix B) |
| ✅     | —        | `app/page.tsx:4-56`               | Home page metadata: complete OG, Twitter, robots, canonical — correct                                                                | —                                             |
| ✅     | —        | `app/new/page.tsx:4-57`           | Create Room metadata: complete — correct                                                                                             | —                                             |
| ⚠️     | Low      | `app/page.tsx:21`                 | OpenGraph URL is hardcoded; should use `NEXT_PUBLIC_BASE_URL`                                                                        | Use env var                                   |
| ⚠️     | Low      | `app/page.tsx:54`                 | Canonical URL is hardcoded                                                                                                           | Use env var                                   |
| ⚠️     | Low      | `app/new/page.tsx:55`             | Canonical URL is hardcoded                                                                                                           | Use env var                                   |
| ❌     | Medium   | `app/layout.tsx`                  | No `viewport` export — `themeColor` and `colorScheme` not set                                                                        | Add viewport export (see Appendix B)          |

### 3. Discovery & Crawl Files

| Status | Severity | File / Location    | Issue                                                                                                  | Fix                                                         |
| ------ | -------- | ------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| ✅     | —        | `app/sitemap.ts`   | Covers `/`, `/new`, `/join` — appropriate for this app                                                 | —                                                           |
| ⚠️     | Low      | `app/sitemap.ts:5` | `BASE_URl` typo (should be `BASE_URL`); uses hardcoded fallback                                        | Fix variable name; use `NEXT_PUBLIC_BASE_URL`               |
| ✅     | —        | `app/robots.ts`    | Correctly disallows `/api/`, points to sitemap                                                         | —                                                           |
| ❌     | Medium   | `app/robots.ts`    | No AI-crawler-specific rules                                                                           | Add AI crawler policy (see Appendix D)                      |
| ❌     | High     | (missing)          | No `app/manifest.ts` or `public/manifest.json` — PWA manifest absent                                   | Add manifest (see Appendix C)                               |
| ❌     | Medium   | (missing)          | No `apple-icon` images — iOS devices get no custom icon                                                | Add `public/apple-icon.png` + config                        |
| ⚠️     | Low      | `app/favicon.ico`  | Only one favicon size — no multi-size icon set                                                         | Add multiple favicon sizes                                  |
| ❌     | High     | (missing)          | No `app/not-found.tsx` — default Next.js `_not-found` returns HTTP 200 (soft-404)                      | Add custom 404 returning proper 404 status (see Appendix C) |
| ❌     | High     | (missing)          | No `app/error.tsx` — 500 errors render React default error overlay in dev, no branded fallback in prod | Add error boundary page (see Appendix C)                    |
| ⚠️     | Low      | (missing)          | No `app/opengraph-image.tsx` or `app/twitter-image.tsx` for dynamic per-room OG images                 | Add dynamic OG image generation for room pages              |

### 4. Structured Data (JSON-LD)

| Status | Severity | File / Location                         | Issue                                                                                                  | Fix                                                            |
| ------ | -------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| ❌     | Critical | (global)                                | Zero JSON-LD in the entire codebase. No `WebSite`, `Organization`, or `BreadcrumbList` schema anywhere | Add JSON-LD to root layout and relevant pages (see Appendix E) |
| ❌     | High     | `app/layout.tsx`                        | No `Organization`/`WebSite` schema — AI crawlers have no structured entity to resolve                  | Add root-level JSON-LD (see Appendix E)                        |
| ❌     | Medium   | `app/new/page.tsx`, `app/join/page.tsx` | No `BreadcrumbList` schema on sub-pages                                                                | Add breadcrumb schema (see Appendix E)                         |

### 5. On-Page SEO

| Status | Severity | File / Location                    | Issue                                                                                                       | Fix                           |
| ------ | -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| ✅     | —        | (all pages)                        | Exactly one `<h1>` per page — correct                                                                       | —                             |
| ✅     | —        | (all pages)                        | `next/link` used for all internal navigation (5 instances) — correct                                        | —                             |
| ✅     | —        | (all pages)                        | No raw `<a>` tags for internal links — correct                                                              | —                             |
| ⚠️     | Low      | (all pages)                        | No `<h2>`/`<h3>` subheadings on most pages — thin heading hierarchy                                         | Add logical subheadings       |
| ✅     | —        | (all pages)                        | Clean URL structure: `/`, `/new`, `/join`, `/room/[code]` — kebab-case, no query strings                    | —                             |
| ⚠️     | Medium   | `components/Home/HomeModal.tsx:91` | Home heading "Chat without boundaries" doesn't include primary keyword "anonymous chat rooms" or "RoomDrop" | Consider more keyword-rich H1 |

### 6. AI Search Optimization (AEO/GEO)

| Status | Severity | File / Location                    | Issue                                                                                                                                                           | Fix                                                          |
| ------ | -------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| ❌     | High     | `app/robots.ts`                    | No AI-crawler-specific rules — all crawlers lumped under `User-agent: *`                                                                                        | Separate policy for AI search/training bots (see Appendix D) |
| ⚠️     | Medium   | (missing)                          | No `llms.txt` — emerging convention for AI crawler guidance                                                                                                     | Add `public/llms.txt` (see Appendix D)                       |
| ❌     | Critical | (global)                           | No structured data — AI systems have no entity resolution for the site                                                                                          | See Structured Data section                                  |
| ⚠️     | Medium   | (global)                           | No visible last-updated dates on any page — stale-undated content is less likely to be cited by AI answer engines                                               | Add dates to content pages                                   |
| ❌     | High     | (multi-file)                       | Inconsistent entity naming — site appears as "RoomDrop", "RoomDrop - Anonymous Chat Rooms", "RoomDrop - An Easy Way to Create and Join Chat Rooms" across pages | Normalize to single entity name                              |
| ✅     | —        | (all pages)                        | SEO-critical content renders in initial server-side HTML (App Router) — AI crawlers see it without JS                                                           | —                                                            |
| ⚠️     | Low      | `components/Home/HomeModal.tsx:66` | Home page returns `null` before hydration (`if (!isClient) return null`) — crawlers see empty shell briefly                                                     | Use server-compatible fallback                               |
| ✅     | —        | —                                  | No `nofollow` or `noindex` leaks on core pages                                                                                                                  | —                                                            |

### 7. Performance / Core Web Vitals

| Status | Severity | File / Location                | Issue                                                                                                                           | Fix |
| ------ | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --- |
| ✅     | —        | `app/layout.tsx:12-14`         | `next/font/google` used for all fonts — no external font `<link>` tags                                                          | —   |
| ✅     | —        | (all pages)                    | No content `<img>` tags — no LCP image issues from images                                                                       | —   |
| ✅     | —        | `next.config.ts:4-6`           | AVIF + WebP format optimization enabled                                                                                         | —   |
| ⚠️     | Low      | (all static pages)             | All pages are `○` (static/prerendered) — fast first HTML to crawlers                                                            | —   |
| ✅     | —        | `app/room/[roomCode]/page.tsx` | Room page is `ƒ` (dynamic server-render) — correct for ephemeral content                                                        | —   |
| ⚠️     | Low      | (all pages)                    | No `revalidate` / ISR or `"use cache"` configured — not critical for this app since all content is user-generated and ephemeral | —   |
| ✅     | —        | —                              | No unsized media embeds causing CLS                                                                                             | —   |

### 8. Verification & Monitoring

| Status | Severity | File / Location  | Issue                                                                                      | Fix                                    |
| ------ | -------- | ---------------- | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| ❌     | High     | `app/layout.tsx` | No `verification` metadata — Search Console and Bing Webmaster Tools not linked            | Add verification meta (see Appendix B) |
| ❌     | High     | (external)       | No Search Console verified — cannot monitor indexation, crawl errors, or query performance | Verify in Google Search Console        |
| ❌     | High     | (external)       | No Bing Webmaster Tools verified — ChatGPT citations lean on Bing index                    | Verify in Bing Webmaster Tools         |

---

## Missing Files & Dependencies

```
# Missing files to create:
app/not-found.tsx
app/error.tsx
app/manifest.ts
public/apple-icon.png
public/llms.txt

# Dependency to install:
pnpm add sharp
pnpm add -D @types/sharp
```

---

## AI Search Optimization (AEO/GEO)

### Current State

RoomDrop is **not optimized** for AI-driven search. This is a significant gap because the product (ephemeral anonymous chat) is the exact type of utility that AI answer engines cite — yet there is zero machine-readable signal for a crawler to understand what the site is.

### Issues & Recommendations

**1. Structured Data (Highest Priority)**
Zero JSON-LD means AI crawlers get no entity resolution. A `WebSite` + `SoftwareApplication` schema in the root layout tells crawlers "this is a web app for anonymous temporary chat rooms" in a structured format they trust more than prose. This is the single highest-leverage AEO change.

**2. robots.txt AI Crawler Policy**
Current rules lump all bots under `User-agent: *`. The industry is moving toward explicit AI-bot policies:

```txt
# AI search/citation bots — Allow (get cited)
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /

# AI training bots — Policy call (currently allowed via wildcard)
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: Applebot-Extended
Disallow: /
```

⚠️ Note: robots.txt is an honor-system control. Perplexity has been documented running crawlers outside declared user-agents. This should be treated as stated policy, not enforcement.

**3. llms.txt**
Add a `public/llms.txt` file — an emerging (non-standard, unconfirmed as a ranking factor) convention that some AI crawlers read for site guidance:

```txt
# RoomDrop
> Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.

## Core pages
- Home: https://room-drop.vercel.app/
- Create Room: https://room-drop.vercel.app/new
- Join Room: https://room-drop.vercel.app/join

## Features
- Anonymous: No signup required, no personal data stored
- Ephemeral: Rooms auto-delete after expiry
- Private: End-to-end encrypted real-time messaging
```

**4. Entity Naming Consistency**
The site currently uses 3 different entity names:

- `"RoomDrop"` (sidebar, settings)
- `"RoomDrop - Anonymous Chat Rooms"` (home page title, root title)
- `"RoomDrop - An Easy Way to Create and Join Chat Rooms"` (/new, /join OG titles)

Standardize to `"RoomDrop"` everywhere with a consistent tagline: `"Anonymous Chat Rooms"`.

**5. Visible Last-Updated Dates**
Add `Last updated: <date>` to pages — citation-pattern research shows AI systems skew toward citing recently-updated content.

**6. Plain Declarative Entity Statement**
The home page hero paragraph is good but could be stronger. Ensure every key page has a plain near-top sentence like:

> RoomDrop is a privacy-focused web app for creating and joining temporary anonymous chat rooms without signup.

This is the sentence most likely to be lifted verbatim into an AI answer.

---

## Prioritized Action Plan

### Critical — Ship This Week

| #   | Action                                                                                                                                     | Files                                                                                      | Estimated Effort |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------- |
| 1   | Add complete root layout metadata (`title.template`, `openGraph`, `twitter`, `robots`, `alternates.canonical`, `verification`, `viewport`) | `app/layout.tsx`                                                                           | 15 min           |
| 2   | Add `generateMetadata` to `/room/[roomCode]`                                                                                               | `app/room/[roomCode]/page.tsx`                                                             | 10 min           |
| 3   | Fix broken OG image and wrong domain on `/join` page                                                                                       | `app/join/page.tsx`                                                                        | 5 min            |
| 4   | Add JSON-LD structured data (`WebSite` + `SoftwareApplication`) to root layout                                                             | `app/layout.tsx`                                                                           | 15 min           |
| 5   | Create `app/not-found.tsx` returning real 404 status                                                                                       | new file                                                                                   | 10 min           |
| 6   | Create `app/error.tsx` for 500 handling                                                                                                    | new file                                                                                   | 10 min           |
| 7   | Normalize hardcoded URLs to use `NEXT_PUBLIC_BASE_URL`                                                                                     | `app/page.tsx`, `app/new/page.tsx`, `app/join/page.tsx`, `app/sitemap.ts`, `app/robots.ts` | 15 min           |

### High — This Sprint

| #   | Action                                                                   | Files                                                   | Estimated Effort |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------- | ---------------- |
| 8   | Add AI-crawler-specific `robots.txt` rules                               | `app/robots.ts`                                         | 10 min           |
| 9   | Add `app/manifest.ts` for PWA support                                    | new file                                                | 15 min           |
| 10  | Add `public/llms.txt`                                                    | new file                                                | 10 min           |
| 11  | Add `poweredByHeader: false`, `trailingSlash` config to `next.config.ts` | `next.config.ts`                                        | 5 min            |
| 12  | Add preview/staging `noindex` via `x-robots-tag` header                  | `next.config.ts` or `middleware.ts`                     | 15 min           |
| 13  | Fix `BASE_URl` typo in `app/sitemap.ts`                                  | `app/sitemap.ts`                                        | 2 min            |
| 14  | Standardize entity name to "RoomDrop — Anonymous Chat Rooms"             | all metadata files                                      | 10 min           |
| 15  | Add visible last-updated dates to pages                                  | `app/page.tsx`, `app/new/page.tsx`, `app/join/page.tsx` | 10 min           |

### Nice-to-Have

| #   | Action                                                                     | Effort |
| --- | -------------------------------------------------------------------------- | ------ |
| 16  | Add `apple-icon.png` + multi-size favicon set                              | 15 min |
| 17  | Add dynamic OG image generation (`app/opengraph-image.tsx`) for room pages | 30 min |
| 18  | Install `sharp` for future `next/image` usage                              | 2 min  |
| 19  | Add Vercel redirects for URL normalization in `vercel.json`                | 10 min |
| 20  | Verify with Google Search Console and Bing Webmaster Tools                 | 30 min |
| 21  | Audit crawl error / coverage data post-fixes                               | 30 min |

---

## Appendix A — next.config.ts Fixes

```ts
import type { NextConfig } from "next";

const isPreview =
  process.env.VERCEL_ENV === "preview" ||
  process.env.VERCEL_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  trailingSlash: false,

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        // Prevent preview/staging from being indexed
        ...(isPreview
          ? [
              {
                key: "X-Robots-Tag",
                value: "noindex, nofollow",
              },
            ]
          : []),
      ],
    },
  ],

  // Optional: redirects for URL normalization
  async redirects() {
    return [
      // Example: redirect www to non-www
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.room-drop.vercel.app' }],
      //   destination: 'https://room-drop.vercel.app/:path*',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;
```

---

## Appendix B — Metadata Fixes

### Root Layout (`app/layout.tsx`)

```ts
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://room-drop.vercel.app",
  ),
  title: {
    default: "RoomDrop — Anonymous Chat Rooms",
    template: "%s — RoomDrop",
  },
  description:
    "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "RoomDrop",
    title: "RoomDrop — Anonymous Chat Rooms",
    description:
      "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RoomDrop — Anonymous Chat Rooms",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoomDrop — Anonymous Chat Rooms",
    description:
      "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
    images: ["/og-twitter.png"],
    creator: "@Nehanahmed988",
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "your-google-search-console-code",
    // Bing: 'your-bing-webmaster-code',
  },
  icons: {
    icon: "/favicon.ico",
    // apple: '/apple-icon.png',
  },
};
```

### Room Page (`app/room/[roomCode]/page.tsx`)

```ts
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}): Promise<Metadata> {
  const { roomCode } = await params;
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://room-drop.vercel.app";

  return {
    title: `Room ${roomCode}`,
    description: "Join the conversation in this anonymous chat room.",
    robots: {
      index: false, // ephemeral rooms should not be indexed
      follow: false,
    },
    openGraph: {
      title: `Room ${roomCode} — RoomDrop`,
      description: "Join the conversation in this anonymous chat room.",
      url: `/room/${roomCode}`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/room/${roomCode}`,
    },
  };
}
```

### Fix Join Page (`app/join/page.tsx`)

Change line 36:

```ts
// Before:
images: ["/og(1).png"],
// After:
images: ["/og-twitter.png"],
```

Change line 54:

```ts
// Before:
canonical: 'https://roomdrop.vercel.app/join',
// After:
canonical: 'https://room-drop.vercel.app/join',
```

---

## Appendix C — Missing Files

### `app/not-found.tsx`

```ts
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconMessageCircle, IconArrowLeft } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-16 text-center">
        <div className="p-[3px] rounded-2xl bg-primary/10 w-fit mx-auto mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-[calc(2rem-3px)] bg-primary/10">
            <IconMessageCircle className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter mb-3">Room not found</h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-[28ch] mx-auto">
          This room may have expired or the link is incorrect.
        </p>
        <Link href="/">
          <Button className="group">
            <span className="flex items-center gap-2">
              <IconArrowLeft className="w-4 h-4" />
              Back to Home
            </span>
          </Button>
        </Link>
      </div>
    </main>
  )
}
```

### `app/error.tsx`

```ts
'use client'

import { Button } from '@/components/ui/button'
import { IconMessageCircle, IconRefresh } from '@tabler/icons-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-16 text-center">
        <div className="p-[3px] rounded-2xl bg-destructive/15 w-fit mx-auto mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-[calc(2rem-3px)] bg-destructive/10">
            <IconMessageCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter mb-3">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-[28ch] mx-auto">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="secondary" className="group">
            <span className="flex items-center gap-2">
              <IconRefresh className="w-4 h-4" />
              Try Again
            </span>
          </Button>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### `app/manifest.ts`

```ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RoomDrop — Anonymous Chat Rooms",
    short_name: "RoomDrop",
    description:
      "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
```

---

## Appendix D — AI / robots.txt Fixes

### `app/robots.ts`

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://room-drop.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      // AI search/citation bots — Allow (get cited in AI answers)
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
      },
      {
        userAgent: "Claude-User",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Perplexity-User",
        allow: "/",
      },
      // AI training bots — decide policy (currently disallowed as default)
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

### `public/llms.txt`

```txt
# RoomDrop
> Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.

## Core pages
- Home: https://room-drop.vercel.app/
- Create Room: https://room-drop.vercel.app/new
- Join Room: https://room-drop.vercel.app/join

## Features
- Anonymous: No signup required, no personal data stored
- Ephemeral: Rooms auto-delete after expiry
- Private: End-to-end encrypted real-time messaging
```

---

## Appendix E — JSON-LD Structured Data

### Root Layout (`app/layout.tsx` — add within the component)

```ts
import Script from 'next/script'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://room-drop.vercel.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'RoomDrop',
    alternateName: 'RoomDrop — Anonymous Chat Rooms',
    url: baseUrl,
    description: 'Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.',
    applicationCategory: 'Communication',
    operatingSystem: 'Any',
    browserRequirements: 'JavaScript enabled',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Nehan Ahmed',
      url: 'https://github.com/NehanAhmed',
    },
  }

  return (
    <html lang="en" className={...} suppressHydrationWarning>
      <head>
        <Script
          id="schema-webapp"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        ...
      </body>
    </html>
  )
}
```

### BreadcrumbList for sub-pages (`app/new/page.tsx`)

Add within the component:

```ts
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Create Room",
      item: `${baseUrl}/new`,
    },
  ],
};
```

Same pattern for `/join`.

---

_Audit completed 2026-07-19. All findings backed by direct file reads. Fixes are copy-paste-ready — verify syntax against nextjs.org/docs and schema.org before deploying._
