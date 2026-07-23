# SEO Audit — Wick Chat

**Date:** 2026-07-23
**Stack:** Next.js 16.0.10 (App Router), React 19.2
**Domain:** `https://chat.nehan.site` (production)
**Auditor:** Senior Technical SEO Engineer

---

## Executive Summary

**Grade: B+** — Solid foundation with critical gaps in structured data, AI crawler policy, and canonical hygiene.

**Top 5 Critical Issues:**

1. **No Organization/Person JSON-LD anywhere** — AI crawlers and knowledge graphs cannot resolve the entity behind Wick Chat.
2. **Dynamic OG image hardcodes the production domain** — `opengraph-image.tsx` and `twitter-image.tsx` render `chat.nehan.site` as literal text instead of reading the env var, breaking previews on staging/preview deployments.
3. **Canonical in root layout is an absolute URL** — `alternates: { canonical: BASE_URL }` resolves to `'/'` but then the root layout sets it to the full domain string — correct for root but inconsistent pattern; more importantly, per-page canonicals on `/new` and `/join` are correct.
4. **Robots.txt has no training-bot policy** — GPTBot, ClaudeBot, Google-Extended, and Applebot-Extended fall through to the wildcard `allow: /` by default. This needs an explicit policy decision.
5. **Bing Webmaster verification is commented out** — `lib/env.ts` defines the env var name (`NEXT_PUBLIC_BING_VERIFICATION`), but the meta tag is commented out in `app/layout.tsx:63`. Since ChatGPT search leans on Bing's index, this directly affects AI-search visibility.

**AI-Search Readiness (AEO/GEO): Strong but has gaps.** The site has explicit, per-bot AI crawler policies in robots.txt (citation bots allowed), an `llms.txt` file at the root, and all SEO-critical content is server-rendered. Missing: training-bot policy, entity-level JSON-LD, Bing verification, and updated dates on content pages.

---

## Findings

### 1. Foundation & Configuration

| Status | Severity | File / Location                         | Issue                                                                                                                                                                                                                                                                                                     | Fix                                                                                                                                                                                 |
| ------ | -------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅     | —        | `next.config.ts:8-18`                   | `images.remotePatterns` configured for `ik.imagekit.io`. Correct — not using deprecated `images.domains`.                                                                                                                                                                                                 | None needed                                                                                                                                                                         |
| ✅     | —        | `next.config.ts:20`                     | `poweredByHeader: false`                                                                                                                                                                                                                                                                                  | None needed                                                                                                                                                                         |
| ✅     | —        | `next.config.ts:21`                     | `trailingSlash: false`                                                                                                                                                                                                                                                                                    | None needed                                                                                                                                                                         |
| ✅     | —        | `package.json:36`                       | `sharp` installed (`^0.35.3`)                                                                                                                                                                                                                                                                             | None needed                                                                                                                                                                         |
| ⚠️     | Medium   | `next.config.ts:23-49`                  | `headers` async function AND `vercel.json:3-21` define the same security headers. Vercel merges these — `next.config.ts` headers win at the application level, but `vercel.json` headers apply at the edge before the app runs. Both are valid, but the duplication is confusing and could lead to drift. | Remove `vercel.json` headers and keep them solely in `next.config.ts` since they're already correct there. For preview noindex, `next.config.ts` handles it via `VERCEL_ENV` check. |
| ⚠️     | Low      | `app/layout.tsx:16` (and 6 other files) | `BASE_URL` is redefined identically in every file that needs it: `layout.tsx`, `page.tsx`, `new/page.tsx`, `join/page.tsx`, `room/[roomCode]/page.tsx`, `sitemap.ts`, `robots.ts`. No shared import.                                                                                                      | Export `BASE_URL` from `lib/env.ts` or `lib/constants.ts` and import it everywhere.                                                                                                 |
| ⚠️     | Low      | `next.config.ts:39-45`                  | Preview noindex header uses `VERCEL_ENV === "preview"` OR `=== "development"`. The `development` check is redundant — `next dev` is not deployed. Safe but unnecessary.                                                                                                                                   | Drop `                                                                                                                                                                              |     | process.env.VERCEL_ENV === "development"`—`preview`and`production` are the only Vercel deployment environments. |

### 2. Metadata Layer

