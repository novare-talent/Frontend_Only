# Novare Talent — Platform README

> **Two products. One mission: connect the top 1% of talent with the right companies.**

```
                          ┌─────────────────────────────────┐
                          │        NOVARE TALENT             │
                          │     novaretalent.com             │
                          └────────────┬────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                        │
          ┌────────▼────────┐                    ┌─────────▼────────┐
          │    ZENHYRE       │                    │     SIGHIRE      │
          │  Talent Portal   │                    │  AI Hiring Suite │
          │  /client         │                    │  /sig-hire       │
          │  /Dashboard      │                    │                  │
          └──────────────────┘                    └──────────────────┘
```

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Product: Zenhyre](#product-zenhyre)
- [Product: Sighire](#product-sighire)
- [Authentication & Roles](#authentication--roles)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Backend Services](#backend-services)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Getting Started](#getting-started)

---

## Platform Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         PLATFORM AT A GLANCE                           │
├─────────────────────────┬──────────────────────────────────────────────┤
│  Framework              │  Next.js 15.0.5 (App Router + Turbopack)     │
│  Language               │  TypeScript 5                                │
│  React                  │  v19.2.1                                     │
│  Database               │  Supabase (PostgreSQL + Auth + Storage)      │
│  Hosting                │  Vercel                                      │
│  Email                  │  Resend (zenhyre@novaretalent.com)           │
│  Payments               │  Cashfree (via novare-payments microservice) │
│  AI                     │  OpenAI GPT + Google Gemini                  │
├─────────────────────────┴──────────────────────────────────────────────┤
│  500+ Candidates Screened  │  50+ Companies  │  48hr Matching           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core
```
Next.js 15 ──── App Router, Server Components, Server Actions
React 19 ─────── Concurrent features, useOptimistic
TypeScript 5 ─── Strict mode
Tailwind CSS 4 ─ PostCSS 4, CSS variables, dark mode
```

### UI & Components
```
UI Layer
├── Shadcn/UI ──────── 36 Radix-based primitives
├── HeroUI 2.8.5 ───── Enterprise component library
├── Framer Motion 12 ── Page transitions, micro-animations
├── GSAP 3.14 ──────── Timeline animations
├── Three.js 0.183 ─── 3D graphics & backgrounds
├── Spline React 4 ─── Embedded 3D models
└── Lottie React 2 ─── JSON-based animations
```

### Forms & Validation
```
React Hook Form 7.62 + Zod 4.0.17 + @hookform/resolvers
```

### Database & Auth
```
Supabase Stack
├── @supabase/supabase-js 2.55 ── Core client
├── @supabase/ssr 0.6.1 ───────── SSR cookie session
├── @supabase/auth-helpers-nextjs ─ Next.js helpers
├── JWT (jsonwebtoken 9.0.2)
└── bcryptjs 3.0.2
```

### AI & PDF
```
AI
├── OpenAI 6.15 ──────── GPT (evaluation, form generation)
└── Google GenAI 0.24 ── Gemini

PDF
├── pdfjs-dist 3.11 ─── PDF rendering
├── react-pdf 10.3 ──── PDF components
├── pdf-parse 2.4 ────── Text extraction
└── pdf2json 4.0 ─────── JSON conversion
```

### Charts & Tables
```
Recharts 2.15.4 ─────── Analytics charts
@tanstack/react-table 8 ─ Data tables
```

### Drag & Drop
```
@dnd-kit/core 6.3
@dnd-kit/sortable 10.0
@dnd-kit/modifiers 9.0
@dnd-kit/utilities 3.2
```

### Notifications & Feedback
```
Sonner 2.0.7 ─────── Toast notifications
SweetAlert2 11.26 ── Modal dialogs
React Hot Toast 2.5 ─ Inline toasts
Driver.js 1.4.0 ──── Guided tours (onboarding)
```

### Email
```
Resend 6.12 + @react-email/components 0.4
```

---

## Project Structure

```
Frontend_Only/
│
├── app/                          ← Next.js App Router root
│   ├── (auth)/                   ← Auth group (no layout)
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── forgot-password/
│   │
│   ├── api/                      ← API Routes (17 endpoints)
│   │   ├── assignment/
│   │   ├── assignment-proxy/
│   │   ├── consume-job/
│   │   ├── consume-evaluation/
│   │   ├── credits/
│   │   ├── evaluate/
│   │   ├── evaluate-proxy/
│   │   ├── form-proxy/
│   │   ├── generate-form/
│   │   ├── migrate-jobs-status/
│   │   ├── payment-proxy/        ← Cashfree payment proxy
│   │   ├── profiles/
│   │   ├── ranking-proxy/
│   │   ├── send-rejection-emails/
│   │   ├── sighire-proxy/
│   │   └── submission/
│   │
│   ├── admin/                    ← Admin dashboard
│   ├── client/                   ← Zenhyre: Recruiter dashboard
│   ├── Dashboard/                ← Zenhyre: Candidate dashboard
│   ├── sig-hire/                 ← Sighire product
│   ├── submission/               ← Candidate submission flow
│   ├── iit-placements/           ← Public placement data
│   ├── auth/                     ← Auth callbacks
│   ├── actions/                  ← Server Actions (service layer)
│   │   └── services/             ← auth, candidates, jobs, assignments
│   ├── layout.tsx                ← Root layout
│   └── page.tsx                  ← Landing page
│
├── components/
│   ├── Admin-Dashboard/
│   ├── Client-Dashboard/         ← Zenhyre recruiter UI
│   ├── Candidate-Dashboard/      ← Zenhyre candidate UI
│   ├── Sig-Hire/                 ← Sighire UI
│   │   └── home/                 ← Sighire landing
│   ├── authForms/
│   ├── landing/                  ← Main landing page
│   │   ├── effects/              ← AuroraMesh, Particles, GlowOrb
│   │   ├── sections/             ← Hero, Zenhyre, FAQs, Testimonials
│   │   └── ui/                   ← GlassCard, GlowButton, Marquee
│   ├── placements/               ← IIT placement tables
│   └── ui/                       ← Shadcn primitives (36 files)
│
├── context/
│   ├── SessionContext.tsx         ← Sighire active session
│   └── MultiSessionContext.tsx    ← Session list + DB queries
│
├── hooks/
│   ├── useAuthRedirect.ts         ← Role-based redirect
│   ├── useDriverGuide.ts          ← Driver.js tour state
│   ├── useMousePosition.tsx       ← Parallax mouse tracking
│   └── use-mobile.ts              ← Responsive breakpoints
│
├── lib/
│   ├── ranking-api.ts             ← Ranking backend client
│   ├── supabase-rankings.ts       ← Ranking DB queries
│   ├── driver-config.ts           ← All tour step configs
│   ├── constants.ts               ← Testimonials, FAQs, nav links
│   └── utils.ts                   ← cn() and helpers
│
├── utils/supabase/
│   ├── client.ts                  ← createBrowserClient()
│   ├── server.ts                  ← createServerClient() + cookies
│   └── middleware.ts              ← Session refresh middleware
│
├── migrations/
│   ├── 001_create_sighire_sessions_table.sql
│   ├── 002_add_session_id_to_assignments.sql
│   └── 003_add_rejection_emails_sent_to_jobs.sql
│
├── middleware.ts                   ← Edge middleware (auth guards)
├── next.config.ts                  ← Image opt, security headers, caching
├── tailwind.config.js
└── tsconfig.json
```

---

## Product: Zenhyre

```
┌─────────────────────────────────────────────────────────────────┐
│                          ZENHYRE                                 │
│            AI-Curated Talent Portal for Elite Hiring             │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────▼──────┐               ┌──────▼──────┐
   │  RECRUITERS  │               │  STUDENTS   │
   │  /client/*   │               │ /Dashboard/* │
   └──────────────┘               └─────────────┘
```

### Recruiter Flow (`/client`)

```
Recruiter Journey
│
├── 1. Sign Up / Sign In ──── role: "recruiter"
│
├── 2. Billing (/client/billing)
│   ├── Buy job credits ─────── ₹5000 base + 18% GST = ₹5900/job
│   ├── Payment via Cashfree
│   ├── Credits stored in subscriptions table
│   └── Optional GST number for tax invoices
│
├── 3. Create Job (/client/create-job)
│   ├── Job title, type, experience, location
│   ├── Stipend, duration, tags, description
│   ├── Upload JD PDF (max 5MB, drag & drop)
│   └── Consumes 1 job credit on publish
│
├── 4. Manage Jobs (/client)
│   ├── View all posted jobs
│   ├── Edit job (/client/edit/[id])
│   └── Status tracking
│
├── 5. Review Candidates (/client/jobs/[id]/candidates)
│   ├── Browse applicants per job
│   ├── View candidate profiles
│   └── Shortlist candidates
│
├── 6. Evaluate (/client/evaluate/[id])
│   ├── Multi-stage evaluation
│   ├── Technical + cultural assessment
│   └── Consumes 1 evaluation credit
│
└── 7. Responses (/client/responses/[id])
    ├── View all applications
    ├── Per-candidate deep dive (/client/responses/[id]/[profileId])
    └── Send rejection emails (Resend + Novare Talent branding)
```

#### Key Components (Recruiter)
```
Client-Dashboard/
├── billing-page.tsx ──── Credits, GST, Cashfree payment flow
├── Job-Form.tsx ─────── Zod-validated job creation
├── job-form-preview.tsx ─ Live job card preview
├── job-create-form.tsx ── Multi-step form with PDF upload
├── ClientJobsList.tsx ─── Jobs grid with status badges
├── CreateJobButton.tsx ── Credit check before allowing creation
├── app-sidebar.tsx ───── Navigation sidebar
└── TrainingCard.tsx ───── Training resource cards
```

---

### Candidate Flow (`/Dashboard`)

```
Candidate Journey
│
├── 1. Sign Up ──── role: "student" (free, always)
│
├── 2. Dashboard (/Dashboard)
│   ├── Job grid overview
│   ├── Application status
│   └── Activity charts (Recharts)
│
├── 3. Browse Jobs (/Dashboard/Jobs)
│   ├── Available openings
│   ├── Filter by type, location, stipend
│   └── Job detail page (/Dashboard/Jobs/[id])
│
├── 4. Apply (/submission)
│   ├── Application form (multi-step)
│   ├── Radio + text questions
│   └── Success page (/submission/success)
│
├── 5. Training (/Dashboard/Training)
│   └── Skill-building resources
│
└── 6. Account (/Dashboard/Account)
    └── Profile management
```

#### Key Components (Candidate)
```
Candidate-Dashboard/
├── DashboardGrid.tsx ────── Job card grid layout
├── job-cards.tsx ─────────── Individual job cards
├── emp-table.tsx ─────────── Employment history table
├── section-cards.tsx ─────── Stats overview cards
├── chart-area-interactive.tsx ─ Activity analytics
├── RadioQuestion.tsx ─────── MCQ application questions
└── TextQuestion.tsx ──────── Open-text questions
```

---

### Admin Flow (`/admin`)

```
Admin Capabilities
├── Full job management (create, edit, delete)
├── User management (/admin/users, /admin/users/[id])
├── Evaluate all candidates (/admin/evaluate)
├── View all responses (/admin/responses)
└── Sidebar navigation with full platform access
```

---

## Product: Sighire

```
┌─────────────────────────────────────────────────────────────────────┐
│                            SIGHIRE                                   │
│         AI-Powered Assignment, Ranking & Evaluation Suite            │
└──────────────────────────────────────────────────────────────────────┘

WORKFLOW (7 Stages)
─────────────────
    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ SESSIONS │────▶│ UPLOADS  │────▶│ RANKINGS │────▶│ASSIGNMENTS│
    │/sessions │     │/uploads  │     │/rankings │     │/assignments│
    └──────────┘     └──────────┘     └──────────┘     └─────┬─────┘
                                                              │
    ┌──────────┐     ┌──────────┐     ┌──────────┐           │
    │ INSIGHTS │◀────│EVALUATIONS◀────│SUBMISSIONS│◀──────────┘
    │/insights │     │/evaluations│   │/submission│
    └──────────┘     └──────────┘     └──────────┘
```

### Stage-by-Stage Breakdown

**Stage 1 — Sessions (`/sig-hire/sessions`)**
```
├── Create new hiring session (job + batch of candidates)
├── View all active sessions
├── Session status: initialized → processing → ready → failed
└── SessionContext: persisted in localStorage (300ms debounce)
```

**Stage 2 — Uploads (`/sig-hire/uploads`)**
```
├── Upload Job Description (PDF)
├── Upload Candidate List (CSV)
├── Stored in Supabase Storage bucket
└── Triggers backend ranking pipeline
```

**Stage 3 — Rankings (`/sig-hire/rankings`)**
```
├── AI scores candidates against JD
├── Score-based ranked list
├── Advanced query filters (queries-management.tsx)
├── Select candidates to proceed
└── Data from rankings_sighire table
```

**Stage 4 — Assignments (`/sig-hire/assignments`)**
```
├── Auto-generate assignments per candidate (OpenAI/Gemini)
├── Bulk send via assignments-sender.tsx
├── Assignment PDF stored in Supabase Storage
├── Track sent/pending/submitted status
└── assignments table with session_id
```

**Stage 5 — Submissions (`/sig-hire/submission`)**
```
├── Public-facing submission page (no auth required)
├── Candidate uploads completed assignment
├── File stored in Supabase Storage
└── Submission status updated in DB
```

**Stage 6 — Evaluations (`/sig-hire/evaluations`)**
```
├── Review submitted assignments
├── AI-assisted evaluation scoring
├── Evaluations table with filtering
└── Scores stored per candidate
```

**Stage 7 — Insights (`/sig-hire/insights`)**
```
├── Session-level analytics
├── Completion rates, score distributions
└── Export/reporting
```

### Key Components (Sighire)
```
Sig-Hire/
├── auth-guard.tsx ──────────── Route protection wrapper
├── navbar.tsx / footer.tsx
├── PageHeader.tsx
├── loading-overlay.tsx
├── ChromeButton.tsx ────────── Chrome extension CTA
├── upload-cards.tsx ────────── JD + CSV upload UI
├── workflow-stepper.tsx ─────── Progress indicator
├── assignment-cards.tsx ─────── Assignment display
├── assignments-sender.tsx ───── Bulk send UI
├── evaluations-table.tsx ─────── Eval list + scoring
├── rankings-screen.tsx ──────── Ranked candidate list
├── candidate-rankings.tsx ────── Individual ranking cards
├── selected-candidates.tsx ───── Selection manager
├── queries-management.tsx ────── Filter builder
└── query-filters.tsx ─────────── Filter UI controls
```

### Context Layer (Sighire)
```
SessionContext.tsx
├── sessionId: string | null
├── clientId: string | null
├── isLoading: boolean
└── localStorage key: `sighire_session_${userId}`

MultiSessionContext.tsx
├── sessions: Session[]
├── addSession(jobName, jobDesc) → DB insert
├── loadSessions(userId) → DB query
└── Joins: jobs + assignments + rankings tables
```

---

## Authentication & Roles

```
Auth Flow
─────────
Browser ──▶ middleware.ts (Edge) ──▶ utils/supabase/middleware.ts
                │
                ├── Public routes: pass through
                │   └── /, /sign-in, /sign-up, /sig-hire, /iit-placements
                │
                └── Protected routes: check session
                    ├── No session → redirect /sign-in
                    └── Has session → getUserRole() → route to dashboard

Role Routing
────────────
role = "recruiter"  →  /client
role = "student"    →  /Dashboard
role = "admin"      →  /admin
(no role)           →  /sig-hire (Sighire is role-agnostic)
```

### Supabase Auth Methods
```
auth.service.ts
├── signUp(email, password, metadata)
├── signIn(email, password)
├── signOut()
├── getCurrentUser() → User | null
├── sendPasswordResetEmail(email)
├── updateUserPassword(newPassword)
└── getRole() → "recruiter" | "student" | "admin"
```

### Session Persistence
```
SSR via @supabase/ssr
├── cookies() from next/headers (Server Components)
├── createBrowserClient() (Client Components)
└── Session refresh on every request (middleware)
```

---

## Database Schema

```
Supabase PostgreSQL
───────────────────

┌──────────────────┐       ┌────────────────────────┐
│    profiles      │       │     subscriptions       │
├──────────────────┤       ├────────────────────────┤
│ id (uuid) PK     │──┐    │ id (uuid) PK            │
│ first_name       │  └───▶│ profile_id (fk)         │
│ last_name        │       │ status (text)           │
│ email            │       │ jobs_remaining (int4)   │
│ phone            │       │ evaluations_remaining   │
│ role             │       │ gst_number (text)       │
│ created_at       │       │ created_at              │
└──────────────────┘       └────────────────────────┘

┌──────────────────┐       ┌────────────────────────┐
│      jobs        │       │       responses         │
├──────────────────┤       ├────────────────────────┤
│ id (uuid) PK     │       │ id (uuid) PK            │
│ job_name         │       │ job_id (fk → jobs)      │
│ job_description  │       │ candidate_id (fk)       │
│ JD_pdf (url)     │       │ form_data (jsonb)       │
│ employer_id (fk) │       │ submitted_at            │
│ status           │       └────────────────────────┘
│ rejection_emails_│
│ sent (bool)      │
└──────────────────┘

┌──────────────────────────┐   ┌──────────────────────────┐
│    sighire_sessions       │   │       assignments         │
├──────────────────────────┤   ├──────────────────────────┤
│ id (uuid) PK              │   │ id (uuid) PK              │
│ client_id (fk)            │   │ job_id (fk → jobs)        │
│ job_name                  │   │ candidate_id              │
│ job_description           │   │ session_id (fk)  ◀── M002 │
│ status                    │   │ assignment_json (jsonb)   │
│ ranking_results (jsonb)   │   │ assignment_pdf_url        │
│ evaluation_results (jsonb)│   │ submitted_at              │
│ created_at                │   │ submission_url            │
└───────────────────────────┘   └──────────────────────────┘

┌────────────────────────────┐  ┌────────────────────────────┐
│    candidate_mappings       │  │      rankings_sighire       │
├────────────────────────────┤  ├────────────────────────────┤
│ id (uuid) PK                │  │ id (uuid) PK                │
│ candidate_id                │  │ session_id (fk)             │
│ ranking_cid                 │  │ candidate_id                │
│ job_id (fk)                 │  │ score (float)               │
│ name, email                 │  │ rank (int)                  │
└─────────────────────────────┘  │ metadata (jsonb)            │
                                  └─────────────────────────────┘

Storage Buckets
├── jd/          ← Job description PDFs
└── submissions/ ← Assignment submissions
```

### SQL Migrations
```
migrations/
├── 001_create_sighire_sessions_table.sql  ← Sessions table init
├── 002_add_session_id_to_assignments.sql  ← FK to sessions
└── 003_add_rejection_emails_sent_to_jobs.sql ← Email tracking flag
```

---

## API Routes

### All Endpoints

```
/api
├── credits/                    GET   → jobs_remaining from subscriptions
├── consume-job/                POST  → decrement jobs_remaining
├── consume-evaluation/         POST  → decrement evaluations_remaining
├── profiles/                   GET   → fetch user profile
├── generate-form/              POST  → AI-generate evaluation form (OpenAI)
├── send-rejection-emails/      POST  → bulk Resend email to candidates
├── migrate-jobs-status/        POST  → backfill job status field
│
├── evaluate/
│   └── [job_id]/[candidate_id] POST  → run candidate evaluation
│
├── assignment/
│   └── create/[jobId]/         POST  → generate + store assignment
│
├── submission/
│   └── upload/                 POST  → store candidate submission file
│
└── [proxy routes] ─── All forward path + query string to backend services
    ├── payment-proxy/[...path]    → https://payments.novaretalent.com
    ├── ranking-proxy/[...path]    → ranking backend
    ├── evaluate-proxy/[...path]   → evaluation backend
    ├── sighire-proxy/[...path]    → sighire backend
    ├── form-proxy/[...path]       → form backend
    └── assignment-proxy/[...path] → assignment backend
```

### Proxy Design Pattern
```typescript
// All proxies forward path + query string to respective backend
function buildBackendUrl(request: Request, pathStr: string): string {
  const { search } = new URL(request.url);
  return `https://<backend-host>/${pathStr}${search}`;
}
// Supports: GET, POST, PUT, PATCH, DELETE
// Forwards: Content-Type, body (JSON / FormData / binary)
```

---

## Backend Services

```
External Microservices (all on EC2)
────────────────────────────────────

┌────────────────────────────────────────────────────────────────┐
│  novare-payments  (Docker: novare-payments:local)              │
│  Port: 8001 → 8000 internally                                  │
│  Runtime: Python FastAPI + Uvicorn                             │
│  Proxy: /api/payment-proxy → payments.novaretalent.com         │
│                                                                │
│  Endpoints:                                                    │
│  POST /start-payment/{profile_id}?jobs=N                       │
│    └── Creates Cashfree payment link                           │
│    └── Amount = AMOUNT_PER_JOB × N  (env: AMOUNT=5900)        │
│    └── Stores profile_id + jobs in link_notes                  │
│                                                                │
│  POST /webhook/cashfree                                        │
│    └── Verifies Cashfree HMAC-SHA256 signature                 │
│    └── Calls verify_payment_with_cashfree()                    │
│    └── On PAID: creates subscription row in Supabase          │
│    └── Idempotency: in-memory processed_webhooks map          │
│                                                                │
│  GET /health  │  GET /                                         │
│                                                                │
│  Env vars: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE  │
│            CASHFREE_URL, CASHFREE_CLIENT_ID, CLIENT_SECRET     │
│            WEBHOOK_BASE_URL, AMOUNT                            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  novare-backend  (Docker: kanishk2kumar/novare-backend:latest) │
│  Port: 8000 → 8000 internally                                  │
│  Runtime: Python Gunicorn                                      │
└────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# OpenAI
OPENAI_API_KEY=sk-proj-[key]

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=[key]

# Email (Resend)
RESEND_API_KEY=re_[key]
RESEND_FROM_EMAIL=zenhyre@novaretalent.com

# Site
NEXT_PUBLIC_SITE_URL=https://novaretalent.com

# Backend API (proxied through Next.js)
NEXT_PUBLIC_RANKING_API_URL=/api/ranking-proxy
```

---

## Deployment

### Frontend (Vercel)
```
next.config.ts highlights
│
├── Image Optimization
│   ├── formats: ['image/avif', 'image/webp']
│   ├── deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2560, 3840]
│   └── minimumCacheTTL: 60
│
├── Security Headers (applied to all routes)
│   ├── Strict-Transport-Security (HSTS, max-age=63072000)
│   ├── X-Frame-Options: SAMEORIGIN
│   ├── X-Content-Type-Options: nosniff
│   ├── X-XSS-Protection: 1; mode=block
│   └── Permissions-Policy: camera=(), microphone=(), geolocation=()
│
├── Performance
│   ├── console removal in production
│   ├── optimizePackageImports: [lucide-react, framer-motion, ...]
│   ├── Static assets: Cache-Control max-age=31536000 immutable
│   └── API routes: public max-age=60, stale-while-revalidate=120
│
└── Dev: npm run dev (Turbopack)  │  Prod: npm run build && npm start
```

### Backend (EC2 Docker)
```bash
# novare-payments container
docker run -d \
  --name novare-payments \
  --entrypoint uvicorn \
  -p 8001:8000 \
  --restart unless-stopped \
  -e AMOUNT=5900 \
  [... other env vars] \
  novare-payments:local \
  main:app --host 0.0.0.0 --port 8000

# novare-backend container
docker run -d \
  --name novare-backend \
  -p 8000:8000 \
  kanishk2kumar/novare-backend:latest
```

---

## Getting Started

### Prerequisites
```
Node.js >= 18
npm >= 9
Supabase project (with tables created via migrations/)
```

### Installation
```bash
git clone https://github.com/novare-talent/Frontend_Only.git
cd Frontend_Only
npm install
```

### Environment Setup
```bash
cp .env.example .env.local
# Fill in Supabase, OpenAI, Resend, and other keys
```

### Database Setup
```bash
# Run migrations in order in Supabase SQL Editor
psql -f migrations/001_create_sighire_sessions_table.sql
psql -f migrations/002_add_session_id_to_assignments.sql
psql -f migrations/003_add_rejection_emails_sent_to_jobs.sql

# Add GST number column to subscriptions
ALTER TABLE subscriptions ADD COLUMN gst_number TEXT;
```

### Development
```bash
npm run dev        # Starts on http://localhost:3000 with Turbopack
npm run build      # Production build
npm run lint       # ESLint check
```

---

## Guided Tours (Driver.js)

All major pages have an interactive onboarding tour:

```
Page                    Tour Elements
──────────────────────────────────────
/sig-hire/sessions      Session cards, create button
/sig-hire/uploads       JD upload, CSV upload
/sig-hire/rankings      Rankings table, filter bar
/sig-hire/assignments   Assignment cards, send button
/sig-hire/evaluations   Evaluation table, scoring
/sig-hire/insights      Analytics widgets
/client/billing         Job input, price card, GST field
```
- Tour state stored in `localStorage` per user — won't repeat
- Manual re-trigger via help button on each page
- Config centralized in `lib/driver-config.ts`

---

## Social Proof & Team

```
Platform Stats
─────────────
500+ Candidates Screened  │  50+ Companies Served
48hr Average Match Time   │  95% Client Satisfaction
Top 1% Talent Pool        │  IITs · IIMs · BITS · IISc

Founding Team (IIT Bombay)
──────────────────────────
Sahil Sheoran ──── Co-Founder & CEO
Ayush Awatade ──── Co-Founder & CTO
Sanat Agrawal ───── Founding Engineer
Sankalp Bhitkar ─── Head of Creatives
```

---

*Built by the Novare Talent team — IIT Bombay*
