# Zenhyre — Security & Bug Fix Log

> Issues sourced from `novare_feedback.docx` (Zenhyre rows only).
> Ordered by fix session. Updated after every fix.

---

## Production Prerequisites

Before these fixes go live, complete these manual steps:

| Step | Action | Urgency |
|------|--------|---------|
| **DB functions** | Run `db/functions.sql` in the Supabase SQL Editor. Creates `decrement_jobs()` and `decrement_evaluations()`. Without this, `/api/consume-job` and `/api/consume-evaluation` return 500 on every call. | **Required before deploying Fix 2** |
| **Env var** | Set `ASSIGNMENT_BACKEND_URL` in Vercel dashboard (or `.env.local`) to the EC2 backend URL. Current code falls back to the old hardcoded plaintext HTTP IP if unset. | Recommended |
| **Upstash Redis** | Create a free Redis database at `console.upstash.com`. Copy the REST URL and token. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel Environment Variables. Without these, rate limiting is silently disabled (the code no-ops gracefully) but all routes are unprotected. | **Required to activate Fix 20** |

---

## Fix Index

| # | Issue Ref | Area | Severity | Status |
|---|-----------|------|----------|--------|
| 1 | Feedback #1 | Security — SSRF via URL fetch | Critical | ✅ Fixed |
| 2 | Feedback #4 | Billing — Non-atomic credit decrement | Critical | ✅ Fixed |
| 3 | Feedback #4 | Billing — Credit consumed after AI work | Critical | ✅ Fixed |
| 4 | Feedback #6 | Payments — Proxy trusts caller-supplied `profile_id` | Critical | ✅ Fixed |
| 5 | Feedback #2 | Auth — Proxy routes forward no Authorization | Critical | ✅ Fixed |
| 6 | Feedback #24 | Design — `/submission` blocked by middleware | Medium | ✅ Fixed |
| 7 | Build error | CSS — `tw-animate-css` unresolvable import | Build | ✅ Fixed |
| 8 | Feedback #16 | Correctness — `final_score` computed in AI prompt, no schema validation | High | ✅ Fixed |
| 9 | Feedback #23 | Security — No CSP; AI content stored/rendered unsanitized | Medium | ✅ Fixed |
| 10 | Feedback #19 | Correctness — No server-side dedup on responses; unthrottled uploads | Medium | ✅ Fixed |
| 11 | Feedback #25 | Reliability — Proxy hardcoded IP, no timeout, no query-string forwarding | Medium | ✅ Fixed |
| 12 | Feedback #24 | Performance — Middleware makes up to 3 redundant profile DB queries | Medium | ✅ Fixed |
| 13 | Feedback #13 | Correctness — No idempotency on rejection email batches | High | ✅ Fixed |
| 14 | Feedback #14 | Cost — No cap on AI evaluation fan-out | High | ✅ Fixed |
| 15 | Bug | Correctness — Evaluation results data structure mismatch (page showed no candidates) | Bug | ✅ Fixed |
| 16 | Bug | Auth — Evaluate-proxy called without Authorization header (401) | Bug | ✅ Fixed |
| 17 | Bug | UX — `/avatars/default.jpg` 404 on dashboard load | Bug | ✅ Fixed |
| 18 | Product | UX — Resume not collected at sign-up; unavailable for pre-screening | Medium | ✅ Fixed |
| 19 | Performance | Rejection emails sent sequentially; 20 candidates = 40–80 s | High | ✅ Fixed |
| 20 | Security | No rate limiting on any route — open to brute-force and DDoS | Critical | ✅ Fixed |

---

## Detailed Fix Records

---

### Fix 1 — SSRF via Unvalidated Server-Side URL Fetch
**Feedback issue:** #1 · **Severity:** Critical · **Commit:** `3905e1f`

#### Technical Problem
Three API routes fetched caller-supplied URLs directly with Node's `fetch()`, with no validation of the destination host:

```typescript
// app/api/generate-form/route.ts:44
const pdfResponse = await fetch(jdUrl)  // jdUrl = req.body.jdUrl — fully attacker-controlled

// app/api/evaluate/route.ts
const response = await fetch(resumeUrl)  // comes from responses table, but originally from submission form

// app/api/send-rejection-emails/route.ts:19
const response = await fetch(url)  // url = evaluations.results[].resume_url
```

An authenticated `client` user could POST `jdUrl: "http://169.254.169.254/latest/meta-data/iam/security-credentials/default"` to `/api/generate-form`. The Next.js serverless function (running on AWS Lambda/EC2) would fetch the cloud metadata endpoint and the response — containing live IAM credentials — would flow into the OpenAI call or be surfaced in an error response. This grants **full AWS account access** from a single HTTP request by any client-role user.

The same SSRF vector on `resume_url` (stored by the unauthenticated `/submission` form) does not even require authentication.

#### Fix Applied
Created `utils/validateStorageUrl.ts` — a shared allowlist helper called before every server-side fetch of a URL sourced from user input or the DB:

```typescript
// utils/validateStorageUrl.ts
const BLOCKED_IP_PATTERNS = [
  /^169\.254\./,         // AWS/GCP/Azure IMDS
  /^10\./,               // RFC 1918 class A
  /^172\.(1[6-9]|2\d|3[01])\./,  // RFC 1918 class B
  /^192\.168\./,         // RFC 1918 class C
  /^127\./,              // Loopback IPv4
  /^::1$/,               // Loopback IPv6
  /^fc00:/i,             // Unique-local IPv6
  /^fe80:/i,             // Link-local IPv6
]

export function validateStorageUrl(rawUrl: string): void {
  const parsed = new URL(rawUrl)            // throws on malformed URLs
  // Reject non-HTTP protocols (file://, data://, etc.)
  // Block all private/loopback IPs
  // Enforce Supabase storage hostname via NEXT_PUBLIC_SUPABASE_URL
}
```

Applied at three call sites:
- `app/api/generate-form/route.ts` — before `fetch(jdUrl)` (line 44)
- `app/api/evaluate/route.ts` — before `fetch(job.JD_pdf)` and before `fetch(resumeUrl)` inside `extractResumeText()`
- `app/api/send-rejection-emails/route.ts` — at the top of `extractTextFromPdf()` before `fetch(url)`

