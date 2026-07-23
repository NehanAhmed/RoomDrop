# Performance Audit — Wick Chat

Date: 2026-07-23
Next.js version: 16.0.10
Router: App Router

## Executive Summary

Wick Chat is a well-architected Next.js app with good foundations (modern Next.js 16 App Router, correct `next/font` usage, proper `next/image` config, no runtime CSS-in-JS overhead). However, the data-access layer in `lib/RoomService.ts` has several critical performance issues — most notably an N+1 `SELECT COUNT(*)` query on every message send (the app's hottest code path) and N+1 Redis calls when re-populating message caches. The cleanup cron endpoint deletes expired rooms one-at-a-time in a loop instead of a single batch query. These issues will cause the app to degrade significantly under real-world load. Fixing the top 3 issues could eliminate ~80% of unnecessary database and Redis round-trips, cutting API latency by an estimated 40–60% on the critical message-sending path.

## Critical (fix immediately)

| Issue                                                 | File:Line                         | Impact                                                                                                                                                                                                                                                               | Fix                                                                                                                  |
| ----------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `db.$count()` on every message insert — **hot path**  | `lib/RoomService.ts:342-347`      | Every `addMessage()` call runs a `SELECT COUNT(*)` query against the `messages` table just to update the `messageCount` column. This is the most frequently executed code path in the app. For a room with 1000 messages, that's 1000 unnecessary COUNT queries.     | Use `db.sql\`message_count + 1\``to increment atomically, or remove the DB count entirely (derive from`redis.llen`). |
| N+1 DELETE in cleanup cron                            | `lib/cleanupRoomUtility.ts:33-45` | `for (const room of expiredRooms)` with individual `db.delete()` per room. If 100 rooms expire, that's 100 separate DELETE queries when 1 would suffice. Vercel cron jobs have a 300s timeout and this will fail under scale.                                        | Replace loop with `db.delete(rooms).where(lt(rooms.expiresAt, new Date()))` — single batch query.                    |
| N+1 Redis calls in `getMessages()` cache repopulation | `lib/RoomService.ts:399-401`      | `for (const msg of formattedMessages.reverse()) { await redis.lpush(...) }` — each message gets its own HTTP round-trip to Upstash. With 100 messages, that's 100 sequential HTTP requests. This triggers every time a room's messages are fetched from DB fallback. | Use `redis.rpush(key, ...messages)` to send all messages in a single call.                                           |

## High Priority

| Issue                                                          | File:Line                                 | Impact                                                                                                                                                                                                                             | Fix                                                                                           |
| -------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `getRoomInfo()` fetches all message rows just to get `.length` | `lib/RoomService.ts:167-171`              | `db.select().from(messages)` transfers all row data (including `id`, `userName`, `message`, `imageUrl`) over the network just to count rows. For rooms with thousands of messages, this is megabytes of unnecessary data transfer. | Use `db.$count(messages, eq(messages.roomCode, roomCode))` or a raw `COUNT(*)` query.         |
| No `Cache-Control` on GET API endpoints                        | `app/api/messages/[roomCode]/route.ts:21` | Messages endpoint returns `NextResponse.json()` with no cache headers. Every client request hits the origin. If users poll frequently, this multiplies server load.                                                                | Add `private, no-cache` (prevents CDN caching of chat data while allowing browser to decide). |
| No `Cache-Control` on upload sign endpoint                     | `app/api/upload/sign/route.ts:18`         | Same issue. The returned auth token has an `expire` field, so a short client-side cache (e.g. `private, max-age=30`) would reduce load without breaking correctness.                                                               | Add `private, max-age=30` or `private, no-cache`.                                             |
| `CopyButton.tsx` missing `'use client'` directive              | `components/CopyButton.tsx:1`             | Uses `useState`, `navigator.clipboard`, `document.body` (all client-only APIs) but has no `'use client'` directive. Will crash at runtime if rendered in a server component tree, or throw a build error depending on the parent.  | Add `'use client'` at the top.                                                                |
| Sequential Redis/DB operations in `getRoomInfo()`              | `lib/RoomService.ts:160-171`              | `redis.ttl()`, `redis.smembers()`, and `db.select(messages)` are three sequential round-trips with zero data dependency on each other.                                                                                             | Wrap in `Promise.all([redis.ttl(...), redis.smembers(...), db.select(...)])`.                 |

## Medium Priority

| Issue                                                     | File:Line                                                                                                                                            | Impact                                                                                                                                                                                                                                      | Fix                                                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Sequential Redis calls in `createRoom()`                  | `lib/RoomService.ts:69-76`                                                                                                                           | Three sequential HTTP round-trips (`setex` → `sadd` → `expire`) to Upstash. Each is a separate HTTP request.                                                                                                                                | Combine room data and online-set into a single data structure, or accept (Upstash HTTP doesn't support pipelining).    |
| Sequential Redis calls in `joinRoom()`                    | `lib/RoomService.ts:228-230`                                                                                                                         | Same `setex` → `sadd` → `expire` pattern.                                                                                                                                                                                                   | Same as above.                                                                                                         |
| Sequential DB queries in `getRoom()` fallback             | `lib/RoomService.ts:115,127-130`                                                                                                                     | Room select then participant select as two separate queries. Could use a JOIN or Drizzle relations API.                                                                                                                                     | Use `db.query.rooms.findFirst({ with: { participants: true } })` or a JOIN.                                            |
| Dynamic imports in route handlers                         | `app/api/join/route.ts:60`, `app/api/send/route.ts:22-24`                                                                                            | `await import('@/lib/pusher')` and `await import('@/lib/RoomService')` add ~5-10ms latency per request. These modules would be cached by Node.js after first import anyway, but the await still incurs overhead for the dynamic resolution. | Replace with static top-level imports.                                                                                 |
| `lucide-react` used for a single icon                     | `package.json:27`, `components/theme-switcher.tsx:5`                                                                                                 | Adds ~30-40KB to the client bundle for one `Palette` icon. `@tabler/icons-react` already has `IconPalette`.                                                                                                                                 | Replace `Palette` from `lucide-react` with `IconPalette` from `@tabler/icons-react`; remove `lucide-react` dependency. |
| 6 landing-page components with unnecessary `'use client'` | `components/Home/HeroSection.tsx:1`, `FeaturesSection.tsx:1`, `HowItWorksSection.tsx:1`, `FAQSection.tsx:1`, `FooterSection.tsx:1`, `HomePage.tsx:1` | These are pure presentational components with no hooks, event handlers, or browser APIs. Adding `'use client'` forces them into the client bundle and prevents server rendering of their content.                                           | Remove `'use client'` from each. They can remain server components.                                                    |
| Missing Suspense on room page async data                  | `app/room/[roomCode]/page.tsx:34-39`                                                                                                                 | `await roomExists()` and `await getRoomInfo()` block the full page render with no Suspense fallback. If Redis/DB is slow, the page hangs entirely.                                                                                          | Wrap data-dependent sections in `<Suspense>` boundaries.                                                               |
| No `dynamic()` for heavy components                       | Throughout                                                                                                                                           | Components like `ChatInterface.tsx` (420 lines, Pusher + ImageKit integration) and `SettingsModal.tsx` (modal, rarely opened) are eagerly loaded in the main bundle.                                                                        | Use `next/dynamic` with `ssr: false` for `SettingsModal` and other infrequently-used components.                       |

## Low Priority

| Issue                                     | File:Line                                                | Impact                                                                                                                                                                    | Fix                                                                  |
| ----------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| No `force-dynamic` on messages GET route  | `app/api/messages/[roomCode]/route.ts`                   | No explicit `export const dynamic = 'force-dynamic'`. Next.js 16 should handle this correctly due to dynamic params, but explicit config would prevent surprises.         | Add `export const dynamic = 'force-dynamic'`.                        |
| No `revalidate` or ISR on any page        | All page files                                           | No incremental static regeneration configured. While most pages are dynamic by nature, the static landing page `/` could benefit from ISR if it ever becomes data-driven. | Consider ISR when/if the landing page becomes dynamic.               |
| Redundant PNG logo files                  | `public/transparent-logo.png`, `public/colored-logo.png` | SVG versions already exist for both. PNG versions add ~10-20KB of unnecessary static assets.                                                                              | Remove PNGs if SVGs are sufficient.                                  |
| PDF assets in `public/`                   | `public/colored-logo.pdf`, `public/transparent-logo.pdf` | PDFs in the public directory are unusual for a web app. They're served as static assets but not linked from any page.                                                     | Verify they're needed; remove if not.                                |
| Rate-limit analytics enabled              | `lib/rateLimit.ts:9`                                     | `analytics: true` adds an extra Redis call per rate-limit check, doubling Redis overhead for every rate-limited request.                                                  | Consider disabling `analytics` in production if latency is critical. |
| `RedisClient` type exported but unused    | `lib/redis.ts`                                           | Dead code — exported type is never imported anywhere.                                                                                                                     | Remove or use it.                                                    |
| No `React.cache()` for data deduplication | `lib/RoomService.ts`                                     | `roomExists()` followed by `getRoomInfo()` in the room page results in duplicate Redis calls (both check room existence independently).                                   | Use `React.cache()` to deduplicate within the same request.          |

## Bad Practices Found

### 1. N+1 over HTTP (Redis without pipelining)

Upstash Redis is HTTP-based — each Redis command is a separate HTTP request. The codebase frequently runs `setex`, `sadd`, and `expire` in sequence as individual `await` calls, creating 3 HTTP round-trips where 1 combined operation could suffice.

- **Recurs at**: `createRoom()` (69-76), `joinRoom()` (228-230), `addMessage()` (327-329)
- **Why it's a problem**: Each HTTP round-trip to Upstash adds ~5-20ms latency. 3 sequential calls = 15-60ms extra per operation.
- **Correct pattern**: Combine into single data structures where possible, or accept the trade-off (Upstash REST doesn't support Lua/pipelining the way redis-server does).

### 2. Fetching entire tables just to count rows

Multiple places `db.select().from(messages)` only to call `.length` on the result array. This transfers all column data over the network only to discard it.

- **Recurs at**: `getRoomInfo()` (167-171), effectively also the `db.$count()` in `addMessage()` (345)
- **Why it's a problem**: For rooms with thousands of messages, this transfers megabytes of unnecessary data.
- **Correct pattern**: Use `db.$count()` (Drizzle) or raw `SELECT COUNT(*)` — the database returns a single integer.

### 3. Dynamic imports in hot-path route handlers

Using `await import('@/lib/pusher')` and `await import('@/lib/RoomService')` inside request handlers when they could be static top-level imports.

- **Recurs at**: `app/api/join/route.ts:60`, `app/api/send/route.ts:22-24`
- **Why it's a problem**: Dynamic import resolution adds latency on every request, even though Node.js caches the module after first load.
- **Correct pattern**: Use `import { getPusherServer } from '@/lib/pusher'` at the top of the file.

### 4. Unnecessary `'use client'` on pure presentational components

Landing page sections that render only JSX with no interactivity are marked `'use client'`, forcing them into the client bundle.

- **Recurs at**: 6 files in `components/Home/`
- **Why it's a problem**: Each `'use client'` component adds its JS to the client bundle and prevents server-side rendering of that section's HTML.
- **Correct pattern**: Only add `'use client'` when the component uses `useState`, `useEffect`, `useRef`, event handlers, browser APIs, or context created by another client component.

## Bundle Analysis

> Note: Next.js 16 with Turbopack doesn't emit a traditional `build-manifest.json` with per-route sizes. Analysis below is based on dependencies, component tree, and emitted chunk sizes.

### Largest server chunks

| Chunk                                 | Size   | Contents                   |
| ------------------------------------- | ------ | -------------------------- |
| `[root-of-the-server]__630f7283._.js` | 261 KB | Server runtime             |
| `_ad22acaa._.js`                      | 244 KB | App server logic           |
| `_1a10e9ab._.js`                      | 236 KB | Server utilities           |
| `[root-of-the-server]__04edbca2._.js` | 140 KB | Base framework             |
| `lib_redis_ts_e89cca64._.js`          | 59 KB  | Redis client + RoomService |

### Client bundle concerns

| Concern                                    | Impact                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `@tabler/icons-react` (full barrel import) | Tree-shaken in production, but barrel resolution still has overhead during development builds. No action needed.                       |
| `lucide-react` for single `Palette` icon   | ~30-40KB in client bundle that could be eliminated by switching to `IconPalette` from `@tabler/icons-react`.                           |
| `motion/react` (formerly framer-motion)    | ~40-50KB. Used extensively (ChatInterface, ImageViewer, theme-switcher, app-sidebar, sidebar UI). Acceptable given usage.              |
| `pusher-js`                                | ~30KB. Required for real-time. Acceptable.                                                                                             |
| No `dynamic()` for heavy components        | ChatInterface (Pusher + ImageKit integration) is eagerly loaded. SettingsModal and ImageViewer are rarely used but in the main bundle. |

### Recommended `dynamic()` targets

- `SettingsModal` — only opened via user action, never on first paint
- `ImageViewer` — only after user clicks an image
- `ChatInterface` — is the main interface for room pages, but the Pusher/ImageKit dependencies could be deferred

## Recommended Fix Order

1. **`addMessage()` messageCount fix** (Critical) — Replace `db.$count()` with atomic increment. This is the hottest code path; every sent message triggers an unnecessary COUNT query.
2. **`cleanupRoomUtility.ts` N+1 deletes** (Critical) — Use single batch delete. The cron job will fail under scale.
3. **`getMessages()` N+1 Redis lpush** (Critical) — Batch with `redis.rpush()`. Cuts ~99 Redis HTTP calls on cache miss.
4. **Add `'use client'` to `CopyButton.tsx`** (High) — Will crash at runtime in current state.
5. **`getRoomInfo()` message count query** (High) — Use `db.$count()` instead of fetching all rows.
6. **Add `Cache-Control` to GET API endpoints** (High) — Reduces origin load on message polls.
7. **Parallelize `getRoomInfo()` Redis/DB calls** (High) — `Promise.all()` for ttl + smembers + message count.
8. **Remove `'use client'` from 6 landing components** (Medium) — Cleaner server/client boundary.
9. **Remove `lucide-react` dependency** (Medium) — Drops ~30-40KB from client bundle.
10. **Replace dynamic imports with static imports in route handlers** (Medium) — Removes ~5-10ms latency per request.
11. **Add Suspense boundary on room page** (Medium) — Better UX during slow data fetches.
12. **Add dynamic() for SettingsModal** (Medium) — Keeps infrequently-used component out of main bundle.

## Out of Scope / Needs Further Investigation

- **Real-time message polling frequency** — requires RUM/APM to know how often clients hit the messages GET endpoint. If clients poll aggressively, the Cache-Control fix becomes critical; if they rely on Pusher, it's less important.
- **Redis Upstash latency** — can't measure HTTP round-trip times to Upstash without production traffic. The sequential Redis call issues may be more or less impactful depending on Upstash region latency.
- **Neon DB connection pooling** — the codebase uses `@neondatabase/serverless` HTTP driver, which is stateless per query. Under high concurrency, connection pooling via `@neondatabase/serverless` WebSocket driver with `ws://` pooler may improve throughput.
- **Image optimization pipeline** — `next/image` is configured for WebP/AVIF conversion, but the actual files served from ImageKit (user-uploaded chat images) depend on ImageKit's own optimization settings, which are outside this codebase.
- **CDN cache hit ratio** — requires production data to assess if Vercel Edge is caching effectively.
- **Hydration mismatches** — no console errors visible in static analysis; requires browser testing.
