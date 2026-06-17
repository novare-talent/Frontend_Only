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

## Remaining Critical Issues (Out of Frontend Scope)

These require changes outside this codebase:

| Issue | Area | Where to Fix |
|-------|------|-------------|
| **#3** RLS write policies on `profiles.role`, `subscriptions.*_remaining` | Auth/Security | Supabase SQL Editor — audit and restrict write policies on privileged columns |
| **#5** Cashfree webhook processed twice on multi-worker Gunicorn | Payments | Python payment service — move idempotency state to Redis/Postgres |
| **#7** Resumes in public-URL buckets, no deletion routine | PII/Legal | Supabase Storage — switch to signed URLs; add deletion endpoint covering all stores |