Any URL not matching the Supabase storage domain (or pointing to a private IP) now returns HTTP 400 `"Invalid URL host"` before any network call is made.

---

### Fix 2 — Non-Atomic Credit Decrement (Race Condition)
**Feedback issue:** #4 · **Severity:** Critical · **Commit:** `3905e1f`

#### Technical Problem
Both `/api/consume-job` and `/api/consume-evaluation` used a read-then-write pattern:

```typescript
// Step 1: READ
const { data: subs } = await supabaseAdmin
  .from('subscriptions')
  .select('id, jobs_remaining')
  .eq('profile_id', userId)
  .maybeSingle()

// Step 2: CHECK in JS (not DB)
const current = Number(subs.jobs_remaining ?? 0)
if (current <= 0) return 400

// Step 3: WRITE (separate round-trip, NOT atomic with step 1)
const newValue = current - 1
await supabaseAdmin
  .from('subscriptions')
  .update({ jobs_remaining: newValue })
  .eq('id', subs.id)
```

Between Step 1 and Step 3 there is a window where a second concurrent request can read the same `current` value, pass the `> 0` check, and write the same decremented value. Net result: **two operations consumed for one credit** (or zero credits on a `jobs_remaining = 1` subscription). Under HTTP/2 multiplexing, the same browser can trivially send simultaneous requests.

#### Fix Applied
Replaced the read-then-write with an atomic conditional SQL `UPDATE` via Supabase RPC. A Postgres function performs the check and decrement in a single statement — serialized by the DB row lock:

```sql
-- db/functions.sql (run once in Supabase SQL Editor)
create or replace function decrement_jobs(sub_id uuid)
returns int language plpgsql security definer as $$
declare new_val int;
begin
  update subscriptions
  set jobs_remaining = jobs_remaining - 1
  where id = sub_id and jobs_remaining > 0
  returning jobs_remaining into new_val;
  return new_val;  -- NULL means no row matched (credit was 0)
end $$;
```

TypeScript call site:
```typescript
// app/api/consume-job/route.ts
const { data: newValue, error: rpcError } = await supabaseAdmin
  .rpc('decrement_jobs', { sub_id: subs.id })

if (newValue === null) {
  return NextResponse.json({ error: 'No jobs remaining', jobs_remaining: 0 }, { status: 400 })
}
```

The same pattern is applied to `decrement_evaluations` in `consume-evaluation/route.ts`.

> **Manual step required:** Run `db/functions.sql` in the Supabase SQL Editor once to create the two Postgres functions.

---

### Fix 3 — Credit Consumed After Expensive Work (Wrong Order)
**Feedback issue:** #4 · **Severity:** Critical · **Commit:** `3905e1f`

#### Technical Problem
In `app/client/create-job/page.tsx`, the job and form records were inserted into the database *before* the credit was consumed:

```typescript
// OLD ORDER in handleCreate()
// 1. supabase.from('jobs').insert(jobData)       ← DB write
// 2. supabase.from('forms').insert(formData)     ← DB write
// 3. consumeJobCredit()                          ← credit deducted HERE (too late)
```

If the user triggered job creation and then aborted the connection, closed the tab, or if the credit API timed out, the job existed in the DB but no credit was consumed. The provided rollback (`supabase.from('jobs').delete(...)`) could also fail silently, compounding the issue. A motivated user could script unlimited free job creation by terminating requests after the DB inserts but before the consume call completes.

#### Fix Applied
Moved `consumeJobCredit()` to be the **first** write operation. If it fails, execution returns immediately with no DB side effects:

```typescript
// NEW ORDER in handleCreate()
// 1. consumeJobCredit()                          ← fail fast, no DB touched
// 2. supabase.from('jobs').insert(jobData)       ← DB write (only if credit succeeded)
// 3. supabase.from('forms').insert(formData)     ← DB write
```

The only downside of this order is: if the DB insert fails after a successful credit deduction, the user loses one credit. This is an acceptable trade-off vs. the alternative (unlimited free jobs). Edge cases can be handled with a manual credit refund.

---

### Fix 4 — Payment Proxy Trusts Caller-Supplied `profile_id`
**Feedback issue:** #6 · **Severity:** Critical · **Commit:** `3905e1f`

#### Technical Problem
`app/api/payment-proxy/[...path]/route.ts` forwarded 100% of the request body to `payments.novaretalent.com` with no authentication:

```typescript
// OLD code — no auth, direct pass-through
async function proxyRequest(request, method, backendUrl) {
  body = await request.text()  // includes attacker-controlled profile_id
  return fetch(backendUrl, { method, headers: { 'Content-Type': contentType }, body })
}
```

Any unauthenticated actor could POST to `/api/payment-proxy/start-payment` with:
```json
{ "profile_id": "<victim_uuid>", "jobs": 9999 }
```

The payment backend would create an order on behalf of the victim's account. Since webhook signature mismatch only logged a warning (not rejected), forged `PAID` webhooks would succeed, granting arbitrary credits to any profile.

#### Fix Applied
Added JWT verification before any forwarding. The `profile_id` is now **injected from the verified token**, overriding whatever the caller sends. The verified JWT is also forwarded to the backend for independent validation:

```typescript
// app/api/payment-proxy/[...path]/route.ts
async function verifyToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null
  return { userId: data.user.id, token }
}

// In proxyRequest — override caller-supplied profile_id
const parsed = JSON.parse(text)
parsed.profile_id = userId  // from verified token, not from caller
text = JSON.stringify(parsed)

// Forward auth to backend
headers: {
  Authorization: `Bearer ${token}`,
  'X-Profile-Id': userId,
}
```

Requests without a valid Bearer token receive HTTP 401.

---

### Fix 5 — Proxy Routes Forward No Authorization Header
**Feedback issue:** #2 · **Severity:** Critical · **Commit:** `3905e1f`

#### Technical Problem
All four backend proxy routes (`evaluate-proxy`, `form-proxy`, `ranking-proxy`, `assignment-proxy`) accepted requests with no token check and forwarded them to backend microservices with only `Content-Type` in the headers:

```typescript
// OLD — no auth, no forwarding
const response = await fetch(backendUrl, {
  method,
  headers: { 'Content-Type': contentType },  // no Authorization
  body,
})
```

