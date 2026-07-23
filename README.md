# Wick Chat 💬

**Signup-less chat rooms to connect with friends and family instantly.**

Create instant chat rooms without the hassle of signing up. Share the link and start chatting with friends and family right away!

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://chat.nehan.site)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## Features

- **No Sign-up Required** - Jump straight into conversations without creating an account
- **Instant Room Creation** - Generate unique room codes and share with anyone
- **Real-time Messaging** - Powered by Pusher for instant message delivery
- **Clean & Minimal UI** - Distraction-free interface for seamless communication
- **Persistent Storage** - Redis + Postgres for message caching and room management
- **Private Rooms** - Access controlled via unique room codes

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Real-time:** [Pusher](https://pusher.com/)
- **Cache/Session:** [Upstash Redis](https://upstash.com/)
- **Styling:** Tailwind CSS v4
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Neon (Postgres) database
- Upstash Redis instance
- Pusher app credentials

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/wick-chat.git
cd wick-chat
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
UPSTASH_REDIS_REST_URL=https://your-region.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# SEO / Verification (optional — for Search Console + Bing Webmaster Tools)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-search-console-code
NEXT_PUBLIC_BING_VERIFICATION=your-bing-webmaster-code
```

4. Push database schema

```bash
npx drizzle-kit push
```

5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
wick-chat/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API route handlers
│   ├── join/         # Join room page
│   ├── new/          # Create room page
│   └── room/         # Chat room page
├── components/       # React components
│   ├── ui/           # shadcn/ui primitives
│   ├── Home/         # Home page components
│   └── Message/      # Chat/message components
├── lib/              # Utilities, types, and configurations
│   └── db/           # Drizzle schema and client
├── hooks/            # Custom React hooks
├── public/           # Static assets
└── migrations/       # Drizzle migrations
```

## API Routes

| Method | Path                       | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/api/create`              | Create a new room     |
| POST   | `/api/join`                | Join an existing room |
| GET    | `/api/messages/[roomCode]` | Get room messages     |
| POST   | `/api/messages/send`       | Send a message        |

## Deployment

Deploy on [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables (use Vercel Environment Variables, not .env files)
4. Deploy

## Roadmap

- [ ] Typing indicators
- [ ] Message reactions
- [ ] File sharing
- [ ] Voice messages
- [ ] Custom room themes

## License

This project is open source and available under the [MIT License](LICENSE).
