# RoomDrop — Agent Guide

## Quick start

```bash
pnpm dev        # local dev at http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint (Next.js core-web-vitals + typescript configs)
pnpm test       # vitest run
pnpm start      # production serve
```

Uses `pnpm` (lockfile: `pnpm-lock.yaml`). Typecheck via `tsc --noEmit -p tsconfig.json`. DB push via `npx drizzle-kit push`.

## Tech & quirks

- **Next.js 16** App Router. Path alias: `@/*` → root.
- **Tailwind v4** via `@tailwindcss/postcss` + **shadcn/ui** (style `base-mira`, icon library `tabler`).
- **Fonts**: Space Grotesk (sans, var `--font-sans`), Geist Mono (mono, var `--font-geist-mono`). Loaded from `next/font/google`.
- **Theme**: `next-themes`, default `dark`, `enableSystem={false}`. Toggle via `Tabs` (light/dark/system).
- **DB**: Neon (serverless Postgres) + Drizzle ORM. Schema at `lib/db/schema.ts`. Migrations in `migrations/`. Push schema: `npx drizzle-kit push`.
- **Cache**: Upstash Redis via `@upstash/redis` (reads `.env` for `UPSTASH_REDIS_REST_URL` / `TOKEN`).
- **Real-time**: Pusher (`pusher` server + `pusher-js` client). Channel: `chat-${roomCode}`, event: `incoming-message`.
- **Rate limiting**: `@upstash/ratelimit` — 10 room creates/h, 30 joins/h, 30 messages/min per IP. Wired into all POST routes.
- **Env validation**: `lib/env.ts` throws at startup if any required var is missing. Optional vars: `NEXT_PUBLIC_GOOGLE_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION` (for Search Console / Bing Webmaster Tools metadata).
- **Animations**: `motion/react` (formerly framer-motion). Local skills at `.agents/skills/motion/`, `.agents/skills/frontend-design/`.
- **DB client**: loads `.env` (not `.env.local`) via `dotenv` in `lib/db/index.ts`. `Drizzle` neon-http driver.

## Architecture

- **Signup-less chat**: Create room → get `XXX-XXX` code → share → others join by code or QR.
- **Session**: Stored in `localStorage` as `chat_room_session` (userName, roomCode, joinedAt, expiresAt). Checked on every page.
- **Data flow**: Redis (fast, TTL-bound) → DB (persistence fallback). `RoomService.ts` is the business logic layer.
- **Messages**: Optimistic insert with client-generated IDs (`${userName}-${Date.now()}-${crypto.randomUUID().slice(0,8)}`). Server responds with real message, replaces via dedup by ID.
- **Expiry**: Rooms auto-delete from DB (cascade deletes participants + messages). Cron endpoint at `/api/cron/cleanup` (Vercel Cron ready).
- **Error handling**: `ErrorBoundary` wraps root layout. `checkBodySize()` guard on all POST routes (10KB/10KB/100KB).
- **CI/CD**: GitHub Actions runs lint → build → test on push/PR. Husky pre-commit hook runs lint-staged.`.lintstagedrc.json` runs `eslint --fix` then `tsc --noEmit -p tsconfig.json` on staged ts/tsx files.
- **SEO**: Full metadata layer (viewport, OG, Twitter, robots, canonical, verification). JSON-LD structured data (WebApplication + BreadcrumbList). AI-crawler-specific robots.txt. PWA manifest. Custom 404/500 pages. `llms.txt` for AI crawler guidance. `sharp` installed for image optimization.

## Pages & routes

| Path               | Component                 | Notes                                                          |
| ------------------ | ------------------------- | -------------------------------------------------------------- |
| `/`                | `Home/HomeModal.tsx`      | Shows active session if exists                                 |
| `/new`             | `CreateRoomComponent.tsx` | POST to `/api/create`                                          |
| `/join`            | `JoinPageComponent.tsx`   | Supports `?by=qrcode&code=XXX`                                 |
| `/room/[roomCode]` | `ChatInterface.tsx`       | Server checks room exists, client reads user from localStorage |

| API                        | Method | Body                                    | Rate limit       |
| -------------------------- | ------ | --------------------------------------- | ---------------- |
| `/api/create`              | POST   | `{ name, duration, participantsCount }` | 10/h per IP      |
| `/api/join`                | POST   | `{ code, name }`                        | 30/h per IP      |
| `/api/messages/[roomCode]` | GET    | —                                       | None             |
| `/api/messages/send`       | POST   | `{ roomCode, userName, message }`       | 30/min per IP    |
| `/api/cron/cleanup`        | GET    | —                                       | CRON_SECRET auth |

## DB schema (3 tables)

`rooms` (code PK, creator, duration, participantsCount, expiresAt, isActive) → `participants` (roomCode FK, userName, isOnline) → `messages` (roomCode FK, userName, message, timestamp). All FK cascade on delete. Room code format: `XXX-XXX` (6 alphanum chars from crypto.getRandomValues).

## Style conventions

- `'use client'` on all interactive components. Server components for data-fetching pages.
- `cn()` utility (`clsx` + `tailwind-merge`) from `@/lib/utils`.
- Icons from `@tabler/icons-react`.
- shadcn/ui components in `components/ui/`.
- Toast via `sonner` (configured top-right, richColors, 3s in layout).
- **Vitest** for tests, no other test framework installed.

## Code Writing

- When you have to write code you have to think like a high level engineer and developer. Think like Linus Torvalds and Andrej Karpathy. Think the best approach to a problem. Find the best and easiest code implementation of that problem. Do not break anything and do no break anything and do not touch anything out of the scope in the instructions.
- Write a high level professional code and think like a high level dev. Write production ready code. Do no leave anything at boilerplate and follow modern design principles and modern code solution. Do not write code that breaks current code functionality.

## Code Planning

When planning you have to follow the high level approach. Think like Linus Torvalds and Andrej Karpathy and find the best solution to the problem. Find its setback and check if it would cause any problem. follow the architecture of the application always.
