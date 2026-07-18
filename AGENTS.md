# RoomDrop — Agent Guide

## Quick start
```bash
pnpm dev        # local dev at http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint (Next.js core-web-vitals + typescript configs)
pnpm start      # production serve
```
No test, typecheck, or db:push scripts exist. `pnpm` is the package manager (lockfile: `pnpm-lock.yaml`).

## Tech & quirks
- **Next.js 16** App Router. Path alias: `@/*` → root.
- **Tailwind v4** via `@tailwindcss/postcss` + **shadcn/ui** (style `base-mira`, icon library `tabler`).
- **Fonts**: Space Grotesk (sans, var `--font-sans`), Geist Mono (mono, var `--font-geist-mono`). Loaded from `next/font/google`.
- **Theme**: `next-themes`, default `dark`, `enableSystem={false}`. Toggle via `Tabs` (light/dark/system).
- **DB**: Neon (serverless Postgres) + Drizzle ORM. Schema at `lib/db/schema.ts`. Migrations in `migrations/`. Push schema: `npx drizzle-kit push`.
- **Cache**: Upstash Redis via `@upstash/redis` (reads `.env` for `UPSTASH_REDIS_REST_URL` / `TOKEN`).
- **Real-time**: Pusher (`pusher` server + `pusher-js` client). Channel: `chat-${roomCode}`, event: `incoming-message`.
- **Animations**: `motion/react` (formerly framer-motion). Local skills at `.agents/skills/motion/`, `.agents/skills/frontend-design/`.
- **DB client**: loads `.env` (not `.env.local`) via `dotenv` in `lib/db/index.ts`. `Drizzle` neon-http driver.

## Architecture
- **Signup-less chat**: Create room → get `XXX-XXX` code → share → others join by code or QR.
- **Session**: Stored in `localStorage` as `chat_room_session` (userName, roomCode, joinedAt, expiresAt). Checked on every page.
- **Data flow**: Redis (fast, TTL-bound) → DB (persistence fallback). `RoomService.ts` is the business logic layer.
- **Messages**: Optimistic insert with temp IDs (`temp-${Date.now()}`). Server responds with real message, replaces via dedup by ID or content match.
- **Expiry**: Rooms auto-delete from DB (cascade deletes participants + messages). Cron-ready cleanup at `lib/cleanupRoomUtility.ts`.

## Pages & routes
| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Home/HomeModal.tsx` | Shows active session if exists |
| `/new` | `CreateRoomComponent.tsx` | POST to `/api/create` |
| `/join` | `JoinPageComponent.tsx` | Supports `?by=qrcode&code=XXX` |
| `/room/[roomCode]` | `ChatInterface.tsx` | Server checks room exists, client reads user from localStorage |

| API | Method | Body |
|-----|--------|------|
| `/api/create` | POST | `{ name, duration, participantsCount }` |
| `/api/join` | POST | `{ code, name }` |
| `/api/messages/[roomCode]` | GET | — |
| `/api/messages/send` | POST | `{ roomCode, userName, message }` |

Note: `POST /api/join` references `/api/room/${roomCode}/status` for existence check but this route doesn't exist yet.

## DB schema (3 tables)
`rooms` (code PK, creator, duration, participantsCount, expiresAt, isActive) → `participants` (roomCode FK, userName, isOnline) → `messages` (roomCode FK, userName, message, timestamp). All FK cascade on delete. Room code format: `XXX-XXX` (6 alphanum chars).

## Style conventions
- `'use client'` on all interactive components. Server components for data-fetching pages.
- `cn()` utility (`clsx` + `tailwind-merge`) from `@/lib/utils`.
- Icons from `@tabler/icons-react`.
- shadcn/ui components in `components/ui/`.
- Toast via `sonner` (configured top-right, richColors, 3s in layout).
- **No test framework** is installed.