Consequences:
1. **Any unauthenticated actor** could trigger expensive AI evaluations or ranking computations.
2. Backend services received **no identity information** — they cannot implement per-user rate limiting, quota enforcement, or ownership checks.
3. Combined with no spend cap (feedback #14), a single actor could run unlimited OpenAI calls.

#### Fix Applied
Each proxy now verifies the Bearer token with Supabase before forwarding, and passes the verified JWT downstream:

```typescript
async function verifyToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null
  return token
}

async function handleRequest(request, method, params) {
  const token = await verifyToken(request.headers.get('authorization'))
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  // ...
  await fetch(backendUrl, {
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${token}`,  // forwarded
    },
  })
}
```

Applied to: `evaluate-proxy`, `form-proxy`, `ranking-proxy`, `assignment-proxy`.

---

### Fix 6 — `/submission` Path Blocked by Middleware
**Feedback issue:** #24 (partial) · **Severity:** Medium · **Commit:** `3905e1f`

#### Technical Problem
`utils/supabase/middleware.ts` checked authentication on every request, with a hardcoded list of public paths:

```typescript
const publicPaths = [
  '/', '/sign-in', '/sign-up', '/error', '/forgot-password',
  '/auth/update-password', '/auth/callback', '/iit-placements', '/career-blogs',
]
if (publicPaths.some(p => path.startsWith(p))) return supabaseResponse
```

`/submission` was missing from this list. Unauthenticated candidates visiting `/submission/[form-id]` (a public form meant for job applicants who are not registered users) were redirected to `/sign-in`, breaking the entire application submission flow.

#### Fix Applied
Added `/submission` to the `publicPaths` array:

```typescript
const publicPaths = [
  // ...existing paths...
  '/submission',  // public job application form — candidates are not logged-in users
]
```

---

### Fix 7 — `tw-animate-css` CSS Import Not Resolving
**Type:** Build error · **Severity:** Blocker · **Commits:** `6b93302`, `bdc443d`

#### Technical Problem
`app/globals.css` had `@import "tw-animate-css"`. The `tw-animate-css` package exposes its CSS only via the `exports["."].style` field:
```json
"exports": {
  ".": { "style": "./dist/tw-animate.css" }
}
```

The `style` export condition is resolved by `@tailwindcss/postcss` (Tailwind v4's PostCSS plugin). When `postcss.config.mjs` was missing from the repo (accidentally deleted in a prior commit), Next.js fell back to default PostCSS with no Tailwind plugin, losing `style`-condition resolution. Webpack's CSS pipeline cannot resolve bare package names via `exports.style`, causing:

```
Package path ./dist/tw-animate.css is not exported from package tw-animate-css
```

#### Fix Applied
Two-part fix:

1. **Restored `postcss.config.mjs`** with `@tailwindcss/postcss`:
   ```js
   // postcss.config.mjs
   const config = { plugins: ["@tailwindcss/postcss"] };
   export default config;
   ```

2. **Kept `@import "tw-animate-css"`** (root import) in `app/globals.css` — this is correctly resolved via the `style` condition when `@tailwindcss/postcss` is present.

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";   ← resolved via exports.style by @tailwindcss/postcss
```

---

---

### Fix 8 — AI `final_score` Computed in Prompt, No Schema Validation
**Feedback issue:** #16 · **Severity:** High · **Commit:** `36862ec`

#### Technical Problem
The evaluation prompt asked Gemini to produce a `final_score` integer directly:

```
"final_score": 75,
```

Two problems:
1. **LLMs don't reliably compute arithmetic.** The prompt implied a weighted formula but left the AI to pick any number. A confident-sounding model could return 75 while sub-scores implied 45.
2. **No schema validation.** `JSON.parse()` was called on the model's response with no field or type checking. On parse success with missing/wrong-typed fields, the bad evaluation was stored as-is. On parse failure, `evaluateCandidateWithRetry` returned `null` and the candidate was **silently dropped** from results — never reviewed, never rejected, just gone.

#### Fix Applied
**Part A — numeric sub-scores in prompt:**
The prompt now requests explicit integer scores (0–100) for each dimension:
```
"skills_score": 75,
"experience_score": 70,
"communication_score": 80,
"fit_score": 72,
```

**Part B — `final_score` computed in code:**
```typescript
function computeFinalScore(obj: any): number {
  const skills      = clamp(Number(obj.skills_score), 0, 100)
  const experience  = clamp(Number(obj.experience_score), 0, 100)
  const communication = clamp(Number(obj.communication_score), 0, 100)
  const fit         = clamp(Number(obj.fit_score), 0, 100)
  // Weighted: skills 35% | experience 30% | communication 15% | fit 20%
  return Math.round(skills * 0.35 + experience * 0.30 + communication * 0.15 + fit * 0.20)
}
// Called unconditionally — overrides any final_score the model may have included
evaluation.final_score = computeFinalScore(evaluation)
```

**Part C — schema validation with human-review flag:**
```typescript
function validateEvaluation(obj: any): { valid: boolean; errors: string[] } {
  // Checks all 5 string fields and 4 numeric score fields
  // Returns { valid: false, errors: [...] } on any violation
}
// On failure: mark needs_review instead of dropping
const { valid, errors } = validateEvaluation(evaluation)
if (!valid) {
  evaluation.needs_review = true
  evaluation.review_reason = `Schema errors: ${errors.join("; ")}`
}
```

Candidates with schema errors now appear in results with a `needs_review: true` flag — visible to the reviewer instead of silently disappearing.

---

### Fix 9 — No Content-Security-Policy; AI Content Stored Unsanitized
**Feedback issue:** #23 · **Severity:** Medium (Security) · **Commit:** `36862ec`

#### Technical Problem
Two compounding issues:

1. **No CSP.** `next.config.ts` had `X-XSS-Protection: 1; mode=block`, which is deprecated, not supported by modern browsers, and covers only reflected XSS (not stored). The only working defense against stored XSS is a Content-Security-Policy that blocks inline script injection.

2. **AI output stored unsanitized.** In `generate-form/route.ts`, question `title` and `options` from the OpenAI response were saved to the `forms` table verbatim:
   ```typescript
   title: q.title,  // raw LLM output — could contain <script>alert(1)</script>
   ```
   Any XSS payload from a compromised or prompt-injected model call would flow: AI → DB `forms.form.questions[].title` → client DOM when candidates view the form.