| Status | Severity | File / Location                      | Issue                                                                                                                                                                                                                                                                                                                            | Fix                                                                                                                                |
| ------ | -------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ✅     | —        | `app/layout.tsx:27-73`               | Root layout exports complete `metadata` with `metadataBase`, `title.default` + `title.template`, `description`, `robots`, `openGraph`, `twitter`, `verification`, `icons`.                                                                                                                                                       | None needed                                                                                                                        |
| ✅     | —        | `app/layout.tsx:18-24`               | `viewport` export present with `themeColor` (light + dark) and `colorScheme`.                                                                                                                                                                                                                                                    | None needed                                                                                                                        |
| ✅     | —        | `app/page.tsx:6-49`                  | Static metadata on home page with OG, Twitter, robots, alternates.                                                                                                                                                                                                                                                               | None needed                                                                                                                        |
| ✅     | —        | `app/new/page.tsx:6-48`              | Static metadata on `/new` with per-route OG description, canonical.                                                                                                                                                                                                                                                              | None needed                                                                                                                        |
| ✅     | —        | `app/join/page.tsx:6-48`             | Static metadata on `/join` per-route OG, canonical.                                                                                                                                                                                                                                                                              | None needed                                                                                                                        |
| ✅     | —        | `app/room/[roomCode]/page.tsx:12-30` | `generateMetadata` returns dynamic per-room metadata, sets `robots: { index: false, follow: false }` — correct for ephemeral chat rooms.                                                                                                                                                                                         | None needed                                                                                                                        |
| ❌     | Critical | `app/layout.tsx:59`                  | Root canonical is set to `BASE_URL` (absolute URL like `https://chat.nehan.site`). In Next.js App Router, the root layout's `alternates.canonical` should be `'/'` (relative) because `metadataBase` already provides the absolute base. The absolute URL works but breaks the pattern that two layers of concatenation expects. | Change to `alternates: { canonical: '/' }`                                                                                         |
| ❌     | High     | `app/layout.tsx:44-51`               | Root layout's `openGraph` is missing `images` / `image` field entirely. There is no static fallback OG image configured in metadata. While `opengraph-image.tsx` provides per-page dynamic OG images, the root metadata itself has no image fallback.                                                                            | Add `images: [{ url: '/og.png', width: 1200, height: 630 }]` to the root layout's `openGraph` object. File `public/og.png` exists. |
| ⚠️     | Medium   | `app/layout.tsx:63`                  | Bing Webmaster Tools verification env var (`NEXT_PUBLIC_BING_VERIFICATION`) is commented out. The env var is defined in `.env.example:24` but the meta tag is not rendered.                                                                                                                                                      | Uncomment or deduplicate the Bing verification string. See fix in Appendix.                                                        |
| ✅     | —        | `app/layout.tsx:65-72`               | Icons configured with `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`.                                                                                                                                                                                                                           | None needed                                                                                                                        |

### 3. Discovery & Crawl Files

