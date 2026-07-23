# Wick Chat — Agent Guide

## Commands

```bash
pnpm dev          # local dev at http://localhost:3000
pnpm build        # production build (CI runs lint → build → test)
pnpm lint         # ESLint 9 (next/core-web-vitals + typescript configs)
pnpm test         # vitest run
pnpm test:watch   # vitest (watch mode)
pnpm start        # production serve
```

Typecheck: `tsc --noEmit -p tsconfig.json`. DB push: `npx drizzle-kit push`. Uses `pnpm` (lockfile: `pnpm-lock.yaml`).

**Pre-commit** (husky): runs `pnpm lint-staged` → `eslint --fix` on `*.{ts,tsx}` + `prettier --write` on `*.{json,md}`.

## Architecture

- **Next.js 16** App Router. Path alias `@/*` → root.
- **Tailwind v4** via `@tailwindcss/postcss` + **shadcn/ui** (`base-nova` style, `tabler` icon library).
- **Fonts**: DM Sans (`--font-sans`), Noto Serif (`--font-heading`), Geist Mono (`--font-geist-mono`). All from `next/font/google`.
- **Theme**: `next-themes` (dark default, `enableSystem={false}`). Toggle via `Tabs` (light/dark/system). Room-specific **theme variants** (`ocean`, `rose`, `neon`, `sunset`, `forest`) stored in `localStorage` key `wickchat-theme` — applied as `.theme-{id}` class on `<html>`.
- **DB**: Neon (serverless Postgres) + Drizzle ORM (`neon-http` driver). Schema: `lib/db/schema.ts`. Migrations: `migrations/`.
  - Config loads `.env` (not `.env.local`) via `dotenv` at `lib/db/index.ts:6`.
  - All routes in `lib/RoomService.ts` use **Redis-first, DB-fallback** pattern.
- **Redis**: Upstash via `@upstash/redis` (reads `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` from env).
- **Real-time**: Pusher. Channel: `chat-${roomCode}`, event: `incoming-message`.
- **Rate limiting**: `@upstash/ratelimit` — 10 room creates/h, 30 joins/h, 30 messages/min, 60 upload signs/min per IP.
- **Env validation**: `lib/env.ts` warns on startup if vars missing (does not throw).
- **Image upload**: ImageKit (client-side via `@imagekit/next`). Auth endpoint: `GET /api/upload/sign` (rate-limited). Files: ≤10MB, JPEG/PNG/GIF/WebP only.
- **Animations**: `motion/react` (formerly framer-motion). Custom CSS transitions: `ease-out-strong` (`cubic-bezier(0.32, 0.72, 0, 1)`), `ease-in-out-strong` (`cubic-bezier(0.77, 0, 0.175, 1)`). Also uses `tw-animate-css`.

## DB schema (3 tables)

`rooms` (id UUID PK, code `XXX-XXX` unique, creator, duration, participantsCount, messageCount, expiresAt, isActive) → `participants` (uuid PK, roomCode FK, userName, isOnline, lastSeenAt) → `messages` (uuid PK, roomCode FK, userName, message, imageUrl?, timestamp). All FK cascade on delete. Indices on code, expiresAt, roomCode, timestamp.

## Pages & API

| Path               | Component                 | Notes                                                            |
| ------------------ | ------------------------- | ---------------------------------------------------------------- |
| `/`                | `Home/HomeModal.tsx`      | Shows active session if exists                                   |
| `/new`             | `CreateRoomComponent.tsx` | POST to `/api/create` (duration: 1–1440 min, participants: 2–50) |
| `/join`            | `JoinPageComponent.tsx`   | Supports `?by=qrcode&code=XXX`                                   |
| `/room/[roomCode]` | `ChatInterface.tsx`       | Server checks room exists; client reads user from localStorage   |

| API                        | Method | Body                                         | Limit        |
| -------------------------- | ------ | -------------------------------------------- | ------------ |
| `/api/create`              | POST   | `{ name, duration, participantsCount }`      | 10/h         |
| `/api/join`                | POST   | `{ code, name }`                             | 30/h         |
| `/api/messages/[roomCode]` | GET    | — (returns last 100)                         | —            |
| `/api/messages/send`       | POST   | `{ roomCode, userName, message, imageUrl? }` | 30/min       |
| `/api/upload/sign`         | GET    | — (returns ImageKit auth token)              | 60/min       |
| `/api/cron/cleanup`        | GET    | — (optional CRON_SECRET auth)                | cron trigger |

All POST routes have `checkBodySize()` guard: 10KB create/join, 100KB send (returns 413). Rate limits return 429.

## Key conventions

- `'use client'` on all interactive components. Server components for data-fetching pages.
- `cn()` from `@/lib/utils` (`clsx` + `tailwind-merge`). Icons from `@tabler/icons-react`.
- shadcn/ui primitives in `components/ui/`. Toast via `sonner` (top-right, richColors, 3s).
- **Session**: `localStorage` key `chat_room_session` (`{ userName, roomCode, joinedAt }`). Fallback to `sessionStorage`.
- **Message flow (client)**: generate temp ID (`temp-${Date.now()}-${cryptoRandom}`, 12 chars). Optimistic insert. Server responds via Pusher; dedup by ID. Max 1000 chars per message.
- **Message flow (server)**: server ID `${Date.now()}-${Math.random().toString(36)....}`. Redis list key `messages:${roomCode}`, trim to 100.
- **Error handling**: `ErrorBoundary` class component wraps root layout.
- **Custom `ease-out-strong`** used extensively on interactive elements (`active:scale-[0.92]` pattern).
- **Test**: Vitest, jsdom env, single test file `lib/__tests__/RoomService.test.ts`. Setup: `lib/test-setup.ts` (jest-dom matchers).

## Dependencies to know

- `React 19.2`, `Next.js 16.0.10`, `TypeScript ^5`, `Node ^20` (CI).
- `motion ^12`, `next-themes ^0.4`, `drizzle-orm ^0.45`, `@upstash/redis ^1.35`, `pusher-js ^8.4`.
- `sharp` installed (required by `next/image`). `lucide-react` used in `theme-switcher.tsx` only.
- `shadcn` CLI (`^4.13`) installed as devDep for component management. Backed by `@base-ui/react` primitives.
- `@imagekit/next` for server (`getUploadAuthParams`) + client (`upload`). ImageKit folder: `/wickchat` (pending confirmation — see ImageKit note).
- `input-otp` for OTP input in join page. `next-qrcode` for QR display.
- `@vercel/og` for dynamic OG/Twitter image generation (`app/opengraph-image.tsx`, `app/twitter-image.tsx`).

## Design Guide

- Use Shadcn/UI Components Strictly for designing.
- Do no Alter the Shadcn/UI components unless told to.
- Do not apply costum styling to the Shadcn/UI Components e.g: 'rounded-xl bg-black'. Leave them as is becuase the Components follow the global.css stylings.
- use tailwindcss theme colors strictly.e.g No -> "bg-black color-red" Yes -> "bg-primary"
- No Gradients and Funky Backgrounds colors. No cheap Animations.
