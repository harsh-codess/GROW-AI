
## FlowAI

**What it is:**
An end-to-end AI-powered marketing stack tailored for early-stage startups. With a single platform, you can:

* Turn a basic product image into studio-grade photos via neural rendering.
* Generate polished product videos using just an image.
* Upload CSV contact lists and launch personalized marketing campaigns—voice calls via custom AI assistants and targeted email sequences.
* Plan and strategize using built-in business planner tools.
* Monitor performance with dashboard metrics (emails sent, campaigns run, engagement, video stats, etc.).

---

## 🔧 Tech Stack

* **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Radix UI, React Query, Recharts, Framer Motion
* **Backend / API**: Next.js API routes (NextAuth w/ Google/YouTube & Prisma with PostgreSQL)
* **AI & Media Engines**:

  * Google GenAI & GenAI SDKs for prompt-based content
  * Replicate – video generation via `veo2`
  * Flash 2.5 (experimental) – image generation
  * Bannerbear, Cloudinary, FFMPEG – image/video processing
  * Twilio – voice agents and campaign calls
  * Resend – email delivery
* **Data Storage/Processing**:

  * PostgreSQL (Prisma & migrations)
  * Redis & Upstash – rate limiting, queues (BullMQ)
  * Qdrant – embeddings & vector similarity
  * CSV parsing, PDF & docx extraction utilities
* **Infrastructure**: Docker + Docker-Compose for full stack deployment

---

## 📁 Repository Structure

```
/actions       → Backend logic for email/video/voice/prompts  
/app/api       → Next.js API routes for auth, content, media, analytics  
/app/*         → Frontend pages and components for each feature (dashboard, video studio, email, voice)  
/lib & prisma  → Shared utilities, db schema, Elasticsearch-type search, embeddings  
/model-voice   → Python service for phone-call voice agents  
public/        → Assets (images, video samples, upload previews)  
Docker setups  → docker-compose.yml and Dockerfile configs for seamless deployment  
```

---

## 🎯 Screenshots 🎯
### Landing Page 
![image](https://github.com/user-attachments/assets/05f6cc58-6df1-4bbc-bcad-92922f9c747d)

### Authentication
![image](https://github.com/user-attachments/assets/c5f3f4b9-a134-4e7a-810e-ccd71ebf3134)

### Onboarding
![image](https://github.com/user-attachments/assets/4102dff7-ea92-42ec-8cad-ffb90dce33b0)
![image](https://github.com/user-attachments/assets/38101493-e016-49b5-8af2-2f4cf48a0e5f)
![image](https://github.com/user-attachments/assets/d0dad3fd-6e16-4327-a94d-7c1f79675450)

### Dashboard
![image](https://github.com/user-attachments/assets/4ee3635b-04dd-4337-b6ee-20d45fdeb234)
![image](https://github.com/user-attachments/assets/50ca56a1-1882-489e-91bc-58a6c251389b)
![image](https://github.com/user-attachments/assets/de9d0f34-8310-41cd-aadb-a7ca8e216d30)
![image](https://github.com/user-attachments/assets/074950bb-eae4-4c80-bb37-1d4e8526366f)
![image](https://github.com/user-attachments/assets/bf71a4ff-326b-45a5-9aea-823d15a3a6d7)
![image](https://github.com/user-attachments/assets/a85e33de-4310-4fae-bbf1-f62fe8d56842)
![image](https://github.com/user-attachments/assets/0790e0e8-58e9-4a5f-9bd5-30dc178df4cd)

### Profile
![image](https://github.com/user-attachments/assets/89e95f9e-c7e2-45c5-80c0-69542f280b53)



---

## 🚀 How to Run Locally

1. Clone repo & copy `.env.example` to `.env`, fill secrets.
2. `docker-compose up --build`
3. `yarn dev` (for local development)
4. Visit `http://localhost:3000` — onboard a sample brand, upload a product image, test video & email/voice campaigns, check dashboard metrics.

---

## ✅ Why It Matters

* **Productivity for startups**: No need to stitch together multiple tools—FlowAI does it end-to-end with AI at each touchpoint.
* **Scalable architecture**: Modular actions structure, Next.js APIs, and async processing make adding new channels (e.g., social, chatbots) trivial.
* **Future-ready engines**: Written to swap in stronger GenAI models or pipelines easily without rewriting frontend.