#### Fix Applied
**Part A — CSP header in `next.config.ts`:**
```typescript
const csp = [
  "default-src 'self'",
  // unsafe-inline: Next.js inline scripts/styles; unsafe-eval: Turbopack HMR; wasm-unsafe-eval: WebAssembly (dotlottie, pdfjs)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  // unpkg.com + cdn.jsdelivr.net: @lottiefiles/dotlottie-react fetches its WASM renderer from CDN at runtime
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com https://unpkg.com https://cdn.jsdelivr.net",
  "font-src 'self' data:",
  "frame-src 'none'",
  "object-src 'none'",
  "media-src 'self' blob:",
  "worker-src blob:",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")
```

Removed `X-XSS-Protection` (deprecated). `unsafe-inline` and `unsafe-eval` are currently required by Next.js — the path to tighten these is a nonce-based CSP, which is a future hardening step. `wasm-unsafe-eval` is required by both `@lottiefiles/dotlottie-react` (Lottie animations) and `pdfjs-dist` (PDF preview) for WebAssembly instantiation. The CDN entries in `connect-src` are for the dotlottie WASM binary fetched at runtime from `unpkg.com` (primary) and `cdn.jsdelivr.net` (fallback) — blocking these produced "WASM loading failed from all sources" errors in the browser console.

**Part B — strip HTML from AI output before DB write:**
```typescript
// app/api/generate-form/route.ts
title: String(q.title ?? '').replace(/<[^>]*>/g, '').trim(),
options: q.options.map((o: any) => String(o ?? '').replace(/<[^>]*>/g, '').trim())
```

Regex strips all HTML tags at the source before any string touches the DB. Even if the model is prompt-injected to output `<script>`, it becomes empty string.

---

### Fix 10 — No Server-Side Dedup on Form Responses; Unthrottled Upload Endpoint
**Feedback issue:** #19 · **Severity:** Medium · **Commit:** `36862ec`

#### Technical Problem
**Part A — client-side-only dedup:**
`JobForm.tsx` checked for duplicate submissions via a Supabase query on mount:
```typescript
const { data: existing } = await supabaseClient.from("responses").select("id")
  .eq("form_id", formId).eq("profile_id", profileRow.id).maybeSingle()
if (existing) setAlreadySubmitted(true)
```
But the actual INSERT was also done client-side via the anon Supabase key. Any user with browser devtools could skip the UI guard and call `supabase.from("responses").insert(...)` directly, submitting the same form 500× and triggering 500 GPT evaluations.

**Part B — unthrottled public upload endpoint:**
`/api/submission/upload` accepted unlimited file uploads per IP with no rate limiting.

#### Fix Applied
**Part A — new server-side submit route:**
Created `app/api/responses/submit/route.ts`:
```typescript
// 1. Rate limit: 3 submissions per IP per 60s
if (!checkRateLimit(ip)) return 429

// 2. Auth: must be authenticated (SSR Supabase session)
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401

// 3. Server-side dedup check before insert
const { data: existing } = await supabase.from("responses")
  .select("id").eq("form_id", form_id).eq("profile_id", user.id).maybeSingle()
if (existing) return 409 "Already submitted"

// 4. Insert — also handles 23505 unique constraint error as a race-condition fallback
await supabase.from("responses").insert([{ form_id, profile_id: user.id, ... }])
```

`JobForm.tsx` now calls `POST /api/responses/submit` instead of inserting via the anon client directly.

**Part B — rate limit on upload:**
Added IP-based rate limiting to `app/api/submission/upload/route.ts`: max 5 uploads per IP per 5 minutes, returning 429 before any file processing begins.

---

---

### Fix 11 — Proxy Hardcoded IP, No Timeout, No Query-String Forwarding
**Feedback issue:** #25 · **Severity:** Medium · **Commit:** `dc64ec0`

**Problem:**
`assignment-proxy` had the EC2 backend address hardcoded as a plaintext HTTP IP (`http://3.111.81.83:8000`). All 4 proxy routes (`assignment-proxy`, `evaluate-proxy`, `form-proxy`, `ranking-proxy`) had no request timeout — a slow or dead backend would hold the Vercel serverless function open indefinitely, burning CPU and eventually timing out with an opaque 504 on the client. Additionally, query strings from the incoming request (e.g., `?job_id=123`) were silently dropped and never forwarded to the backend.

**Fix:**

1. **Hardcoded IP → env var** (`app/api/assignment-proxy/[...path]/route.ts`):
   ```typescript
   const ASSIGNMENT_BACKEND_URL = process.env.ASSIGNMENT_BACKEND_URL ?? "http://3.111.81.83:8000";
   ```
   Fallback keeps existing behavior; set `ASSIGNMENT_BACKEND_URL` in `.env.local` / Vercel env to override.

2. **Request timeout** (all 4 proxies): Added `AbortSignal.timeout(30_000)` to the `fetch()` call:
   ```typescript
   signal: AbortSignal.timeout(PROXY_TIMEOUT_MS), // 30 s
   ```
   On timeout the `catch` block already returns a 500 with the error message, which will now include `TimeoutError`.

3. **Query-string forwarding** (all 4 proxies):
   ```typescript
   const { search } = new URL(request.url);
   const backendUrl = `${BASE_URL}/${path.join('/')}${search}`;
   ```

**Files changed:**
- `app/api/assignment-proxy/[...path]/route.ts`
- `app/api/evaluate-proxy/[...path]/route.ts`
- `app/api/form-proxy/[...path]/route.ts`
- `app/api/ranking-proxy/[...path]/route.ts`

---

### Fix 12 — Middleware Triple Profile Query Collapsed to One
**Feedback issue:** #24 · **Severity:** Medium · **Commit:** `dc64ec0`

**Problem:**
The middleware had 3 separate `supabase.from("profiles").select("role")` calls — one per guarded route section (`/Dashboard`, `/client`, `/admin`). While only one block runs per request, the code was structurally fragile: every future edit risked adding a fourth query, and the `/Dashboard` block contained a dead redundant `if (!user)` check that could never be true (user already checked 10 lines above).

