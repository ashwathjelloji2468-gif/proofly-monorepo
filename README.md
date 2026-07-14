# ✦ Proofly

> Elevate customer trust with the ultimate AI-powered social proof and testimonial collection platform.

Proofly is a premium, developer-first platform designed to bridge the gap between customer appreciation and conversions. Collect video and text testimonials natively, curate submissions with AI sentiment analysis, and embed stunning, interactive Walls of Love on any website in under 5 minutes.

---

## ⚡ Core Architecture

Proofly is built as a monorepo containing a high-performance Express/GraphQL API backend and a state-of-the-art Next.js frontend application.

```mermaid
graph TD
    User[Client Browser] -->|Next.js App Router| FE[Frontend App]
    FE -->|GraphQL & REST API| BE[Express Backend]
    BE -->|Prisma Client| DB[(PostgreSQL Database)]
    BE -->|SMTP / SMTP Relay| Mail[Resend Email Service]
    BE -->|Stripe API| Stripe[Stripe Billing Pipeline]
```

---

## 🎨 Premium Key Features

### 🎥 Native Webcam Recorder
*   Lightweight streaming webcam interface running natively in modern mobile and desktop browsers with no external app dependencies.
*   Supports video file uploads with smart resolution and size limit validation.

### 🛡️ Enterprise Passwordless Sign-In
*   Seamless security using modern passwordless one-time passcodes (OTP).
*   Automatic sandbox fallback: displays the verification code directly in the UI if unverified email clients are used.

### ⚙️ Liquid Layout Showcase Widgets
*   Renders responsive testimonial widgets including **Masonry**, **Grid**, and swipeable **Carousel** layouts.
*   Features interactive Apple-like 3D card tilt and hover spotlight animation effects.

### 🧠 Semantic AI Insights
*   Automated review transcription summaries and sentiment analysis.
*   Extracted keywords and pre-composed social media drafts (Twitter threads / LinkedIn posts) generated instantly.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router), Zustand, TailwindCSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, Apollo Server (GraphQL), JSON Web Tokens (JWT) |
| **Database** | PostgreSQL, Prisma ORM, Redis Cache |
| **Infrastructure** | Resend API, Stripe, Docker, Sentry Monitoring |

---

## 🚀 Quick Start Guide

### Prerequisites
*   Node.js (v20+ recommended)
*   PostgreSQL Database instance

---

### 1. Setting Up the Backend

```bash
cd backend
```

Create a `.env` file matching this template:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/proofly?schema=public"
PORT=4000
JWT_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
COOKIE_SECRET="your-cookie-secret"
RESEND_API_KEY="re_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Install dependencies, migrate the schema, and boot the server:

```bash
npm install
npx prisma db push
npm run dev
```

The API will list on `http://localhost:4000/graphql` and `http://localhost:4000/api/v1`.

---

### 2. Setting Up the Frontend

```bash
cd ../frontend
```

Create a `.env` file matching this template:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:4000"
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:4000/graphql"
NEXT_PUBLIC_CLIENT_URL="http://localhost:3000"
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Visit the application at `http://localhost:3000`.

---

## 🐳 Docker Deployment

Proofly includes a production-ready Docker configuration. Build and orchestrate both services using Compose:

```bash
docker-compose up --build
```

---

## 🔒 Security & Optimization

*   **HttpOnly Cookies**: Sessions are securely saved via signed, secure cookies to mitigate XSS vulnerabilities.
*   **Rate Limiting**: Automated protection limits OTP generation rates to prevent abuse.
*   **Static Search Performance**: Integrated dynamically-generated sitemaps (`sitemap.xml`) and web crawler rules (`robots.txt`) for maximized indexation.

---

<div align="center">
  <p>Crafted with care for developers who value speed, beauty, and conversions.</p>
</div>