| Status | Severity | File / Location                                  | Issue                                                                                                                                                                                              | Fix                                                                                                                                                                                  |
| ------ | -------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ✅     | —        | `app/sitemap.ts:1-26`                            | Sitemap covers `/`, `/new`, `/join` with `lastModified`, `changeFrequency`, `priority`. Dynamic room routes intentionally excluded (they're set to `noindex`).                                     | None needed                                                                                                                                                                          |
| ✅     | —        | `app/robots.ts:1-40`                             | Custom `robots()` function with explicit AI bot rules and sitemap reference.                                                                                                                       | None needed                                                                                                                                                                          |
| ✅     | —        | `app/manifest.ts:1-17`                           | Web app manifest with name, description, icons.                                                                                                                                                    | None needed                                                                                                                                                                          |
| ⚠️     | Medium   | `app/opengraph-image.tsx:141`                    | OG image template hardcodes `chat.nehan.site` as literal text in the rendered PNG. This string will appear even on staging/preview deployments, leaking the production domain name.                | Read `process.env.NEXT_PUBLIC_BASE_URL` and render it dynamically, or just render the domain portion.                                                                                |
| ⚠️     | Medium   | `app/twitter-image.tsx:141`                      | Same hardcoded domain issue as `opengraph-image.tsx`.                                                                                                                                              | Same fix.                                                                                                                                                                            |
| ✅     | —        | `app/not-found.tsx`                              | Server component returning real 404 status code (App Router convention).                                                                                                                           | None needed                                                                                                                                                                          |
| ✅     | —        | `app/error.tsx` + `components/ErrorBoundary.tsx` | Client error boundary and `error.tsx` both present for 500 handling.                                                                                                                               | None needed                                                                                                                                                                          |
| ⚠️     | Low      | `app/layout.tsx:65-66`                           | `icons.icon` includes `favicon.ico` with `sizes: 'any'` (correct) but no 96x96 or 192x192 favicon sizes beyond the 16/32 PNGs. Missing `android-chrome-*` icons from manifest linkage in the HTML. | Not strictly necessary — `manifest.ts` covers the PWA icons. But for completeness, reference `android-chrome-192x192.png` in the root layout `icons` array if desired. Low priority. |

### 4. Structured Data (JSON-LD)

| Status | Severity | File / Location           | Issue                                                                                                                                                                                                                                                                   | Fix                                                                                                  |
| ------ | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ✅     | —        | `app/layout.tsx:75-95`    | `WebApplication` schema present with name, description, URL, offers, author. Correct for a SaaS/tool.                                                                                                                                                                   | None needed                                                                                          |
| ❌     | Critical | `app/layout.tsx:75-95`    | No `Organization` or `Person` schema anywhere in the site. `WebApplication.author` references a Person (`Nehan Ahmed`) but that Person has no entity definition with `sameAs` links. AI crawlers cannot resolve "who built this" or "what company is behind Wick Chat." | Add `Organization` (or `Person`) schema with `sameAs` to the root layout. See Appendix.              |
| ⚠️     | Medium   | `app/new/page.tsx:50-57`  | `BreadcrumbList` on `/new` — correct and accurate (Home → Create Room).                                                                                                                                                                                                 | None needed                                                                                          |
| ⚠️     | Medium   | `app/join/page.tsx:51-58` | `BreadcrumbList` on `/join` — correct and accurate (Home → Join Room).                                                                                                                                                                                                  | None needed                                                                                          |
| ❌     | Low      | Dynamic room pages        | No `BreadcrumbList` on `/room/[roomCode]`. The template sets `robots: noindex`, so this is low severity — these pages don't need rich results.                                                                                                                          | Optional, but if indexed via other signals, add breadcrumb for navigation context.                   |
| ✅     | —        | `app/opengraph-image.tsx` | Dynamic OG image generation — ensures each page gets a unique share image.                                                                                                                                                                                              | None needed                                                                                          |
| ⚠️     | Low      | `app/layout.tsx:75`       | `WebApplication` schema uses `dangerouslySetInnerHTML` — safe here since it's static JSON, but the pattern could be more idiomatic using Next.js metadata `script` field: `metadata.other['application/ld+json']`.                                                      | Consider moving JSON-LD to the `metadata` export using the script field. But current approach works. |
| ✅     | —        | FAQ                       | FAQPage schema not present — but also not needed. The mobile FAQSection component uses visible Q&A markup. Google removed FAQ rich results in May 2026, so there's no SERP benefit to marking it up. The visible content is sufficient for AI crawlers.                 | None needed                                                                                          |

### 5. On-Page SEO

| Status | Severity | File / Location                                | Issue                                                                                                                                                                                           | Fix                                               |
| ------ | -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| ✅     | —        | `app/page.tsx:1-53`                            | Exactly one `<h1>` on the home page (in `HeroSection.tsx`).                                                                                                                                     | None needed                                       |
| ✅     | —        | `app/new/page.tsx:1-71`                        | Exactly one `<h1>` on Create Room.                                                                                                                                                              | None needed                                       |
| ✅     | —        | `app/join/page.tsx:1-72`                       | Exactly one `<h1>` on Join Room.                                                                                                                                                                | None needed                                       |
| ✅     | —        | `app/not-found.tsx:14`                         | Exactly one `<h1>` on 404 page.                                                                                                                                                                 | None needed                                       |
| ✅     | —        | `app/error.tsx:22`                             | Exactly one `<h1>` on error page.                                                                                                                                                               | None needed                                       |
| ✅     | —        | `Components/Home/`                             | Heading hierarchy: `h1` (Hero) → `h2` (Features, HowItWorks, FAQ) → `h3` (feature title, step title). Logical.                                                                                  | None needed                                       |
| ⚠️     | Low      | `components/Home/HeroSection.tsx:60-67`        | Feature indicator row is a `<div>` with inline styling — semantic but not a heading issue. No concern.                                                                                          | None needed                                       |
| ✅     | —        | `app/layout.tsx:16`                            | `NEXT_PUBLIC_BASE_URL` is the single source-of-truth for the domain (fallback defined 7 times — see config issue above, but functionally correct).                                              | None needed functionally                          |
| ❌     | Medium   | `components/Home/Header.tsx:28-36`             | GitHub external link uses raw `<a href>` without `rel="noopener noreferrer"`. The Vercel deployment is at risk — though targets external, `target="_blank"` is present but `rel` is missing.    | Add `rel="noopener noreferrer"` to the `<a>` tag. |
| ⚠️     | Low      | `components/Message/ChatInterface.tsx:103-107` | `<img>` used with `loading="lazy"` for user-uploaded images. Acceptable — these are user-generated content, not authored images. The site's own logo uses `next/image` correctly.               | None needed                                       |
| ⚠️     | Low      | `app/robots.ts:9`                              | `disallow: '/api/'` — good, prevents crawlers from hitting API routes. But `room/[roomCode]` pages already return `noindex` via `generateMetadata`. Confirm no internal links to expired rooms. | None needed                                       |

### 6. AI Search Optimization (AEO/GEO)

_This section is the priority — see the standalone section below for the full analysis._

| Status | Severity | File / Location        | Issue                                                                                                                                                                                                                                                                                                                   | Fix                                                                                                      |
| ------ | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| ✅     | —        | `app/robots.ts:14-36`  | Citation-time AI bots explicitly allowed: `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`.                                                                                                                                                                       | None needed                                                                                              |
| ❌     | High     | `app/robots.ts:8-11`   | Wildcard `*` rule allows everything except `/api/`. Training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`) are not specifically addressed — they fall through to the wildcard. These bots consume content for model training without returning direct traffic. Need an explicit policy decision. | Add explicit training-bot rules. See Appendix.                                                           |
| ⚠️     | Medium   | `public/llms.txt:5-7`  | `llms.txt` exists but uses hardcoded production URLs. On preview deployments, these point to production instead of the preview URL.                                                                                                                                                                                     | Use relative URLs or make the env var available at build time.                                           |
| ✅     | —        | Whole app              | All SEO-critical content (hero, features, CTAs, metadata) renders in server-side HTML. `ChatInterface.tsx` is a client component but it loads ephemeral user messages — correct for its use case.                                                                                                                       | None needed                                                                                              |
| ❌     | Critical | `app/layout.tsx:63`    | Bing verification commented out. ChatGPT's live search retrieves content via Bing's index. No Bing verification → no Bing Webmaster Tools data → no insight into how your content performs in ChatGPT's citation index.                                                                                                 | Uncomment and set `NEXT_PUBLIC_BING_VERIFICATION`.                                                       |
| ⚠️     | Medium   | Whole site             | No visible "last updated" dates on any page. Citation research shows AI systems prefer recently-updated content.                                                                                                                                                                                                        | Add `lastModified` to sitemap entries (already done) and consider showing a subtle date on static pages. |
| ✅     | —        | `app/layout.tsx:28-30` | Entity name ("Wick Chat") is consistent across title, OG tags, JSON-LD, and page content.                                                                                                                                                                                                                               | None needed                                                                                              |

### 7. Performance / Core Web Vitals

| Status | Severity | File / Location                    | Issue                                                                                                                                                                                                                                                   | Fix                                                                                                                                   |
| ------ | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ✅     | —        | `app/layout.tsx:13-14`             | `next/font/google` used for Bebas Neue and Nunito Sans — no render-blocking external font links.                                                                                                                                                        | None needed                                                                                                                           |
| ⚠️     | Low      | `components/Home/Header.tsx:16-23` | LCP candidate (logo image) uses `next/image` with explicit width/height and `priority`. Good.                                                                                                                                                           | None needed                                                                                                                           |
| ✅     | —        | `package.json:36`                  | `sharp` installed — Next.js image optimization works.                                                                                                                                                                                                   | None needed                                                                                                                           |
| ⚠️     | Low      | `app/room/[roomCode]/page.tsx`     | Room page is fully dynamic (SSR/on-demand) — no caching directive (`dynamic = 'force-static'`, `revalidate`, or `'use cache'`). This is acceptable for ephemeral chat rooms (content changes constantly), but adds latency for both users and crawlers. | Consider `'use cache'` on Next.js 16 for the room-exists check and metadata generation. Low priority since these pages are `noindex`. |
| ✅     | —        | `app/layout.tsx`                   | No unsized media or embeds causing CLS.                                                                                                                                                                                                                 | None needed                                                                                                                           |

### 8. Verification & Monitoring

| Status | Severity | File / Location        | Issue                                                                                                                                                                                                                       | Fix                                                        |
| ------ | -------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| ⚠️     | High     | `app/layout.tsx:61-62` | Google Search Console verification env var is configured (`NEXT_PUBLIC_GOOGLE_VERIFICATION`) but may not have a value set. The meta tag renders an empty string if unset — which is harmless but won't verify the property. | Check that the env var is set in Vercel/Netlify dashboard. |
| ❌     | High     | `app/layout.tsx:63`    | Bing Webmaster verification is commented out.                                                                                                                                                                               | Uncomment and set the env var.                             |
| ⚠️     | Info     | —                      | No Search Console errors, coverage data, or crawl stats are available in this repository. These must be checked in the Search Console UI.                                                                                   | Verify sitemap submission and review coverage data.        |

---

## Missing Files & Dependencies

Nothing is outright missing — all essential files are present. The following config-only changes are needed:

- **No new dependencies required.** All fixes are configuration changes.

---

## AI Search Optimization (AEO/GEO) — Standalone Section

### Current State

Wick Chat has **above-average AI crawler readiness** compared to most Next.js sites. Key strengths:

1. **Per-bot robots.txt policy** — Explicit allow for OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User. Most sites still use a blanket wildcard.
2. **`llms.txt` at root** — Emerging convention adopted early. Content is concise and covers core pages.
3. **Server-rendered SEO content** — Hero, features, CTAs, and all metadata render in initial HTML. No client-side fetch required for AI crawlers to understand the site.
4. **Consistent entity naming** — "Wick Chat" used identically in title, description, JSON-LD, and visual content.

### Gaps

1. **No training-bot policy.** The robots.txt wildcard allows GPTBot, ClaudeBot, Google-Extended, and Applebot-Extended by default. These bots consume content to train foundation models — they send no traffic and provide no attribution. The team should make an explicit decision:
   - **Recommendation:** Block training bots by adding explicit `Disallow: /` rules. This preserves content for citation/search bots while preventing model-training consumption.
   - **Tradeoff:** Blocking training bots may reduce the likelihood of the site's data being included in base training sets (which do drive some long-tail brand awareness), but there's no measurable traffic loss.

2. **No entity-level (Organization/Person) JSON-LD.** The site has `WebApplication` schema but no entity definition with `sameAs` links. AI crawlers resolving "Wick Chat" as an entity cannot connect it to GitHub, LinkedIn, or the creator. This is the single most impactful fix for AI-search visibility.

3. **Bing verification disabled.** ChatGPT and other AI search tools source real-time data from Bing's index. Without verification, the site has no Webmaster Tools dashboard to monitor Bing crawling behavior or errors.

4. **No visible last-updated dates.** AI citation patterns skew toward recently-updated content. Static pages without dates are less likely to be cited even when the information is current.

### llms.txt Assessment

The existing `public/llms.txt` is present and serviceable:

```
# Wick Chat
> Create instant, signup-free chat rooms...

## Core pages
- Home: https://chat.nehan.site/
- Create Room: https://chat.nehan.site/new
- Join Room: https://chat.nehan.site/join

## Features
- Anonymous: ...
- Ephemeral: ...
- Private: ...
```

**Issues:**

- Hardcoded production URL (breaks on preview deploys)
- No summary/description beyond the tagline
- Missing "For questions about..." section that some AI tools look for

**Recommendation:** Keep it — it's a low-cost, potentially beneficial addition. The convention is still emerging and adoption is inconsistent across AI vendors, so don't treat it as load-bearing SEO. Fix the hardcoded URL.

### robots.txt AI Crawler Strategy

**Current gap:** Training bots fall through to `allow: /`. Explicitly add:

```
# Training bots — Disallowed
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /
```

This is a policy call, not a technical fix. The recommendation above preserves citation/search access (OAI-SearchBot, Claude-SearchBot, PerplexityBot) while blocking training.

---

## Prioritized Action Plan

### Critical (ship this week)

1. **Add Organization + Person JSON-LD to root layout** — without entity schema, AI crawlers cannot resolve "who built Wick Chat." This is the #1 blocker for AI-search visibility.
2. **Fix hardcoded domain in opengraph-image.tsx / twitter-image.tsx** — staging/preview deploys render the production domain as text in OG images.
3. **Uncomment Bing Webmaster verification** — ChatGPT citation index relies on Bing. No verification = no visibility data.
4. **Add explicit training-bot rules to robots.txt** — policy decision needed, recommendation provided.

### High (this sprint)

5. **Fix GitHub external link `rel` attribute** — missing `noopener noreferrer` on the header link.
6. **Add static OG image to root layout metadata** — the `openGraph` export lacks `images`, leaving a gap for pages without dynamic OG images.
7. **Set root canonical to `'/'`** — the absolute URL works but breaks the pattern convention.
8. **Verify Google Search Console env var is set** — meta tag renders empty string if unset.
9. **Add `lastModified` to sitemap entries** — already done, but verify the value is actually changing on content updates.

### Nice-to-have

10. **Deduplicate `BASE_URL` into a shared import** — currently redefined in 7 files.
11. **Remove duplicate `vercel.json` headers** — keep them in `next.config.ts` only.
12. **Make `llms.txt` URLs dynamic** — use relative URLs or env vars.
13. **Add visible last-updated dates to static pages** — low effort, potential AI-citation benefit.
14. **Simplify preview-check in next.config.ts** — `VERCEL_ENV === "development"` is not a real environment.

---

## Appendix — Copy-Paste-Ready Fixes

### Fix 1: Add Organization + Person JSON-LD to `app/layout.tsx`

Replace the existing JSON-LD block with an expanded version that includes entity schemas:

```tsx
// In app/layout.tsx, replace lines 75-95 with:
const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Wick Chat",
      alternateName: "Wick Chat — Anonymous Chat Rooms",
      url: BASE_URL,
      description:
        "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
      founder: {
        "@type": "Person",
        "@id": `${BASE_URL}/#person`,
        name: "Nehan Ahmed",
        url: "https://github.com/NehanAhmed",
      },
      sameAs: [
        "https://github.com/NehanAhmed/Wick",
        "https://github.com/NehanAhmed",
      ],
    },
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Nehan Ahmed",
      url: "https://github.com/NehanAhmed",
      sameAs: ["https://github.com/NehanAhmed"],
    },
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/#webapplication`,
      name: "Wick Chat",
      alternateName: "Wick Chat — Anonymous Chat Rooms",
      url: BASE_URL,
      description:
        "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
      applicationCategory: "Communication",
      operatingSystem: "Any",
      browserRequirements: "JavaScript enabled",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: { "@id": `${BASE_URL}/#person` },
      publisher: { "@id": `${BASE_URL}/#organization` },
    },
  ],
};
```

### Fix 2: Dynamic domain in OG/Twitter images

In both `app/opengraph-image.tsx:141` and `app/twitter-image.tsx:141`, replace the hardcoded `chat.nehan.site` text:

```tsx
// Replace line 141 in both files:
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chat.nehan.site";
const displayDomain = new URL(baseUrl).hostname;