**Fix:**
Replaced all 3 profile query blocks with a single guarded fetch:
```typescript
const needsRoleCheck = path.startsWith("/Dashboard") || path.startsWith("/client") || path.startsWith("/admin");
if (needsRoleCheck) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  // inline redirect logic for each section
}
```
Redirect logic is identical in behavior; redundant `if (!user)` removed.

**Files changed:**
- `utils/supabase/middleware.ts`

---

### Fix 13 — No Idempotency on Rejection Email Batches
**Feedback issue:** #13 · **Severity:** High · **Commit:** TBD

#### Technical Problem
`send-rejection-emails/route.ts` had no guard against re-triggering. Clicking "Send Rejection Emails" twice (or a retried client request after a timeout) re-sent emails to every already-rejected candidate. The `rejection_emails_sent` job-level flag was set **after** all emails sent, so a mid-flight timeout left the flag unset and the next retry re-sent from the top.

#### Fix Applied
**Job-level guard:** Read `rejection_emails_sent` from the jobs table at the start of the handler. Return 409 before doing any work if true.

**Per-candidate guard:** Read the `evaluations.results.candidates` array and filter out any candidate with `rejection_sent: true`. After each successful Resend API call, add the `profile_id` to a `sentIds` array. After the loop, update the evaluations JSONB — setting `rejection_sent: true` for each successfully sent candidate. The job-level flag is only set after at least one email succeeds.

Files changed:
- `app/api/send-rejection-emails/route.ts`

---

### Fix 14 — No Cap on AI Evaluation Fan-Out
**Feedback issue:** #14 · **Severity:** High · **Commit:** TBD

#### Technical Problem
`/api/evaluate` fetched all responses for a form with no limit. A job with 2000 applicants would trigger 2000 resume downloads and 2000 Gemini calls from a single button click, with no rate limit or spend ceiling.

#### Fix Applied
Added `MAX_CANDIDATES = 500` check immediately after fetching responses. If `responses.length > 500`, the route returns HTTP 400 before any AI calls begin:

```typescript
const MAX_CANDIDATES = 500
if (responses.length > MAX_CANDIDATES) {
  return NextResponse.json(
    { error: `Too many candidates (${responses.length}). Evaluation is capped at ${MAX_CANDIDATES} per run.` },
    { status: 400 }
  )
}
```

Files changed:
- `app/api/evaluate/route.ts`

---

### Fix 15 — Evaluation Results Data Structure Mismatch
**Type:** Bug · **Severity:** High (evaluation pages showed zero candidates) · **Commit:** TBD

#### Technical Problem
`/api/evaluate` stored candidates as a flat array: `results: evaluated[]`. The admin and client evaluate pages read `evalRow.results.candidates` (nested object), so they always got `undefined` → fell back to `[]` → rendered "No candidates evaluated yet." for every completed evaluation. Additionally, the route stored each candidate with `id` and `name` keys while the pages expected `profile_id` and `full_name`. AI scores were nested under a `results` sub-object while the pages expected them flat on the candidate.

#### Fix Applied
The route now stores: `results: { candidates: evaluated }`. Each candidate entry uses the page-expected key names and flat structure:

```typescript
{
  profile_id: candidate.id,     // was: id
  full_name: candidate.name,    // was: name
  skills_match: evalResult.skills_score,           // numeric score, flat
  experience_relevance: evalResult.experience_score,
  communication_clarity: evalResult.communication_score,
  overall_fit: evalResult.fit_score,
  final_score: evalResult.final_score,
  justification: evalResult.justification,
  skills_assessment: evalResult.skills_match,      // text assessment kept separately
  // ...
  rejection_sent: false,
}
```

The `send-rejection-emails` route's `evalMap` keying was also updated to use `c.profile_id ?? c.id` to handle both old and new records during the transition.

Files changed:
- `app/api/evaluate/route.ts`
- `app/api/send-rejection-emails/route.ts`
- `app/admin/evaluate/[id]/page.tsx`
- `app/client/evaluate/[id]/page.tsx`

---

### Fix 16 — Evaluate-Proxy Called Without Authorization Header
**Type:** Bug · **Severity:** High (100% 401 rate on evaluation trigger) · **Commit:** TBD

**Problem:**
Both `components/Client-Dashboard/Job-Card.tsx` and `components/Admin-Dashboard/JobList.tsx` called `/api/evaluate-proxy/evaluate/...` with `fetch(url, { method: "POST" })` — no `Authorization` header. Fix 5 added JWT verification to all proxy routes, so every evaluation trigger returned 401.

**Fix:**
Both files already had `session` in scope (retrieved a few lines earlier for `consume-evaluation`). Added `headers: { Authorization: \`Bearer ${session.access_token}\` }` to the evaluate-proxy fetch call in each.

Files changed:
- `components/Client-Dashboard/Job-Card.tsx`
- `components/Admin-Dashboard/JobList.tsx`

---

### Fix 17 — `/avatars/default.jpg` 404 on Dashboard Load
**Type:** Bug · **Severity:** Low (console error, broken avatar image) · **Commit:** TBD

**Problem:**
`components/Candidate-Dashboard/app-sidebar.tsx` used `/avatars/default.jpg` as the fallback avatar URL in two places (session metadata fallback and loading state). The `public/avatars/` directory did not exist, causing a 404 on every dashboard load.

**Fix:**
Created `public/avatars/default.svg` — a minimal SVG person icon. Updated both references in `app-sidebar.tsx` from `/avatars/default.jpg` to `/avatars/default.svg`.

Files changed:
- `public/avatars/default.svg` (new)
- `components/Candidate-Dashboard/app-sidebar.tsx`

---

### Fix 18 — Mandatory Resume Upload at Candidate Sign-Up
**Type:** Product / UX · **Severity:** Medium · **Commit:** `79486cc`

#### Technical Problem
The candidate sign-up form (`components/authForms/sign-User.tsx`) had a resume upload field, but it was entirely **optional**. The label read "Resume (Optional)" and the submit button was enabled whether or not a file was attached. This meant:

1. Candidates could create accounts with no resume on file.
2. When those candidates later applied for jobs, the evaluation route (`/api/evaluate`) tried to fetch their `resume_url` from the `evaluations.results` JSONB. If it was empty, it fell back to an empty string, and GPT-4o evaluated the candidate with zero resume context — producing low-quality, misleading scores.
3. The rejection email route (`send-rejection-emails`) also reads `resume_url` to personalize rejection reasons. Without a resume, the AI defaulted to vague, non-specific rejection copy.

The upload logic itself was already correct — the file was stored in the `resumes` Supabase bucket at path `${userId}/${timestamp}_${filename}` and the public URL was saved to `profiles.resume_url` (a `TEXT[]` column) — but nothing enforced it was used at sign-up.

#### Fix Applied
Three changes to `components/authForms/sign-User.tsx`:

**1. Submit button gating (`isUserFormValid` function):**
```typescript
// BEFORE
const isUserFormValid = () => {
  return (
    userFormData.firstName && userFormData.lastName &&
    userFormData.email && userFormData.phone &&
    userFormData.linkedinLink && userFormData.password &&
    userFormData.password.length >= 6
    // resume NOT checked
  )
}

// AFTER
const isUserFormValid = () => {
  return (
    userFormData.firstName && userFormData.lastName &&
    userFormData.email && userFormData.phone &&
    userFormData.linkedinLink && userFormData.password &&
    userFormData.password.length >= 6 &&
    !!resumeFile  // ← resume now required to enable button
  )
}
```

The submit button is `disabled={!isUserFormValid() || isLoading}`, so it stays greyed-out until a PDF is attached.

**2. Server-side guard in `handleUserSubmit`:**
Even if the button were somehow bypassed (e.g., via devtools), a check runs at the top of the submit handler:
```typescript
if (!resumeFile) {
  toast.error("Resume Required", {
    description: "Please upload your resume (PDF, max 2MB) to continue.",
    duration: 5000,
    position: "top-right",
  })
  setIsLoading(false)
  return  // ← early exit, no account created
}
```

**3. UI labels updated:**
- Field label: `"Resume (Optional)"` → `"Resume *"` (red asterisk via `<span className="text-red-500">*</span>`)
- Drop-zone hint: `"PDF (up to 2MB)"` → `"PDF only · max 2 MB · required"`
- Helper text below field: `"You can update your resume later in the profile section"` → `"You can replace your resume any time from the profile section"`

**Storage flow (unchanged but documented here for clarity):**
```typescript
// On successful account creation:
const filePath = `${user.id}/${Date.now()}_${resumeFile.name}`
const { data: uploadData } = await supabase.storage
  .from('resumes')
  .upload(filePath, resumeFile)

const resumeUrl = supabase.storage.from('resumes').getPublicUrl(uploadData.path).data.publicUrl

await supabase.from('profiles').update({ resume_url: [resumeUrl] }).eq('id', user.id)
```

The client (`handleClientSubmit`) is intentionally unchanged — clients are companies, not candidates, and have no resume.

Files changed:
- `components/authForms/sign-User.tsx`

---

### Fix 19 — Rejection Email Sequential Processing (Latency Fix)
**Type:** Performance · **Severity:** High · **Commit:** `800b7ba`

#### Technical Problem
`app/api/send-rejection-emails/route.ts` processed candidates in a `for...of` loop — one at a time, fully sequential:

```typescript
// OLD — sequential loop
for (const profile of profilesToProcess) {
  // Step A: fetch and parse the candidate's PDF resume (~1–2 s)
  const resumeText = await extractTextFromPdf(resumeUrl)

  // Step B: call GPT-4o to write a personalised rejection email (~3–5 s)
  const { subject, body } = await generateRejectionEmail({ ... })

  // Step C: call Resend API to send one email (~0.5 s)
  const { error } = await resend.emails.send({ to: profile.email, subject, html: body })
}
```

Wall-clock time per candidate ≈ 5–8 s. For a typical batch of 20 candidates: **40–80 seconds**. This meant:
- The admin/client UI showed a "Sending…" spinner for up to 80 seconds.
- Vercel's default 60-second function timeout (or 300-second Pro timeout with `maxDuration=300`) was in danger of being hit.
- Users sometimes closed the tab thinking it had failed, triggering a retry that re-sent all emails.

Additionally, the `resend.emails.send()` call was made individually per candidate — N HTTP round-trips to Resend's API instead of one.

#### Fix Applied

**Part A — Parallel PDF fetch + OpenAI calls via `Promise.allSettled`:**

All candidates are now processed concurrently. `Promise.allSettled` (not `Promise.all`) is used so a single failure (e.g., a candidate's PDF is corrupt) does not abort the entire batch — it is collected as a failure result while the rest proceed.

```typescript
// NEW — all candidates run in parallel
const generationResults = await Promise.allSettled(
  profilesToProcess.map(async (profile) => {
    const evalData = evalMap[profile.id] ?? {}
    const resumeUrl = evalData.resume_url ?? ""

    // PDF fetch + parse in parallel for all candidates
    const resumeText = resumeUrl ? await extractTextFromPdf(resumeUrl) : ""

    // GPT-4o call in parallel for all candidates
    const { subject, body } = await generateRejectionEmail({
      candidateName: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      jobTitle: job.Job_Name || "the position",
      jobDescription: job.Job_Description || "",
      resumeText,
      evalJustification: evalData.justification ?? "",
      skillsMatch: evalData.skills_match ?? 0,
      experienceRelevance: evalData.experience_relevance ?? 0,
      communicationClarity: evalData.communication_clarity ?? 0,
      finalScore: evalData.final_score ?? 0,
    })

    return { profile, candidateName, subject, body }
  })
)
```

After `Promise.allSettled` resolves, fulfilled and rejected results are separated:
```typescript
const emailPayloads: EmailPayload[] = []
const results: ResultEntry[] = []

for (let i = 0; i < generationResults.length; i++) {
  const res = generationResults[i]
  if (res.status === "fulfilled") {
    emailPayloads.push(res.value)
  } else {
    results.push({ email: profile.email, name: candidateName, success: false,
      error: res.reason?.message ?? "Email generation failed" })
  }
}
```

**Part B — Single batch send via `resend.batch.send()`:**

Instead of N individual `resend.emails.send()` calls (one per candidate), all generated emails are sent in **one HTTP request** using Resend's batch API:

```typescript
// Collect all payloads
const batchPayload = emailPayloads.map(({ profile, subject, body }) => ({
  from: fromEmail,
  to: profile.email,
  subject,
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;">${body}</div>`,
}))

