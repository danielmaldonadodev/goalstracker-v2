# 🎯 GoalsTracker V2 - Professional Edition

> Multi-user habit tracking application with AI insights, gamification, and professional infrastructure.

![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Features

### Core Functionality
- 🎯 **Multi-user support** with authentication
- 📊 **Multiple objective types** (numeric, boolean, choice, scale, etc.)
- 📅 **Daily tracking** with mood, energy, and notes
- 🔄 **Navigate between days** to edit past entries
- 📈 **Advanced analytics** with trends and insights
- ⭕ **Circular wheel view** (month visualization)
- 🤖 **AI-powered insights** and recommendations
- 🏆 **Gamification** with XP, levels, and badges

### Technical Features
- ⚡ **Serverless** architecture (Vercel)
- 🔒 **Secure authentication** (NextAuth.js)
- 🗄️ **PostgreSQL** database
- ⚡ **Redis** caching
- 📱 **PWA** installable
- 🎨 **Professional UI** (shadcn/ui + Tailwind)
- 🔄 **Real-time updates** (React Query)
- 📤 **Export data** (JSON, CSV, TXT)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or pnpm
- Accounts on:
  - [Vercel](https://vercel.com) (hosting)
  - [Railway](https://railway.app) or [Supabase](https://supabase.com) (PostgreSQL)
  - [Upstash](https://upstash.com) (Redis)

### 1. Clone & Install

```bash
# Clone this repository
cd goalstracker-v2

# Install dependencies
npm install
# or
pnpm install
```

### 2. Setup Database (Railway)

```bash
# Create account at https://railway.app

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql

# Get connection string
railway variables
# Copy DATABASE_URL
```

### 3. Setup Redis (Upstash)

```bash
# Create account at https://console.upstash.com

# Create new Redis database (free tier)
# Select region closest to you

# Copy:
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
```

### 4. Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values:
nano .env.local
```

Required variables:
```bash
DATABASE_URL="postgresql://..."           # From Railway
UPSTASH_REDIS_REST_URL="https://..."     # From Upstash
UPSTASH_REDIS_REST_TOKEN="..."           # From Upstash
NEXTAUTH_SECRET="..."                     # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"     # Or your domain
```

### 5. Initialize Database

```bash
# Push schema to database
npx prisma db push

# Seed with default data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option 1: CLI Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Deploy

---

## 📁 Project Structure

```
goalstracker-v2/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # DB migrations
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── (marketing)/       # Public pages (landing, pricing)
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── objectives/        # Objective components
│   │   └── charts/            # Chart components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   ├── redis.ts           # Redis client
│   │   ├── trpc.ts            # tRPC config
│   │   └── utils.ts           # Utilities
│   ├── server/
│   │   ├── routers/           # tRPC routers
│   │   ├── context.ts         # tRPC context
│   │   └── trpc.ts            # tRPC setup
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   └── config/                # App configuration
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.js             # Next.js config
```

---

## 🔧 Configuration

### OAuth Providers (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
6. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-id"
   GOOGLE_CLIENT_SECRET="your-secret"
   ```

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (dev)
   - `https://yourdomain.com/api/auth/callback/github` (prod)
4. Add to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID="your-id"
   GITHUB_CLIENT_SECRET="your-secret"
   ```

### AI Integration (Optional)

Add one of these to enable AI insights:

```bash
# OpenAI
OPENAI_API_KEY="sk-..."

# Or Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 📊 Database Management

```bash
# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name your_migration_name

# View data in Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

---

## 🧪 Development

### Local Development

```bash
# Run dev server
npm run dev

# Run with Turbopack (faster)
npm run dev --turbo

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Environment-specific configs

```bash
# Development
.env.local

# Production (Vercel)
Add via Vercel dashboard or CLI
```

---

## 📦 Scripts

```json
{
  "dev": "next dev",              // Start dev server
  "build": "next build",          // Build for production
  "start": "next start",          // Start production server
  "lint": "next lint",            // Lint code
  "db:push": "prisma db push",    // Push schema to DB
  "db:studio": "prisma studio",   // Open Prisma Studio
  "db:seed": "tsx prisma/seed.ts" // Seed database
}
```

---

## 🎨 Customization

### Branding

Edit `/src/config/site.ts`:
```typescript
export const siteConfig = {
  name: "GoalsTracker",
  description: "Track your habits professionally",
  url: "https://goals.yourdomain.com",
  // ... more config
}
```

### Colors

Edit `tailwind.config.ts` to change color scheme.

### Objective Templates

Add templates in `/src/config/templates.ts` or via admin interface.

---

## 📈 Monitoring

### Vercel Analytics (Built-in)

Automatically enabled on Vercel Pro plan.

### PostHog (Optional)

```bash
# Add to .env.local
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)

---

## 🔒 Security

- ✅ NextAuth.js for authentication
- ✅ CSRF protection
- ✅ Rate limiting (via Redis)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)
- ✅ Environment variables for secrets
- ✅ Secure password hashing (bcryptjs)

---

## 📱 PWA Installation

Users can install GoalsTracker as an app:

**Desktop:**
1. Click install icon in browser address bar
2. Or browser menu → Install GoalsTracker

**Mobile (iOS/Android):**
1. Safari/Chrome menu
2. "Add to Home Screen"

---

## 🚧 Roadmap

- [x] Multi-user authentication
- [x] Multiple objective types
- [x] Circular wheel visualization
- [x] Daily tracking with mood/energy
- [x] Navigate between days
- [ ] AI insights and recommendations
- [ ] Gamification (badges, levels)
- [ ] Team/social features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] API for third-party integrations

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 💬 Support

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/goalstracker-v2/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/goalstracker-v2/discussions)

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [NextAuth.js](https://next-auth.js.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)

---

Made with ❤️ for building better habits

