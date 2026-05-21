# GrowIT

AI-powered marketing platform designed to help startups grow faster. Create content, generate product visuals, run voice campaigns, send email blasts, and analyze competitors — all from one dashboard powered by Google Gemini AI.

## Features

- **AI Product Photoshoot** — Transform basic product photos into professional marketing images using AI image generation
- **Marketing Chat Assistant** — AI chatbot with RAG-based knowledge base that understands your brand and business context
- **Voice Sales Agent** — Deploy AI voice agents via Twilio + Ultravox that handle customer calls and qualify leads 24/7
- **Content Generation** — Create blogs, social media posts, and marketing copy tailored to your brand voice
- **AI Video Generation** — Generate marketing videos using Replicate AI models with Cloudinary hosting
- **Email Marketing Engine** — AI-generated personalized and bulk email campaigns delivered via Resend
- **Business Planner** — AI-assisted business planning with milestones, tasks, and progress tracking
- **Competitor Analysis** — Track competitors and identify market opportunities
- **Analytics Dashboard** — Track content performance, engagement metrics, and activity logs
- **Social Integrations** — Connect YouTube, Instagram, and LinkedIn accounts
- **Document Knowledge Base** — Upload documents (PDF, DOCX, CSV) that get embedded into a vector store for RAG-powered chat

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI, Lucide Icons, Framer Motion |
| Database | PostgreSQL 15 (Prisma ORM) |
| Vector DB | Qdrant |
| Job Queue | BullMQ + Redis |
| Rate Limiting | Upstash Redis |
| AI Engine | Google Gemini (via `@google/genai` + LangChain) |
| Auth | NextAuth.js + custom JWT (jose) |
| Email | Resend |
| Voice | Twilio + Ultravox |
| File Uploads | UploadThing |
| Image/Video CDN | Cloudinary |
| Video Generation | Replicate |
| Banner Generation | Bannerbear |
| Deployment | Docker Compose / Vercel |

## Project Structure

```
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/               # Login, register, onboarding, OAuth callbacks
│   ├── (dashboard)/          # Main app pages
│   │   └── dashboard/
│   │       ├── analytics/    # Performance analytics
│   │       ├── business-planner/  # AI business planning
│   │       ├── chat/         # AI marketing assistant
│   │       ├── competition/  # Competitor analysis
│   │       ├── content/      # Content management & generation
│   │       ├── email/        # Email campaign builder
│   │       ├── photoshoot/   # AI product photography
│   │       ├── settings/     # User & company settings
│   │       ├── video/        # AI video generation
│   │       └── voice-agent/  # Voice campaign management
│   ├── api/                  # API routes
│   ├── actions/              # Server actions
│   └── lib/                  # Shared utilities
├── actions/                  # Root-level server actions
├── components/               # Reusable UI components
├── lib/                      # Auth, Prisma, utils
├── prisma/                   # Database schema
└── docker-compose.yml
```

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd GROW-AI
npm install
```

### 2. Start infrastructure services

```bash
docker-compose up -d db redis qdrant
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Qdrant** on port `6333`

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# ──────────────────────────────────────────────
# REQUIRED — App will not start without these
# ──────────────────────────────────────────────

# Database (auto from Docker)
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/flowai"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
JWT_SECRET="<run: openssl rand -base64 32>"

# AI Engine (core of the app)
GEMINI_API_KEY="<from https://aistudio.google.com/apikey>"

# Rate limiting & caching
UPSTASH_REDIS_REST_URL="<from https://upstash.com>"
UPSTASH_REDIS_REST_TOKEN="<from https://upstash.com>"

# Vector database (auto from Docker)
QDRANT_URL="http://localhost:6333"

# ──────────────────────────────────────────────
# OPTIONAL — Enable specific features
# ──────────────────────────────────────────────

# Google OAuth (Google login + YouTube)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
YOUTUBE_REDIRECT_URL="http://localhost:3000/api/social/youtube/callback"

# Cloudinary (product photos, videos, content images)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Replicate (AI video generation)
REPLICATE_API_TOKEN=""

# Twilio (voice campaigns)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Ultravox (AI voice engine)
ULTRAVOX_API_KEY=""

# Resend (email campaigns)
RESEND_API_KEY=""
RESEND_FROM_EMAIL=""
RESEND_REPLY_TO_EMAIL=""

# UploadThing (file uploads)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Bannerbear (banner generation)
BANNERBEAR_API_KEY=""

# Instagram
INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/social/instagram/callback"

# LinkedIn
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/social/linkedin/callback"

# Public app URL (needed for Twilio webhooks in production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the dev server

```bash
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

## API Keys — Where to Get Them

| Service | Sign Up URL | Free Tier |
|---------|-------------|-----------|
| **Google Gemini** | https://aistudio.google.com/apikey | Yes |
| **Upstash Redis** | https://upstash.com | Yes (10k requests/day) |
| **Google OAuth** | https://console.cloud.google.com → APIs & Services → Credentials | Free |
| **Cloudinary** | https://cloudinary.com | Yes (25 credits/mo) |
| **Replicate** | https://replicate.com | Pay-per-use |
| **Twilio** | https://www.twilio.com | Trial credits |
| **Ultravox** | https://www.ultravox.ai | Contact for access |
| **Resend** | https://resend.com | Yes (100 emails/day) |
| **UploadThing** | https://uploadthing.com | Yes (2GB) |
| **Bannerbear** | https://www.bannerbear.com | Trial available |
| **Instagram/Meta** | https://developers.facebook.com | Free |
| **LinkedIn** | https://www.linkedin.com/developers | Free |

## Database Models

The Prisma schema defines 30+ models including:

- **User / Company** — Multi-tenant user and company management
- **ContentItem** — Generated marketing content (blog posts, social media, etc.)
- **Lead / Campaign / CampaignLog** — Lead management and outbound campaign tracking
- **EmailCampaign / EmailLead** — Email marketing with personalized AI-generated content
- **VoiceAgent / Script / Call** — Voice campaign configuration and call history
- **ProductPhotographySession / ProductImage** — AI product photo sessions
- **ProductVideoSession / ProductVideo** — AI video generation sessions
- **Document / DocumentChunk / KnowledgeBase** — RAG document processing pipeline
- **BusinessPlan / PlanMilestone / PlanTask** — Business planning with progress tracking
- **SocialConnection** — YouTube, Instagram, LinkedIn OAuth connections
- **AnalyticsEvent / AnalyticsData / ActivityLog** — Usage and performance analytics
- **ChatConversation / ChatMessage** — Persistent AI chat history

## Scripts

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # Generate Prisma client + build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Docker (Full Stack)

To run the entire stack in Docker:

```bash
docker-compose up
```

This starts all services: PostgreSQL, Redis, Qdrant, the voice agent server, and the Next.js app.

## License

All rights reserved.
