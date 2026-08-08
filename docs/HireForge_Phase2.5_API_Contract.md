# HireForge — API Contract
### Phase 2.5 | Frozen Specification for Web, Mobile, and Chrome Extension Clients

*Companion to the finalized PRD (Phase 1) and Architecture (Phase 2). Neither is modified here. This document is the contract every client and the backend implement against independently.*

**Base URL:** `https://api.hireforge.app/v1`
**Contract status:** Draft → will be marked FROZEN once approved, after which changes require a new version (`/v2`) or an additive, backward-compatible change only.

---

## PART A — General API Standards

These rules apply to every endpoint in this document unless explicitly overridden.

### A.1 Response Format (Success)

```json
{
  "data": { },
  "meta": {
    "requestId": "req_9f8a2c",
    "timestamp": "2026-07-15T10:32:00Z"
  }
}
```

Collections wrap `data` as an array and add pagination info inside `meta`:

```json
{
  "data": [ ],
  "meta": {
    "requestId": "req_9f8a2c",
    "timestamp": "2026-07-15T10:32:00Z",
    "pagination": {
      "nextCursor": "eyJpZCI6MTIzfQ==",
      "hasMore": true,
      "limit": 20
    }
  }
}
```

### A.2 Error Format

```json
{
  "error": {
    "code": "RESUME_NOT_FOUND",
    "message": "No resume exists with the given ID.",
    "details": {},
    "requestId": "req_9f8a2c"
  }
}
```

Error `code` is a stable, machine-readable string (SCREAMING_SNAKE_CASE), safe for clients to branch on. `message` is human-readable and may change wording without being a breaking change — clients must never pattern-match on `message`.

### A.3 Pagination — Cursor, Not Offset

**Decision: cursor-based pagination for all list endpoints.**

Why: offset pagination (`?page=3&limit=20`) breaks under concurrent writes (items shift between pages, causing duplicates/skips) — this matters for feeds like Notifications, Community threads, and Submissions history that are written to constantly. Cursor pagination (`?cursor=...&limit=20`) is stable regardless of concurrent inserts.

The one exception: **Admin tables** (Section G) may offer offset pagination *additionally*, since admins need "jump to page 8" behavior for data review — but cursor remains the default and required mode everywhere else.

Standard query params: `?cursor={opaque}&limit={1-100, default 20}`

### A.4 Sorting

Standard query param: `?sort=field` (ascending) or `?sort=-field` (descending, prefix `-`). Multiple sort keys comma-separated: `?sort=-createdAt,title`. Each endpoint documents its whitelisted sortable fields — arbitrary field sorting is rejected with `INVALID_SORT_FIELD`.

### A.5 Filtering

Standard convention: `?filter[field]=value`, e.g. `?filter[difficulty]=hard&filter[topic]=graphs`. Range filters use suffix: `?filter[createdAt][gte]=2026-01-01`.

### A.6 Date Format & Timezone

All timestamps: **ISO 8601, UTC, with `Z` suffix** (`2026-07-15T10:32:00Z`). Clients handle local timezone conversion for display. User's timezone (needed for Daily Planner "morning" trigger, Section D) is stored explicitly as an IANA timezone string (`Asia/Kolkata`) on `UserSettings`, never inferred from request headers.

### A.7 UUID Usage

All resource IDs are **UUIDv7** (time-ordered UUIDs) — chosen over sequential integers to avoid exposing record counts/enumeration risk, and over UUIDv4 because v7's time-ordering keeps database index locality good for insert-heavy tables (Submissions, Messages).

