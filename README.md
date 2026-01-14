<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker"/>
</p>

<h1 align="center">🚀 FlowAI</h1>

<p align="center">
  <strong>The End-to-End AI-Powered Marketing Stack for Early-Stage Startups</strong>
</p>

<p align="center">
  Transform your product marketing with AI — from stunning visuals to personalized campaigns, all in one platform.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**FlowAI** is a comprehensive, AI-powered marketing automation platform designed specifically for early-stage startups. It eliminates the need to stitch together multiple tools by providing an end-to-end solution for content creation, campaign management, and performance analytics.

### The Problem We Solve

Startups often struggle with:
- 📸 Creating professional product imagery without expensive photoshoots
- 🎬 Producing engaging video content without a production team
- 📧 Running personalized email campaigns at scale
- 📞 Managing voice outreach efficiently
- 📊 Tracking marketing performance across channels

**FlowAI solves all of this with AI at every touchpoint.**

---

## ✨ Key Features

### 🎨 AI-Powered Content Creation

| Feature | Description |
|---------|-------------|
| **Neural Product Photography** | Transform basic product images into studio-grade photos using AI neural rendering |
| **AI Video Generation** | Generate polished product videos from a single image using Google Veo2 |
| **Content Generator** | Create marketing copy, social media posts, and ad content with Gemini AI |
| **Business Plan Generator** | Get comprehensive, AI-generated business plans with milestones and tasks |

### 📣 Multi-Channel Campaign Management

| Feature | Description |
|---------|-------------|
| **Email Campaigns** | Upload CSV contact lists and launch personalized email sequences via Resend |
| **Voice Campaigns** | Automated phone outreach with custom AI voice assistants via Twilio |
| **Lead Management** | Track leads, manage contacts, and monitor campaign performance |

### 📊 Analytics & Insights

| Feature | Description |
|---------|-------------|
| **Real-time Dashboard** | Monitor emails sent, campaigns running, video stats, and engagement metrics |
| **Content Performance** | Track which content performs best across channels |
| **AI Recommendations** | Get AI-powered suggestions to improve marketing effectiveness |
| **Competition Analysis** | Analyze competitors and identify market opportunities |

### 💬 Intelligent Assistance

| Feature | Description |
|---------|-------------|
| **AI Chat Assistant** | Context-aware chatbot trained on your company documents |
| **Document Processing** | Upload PDFs and documents to build company knowledge base |
| **RAG-powered Search** | Semantic search across all your marketing content and documents |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router and Turbopack |
| **TypeScript 5.8** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **Radix UI** | Accessible component primitives |
| **Framer Motion** | Smooth animations |
| **Recharts** | Data visualization |
| **React Query** | Server state management |

### Backend & APIs
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **NextAuth.js** | Authentication (credentials + OAuth) |
| **Prisma ORM** | Type-safe database client |
| **PostgreSQL** | Primary database |
| **Redis (Upstash)** | Rate limiting and caching |
| **BullMQ** | Background job processing |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| **Google Gemini 1.5 Pro** | Content generation and business planning |
| **Google GenAI SDK** | AI integration |
| **LangChain** | LLM orchestration |
| **Qdrant** | Vector database for embeddings |
| **Replicate (Veo2)** | AI video generation |

### Media Processing
| Technology | Purpose |
|------------|---------|
| **Bannerbear** | Dynamic image generation |
| **Cloudinary** | Image/video storage and processing |
| **FFMPEG** | Video processing |
| **UploadThing** | File uploads |