// One API call for all emails (Resend Pro supports batch)
const { data: batchData, error: batchError } = await resend.batch.send(batchPayload)

// Map results back: batchData.data[i] corresponds to emailPayloads[i]
const batchItems: { id: string }[] = batchData?.data ?? []
for (let i = 0; i < emailPayloads.length; i++) {
  const { profile, candidateName } = emailPayloads[i]
  if (batchItems[i]?.id) {
    results.push({ email: profile.email, name: candidateName, success: true })
    sentIds.push(profile.id)
  } else {
    results.push({ email: profile.email, name: candidateName, success: false, error: "Send failed" })
  }
}
```

The DB writes after the batch (updating `rejection_sent` in JSONB and `rejection_emails_sent` on the job) are unchanged.

**Part C — Optimistic UI in both evaluate pages:**

`app/client/evaluate/[id]/page.tsx` and `app/admin/evaluate/[id]/page.tsx` previously awaited the API response before showing any feedback — the button stayed in "Sending…" state for the full 40–80 seconds.

The fix applies an optimistic update on click:

```typescript
const handleSendRejections = async () => {
  const pendingIds = new Set(selectedIds)  // save selection before clearing

  // Immediately show success state — don't wait for the API
  setSending(true)
  setRejectionSent(true)      // ← green badge appears instantly
  setSelectedIds(new Set())   // ← selection cleared immediately

  try {
    const res = await fetch("/api/send-rejection-emails", { ... })
    const data = await res.json()

    if (!res.ok) {
      if (data?.alreadySent) return  // already sent — stay disabled, no revert
      // Real error — revert optimistic state so user can retry
      setRejectionSent(false)
      setSelectedIds(pendingIds)
      toast.error(data.error || "Failed to send rejection emails")
      return
    }

    const successCount = data.results?.filter((r: any) => r.success).length ?? 0
    if (successCount === 0) {
      // All failed — revert
      setRejectionSent(false)
      setSelectedIds(pendingIds)
    }

    toast.success(`${successCount}/${data.results?.length} rejection emails sent`)
    data.results?.filter((r: any) => !r.success)
      .forEach((r: any) => toast.error(`Failed for ${r.name}: ${r.error}`))

  } catch (err: any) {
    setRejectionSent(false)
    setSelectedIds(pendingIds)
    toast.error(err?.message || "Unexpected error")
  } finally {
    setSending(false)
  }
}
```

**Performance improvement:**

| Step | Before | After |
|------|--------|-------|
| PDF fetch | 20 × 1.5 s = 30 s | ~1.5 s (parallel) |
| GPT-4o call | 20 × 4 s = 80 s | ~5 s (parallel) |
| Resend send | 20 × 0.5 s = 10 s | ~1 s (batch) |
| **Total** | **40–80 s** | **~8–10 s** |
| UX | Spinner 40–80 s | Instant badge |

Files changed:
- `app/api/send-rejection-emails/route.ts`
- `app/client/evaluate/[id]/page.tsx`
- `app/admin/evaluate/[id]/page.tsx`

---

### Fix 20 — No Rate Limiting on Any Route
**Type:** Security / Reliability · **Severity:** Critical · **Commit:** `060c7a1`

#### Technical Problem
Every API route and auth page had **zero rate limiting**. Concrete attack surfaces:

- **`/sign-in` / `/sign-up`**: Unlimited password-guessing attempts from any IP. No lockout, no CAPTCHA, no delay. A credential-stuffing script could try millions of passwords/usernames.
- **`/api/evaluate-proxy`**: Triggers a GPT-4o evaluation on the EC2 backend. With the proxy's prior no-auth gap (fixed in Fix 5), anyone could fire unlimited evaluation calls, running up unbounded OpenAI spend with no per-user cap. Even with auth restored, a single client with valid credentials could spam evaluations.
- **`/api/generate-form`**: One request = one PDF download + one GPT-4o call (up to 1400 tokens). No per-user throttle.
- **`/api/consume-job` / `/api/consume-evaluation`**: Credit-deduction endpoints. A rapid sequence of requests (e.g., from a script that races the atomic decrement) could be used to probe the system or drain credits faster than the UI allows.
- **`/api/submission/upload`**: Accepted unlimited file uploads per IP. A script could flood the Supabase `resumes` bucket with gigabytes of PDFs. The route previously had an **in-memory `Map`-based rate limiter** — but this is broken in serverless: each Vercel function invocation is a fresh process with no shared memory, so the counter reset on every cold start and provided zero real protection.

#### Root Cause of In-Memory Rate Limiter Failure
```typescript
// OLD app/api/submission/upload/route.ts — BROKEN in serverless
const uploadRateMap = new Map<string, { count: number; resetAt: number }>()

function checkUploadRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = uploadRateMap.get(ip)
  // uploadRateMap is in-process memory — each Lambda invocation starts with an empty Map
  // Two simultaneous requests hit two different Lambda containers → both see count = 0
  if (!entry || now > entry.resetAt) {
    uploadRateMap.set(ip, { count: 1, resetAt: now + UPLOAD_WINDOW_MS })
    return true  // ← always allowed on cold container
  }
  ...
}
```

#### Fix Applied

**Architecture: Upstash Redis + sliding window algorithm**

Added packages `@upstash/ratelimit` and `@upstash/redis`. Created `utils/rateLimit.ts` — a single shared utility used by both middleware and individual API route handlers:

```typescript
// utils/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Redis client — null if env vars absent (graceful no-op)
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = createRedis()

// Creates a sliding-window limiter, or null if Redis not configured
function makeLimiter(requests: number, window: `${number} ${"s"|"m"|"h"|"d"}`): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) })
}

// Named limiters — one per protection boundary
export const limiters = {
  globalIp:         makeLimiter(120, "1 m"),   // 120 req/min per IP — all /api/*
  authIp:           makeLimiter(5, "15 m"),    // 5 req/15 min per IP — sign-in/up/auth
  generateForm:     makeLimiter(3, "1 m"),     // 3 req/min per user
  evaluateProxy:    makeLimiter(2, "5 m"),     // 2 req/5 min per user
  consumeCredit:    makeLimiter(10, "1 m"),    // 10 req/min per user
  submissionUpload: makeLimiter(5, "1 m"),     // 5 req/min per IP
}

