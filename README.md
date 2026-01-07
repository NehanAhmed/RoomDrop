# Room Drop 💬

**Signup-less chat rooms to connect with friends and family instantly.**

Create instant chat rooms without the hassle of signing up. Share the link and start chatting with friends and family right away!

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://room-drop.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **🚀 No Sign-up Required** - Jump straight into conversations without creating an account
- **🔗 Instant Room Creation** - Generate unique room codes and share with anyone
- **⚡ Real-time Messaging** - Lightning-fast WebSocket-powered chat
- **🎨 Clean & Minimal UI** - Distraction-free interface for seamless communication
- **📦 Persistent Storage** - Redis integration for message caching and room management
- **🔒 Private Rooms** - Access controlled via unique room codes

## 🛠️ Tech Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Real-time:** WebSocket
- **Cache/Session:** [Redis](https://redis.io/)
- **Styling:** Tailwind CSS (assumed)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (Neon account)
- Redis instance (Upstash or local)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/room-drop.git
cd room-drop
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_neon_database_url

# Redis
REDIS_URL=your_redis_url

# WebSocket (if applicable)
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Optional: Node environment
NODE_ENV=development
```

4. Push database schema
```bash
npm run db:push
# or
npx drizzle-kit push
```

5. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
room-drop/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions and configurations
├── db/               # Drizzle schema and migrations
├── public/           # Static assets
└── types/            # TypeScript type definitions
```

## 🌐 Deployment

This app is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## 🗺️ Roadmap

- [ ] Typing indicators
- [ ] Message reactions
- [ ] File sharing
- [ ] Voice messages
- [ ] Room expiration settings
- [ ] Custom room themes

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with modern web technologies to provide a seamless, privacy-focused chat experience.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)