### A.8 HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Success (GET, PATCH, action success) |
| 201 | Resource created (POST) |
| 202 | Accepted — async processing (e.g., resume analysis queued) |
| 204 | Success, no body (DELETE) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized (RBAC failure) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate submission, idempotency key reuse with different payload) |
| 422 | Semantically invalid (valid shape, invalid business state — e.g., regenerating a roadmap that's already regenerating) |
| 429 | Rate limited |
| 500 | Unhandled server error |
| 503 | Upstream dependency down (e.g., LLM provider outage) |

### A.9 API Versioning

Path-based: `/v1/`, `/v2/`. A version is never broken once shipped — only additive changes (new optional fields, new endpoints) within a version. Breaking changes require a new version, with the old version supported for a documented deprecation window (minimum 6 months once HireForge has external API consumers).

### A.10 Idempotency

All **POST** endpoints that create a resource accept an optional `Idempotency-Key` header. If a request is retried with the same key within 24 hours, the server returns the original response rather than creating a duplicate. This matters most for: Submission creation (extension sync retries), Resume analysis requests, Interview session creation.

### A.11 Retry Safety

GET/PUT/DELETE are safe to retry by nature. POST is only safe to retry when an `Idempotency-Key` is supplied — documented explicitly per endpoint below. Clients (especially the Chrome Extension's offline queue) must always supply this key for sync-related POSTs.

### A.12 Rate Limiting

Every response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1752600000
```

Limits are tiered: default authenticated tier, a stricter tier for AI endpoints (cost-sensitive), and a per-IP tier for unauthenticated endpoints (login, signup). Exceeding returns `429` with `Retry-After` header.

### A.13 Request IDs & Correlation IDs

Every response carries `X-Request-Id` (generated server-side if not supplied). Clients may supply `X-Correlation-Id` to tie together a chain of related requests (e.g., a multi-step onboarding flow) for tracing — propagated into logs (Section 17 of the Architecture doc).

### A.14 Caching Headers

Read-only, rarely-changing endpoints (Problem catalog, Theory topics, Company profiles) return `Cache-Control: private, max-age=300` and an `ETag`; clients send `If-None-Match` to get `304 Not Modified`. Highly dynamic endpoints (Dashboard, Notifications) return `Cache-Control: no-store`.

---

## PART B — Authentication & User APIs

*Auth required: 🔓 = public, 🔒 = authenticated, 🔒A = Admin only*

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/auth/session` | GET | 🔒 | Returns current Clerk-verified session summary (delegates actual login/signup UI to Clerk — HireForge doesn't reimplement credential handling) |
| `/auth/logout` | POST | 🔒 | Invalidates local session cache (Clerk handles actual token revocation) |
| `/users/me` | GET | 🔒 | Current user profile + role + subscription tier |
| `/users/me` | PATCH | 🔒 | Update profile fields (name, avatar, bio) |
| `/users/me/onboarding` | POST | 🔒 | Submits onboarding answers (target role, target companies, current level) → triggers initial Roadmap generation event |
| `/users/me/preferences` | GET / PATCH | 🔒 | Notification preferences, theme, language |
| `/users/me/settings` | GET / PATCH | 🔒 | Timezone, subscription management entry point |
| `/users/me/roles` | GET | 🔒 | Returns role + effective permissions (for frontend feature-gating) |

**`POST /users/me/onboarding` detail (representative full spec):**

- **Request body:**
```json
{
  "targetRole": "SDE" ,
  "targetCompanies": ["amazon", "google"],
  "currentLevel": "beginner",
  "timezone": "Asia/Kolkata"
}
```
- **Validation:** `targetRole` enum-checked against supported tracks (Section 26 of PRD); `targetCompanies` max 5, each must exist in `Company` catalog; `timezone` must be a valid IANA string.
- **Success response:** `201`, returns created `UserProfile` + `roadmapGenerationJobId` (async — see Idempotency/Events, roadmap generation is queued, not synchronous).
- **Errors:** `400 VALIDATION_ERROR`, `409 ONBOARDING_ALREADY_COMPLETED`.
- **Rate limit:** Standard authenticated tier (not AI-tier, since this only *queues* generation).
- **Cache:** `no-store`.

All other endpoints in this section follow the same documentation shape (method/auth/roles/body/response/errors/rate-limit/cache) per Part A standards — omitted here for brevity where they're straightforward CRUD, expanded fully wherever an endpoint has non-obvious behavior (as above).

---

## PART C — Dashboard APIs

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/dashboard` | GET | 🔒 | Composite read — today's tasks, HireScore snapshot, streak, upcoming revisions, quick stats. `Cache-Control: no-store`; internally the server composes this from cached module reads (Architecture §1). |
| `/dashboard/tasks/today` | GET | 🔒 | Today's Planner output (Section D) |
| `/dashboard/streak` | GET | 🔒 | Current streak count + calendar heatmap data (`?range=90d`) |
| `/dashboard/activity` | GET | 🔒 | Recent activity feed, cursor-paginated |
| `/dashboard/weekly-progress` | GET | 🔒 | `?week=2026-W28` — ISO week param |

**Rate limit:** Standard tier. **Cache:** `no-store` (this is the single most frequently-loaded screen; correctness over cacheability).

---

## PART D — DSA APIs

| Endpoint | Method | Auth | Roles | Notes |
|---|---|---|---|---|
| `/dsa/topics` | GET | 🔒 | any | Cacheable (`max-age=300`) |
| `/dsa/patterns` | GET | 🔒 | any | Cacheable |
| `/dsa/problems` | GET | 🔒 | any | Cursor-paginated, filterable by `difficulty`, `topic`, `pattern`, `company`; sortable by `-createdAt`, `difficulty`, `acceptanceRate` |
| `/dsa/problems/:id` | GET | 🔒 | any | Path param `id` = UUIDv7 |
| `/dsa/problems/:id/submit` | POST | 🔒 | any | **Idempotency-Key required.** Body: `{ code, language, status: "solved"|"attempted" }`. Triggers `ProblemSolved` event (Part L) on `status: solved`. |
| `/dsa/problems/:id/hint` | POST | 🔒 | any | AI-tier rate limit. Routes to DSA Mentor agent. Returns progressive hint (level 1/2/3, tracked to avoid giving full solution prematurely). |
| `/dsa/problems/:id/ai-explanation` | POST | 🔒 | any | AI-tier rate limit. Full walkthrough after solving. |
| `/dsa/problems/:id/bookmark` | POST / DELETE | 🔒 | any | Toggle bookmark |
| `/dsa/submissions` | GET | 🔒 | any | Own submission history, cursor-paginated |
| `/dsa/revision/due` | GET | 🔒 | any | Spaced-repetition due queue for today |
| `/dsa/revision/:submissionId/complete` | POST | 🔒 | any | Marks a revision cycle complete, advances SRS interval |
| `/dsa/progress` | GET | 🔒 | any | Aggregate stats: solved count by difficulty/topic |
| `/dsa/search` | GET | 🔒 | any | `?q=` — delegates to Search module (Part K) scoped to DSA |

**`POST /dsa/problems/:id/submit` full detail:**
- **Request body:** `{ "code": "string", "language": "python|java|cpp|javascript", "status": "solved" | "attempted" }`
- **Validation:** `language` enum, `code` max 50,000 chars, `problemId` must exist.
- **Success:** `201`, returns created `Submission` + updated `progress` snapshot.
- **Errors:** `400 VALIDATION_ERROR`, `404 PROBLEM_NOT_FOUND`, `409 IDEMPOTENCY_KEY_CONFLICT` (same key, different body).
- **Rate limit:** Standard tier (not AI-tier — this doesn't call an LLM).
- **Cache:** `no-store`.

---

## PART E — Theory APIs

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/theory/subjects` | GET | 🔒 | Cacheable |
| `/theory/subjects/:id/topics` | GET | 🔒 | Cacheable |
| `/theory/topics/:id` | GET | 🔒 | Full note content |
| `/theory/topics/:id/flashcards` | GET | 🔒 | |
| `/theory/topics/:id/flashcards/generate` | POST | 🔒 | AI-tier. Calls Theory Mentor agent (Architecture §7.2) |
| `/theory/quizzes/:id` | GET | 🔒 | |
| `/theory/quizzes/:id/attempts` | POST | 🔒 | Body: `{ answers: [...] }` → graded synchronously, returns score |
| `/theory/topics/:id/bookmark` | POST / DELETE | 🔒 | |
| `/theory/revision/due` | GET | 🔒 | Same SRS pattern as DSA |
| `/theory/topics/:id/ai-explanation` | POST | 🔒 | AI-tier |

---

## PART F — Roadmap & Planner APIs

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/roadmaps` | GET | 🔒 | Current active roadmap |
| `/roadmaps/generate` | POST | 🔒 | AI-tier, **async** — returns `202` + `jobId`, client polls `/roadmaps/jobs/:jobId` or receives an SSE/notification on completion |
| `/roadmaps/regenerate` | POST | 🔒 | Same async pattern; `422 REGENERATION_ALREADY_IN_PROGRESS` if one is already running |
| `/roadmaps/:id/nodes/:nodeId` | PATCH | 🔒 | Mark node complete/skipped manually |
| `/planner/today` | GET | 🔒 | Today's plan (also surfaced via Dashboard) |
| `/planner/weekly` | GET | 🔒 | |
| `/planner/today/regenerate` | POST | 🔒 | AI-tier, manual re-plan trigger (e.g., user missed the whole morning) |

**`POST /roadmaps/generate` full detail:**
- **Request body:** none required — reads from onboarding profile; optional override: `{ "targetRole": "...", "targetCompanies": [...] }`
- **Success:** `202 Accepted`, `{ "jobId": "job_...", "estimatedSeconds": 8 }`
- **Errors:** `422 ONBOARDING_INCOMPLETE` (must complete onboarding first).
- **Rate limit:** AI-tier — max 5/day on Free plan, unlimited-but-throttled on Pro.
- **Idempotency:** Not applicable (GET-then-decide pattern via `422` on concurrent regen instead).

---

## PART G — AI APIs

These sit directly on top of the Architecture's AI Orchestrator (Architecture §7). Every endpoint here is **AI-tier rate limited** and **streams via SSE** where noted.

| Endpoint | Method | Notes |
|---|---|---|
| `/ai/mentor/messages` | POST | Streaming (SSE). Body: `{ conversationId?, message }`. Orchestrator Router selects agent(s). |
| `/ai/mentor/conversations` | GET | Cursor-paginated conversation list |
| `/ai/mentor/conversations/:id` | GET | Full message history for one conversation |
| `/ai/mentor/conversations/:id/summary` | GET | Returns the rolling summary (Architecture §8.3), not raw messages |
| `/ai/resume/review` | POST | Body: `{ resumeId, jobDescription }` → Resume Mentor agent |
| `/ai/projects/generate` | POST | Body: `{ skills: [...] }` → Project Mentor agent |
| `/ai/career/plan` | POST | Body: `{ targetRole }` → Career Mentor agent (feeds Roadmap module) |
| `/ai/interview/sessions` | POST | Creates a mock interview session → Interview Mentor agent |
| `/ai/interview/sessions/:id/voice` | POST (multipart) | Uploads voice segment for delivery scoring |
| `/ai/knowledge-graph/query` | GET | `?nodeId=` — returns prerequisite chain (internal graph traversal, not an LLM call — cheap, standard-tier rate limit, not AI-tier) |

**`POST /ai/mentor/messages` full detail:**
- **Auth:** 🔒 required.
- **Request body:** `{ "conversationId": "uuid|null", "message": "string, max 4000 chars" }`
- **Response:** `Content-Type: text/event-stream` — a sequence of `data: {"delta": "..."}` chunks, terminated by `data: [DONE]`. Final assembled message is persisted server-side; client doesn't need to re-POST the full text.
- **Errors (pre-stream, returned as normal JSON if validation fails before streaming starts):** `400 VALIDATION_ERROR`, `429 AI_RATE_LIMIT_EXCEEDED` (includes `Retry-After` and current plan's daily quota in `details`).
- **Prompt injection note:** message content is passed as user-role content only — never concatenated into system prompt (Architecture §18).
- **Rate limit:** AI-tier — Free: 20/day, Pro: 500/day (soft-throttled beyond that rather than hard-blocked, per Architecture §18 AI Abuse control).
- **Cache:** `no-store` (streaming, inherently uncacheable).
- **Idempotency:** Not applicable — chat messages are naturally append-only, not retried-as-duplicate-create operations.

---

## PART H — Analytics APIs

| Endpoint | Method | Notes |
|---|---|---|
| `/analytics/hirescore` | GET | Current HireScore™ + sub-scores (Architecture §31) |
| `/analytics/hirescore/history` | GET | `?range=90d` — trend data for charting |
| `/analytics/insights` | GET | AI-generated narrative insights (Analytics Agent output, pre-computed nightly per Architecture §11, served from cache — `max-age=3600`) |
| `/analytics/weak-topics` | GET | |
| `/analytics/strong-topics` | GET | |
| `/analytics/company-readiness` | GET | `?company=amazon` |
| `/analytics/placement-probability` | GET | Directional estimate — response includes a `disclaimer` field, always, non-optional, since this is a sensitive/speculative metric |
| `/analytics/timeline` | GET | Full learning journey timeline, cursor-paginated |

---

## PART I — Project, Resume & Interview APIs

**Projects**

| Endpoint | Method | Notes |
|---|---|---|
| `/projects` | GET / POST | List / create manually |
| `/projects/generate` | POST | AI-tier → Project Mentor |
| `/projects/templates` | GET | Cacheable, curated starter templates |
| `/projects/:id` | GET / PATCH / DELETE | |
| `/projects/:id/milestones` | GET / POST | |
| `/projects/:id/milestones/:milestoneId` | PATCH | Mark complete |

**Resume**

| Endpoint | Method | Notes |
|---|---|---|
| `/resumes` | GET / POST | List versions / upload new |
| `/resumes/:id` | GET / DELETE | |
| `/resumes/:id/analyze` | POST | Body: `{ jobDescription }` → AI-tier, async (`202` + jobId for longer JD diffs) |
| `/resumes/:id/ats-score` | GET | Cached result of last analysis |
| `/resumes/:id/export` | GET | Returns signed Storage URL to PDF (Architecture §16) |

**Interview**

| Endpoint | Method | Notes |
|---|---|---|
| `/interviews/sessions` | GET / POST | |
| `/interviews/sessions/:id` | GET | |
| `/interviews/sessions/:id/questions/:qId/answer` | POST | Submit answer (text or reference to uploaded voice) |
| `/interviews/sessions/:id/feedback` | GET | Full scored feedback report |
| `/interviews/sessions/:id/replay` | GET | Returns signed URL to recording (if voice/video enabled) |
| `/interviews/history` | GET | Cursor-paginated past sessions |

---

## PART J — Company, Contest & Community APIs

**Company**

| Endpoint | Method | Notes |
|---|---|---|
| `/companies` | GET | Cacheable, cursor-paginated |
| `/companies/:slug` | GET | Full profile — roadmap, questions, OA pattern, salary, etc. (Architecture §25) |
| `/companies/:slug/interview-experiences` | GET | Cursor-paginated |
| `/companies/:slug/readiness` | GET | User-specific, `no-store` |

**Contest**

| Endpoint | Method | Notes |
|---|---|---|
| `/contests/upcoming` | GET | Cached `max-age=900` (matches sync job, Architecture §11) |
| `/contests/history` | GET | Own history, cursor-paginated |
| `/contests/rating` | GET | `?platform=leetcode` |

**Community**

| Endpoint | Method | Notes |
|---|---|---|
| `/community/friends` | GET / POST / DELETE | |
| `/community/study-rooms` | GET / POST | |
| `/community/study-rooms/:id/join` | POST | Returns real-time channel token (Architecture §13) |
| `/community/threads` | GET / POST | |
| `/community/threads/:id/replies` | GET / POST | |
| `/community/leaderboard` | GET | `?scope=global|college|friends` — backed by Redis sorted set, `no-store` |

---

## PART K — Notifications & Search APIs

| Endpoint | Method | Notes |
|---|---|---|
| `/notifications` | GET | Cursor-paginated, `no-store` |
| `/notifications/:id/read` | POST | |
| `/notifications/read-all` | POST | |
| `/notifications/preferences` | GET / PATCH | |
| `/search` | GET | `?q=&scope=all|dsa|theory|projects|notes|resources` — Postgres FTS (Architecture §15) |

---

## PART L — Chrome Extension APIs

Narrow, purpose-built surface — never the general app APIs (Architecture §14).

| Endpoint | Method | Notes |
|---|---|---|
| `/extension/auth/handshake` | POST | One-time pairing from web app → issues extension-scoped JWT |
| `/extension/auth/refresh` | POST | Refresh short-lived token |
| `/extension/sync/submission` | POST | **Idempotency-Key required** (keyed by `problemSlug+timestamp`, per Architecture §14 conflict resolution) |
| `/extension/sync/notes` | POST | |
| `/extension/session-check` | GET | Lightweight token validity check |

**Scope restriction:** the extension JWT carries a `scope: extension-sync` claim; any attempt to call non-extension endpoints with this token returns `403 INSUFFICIENT_SCOPE` — enforced at the RBAC layer (Architecture §6), not just by convention.

---

## PART M — Admin APIs

All under `/admin/*`, requiring role `ADMIN` or `SUPER_ADMIN`. Support **both** cursor and offset pagination (Part A.3 exception).

| Endpoint | Method | Notes |
|---|---|---|
| `/admin/users` | GET / PATCH | Search, filter, role management |
| `/admin/problems` | GET / POST / PATCH / DELETE | Content management |
| `/admin/theory` | GET / POST / PATCH / DELETE | |
| `/admin/companies` | GET / POST / PATCH / DELETE | |
| `/admin/roadmap-templates` | GET / POST / PATCH | |
| `/admin/analytics/platform` | GET | Platform-wide metrics (DAU/WAU, conversion, etc. — PRD §19/39) |
| `/admin/audit-logs` | GET | Read-only, immutable |
| `/admin/feature-flags` | GET / PATCH | |

All Admin mutating endpoints write to `AuditLog` automatically (Architecture §17) — this is enforced server-side, not optional per-endpoint.

---

## PART N — Webhooks

| Webhook | Source | Purpose | Verification |
|---|---|---|---|
| `/webhooks/clerk` | Clerk | User created/updated/deleted → sync to local `User` table | Svix signature verification (Clerk's webhook standard) |
| `/webhooks/stripe` | Stripe (future) | Subscription created/updated/cancelled | Stripe signature header verification |
| `/webhooks/contest-sync` | Internal cron callback | Not a true external webhook — internal job completion signal, included here for completeness of the async surface | Internal shared secret |
| `/webhooks/email-provider` | Transactional email provider (e.g., Resend) | Delivery/bounce/complaint events → update notification delivery status | Provider signature verification |

All webhook endpoints: verify signature **before** any parsing; return `200` quickly and process asynchronously via the job queue (Architecture §11) rather than doing heavy work in the request itself, to avoid provider-side timeout retries stacking up.

---

## PART O — Domain Events

Internal event bus (in-process pub/sub within the monolith initially — Architecture §2 keeps this extractable to a real message broker later without a rewrite, since events are already defined as discrete typed contracts).

| Event | Producer | Consumer(s) | Payload (key fields) | Retry Policy |
|---|---|---|---|---|
| `UserCreated` | Auth module (Clerk webhook) | Notifications, Analytics | `userId, email, createdAt` | 3 retries, backoff |
| `OnboardingCompleted` | Auth module | Roadmap module | `userId, targetRole, targetCompanies` | 3 retries |
| `ProblemSolved` | DSA module | Analytics, Spaced Repetition Engine, HireScore | `userId, problemId, difficulty, timeTaken` | 5 retries (this must not be lost — affects scoring integrity) |
| `FlashcardReviewed` | Theory module | Spaced Repetition Engine, Analytics | `userId, flashcardId, recallQuality` | 3 retries |
| `RoadmapGenerated` | AI Orchestrator (Planner/Career agent) | Dashboard, Notifications | `userId, roadmapId` | 3 retries |
| `HireScoreUpdated` | Analytics module (nightly job) | Dashboard, Notifications | `userId, newScore, delta` | 3 retries |
| `InterviewCompleted` | Interview module | Analytics, HireScore, Notifications | `userId, sessionId, overallScore` | 5 retries |
| `ResumeUploaded` | Resume module | Notifications (optional nudge to analyze) | `userId, resumeId` | 3 retries |
| `ContestCompleted` | Contest sync job | Analytics, Notifications | `userId, contestId, rank, ratingDelta` | 3 retries |
| `NotificationSent` | Notifications module | Analytics (delivery tracking) | `notificationId, channel, status` | Not retried — terminal event |

Every event handler is idempotent by design (checks for prior processing via event ID before mutating), since at-least-once delivery is assumed rather than exactly-once.

---

## PART P — API Security Recap (contract-level, not infra-level)

- **JWT:** Bearer token required on all `🔒` endpoints; Clerk-issued for web, extension-scoped short-lived JWT for the extension (Part L).
- **RBAC/Scopes:** Every endpoint's required role is declared explicitly in this contract (default: any authenticated user; elevated: `ADMIN`/`SUPER_ADMIN`; scoped: `extension-sync`).
- **Rate limits:** Declared per endpoint group above; AI endpoints are always the stricter tier regardless of plan, with plan-based quota multipliers layered on top.
- **Input sanitization/validation:** Every request body validated against a shared Zod schema (Architecture §18) before touching any service logic — invalid requests never reach business logic, full stop.
- **Prompt injection protection:** Documented per AI endpoint (Part G) — user content is always data, never instruction, in every agent call.
- **Replay attack prevention:** Idempotency keys (Part A.10) prevent duplicate-effect replay on mutating endpoints; webhook signature timestamps (Part N) are checked against a tolerance window (5 minutes) to reject stale replayed webhook payloads.

---

## PART Q — Complete API Index & Server Actions vs. REST Recommendation

### Q.1 Index by Module (version: all `v1` at launch)

| Module | Endpoint Count (approx.) | Primary Consumers |
|---|---|---|
| Auth & Users | 8 | Web, Mobile (future) |
| Dashboard | 5 | Web, Mobile |
| DSA | 12 | Web, Extension, Mobile |
| Theory | 10 | Web, Mobile |
| Roadmap/Planner | 7 | Web, Mobile |
| AI | 10 | Web, Mobile |
| Analytics | 8 | Web, Mobile |
| Projects | 6 | Web |
| Resume | 5 | Web |
| Interview | 6 | Web, Mobile |
| Company | 4 | Web, Mobile |
| Contest | 3 | Web, Extension |
| Community | 6 | Web, Mobile |
| Notifications | 4 | Web, Mobile |
| Search | 1 | Web, Mobile |
| Chrome Extension | 5 | Extension only |
| Admin | 8 | Web (admin console) |
| Webhooks | 4 | External providers only |

### Q.2 Server Actions vs. REST — Decision Table

| Use Server Actions when... | Use REST (`/v1/*`) when... |
|---|---|
| The mutation is triggered from within the Next.js-rendered web app itself (a form submit, a button click on a page the user is already on) | The consumer is **not** a Next.js render tree — Chrome Extension, future mobile app, external webhooks, or any future third-party API consumer |
| The response doesn't need to be consumed by a non-web client, ever | The endpoint needs a stable, versioned, documented contract because multiple independent teams/clients build against it |
| Progressive enhancement / no-JS fallback matters (Server Actions degrade gracefully with native forms) | Streaming responses are needed in a way that benefits from a plain HTTP contract (SSE for AI chat) — technically Server Actions can't stream in the same client-agnostic way |
| Tight co-location with a specific page's UI is desirable (e.g., marking a problem "bookmarked" from the problem detail page) | The operation is a webhook receiver (must be a plain HTTP endpoint by definition) |

**Concretely, for HireForge:**

- **Server Actions:** most of DSA (bookmark, submit from the in-app editor), Theory (quiz attempts, bookmarks), Projects (milestone updates), Settings, Community (thread replies, friend requests) — anything a logged-in web user does by clicking something on a page they're already viewing.
- **REST (`/v1/*`):** all of Chrome Extension (Part L, by definition), all Webhooks (Part N), AI Mentor chat specifically (needs SSE streaming with a clean client-agnostic contract, and will be the first thing a future mobile app needs), Admin bulk operations (often scripted/automated rather than clicked), and anything explicitly listed as consumed by "Mobile (future)" in the table above — building these as REST from day one avoids a rewrite when the mobile app arrives.

**Why this split, restated plainly:** Server Actions are cheaper to build and keep the codebase simpler for pure in-app interactions, but they are *not* a public contract — they can change shape whenever the UI changes, with no versioning guarantee. REST under `/v1/*` is reserved for exactly the surfaces that need the guarantees this whole document exists to provide: a frozen, cross-client, versioned agreement. Using REST everywhere would add unnecessary ceremony to simple in-app clicks; using Server Actions everywhere would break the Extension and future Mobile app the moment any page's internal logic shifted.

---

*End of Phase 2.5 API Contract. No backend code, Prisma schema, SQL, or frontend generated, per instruction. Awaiting approval before Phase 3 (Database Design).*
