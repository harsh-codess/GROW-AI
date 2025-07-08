# FlowAI Local Development Setup

## 📋 Prerequisites

### 1. Install Node.js
- Download and install Node.js (v18 or higher) from: https://nodejs.org/
- This will also install npm (Node Package Manager)

### 2. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop/
- Required for PostgreSQL, Redis, and Qdrant databases

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Alternative: If you prefer Bun (faster)
# Install Bun from: https://bun.sh/
# bun install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory with these variables:

```env
# Database
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/flowai"

# Authentication (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional for auth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
REPLICATE_API_TOKEN="your-replicate-token"

# Media Services
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Communication
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
RESEND_API_KEY="your-resend-key"

# Redis & Upstash
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Vector Database
QDRANT_URL="http://localhost:6333"
```

### 3. Start Services
```bash
# Start databases (PostgreSQL, Redis, Qdrant)
docker-compose up -d db redis qdrant

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
# or with Bun: bun dev
```

Visit: http://localhost:3000

## 🧪 Testing the Application

### 1. Basic Testing
1. Navigate to http://localhost:3000
2. Register a new account
3. Complete the onboarding process
4. Test basic features without API keys

### 2. Full Feature Testing
To test all features, you'll need API keys for:
- **OpenAI/Google AI**: For content generation
- **Replicate**: For video generation
- **Cloudinary**: For image processing
- **Twilio**: For voice campaigns
- **Resend**: For email campaigns

### 3. Database Management
```bash
# View database in browser
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 🔧 Troubleshooting

### Common Issues:
1. **Port conflicts**: Make sure ports 3000, 5432, 6379, 6333 are available
2. **Docker issues**: Ensure Docker Desktop is running
3. **Environment variables**: Check all required .env variables are set
4. **Node version**: Ensure Node.js v18+ is installed

### Minimal Testing (No API Keys)
You can test the basic UI and authentication without external API keys by:
1. Setting up just the database
2. Registering an account
3. Exploring the dashboard UI
4. Testing file uploads (will fail gracefully without Cloudinary)

## 📚 Additional Commands
```bash
# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start

# View all npm scripts
npm run
```