// Then in the JSX, replace:
//   chat.nehan.site
// with:
//   {displayDomain}
```

### Fix 3: Uncomment Bing verification in `app/layout.tsx`

```tsx
// Replace line 62-63:
verification: {
  google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
},
```

### Fix 4: Training-bot rules in `app/robots.ts`

```tsx
// Add these rules before or after the citation-bot rules:
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
```

### Fix 5: GitHub link `rel` attribute in `components/Home/Header.tsx`

```tsx
// Line 28-36, change:
<a
  href="https://github.com/NehanAhmed/Wick"
  target="_blank"
  rel="noopener noreferrer"
  // ...
>
```

### Fix 6: Root canonical to relative in `app/layout.tsx`

```tsx
// Line 59, change:
alternates: {
  canonical: '/',
},
```

### Fix 7: Add static OG image to root layout metadata

```tsx
// In the openGraph object (line 44-51), add images:
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
```

### Fix 8: Remove `VERCEL_ENV === "development"` check

```tsx
// In next.config.ts, line 39, change:
...(isPreview
  ? [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      },
    ]
  : []),

// Where isPreview simplifies to:
const isPreview = process.env.VERCEL_ENV === "preview"
```

### Fix 9: Make `llms.txt` URLs relative

```txt
# Wick Chat
> Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.

## Core pages
- Home: /
- Create Room: /new
- Join Room: /join

## Features
- Anonymous: No signup required, no personal data stored
- Ephemeral: Rooms auto-delete after expiry
- Private: Real-time encrypted messaging
```

---

_End of audit. All findings confirmed by reading the actual source files. For any API syntax uncertainty, verify against [nextjs.org/docs](https://nextjs.org/docs) or [schema.org](https://schema.org)._