### Communications
| Technology | Purpose |
|------------|---------|
| **Twilio** | Voice agents and phone campaigns |
| **Resend** | Transactional and marketing emails |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Dashboard │ │  Video   │ │  Email   │ │  Voice   │           │
│  │   UI     │ │  Studio  │ │ Campaign │ │  Agent   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js Routes)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   Auth   │ │Dashboard │ │  Social  │ │ Twilio   │           │
│  │   API    │ │   API    │ │   API    │ │   API    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Google Gemini  │ │   Replicate  │ │  Twilio/Resend   │
│   (AI Content)   │ │   (Video)    │ │   (Comms)        │
└──────────────────┘ └──────────────┘ └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  PostgreSQL  │ │    Redis     │ │   Qdrant     │            │
│  │  (Primary)   │ │   (Cache)    │ │  (Vectors)   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun**
- **Docker** & **Docker Compose**
- **PostgreSQL** 15+
- API keys for required services (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flow-ai.git
   cd flow-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the database**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

7. **Open your browser**  
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

For full-stack deployment with Docker:

```bash
docker-compose up --build
```

This starts:
- Next.js application
- PostgreSQL database
- Redis cache

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flowai"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google AI (Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# Twilio (Voice Campaigns)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key"

# Replicate (Video Generation)
REPLICATE_API_TOKEN="your-replicate-token"

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Upstash (Redis)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Qdrant (Vector Database)
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="your-qdrant-key"

# UploadThing (File Uploads)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

---

## 📡 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth.js authentication routes |
| `/api/auth/register` | POST | User registration |

### Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Fetch dashboard statistics |
| `/api/dashboard/chart` | GET | Get chart data for analytics |
| `/api/dashboard/recommendations` | GET | AI-powered recommendations |
| `/api/dashboard/business-planner` | GET/POST | Generate/retrieve business plans |
| `/api/dashboard/content-generator` | POST | Generate marketing content |
| `/api/dashboard/content-items` | GET/POST | Manage content items |

### Social & Media

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/social/connect` | POST | Connect social media accounts |
| `/api/social/youtube/*` | * | YouTube integration endpoints |

### Voice Campaigns

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/twilio/*` | * | Twilio voice campaign endpoints |

### Documents

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents/upload` | POST | Upload documents for processing |
| `/api/documents/search` | POST | Search documents using RAG |

---

## 🗄 Database Schema

FlowAI uses a comprehensive PostgreSQL schema with the following key models:

### Core Models

| Model | Description |
|-------|-------------|
| `User` | User accounts with authentication details |
| `Company` | Company profiles and settings |
| `ContentItem` | Generated marketing content |
| `BusinessPlan` | AI-generated business plans with milestones |

### Campaign Models

| Model | Description |
|-------|-------------|
| `EmailCampaign` | Email campaign configurations |
| `Campaign` | Voice campaign definitions |
| `Lead` | Contact/lead information |
| `CallHistory` | Voice call logs |

### Media Models

| Model | Description |
|-------|-------------|
| `ProductImage` | Product images and AI-enhanced versions |
| `ProductVideo` | Generated product videos |
| `ProductPhotographySession` | Photo session configurations |
| `ProductVideoSession` | Video session configurations |

### AI & Analytics

| Model | Description |
|-------|-------------|
| `Document` | Uploaded documents for RAG |
| `DocumentChunk` | Embedded document chunks |
| `ChatConversation` | AI chat history |
| `AnalyticsData` | Cached analytics data |
| `ActivityLog` | User activity tracking |

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://github.com/user-attachments/assets/05f6cc58-6df1-4bbc-bcad-92922f9c747d)

### Authentication
![Authentication](https://github.com/user-attachments/assets/c5f3f4b9-a134-4e7a-810e-ccd71ebf3134)

### Onboarding Flow
![Onboarding 1](https://github.com/user-attachments/assets/4102dff7-ea92-42ec-8cad-ffb90dce33b0)
![Onboarding 2](https://github.com/user-attachments/assets/38101493-e016-49b5-8af2-2f4cf48a0e5f)
![Onboarding 3](https://github.com/user-attachments/assets/d0dad3fd-6e16-4327-a94d-7c1f79675450)

### Dashboard
![Dashboard Overview](https://github.com/user-attachments/assets/4ee3635b-04dd-4337-b6ee-20d45fdeb234)
![Dashboard Analytics](https://github.com/user-attachments/assets/50ca56a1-1882-489e-91bc-58a6c251389b)
![Dashboard Content](https://github.com/user-attachments/assets/de9d0f34-8310-41cd-aadb-a7ca8e216d30)
![Dashboard Campaigns](https://github.com/user-attachments/assets/074950bb-eae4-4c80-bb37-1d4e8526366f)
![Dashboard Performance](https://github.com/user-attachments/assets/bf71a4ff-326b-45a5-9aea-823d15a3a6d7)
![Dashboard Insights](https://github.com/user-attachments/assets/a85e33de-4310-4fae-bbf1-f62fe8d56842)
![Dashboard Reports](https://github.com/user-attachments/assets/0790e0e8-58e9-4a5f-9bd5-30dc178df4cd)

### User Profile
![Profile](https://github.com/user-attachments/assets/89e95f9e-c7e2-45c5-80c0-69542f280b53)

---

## 🗺 Roadmap

### Current Features ✅
- [x] AI-powered business plan generation
- [x] Product image enhancement
- [x] Video generation from images
- [x] Email campaign management
- [x] Voice campaign with Twilio
- [x] Analytics dashboard
- [x] Document-based AI chat
- [x] Multi-user with company support

### Upcoming Features 🔜
- [ ] Social media scheduling (Instagram, LinkedIn, Twitter)
- [ ] A/B testing for email campaigns
- [ ] Advanced AI voice cloning
- [ ] WhatsApp integration
- [ ] Zapier/Make integrations
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Enhanced reporting with exports

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (TypeScript strict mode)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - For powerful AI content generation
- **Replicate** - For AI video generation capabilities
- **Twilio** - For voice campaign infrastructure
- **Resend** - For reliable email delivery
- **Vercel** - For Next.js and deployment platform

---

<p align="center">
  <strong>Built with ❤️ for the startup community</strong>
</p>

<p align="center">
  <a href="https://github.com/your-username/flow-ai">⭐ Star this repo</a> •
  <a href="https://github.com/your-username/flow-ai/issues">🐛 Report Bug</a> •
  <a href="https://github.com/your-username/flow-ai/issues">💡 Request Feature</a>
</p>