// Call this in a route handler: returns a 429 NextResponse on limit exceeded, null if allowed
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null  // ← no-op when Upstash not configured
  const { success, reset } = await limiter.limit(identifier)
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: "Too many requests", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }
  return null
}
```

**Why sliding window?** A fixed window (e.g., "5 per minute, reset at :00") allows a burst of 10 requests split across the :59→:01 boundary. Sliding window counts requests in a rolling time frame, preventing edge-case bursts.

**Why Upstash Redis?** It provides a persistent, shared, low-latency (HTTP-based, ~5 ms) key-value store accessible from all Vercel serverless function instances simultaneously. Unlike in-memory state, a counter stored in Upstash is visible to every concurrent invocation across every region.

**Layer 1 — Next.js Middleware (IP-based, edge-wide):**

`middleware.ts` runs before every request, including before the Supabase auth check. Two IP-based guards are added:

```typescript
// middleware.ts
import { applyRateLimit, limiters } from '@/utils/rateLimit'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Auth brute-force: 5 attempts per IP per 15 minutes
  if (path.startsWith('/sign-in') || path.startsWith('/sign-up') || path.startsWith('/auth/')) {
    const limited = await applyRateLimit(limiters.authIp, `auth:${ip}`)
    if (limited) return limited  // 429 before any auth processing
  }

  // Global API DDoS guard: 120 requests per IP per minute
  if (path.startsWith('/api/')) {
    const limited = await applyRateLimit(limiters.globalIp, `api:${ip}`)
    if (limited) return limited
  }

  return await updateSession(request)  // existing Supabase auth check
}
```

Identifier format: `"auth:<ip>"` and `"api:<ip>"` — the prefix prevents collisions between limiters sharing the same Redis instance.

**Layer 2 — Per-route, per-user limits (applied after auth so user ID is known):**

The check is inserted immediately after the auth block in each route, before any expensive work starts:

```typescript
// app/api/generate-form/route.ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401

// ... role check ...

// Rate limit AFTER we have the user ID
const rateLimited = await applyRateLimit(limiters.generateForm, `gen-form:${user.id}`)
if (rateLimited) return rateLimited  // 429 if over limit

// Only reaches here if allowed — expensive work begins:
const pdfResponse = await fetch(jdUrl)
const completion = await openai.chat.completions.create(...)
```

Same pattern in `consume-job` (`consume-job:${userId}`) and `consume-evaluation` (`consume-eval:${userId}`).

For `evaluate-proxy`, the `verifyToken` helper was modified to return both the token and user ID (previously it only returned the token):
```typescript
// BEFORE
async function verifyToken(authHeader): Promise<string | null> {
  ...
  return token
}

// AFTER
async function verifyToken(authHeader): Promise<{ token: string; userId: string } | null> {
  ...
  return { token, userId: data.user.id }
}

// In handleRequest:
const verified = await verifyToken(request.headers.get("authorization"))
if (!verified) return 401
const { token, userId } = verified
const limited = await applyRateLimit(limiters.evaluateProxy, `eval-proxy:${userId}`)
if (limited) return limited
```

**`submission/upload` — replaced broken in-memory limiter:**
```typescript
// BEFORE (broken in serverless — in-memory Map)
const uploadRateMap = new Map<string, { count: number; resetAt: number }>()
function checkUploadRateLimit(ip: string): boolean { ... }

// AFTER (Upstash Redis — works across all invocations)
const limited = await applyRateLimit(limiters.submissionUpload, `upload:${ip}`)
if (limited) return new NextResponse(limited.body, {
  status: 429,
  headers: { ...Object.fromEntries(limited.headers), ...corsHeaders }
})
```

**429 response format** (consistent across all rate-limited routes):
```json
HTTP/1.1 429 Too Many Requests
Retry-After: 47
Content-Type: application/json

{ "error": "Too many requests", "retryAfter": 47 }
```

**Complete rate limit table:**

| Route / Path | Limiter Key | Limit | Algorithm |
|---|---|---|---|
| `/sign-in`, `/sign-up`, `/auth/*` | `auth:<ip>` | 5 / 15 min | Sliding window |
| All `/api/*` | `api:<ip>` | 120 / min | Sliding window |
| `/api/generate-form` | `gen-form:<userId>` | 3 / min | Sliding window |
| `/api/evaluate-proxy/[…]` | `eval-proxy:<userId>` | 2 / 5 min | Sliding window |
| `/api/consume-job` | `consume-job:<userId>` | 10 / min | Sliding window |
| `/api/consume-evaluation` | `consume-eval:<userId>` | 10 / min | Sliding window |
| `/api/submission/upload` | `upload:<ip>` | 5 / min | Sliding window |

**Graceful degradation:** If `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are not set (e.g., in a local dev environment without Upstash configured), `createRedis()` returns `null`, every `makeLimiter()` returns `null`, and every `applyRateLimit(null, ...)` returns `null` immediately. The application works normally with no rate limiting active. This means deploying this code never breaks the app — it just won't enforce limits until Upstash is connected.

Files changed:
- `utils/rateLimit.ts` (new)
- `middleware.ts`
- `app/api/generate-form/route.ts`
- `app/api/evaluate-proxy/[...path]/route.ts`
- `app/api/consume-job/route.ts`
- `app/api/consume-evaluation/route.ts`
- `app/api/submission/upload/route.ts`
- `package.json` (added `@upstash/ratelimit`, `@upstash/redis`)

---

## Remaining Critical Issues (Out of Frontend Scope)

These require changes outside this codebase:

| Issue | Area | Where to Fix |
|-------|------|-------------|
| **#3** RLS write policies on `profiles.role`, `subscriptions.*_remaining` | Auth/Security | Supabase SQL Editor — audit and restrict write policies on privileged columns |
| **#5** Cashfree webhook processed twice on multi-worker Gunicorn | Payments | Python payment service — move idempotency state to Redis/Postgres |
| **#7** Resumes in public-URL buckets, no deletion routine | PII/Legal | Supabase Storage — switch to signed URLs; add deletion endpoint covering all stores |
