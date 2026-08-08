# HireForge — Software Architecture Document
### Phase 2 of 5 | Modular Monolith on Next.js

*Companion document to the Phase 1 PRD. PRD is final and unmodified — this document defines the technical foundation only.*

---

## 1. High-Level Architecture

### 1.1 Components

**Frontend** — Next.js 15 (App Router), React Server Components by default, Client Components only where interactivity requires it (editors, real-time widgets, forms). Tailwind + Shadcn for UI, Framer Motion for animation.

**Backend** — Lives inside the same Next.js app as Server Actions + Route Handlers (`app/api/**`). No separate backend service in V1. This is the core of the "Modular Monolith" decision.

**Database** — PostgreSQL, hosted on Supabase, accessed through Prisma ORM for typed queries and migrations.

**AI Layer** — A dedicated internal service boundary (not a separate deployable in V1, but isolated in code as `server/ai/`) that fronts OpenAI/Claude/Gemini behind an **AI Orchestrator** (see Section 7). This is the layer your Hinglish suggestion targets directly — good instinct, and it's now load-bearing in the design.

**Caching** — Redis (Upstash), used for session cache, rate limiting, AI response caching, leaderboard sorted sets, and hot roadmap/knowledge-graph reads.

**Storage** — Supabase Storage for resumes, profile images, notes attachments, voice recordings, mock interview recordings.

**Authentication** — Clerk, handling identity, session, and JWT issuance; HireForge owns RBAC on top of Clerk's identity layer.

**Background Jobs** — A job queue (see Section 11) driven by Vercel Cron + a queue worker (BullMQ on Redis) for anything longer-running than a request/response cycle.

**Browser Extension** — A separate deployable (Manifest V3 Chrome extension) that talks to the monolith exclusively through versioned REST APIs (Section 10) — it is a *client*, not a module, of the monolith.

**External APIs** — OpenAI, Anthropic, Google (Gemini), LeetCode/Codeforces/CodeChef/AtCoder public or scraped endpoints, Clerk, Supabase, Stripe (future).

### 1.2 Communication Diagram

```
                        ┌─────────────────────────────┐
                        │        Chrome Extension      │
                        │   (separate deployable)      │
                        └──────────────┬───────────────┘
                                       │ HTTPS (versioned REST, JWT)
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                         NEXT.JS MODULAR MONOLITH                  │
│                                                                    │
│  ┌───────────────┐   ┌────────────────┐   ┌────────────────────┐ │
│  │  App Router    │   │  Server        │   │  API Route         │ │
│  │  (RSC + Client │──▶│  Actions       │──▶│  Handlers          │ │
│  │  Components)   │   │  (mutations)   │   │  (external/webhook)│ │
│  └───────┬───────┘   └───────┬────────┘   └──────────┬─────────┘ │
│          │                   │                        │          │
│          ▼                   ▼                        ▼          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    modules/* (feature modules)                │ │
│  │   dsa · theory · resume · projects · roadmaps · analytics ·  │ │
│  │   interview · community · contests · company-mode · admin    │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                              │                                    │
│          ┌───────────────────┼────────────────────┐               │
│          ▼                   ▼                    ▼               │
│  ┌───────────────┐   ┌───────────────┐   ┌─────────────────────┐ │
│  │  AI            │   │  Prisma /     │   │  Redis (Upstash)    │ │
│  │  Orchestrator  │   │  PostgreSQL   │   │  cache/queue/rate   │ │
│  │  (Section 7)   │   │  (Supabase)   │   │  limit              │ │
│  └───────┬───────┘   └───────────────┘   └─────────────────────┘ │
│          │                                                        │
└──────────┼────────────────────────────────────────────────────────┘
           ▼
   ┌───────────────────────────────┐
   │  OpenAI / Claude / Gemini     │
   │  (behind Orchestrator only)   │
   └───────────────────────────────┘
```

**Key rule:** Nothing outside `server/ai/` talks to an LLM provider directly. Every module that needs AI capability calls the Orchestrator's internal interface, never the provider SDK. This is exactly the future-proofing your Hinglish note called out — swapping providers means touching one layer, not twenty.

---

## 2. Application Architecture

### 2.1 Why Modular Monolith (not Microservices)

**Decision:** Single Next.js deployable, internally partitioned into strictly isolated modules.

**Why:**
- One developer, one deploy pipeline, one database connection pool — microservices add network hops, service discovery, and distributed transaction complexity with zero payoff at this team size.
- Next.js Server Actions + Route Handlers give us request/response boundaries "for free" without standing up separate services.
- A monolith with real module boundaries can be split into microservices later *module by module*, only when a specific module's load profile actually demands independent scaling (most likely candidates: AI Orchestrator, Contest Sync jobs).

**Alternatives considered:**
- *Microservices from day one* — rejected: operational overhead (auth-per-service, service mesh, distributed logging) far exceeds the benefit for a pre-PMF product with one engineer.
- *Separate backend (NestJS/Express) + separate frontend* — rejected: doubles deployment surface and duplicates auth/validation logic for no scaling benefit Next.js doesn't already provide via Route Handlers.

**Pros:** Single codebase, single deploy, shared types end-to-end (frontend ↔ backend), fast iteration, cheaper hosting.

**Cons:** Requires discipline to maintain module boundaries — a monolith without enforced boundaries becomes a "big ball of mud." We counter this with the dependency rules below.

**Future migration strategy:** Because every module owns its own `service.ts` (business logic), `repository.ts` (data access), and `api/` folder, extracting a module into a standalone service later is a matter of: (1) wrapping its service layer in an HTTP interface, (2) pointing the monolith's calls at that HTTP interface instead of the in-process import, (3) giving it its own database schema/connection if needed. No rewrite — a *lift*, not a *rebuild*.

### 2.2 Folder Boundaries & Module Isolation

Each feature module (`modules/dsa`, `modules/resume`, etc.) is a **vertical slice**:

```
modules/dsa/
  ├── components/       (DSA-specific UI, never imported by other modules)
  ├── services/         (business logic)
  ├── repository/       (Prisma queries scoped to DSA tables)
  ├── actions/           (Server Actions specific to DSA)
  ├── api/               (Route Handlers specific to DSA, if externally consumed e.g. by extension)
  └── types.ts
```

### 2.3 Dependency Rules

1. **Modules never import another module's internals directly.** `modules/resume` cannot `import` from `modules/dsa/services`. If Resume needs DSA data (e.g., for HireScore), it goes through a shared **contract** in `lib/contracts/` or calls a public exported function explicitly marked as the module's public API (`modules/dsa/index.ts`).
2. **Shared code lives in `lib/`, not in a module.** Anything two+ modules need (date utils, formatting, the Prisma client singleton) belongs in `lib/`.
3. **The AI Orchestrator is the only path to LLMs.** No module calls OpenAI/Anthropic/Gemini SDKs directly — ever.
4. **Database access is repository-scoped.** Each module's repository only queries tables it owns. Cross-module data joins happen at the service layer via explicit calls between modules' public APIs, not raw Prisma joins across module boundaries — this keeps future extraction possible.

This ruleset is what makes "future microservices extraction becomes easy if required" (your requirement) actually true rather than aspirational.

---

## 3. Feature Modules

Each module below follows the same template: Responsibilities, Components, Services, API, Database, Dependencies.

### 3.1 Authentication
- **Responsibilities:** Sign up/in via Clerk, session sync, RBAC role assignment, onboarding flow trigger.
- **Components:** `SignInForm`, `OnboardingWizard`, `RoleGate`.
- **Services:** `syncClerkUserToDb()`, `assignDefaultRole()`.
- **API:** Clerk webhook handler (`/api/webhooks/clerk`).
- **Database:** `User`, `UserRole`.
- **Dependencies:** Clerk SDK only.

### 3.2 Dashboard
- **Responsibilities:** Aggregate view across all modules — today's tasks, HireScore snapshot, streaks.
- **Components:** `DashboardGrid`, `TodayTasksCard`, `HireScoreWidget`, `StreakCalendar`.
- **Services:** `getDashboardSnapshot(userId)` — calls public APIs of DSA, Theory, Analytics, Roadmap modules and composes a single read model.
- **API:** `GET /api/dashboard`.
- **Database:** No owned tables — pure aggregator. May cache its composed result in Redis.
- **Dependencies:** DSA, Theory, Analytics, Roadmaps, Planner Agent (read-only, via public module APIs).

### 3.3 DSA
- **Responsibilities:** Problem catalog, submission tracking, pattern tagging, revision scheduling trigger.
- **Components:** `ProblemList`, `ProblemDetail`, `SubmissionEditor`, `PatternBadge`.
- **Services:** `recordSubmission()`, `computeDifficultyStats()`, `triggerSpacedRepetitionEntry()`.
- **API:** `GET/POST /api/dsa/problems`, `POST /api/dsa/submissions`.
- **Database:** `Problem`, `Submission`, `Pattern`, `RevisionSchedule`.
- **Dependencies:** Knowledge Graph (Section 9), Memory Manager (Section 8), Spaced Repetition Engine.

### 3.4 Theory
- **Responsibilities:** Structured notes (OS/DBMS/CN/OOP), quizzes, flashcards.
- **Components:** `TopicReader`, `QuizRunner`, `FlashcardDeck`.
- **Services:** `gradeQuiz()`, `generateFlashcardsFromNote()` (calls AI Orchestrator).
- **API:** `GET /api/theory/topics`, `POST /api/theory/quiz-attempts`.
- **Database:** `TheoryTopic`, `Quiz`, `Flashcard`, `QuizAttempt`.
- **Dependencies:** Knowledge Graph, AI Orchestrator (Theory Mentor agent).

### 3.5 AI Mentor (Orchestrator-facing surface)
- **Responsibilities:** Chat UI, routes user queries into the Orchestrator, displays multi-agent responses.
- **Components:** `MentorChatWindow`, `AgentBadge`, `ContextPanel`.
- **Services:** `sendMentorMessage()` — the client-facing entry point into `server/ai/orchestrator`.
- **API:** `POST /api/ai/mentor/message` (streaming response).
- **Database:** `Conversation`, `Message` (conversation memory — see Section 8).
- **Dependencies:** AI Orchestrator, Memory Manager, Knowledge Graph.

### 3.6 Resume
- **Responsibilities:** Resume builder, versioning, JD comparison, ATS scoring.
- **Components:** `ResumeEditor`, `TemplatePicker`, `ATSScoreCard`, `JDComparisonView`.
- **Services:** `scoreResumeAgainstJD()` (calls Resume Mentor agent), `exportResumePDF()`.
- **API:** `POST /api/resume/analyze`, `GET/POST /api/resume/versions`.
- **Database:** `Resume`, `ResumeVersion`, `JDAnalysis`.
- **Dependencies:** AI Orchestrator (Resume Mentor), Storage (PDF export), Projects module (pulls completed projects into resume suggestions).

### 3.7 Projects
- **Responsibilities:** AI Project Generator, project tracking, milestone checklist.
- **Components:** `ProjectGeneratorForm`, `ProjectCard`, `MilestoneChecklist`.
- **Services:** `generateProjectIdeas()` (Project Mentor agent).
- **API:** `POST /api/projects/generate`, `PATCH /api/projects/:id/milestones`.
- **Database:** `Project`, `ProjectMilestone`.
- **Dependencies:** AI Orchestrator (Project Mentor), Resume module (feeds completed projects).

### 3.8 Roadmaps
- **Responsibilities:** AI-personalized + curated roadmap generation and tracking.
- **Components:** `RoadmapTimeline`, `RoadmapNode`, `RegenerateButton`.
- **Services:** `generateRoadmap()` (Planner Agent + Career Mentor agent), `adjustRoadmapFromRootCause()` (Section 23 loop).
- **API:** `POST /api/roadmaps/generate`, `GET /api/roadmaps/:userId`.
- **Database:** `Roadmap`, `RoadmapNode`.
- **Dependencies:** Knowledge Graph, AI Orchestrator, DSA + Theory modules (for progress signal).

### 3.9 Analytics
- **Responsibilities:** HireScore computation, pattern-level insights, placement probability modeling.
- **Components:** `HireScoreGauge`, `InsightFeed`, `TrendChart`.
- **Services:** `computeHireScore()`, `generateInsightNarratives()` (Analytics Agent).
- **API:** `GET /api/analytics/hirescore`, `GET /api/analytics/insights`.
- **Database:** `HireScoreSnapshot`, `Insight` (denormalized, recomputed on a schedule — see Section 11).
- **Dependencies:** DSA, Theory, Resume, Interview modules (read-only aggregation), Analytics Agent.

### 3.10 Interview
- **Responsibilities:** AI mock interviews (text + voice), feedback scoring.
- **Components:** `MockInterviewRoom`, `VoiceCapture`, `FeedbackReport`.
- **Services:** `runMockInterview()` (Interview Mentor agent), `scoreVoiceDelivery()` (Voice AI, Section 37).
- **API:** `POST /api/interview/sessions`, `GET /api/interview/sessions/:id/feedback`.
- **Database:** `InterviewSession`, `InterviewFeedback`, `VoiceRecording` (metadata; file in Storage).
- **Dependencies:** AI Orchestrator (Interview Mentor), Storage, Memory Manager (interview memory).

### 3.11 Community
- **Responsibilities:** Friends, study rooms, discussion threads, sharing.
- **Components:** `FriendsList`, `StudyRoom`, `ThreadView`, `ShareSheet`.
- **Services:** `createStudyRoom()`, `postThreadReply()`.
- **API:** `GET/POST /api/community/threads`, WebSocket channel for study rooms (Section 13).
- **Database:** `Friendship`, `StudyRoom`, `Thread`, `ThreadReply`.
- **Dependencies:** Notifications module.

### 3.12 Contest Center
- **Responsibilities:** Aggregate contests across platforms, rating history.
- **Components:** `ContestCalendar`, `RatingGraph`.
- **Services:** `syncContestData()` (background job, Section 11).
- **API:** `GET /api/contests/upcoming`, `GET /api/contests/history`.
- **Database:** `Contest`, `ContestResult`.
- **Dependencies:** External contest APIs, Chrome Extension (for sync).

### 3.13 Company Mode
- **Responsibilities:** Company-specific dashboard transformation.
- **Components:** `CompanySelector`, `CompanyDashboard`, `CompanyReadinessCard`.
- **Services:** `getCompanyProfile()`, `computeCompanyReadiness()`.
- **API:** `GET /api/companies/:slug`.
- **Database:** `Company`, `CompanyQuestion`, `CompanyReadinessScore`.
- **Dependencies:** DSA, Interview, Analytics modules (readiness inputs).

### 3.14 Notifications
- **Responsibilities:** In-app + email notification delivery (revision due, roadmap updated, mock interview reminder).
- **Components:** `NotificationBell`, `NotificationList`.
- **Services:** `dispatchNotification()`.
- **API:** `GET /api/notifications`, `PATCH /api/notifications/:id/read`.
- **Database:** `Notification`.
- **Dependencies:** Email queue (Section 11), all modules can trigger via a shared `NotificationEvent` contract.

### 3.15 Settings
- **Responsibilities:** Profile, preferences, subscription management.
- **Components:** `SettingsForm`, `SubscriptionCard`.
- **Services:** `updatePreferences()`.
- **API:** `GET/PATCH /api/settings`.
- **Database:** `UserSettings`, `Subscription`.
- **Dependencies:** Clerk, Stripe (future).

### 3.16 Admin
- **Responsibilities:** Content management (problems, theory topics, companies), user moderation, platform metrics.
- **Components:** `AdminTable`, `ContentEditor`, `MetricsDashboard`.
- **Services:** `bulkImportProblems()`, `moderateUser()`.
- **API:** `/api/admin/**` (RBAC-gated, Section 6).
- **Database:** Reads/writes across most module tables under elevated permission.
- **Dependencies:** All modules (read access), RBAC middleware.

### 3.17 Chrome Extension (client, not server module)
- **Responsibilities:** Detect LeetCode/GFG pages, show sidebar, sync solves.
- **Components:** Extension-side React mini-app (separate build).
- **Services:** Calls `POST /api/extension/sync` on the monolith.
- **API (consumed):** `/api/extension/*` — a dedicated, tightly-scoped API surface (Section 10.9), never the internal Server Actions.
- **Database:** None locally beyond an offline queue (IndexedDB) — synced to monolith's `Submission` table.
- **Dependencies:** DSA module (via its public API only), Auth (JWT from Clerk).

---

## 4. Folder Structure

```
hireforge/
├── app/                                # Next.js App Router — routing + composition only
│   ├── (marketing)/                    # public landing pages
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/                    # authenticated app shell
│   │   ├── dashboard/
│   │   ├── dsa/
│   │   ├── theory/
│   │   ├── mentor/
│   │   ├── resume/
│   │   ├── projects/
│   │   ├── roadmaps/
│   │   ├── analytics/
│   │   ├── interview/
│   │   ├── community/
│   │   ├── contests/
│   │   ├── company/[slug]/
│   │   ├── settings/
│   │   └── admin/
│   ├── api/                            # Route Handlers ONLY for external/webhook/extension consumers
│   │   ├── webhooks/clerk/route.ts
│   │   ├── extension/[...]/route.ts
│   │   ├── ai/mentor/message/route.ts  # streaming endpoint
│   │   └── v1/[...]/route.ts           # versioned public API surface
│   ├── layout.tsx
│   └── globals.css
│
├── modules/                            # feature modules — the heart of the monolith
│   ├── auth/
│   ├── dashboard/
│   ├── dsa/
│   ├── theory/
│   ├── ai-mentor/
│   ├── resume/
│   ├── projects/
│   ├── roadmaps/
│   ├── analytics/
│   ├── interview/
│   ├── community/
│   ├── contests/
│   ├── company-mode/
│   ├── notifications/
│   ├── settings/
│   └── admin/
│       (each module contains: components/ services/ repository/ actions/ api/ types.ts)
│
├── server/
│   ├── ai/
│   │   ├── orchestrator/               # Section 7 — the only caller of LLM SDKs
│   │   │   ├── orchestrator.ts
│   │   │   ├── router.ts               # decides which agent(s) to invoke
│   │   │   └── response-builder.ts
│   │   ├── agents/
│   │   │   ├── dsa-mentor.ts
│   │   │   ├── theory-mentor.ts
│   │   │   ├── resume-mentor.ts
│   │   │   ├── career-mentor.ts
│   │   │   ├── interview-mentor.ts
│   │   │   ├── project-mentor.ts
│   │   │   ├── analytics-agent.ts
│   │   │   ├── planner-agent.ts
│   │   │   └── research-agent.ts
│   │   ├── memory/                     # Section 8
│   │   │   ├── memory-manager.ts
│   │   │   ├── short-term.ts
│   │   │   ├── long-term.ts
│   │   │   └── summarizer.ts
│   │   ├── knowledge-graph/            # Section 9
│   │   │   ├── graph-engine.ts
│   │   │   └── root-cause.ts
│   │   └── providers/                  # thin SDK wrappers — ONLY files allowed to import provider SDKs
│   │       ├── openai.ts
│   │       ├── anthropic.ts
│   │       └── gemini.ts
│   ├── auth/
│   │   ├── rbac.ts
│   │   └── session.ts
│   └── db/
│       ├── prisma.ts                   # singleton client
│       └── redis.ts                    # singleton client
│
├── components/                         # truly shared, cross-module UI only (buttons, cards, shells)
│   └── ui/                             # shadcn primitives
│
├── hooks/                              # shared React hooks (use-debounce, use-media-query, etc.)
│
├── lib/
│   ├── contracts/                      # cross-module TypeScript interfaces (public API shapes)
│   ├── validation/                     # zod schemas, shared across client + server
│   ├── utils/
│   └── constants/
│
├── actions/                            # ONLY truly cross-cutting Server Actions (rare — most live in modules/*)
│
├── jobs/                               # background job definitions (Section 11)
│   ├── daily-planner.ts
│   ├── weekly-report.ts
│   ├── revision-reminder.ts
│   ├── contest-sync.ts
│   ├── roadmap-regeneration.ts
│   └── analytics-refresh.ts
│
├── emails/                             # React Email templates
│
├── middleware.ts                       # Clerk + RBAC route protection
│
├── providers/                          # React context providers (QueryClientProvider, ThemeProvider)
│
├── types/                              # global ambient types only (not module-specific)
│
├── config/                             # app-wide config (feature flags, plan limits)
│
├── styles/                             # Tailwind config, global tokens
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── extension/                          # SEPARATE package — Chrome extension source
    ├── src/
    ├── manifest.json
    └── package.json
```

**Rule enforced by this structure:** `app/` never contains business logic — only composition (importing module components) and routing. `modules/*` never import Next.js routing primitives directly into their services layer, keeping services portable if extracted later.

---

## 5. Database Architecture

| Data | Store | Reasoning |
|---|---|---|
| Users, roles, permissions | Postgres (Prisma) | Permanent, relational, needs ACID |
| Problems, submissions, theory content | Postgres | Permanent, relational, heavily queried/joined |
| Roadmaps, knowledge graph nodes/edges | Postgres | Permanent structure; read-heavy → cached in Redis on top |
| Conversation/message history (AI memory) | Postgres | Permanent but pruned/summarized periodically (Section 8) |
| Resume versions, JD analyses | Postgres + Supabase Storage (files) | Metadata relational, binary in object storage |
| Sessions | Clerk-managed + Redis mirror | Clerk owns source of truth; Redis mirrors for fast middleware checks |
| Leaderboards | Redis (sorted sets) | Needs O(log N) rank queries — not a Postgres strength at scale |
| Rate limit counters | Redis (TTL keys) | Ephemeral by definition |
| AI response cache (identical prompt+context) | Redis (TTL) | Cost control — avoid re-calling LLM for identical recent queries |
| Roadmap/knowledge-graph hot reads | Redis (cache-aside over Postgres) | Read-heavy, changes infrequently |
| Contest data (upcoming contests) | Redis (TTL, refreshed by cron) | External, time-sensitive, cheap to refetch |
| HireScore snapshots | Postgres (historical) + Redis (latest, hot read) | Need history for trend charts, need speed for dashboard |

**Permanent vs. expiring, explicit:**
- **Permanent (Postgres):** anything that is a fact about the user's journey — never silently expires.
- **Expiring (Redis, TTL-bound):** anything that's either a cache of Postgres data or genuinely ephemeral (rate limits, live session flags, contest countdowns).

**Why Prisma over raw SQL/Supabase client:** Prisma gives us type-safe queries shared between Server Actions and Route Handlers, and a first-class migration system — important since one developer needs migrations to be safe and reversible, not hand-rolled SQL scripts.

**Why Supabase specifically (vs. plain hosted Postgres):** We get Postgres + Storage + (optionally, later) Realtime and Row-Level Security in one provider, reducing the number of vendors a solo developer manages. Prisma is used for app-level queries; Supabase's RLS is kept as a defense-in-depth layer, not the primary authorization mechanism (that's RBAC in the app layer — Section 6).

---

## 6. Authentication Architecture

- **Identity provider:** Clerk handles sign-up/in, session tokens, social login, MFA.
- **Middleware:** `middleware.ts` intercepts every request to `(dashboard)` and `admin` route groups, validates the Clerk session, and attaches `userId` + `role` to the request context before it reaches any Server Component or Action.
- **Protected routes:** Route-group-level protection (`(dashboard)/*` requires any authenticated role; `(dashboard)/admin/*` requires `role = ADMIN`), enforced in middleware, *not* left to individual pages to remember.
- **RBAC:** Roles — `STUDENT` (default), `MODERATOR` (community), `ADMIN` (content + user management), `SUPER_ADMIN` (platform config). Role stored in our own `UserRole` table (not just Clerk metadata) so authorization logic stays queryable/joinable in Postgres and isn't hostage to a third party's schema.
- **JWT:** Clerk-issued JWT is verified server-side on every Route Handler that serves the Chrome Extension (which cannot rely on cookies the way the web app can) — extension calls always carry a Bearer token.
- **Session management:** Web app uses Clerk's cookie-based session (httpOnly, secure). Extension uses short-lived JWT + refresh flow.
- **API authorization:** Every module's `api/` and `actions/` layer re-validates `userId` + role server-side — never trusts a client-supplied user ID. This is enforced via a shared `requireAuth()` / `requireRole()` helper in `server/auth/rbac.ts` that every module imports rather than reimplementing.
- **Admin access:** Separate route group with its own layout, gated by `requireRole('ADMIN')` at the layout level (fails closed — no admin page renders without the check passing first).

---

## 7. AI Architecture — Multi-Agent Orchestration

This directly incorporates and formalizes your Hinglish suggestion — it's the right call, and here's the full design.

### 7.1 Why an Orchestrator (not direct User → AI)

**Problem with direct calls:** if every module calls OpenAI directly, switching providers, adding memory, adding rate limiting, or adding cost controls means touching every module. It also means every module reimplements prompt construction, which drifts inconsistently over time.

**Solution:** every AI-powered feature routes through one internal entry point:

```
User Request
     │
     ▼
AI Orchestrator (server/ai/orchestrator/orchestrator.ts)
     │
     ├─▶ Router — decides which agent(s) handle this request
     │
     ▼
 ┌─────────────────────────────────────────────────┐
 │   Agent Layer (one of nine specialized agents)   │
 └─────────────────────┬─────────────────────────────┘
                        ▼
              Memory Manager (Section 8)
                        │
                        ▼
             Knowledge Graph Engine (Section 9)
                        │
                        ▼
              Response Builder (formats, validates,
              strips unsafe content, attaches citations)
                        │
                        ▼
                     User
```

**Provider abstraction:** agents never call `openai.chat.completions.create()` directly — they call a provider-agnostic `llm.complete({ messages, tools })` interface defined in `server/ai/providers/`. Switching the underlying model for an agent (or all agents) is a one-line config change, not a codebase-wide refactor. This is exactly the property your note asked for.

### 7.2 The Nine Agents

Each agent is a configuration object (system prompt + tool list + memory scope), not a separate deployable — they're routed to *within* the Orchestrator process.

| Agent | Responsibilities | Memory Scope | Key Tools | Typical Input → Output |
|---|---|---|---|---|
| **DSA Mentor** | Hints, code review, pattern explanation | Learning Memory + Conversation | `getProblem()`, `getSubmissionHistory()`, `queryKnowledgeGraph()` | Code + question → hint/review, never full solution unless explicitly asked |
| **Theory Mentor** | Concept explanation, flashcard generation | Learning Memory | `getTopicContent()`, `generateFlashcards()` | Topic/question → explanation or flashcard set |
| **Resume Mentor** | ATS scoring, JD gap analysis, bullet rewrites | Resume Memory | `parseResume()`, `parseJD()`, `diffSkills()` | Resume + JD → structured gap report |
| **Career Mentor** | Career roadmap generation across role tracks | Long-term + Behavior Memory | `queryKnowledgeGraph()`, `getMarketData()` (Research Agent hand-off) | Target role → full roadmap |
| **Interview Mentor** | Mock interview conduct + scoring (text & voice) | Interview Memory | `generateQuestion()`, `evaluateAnswer()`, `scoreVoiceDelivery()` | Session transcript → structured feedback |
| **Project Mentor** | Personalized project generation | Learning Memory | `getUserSkills()`, `generateMilestones()` | Skills → project spec |
| **Analytics Agent** | Turns raw stats into narrative insight | Behavior + Learning Memory | `queryAnalyticsStore()` | Stats → plain-language insight |
| **Planner Agent** | Daily/weekly plan generation and re-planning | Short-term + Behavior Memory | `getTodayDue()`, `getRoadmapState()` | User state → today's task list |
| **Research Agent** | Fetches/aggregates external info (salary data, company patterns) not stored internally | None persistent (stateless per-call) | Web/search tool, cached results | Query → summarized findings |

**Communication flow example (real scenario):** Student asks Mentor chat "why do I keep failing graph problems?" → Orchestrator Router identifies this as a DSA diagnostic query → routes to **DSA Mentor**, which calls `queryKnowledgeGraph()` and pulls **Root Cause Analysis** (Section 23) → DSA Mentor's draft response is passed to **Response Builder**, which checks it against Memory Manager for consistency with past conversations (avoiding contradicting earlier advice) → final response streamed to user, and the interaction is written back into Learning Memory.

**Multi-agent hand-off example:** Career Mentor generating a roadmap for "ML Engineer" may internally request a Research Agent call for current market-relevant skills before finalizing — this hand-off happens *within* the Orchestrator, invisible to the module that requested the roadmap.

---

## 8. Memory Architecture

### 8.1 Memory Categories

| Type | Contents | Store | Lifespan |
|---|---|---|---|
| **Short-term Memory** | Current conversation's last N turns | Redis | Session-bound, TTL ~2 hours |
| **Long-term Memory** | Summarized profile: strengths/weaknesses, preferences, goals | Postgres (structured) + periodic summary blob | Permanent, updated incrementally |
| **Conversation Memory** | Full raw chat logs | Postgres | Permanent (for user trust/history), but not replayed in full to the LLM — only summarized |
| **Learning Memory** | Solved problems, mistakes, topic mastery | Postgres (already the DSA/Theory modules' own tables — Memory Manager *reads* them, doesn't duplicate) | Permanent |
| **Behavior Memory** | Study habits, active hours, streaks | Postgres, aggregated nightly | Permanent, rolling window emphasis |
| **Resume Memory** | Resume versions, JD comparisons over time | Postgres + Storage | Permanent |
| **Interview Memory** | Past mock interview feedback | Postgres | Permanent |

### 8.2 Storage & Retrieval Strategy

- **Facts** (solved problems, mistakes, resume versions) already live as structured rows in each module's own tables — the Memory Manager does **not** duplicate this data. It's a read-aggregator with a caching layer, not a second source of truth. This avoids the classic mistake of building a parallel "memory database" that drifts from the real data.
- **Narrative memory** (a compact "here's what you need to know about this student" summary) is generated on a schedule — not on every request — and cached. The summary is what actually gets injected into agent prompts, not raw history.

### 8.3 Summarization

- A nightly job (Section 11) regenerates each active user's long-term memory summary: a few hundred tokens capturing weak topics, recent trend, preferences, and open goals.
- Conversation memory beyond the short-term window is summarized incrementally (rolling summary, updated each session) rather than replayed — this is the primary token-cost control.

### 8.4 Token Usage Minimization

- Agents receive: (1) the rolling long-term summary, (2) the last few short-term turns, (3) only the specific structured data relevant to the current query (e.g., DSA Mentor pulls *only* the relevant problem's submission history, not the user's entire history).
- Redis caches the long-term summary so it isn't regenerated per-message — only invalidated/regenerated on the nightly job or after a significant event (e.g., a mock interview completes).

### 8.5 Embeddings / Vector Database — Decision

**Do we need one in V1? No — and here's the reasoning, not just the answer:**

Vector search earns its cost when you need *semantic similarity search over large, unstructured text corpora* (e.g., "find me problems similar in concept to this one" across thousands of freeform descriptions, or semantic search across community threads). In V1:
- Problem/topic relationships are **explicit and structured** (the Knowledge Graph, Section 9) — a graph traversal is more accurate and cheaper than an embedding similarity search for "what's the prerequisite of X."
- User memory is **structured + summarized**, not a pile of unstructured text needing semantic retrieval.

**Where it becomes worth it (future, flagged honestly):** Global Search (Section 15) across notes/resources/community content at scale, and "find similar past mistakes" pattern matching once Learning Memory volume is very large. We design the schema so a `pgvector` extension can be added to Postgres later without a new database — Supabase supports `pgvector` natively, so this is a config/migration addition, not an architectural pivot.

---

## 9. Knowledge Graph Architecture

- **Nodes:** Topics/concepts (e.g., "Arrays," "Sorting," "Comparator," "Merge Intervals," "BFS," "Queue," "Circular Queue").
- **Edges:** Directed, representing "is a prerequisite of." Weighted optionally (some prerequisites are stronger dependencies than others).
- **Storage:** Postgres tables `KnowledgeNode` and `KnowledgeEdge` (adjacency-list model) — small enough dataset (hundreds, not millions, of nodes) that a graph database (Neo4j) is unnecessary overhead; recursive CTEs in Postgres handle traversal fine at this scale.
- **Caching:** The full graph (or per-subject subgraphs) is cached in Redis as an adjacency list, refreshed whenever an admin edits graph content — traversal happens against the cached structure, not live Postgres queries, since it's read constantly and written rarely.

**How AI queries it:** The DSA Mentor and Planner Agent call `queryKnowledgeGraph(nodeId)` from `server/ai/knowledge-graph/graph-engine.ts`, which returns the prerequisite chain. This is a plain internal function call — not itself an LLM call — the LLM only reasons over the *result* of the graph traversal.

**How roadmap generation uses it:** `generateRoadmap()` topologically sorts the relevant subgraph for a target role/company, then interleaves it with the user's current mastery (from Learning Memory) to produce an ordered plan that never assigns a topic before its prerequisites.

**How weakness detection uses it:** This is exactly Section 23's Root Cause Analysis — `root-cause.ts` walks edges backward from a detected weak node until it finds the shallowest node where the user's mastery signal is also weak, and returns that as the true root cause.

---

## 10. API Architecture

### 10.1 Conventions
- **Naming:** REST-ish, resource-based, plural nouns: `/api/v1/problems`, `/api/v1/resumes`.
- **Versioning:** All externally-consumed endpoints (extension, future public API) live under `/api/v1/`. Internal Server Actions are NOT versioned (they're not a public contract — they change with the UI they serve).
- **Error format (standardized across all endpoints):**
```json
{
  "error": {
    "code": "RESUME_NOT_FOUND",
    "message": "Human-readable message",
    "details": {}
  }
}
```
- **Success format:** `{ "data": { ... }, "meta": { "page": 1 } }` for paginated resources.

### 10.2–10.9 Endpoint Groups (representative, not exhaustive)

| Group | Examples |
|---|---|
| Authentication | `POST /api/webhooks/clerk` (internal sync only — Clerk owns the actual auth endpoints) |
| Dashboard | `GET /api/v1/dashboard` |
| DSA | `GET /api/v1/problems`, `POST /api/v1/submissions`, `GET /api/v1/problems/:id/hints` |
| Theory | `GET /api/v1/theory/topics`, `POST /api/v1/quiz-attempts` |
| Resume | `POST /api/v1/resume/analyze`, `GET /api/v1/resume/versions` |
| Analytics | `GET /api/v1/analytics/hirescore`, `GET /api/v1/analytics/insights` |
| Interview | `POST /api/v1/interview/sessions`, `GET /api/v1/interview/sessions/:id` |
| Admin | `POST /api/v1/admin/problems`, `PATCH /api/v1/admin/users/:id/role` (RBAC-gated) |
| Chrome Extension | `POST /api/v1/extension/sync`, `GET /api/v1/extension/session-check` |

Most user-facing mutations (form submits, marking a problem solved from within the app) go through **Server Actions**, not these REST endpoints — the REST surface under `/api/v1/` exists specifically for consumers *outside* the Next.js render tree (extension, webhooks, future mobile app, future public API).

---

## 11. Background Jobs

| Job | Trigger | Purpose | Retry Strategy |
|---|---|---|---|
| Daily Planner | Cron, per-user local morning time | Generate today's task list (Section 29) | Retry 3x with backoff; on final failure, fall back to yesterday's unfinished plan |
| Weekly Report | Cron, weekly | Progress summary email | Retry 3x; failure logged, not user-blocking |
| Revision Reminder | Cron, hourly sweep | Push due spaced-repetition items into Notification queue | Idempotent — safe to retry, checks `sent` flag |
| Contest Sync | Cron, every 15 min | Pull upcoming contests from external platforms, refresh Redis cache | Retry with exponential backoff; stale cache served on failure rather than blank |
| Roadmap Regeneration | Event-triggered (mock interview completed, milestone hit) + weekly cron fallback | Re-run Planner/Career Mentor agents | Queued via BullMQ, retried 3x, dead-letter queue on repeated failure |
| Analytics Refresh | Cron, nightly | Recompute HireScore snapshots and insights | Must complete before Daily Planner runs (job dependency ordering) |
| Email Queue | Event-triggered | Transactional + digest emails | BullMQ with exponential backoff, max 5 attempts |
| Notification Queue | Event-triggered | In-app notification fan-out | Same as above |

**Infra:** Vercel Cron triggers lightweight jobs directly; anything with meaningful processing time or that needs guaranteed delivery (emails, AI-heavy regeneration) goes through a BullMQ queue backed by the same Upstash Redis, processed by a small worker process (can be a Vercel Cron-triggered function that drains the queue, avoiding a separate always-on worker server in V1).

---

## 12. Caching Strategy

| Cached Item | TTL | Why |
|---|---|---|
| Leaderboard (Redis sorted set) | No TTL — live structure, updated on write | Needs real-time rank, not a "cache" per se but Redis-native |
| Roadmap (per user) | 1 hour, invalidated on regeneration event | Read far more than written |
| Question/problem metadata | 6 hours | Rarely changes, high read volume |
| AI responses (identical prompt+context hash) | 15 minutes | Cost control for repeated identical queries (e.g., common hint requests) |
| Rate limit counters | Matches rate limit window (e.g., 1 min, 1 hour) | By definition ephemeral |
| Session cache (mirrors Clerk session validity) | 5 minutes | Avoid hitting Clerk on every request; short enough that revocation propagates fast |
| Contest data | 15 minutes | Matches sync job frequency |
| Long-term AI memory summary | 24 hours or invalidated on significant event | Balances freshness against regeneration cost |

---

## 13. Real-Time Architecture

**Decision: Server-Sent Events (SSE) for AI streaming + notifications; WebSocket (via a managed service, e.g., Pusher/Ably, not self-hosted) for Study Rooms and live Pomodoro sync.**

**Why not WebSocket for everything:** Vercel's serverless functions don't hold persistent connections well — SSE works cleanly with Next.js Route Handlers for one-directional server→client streams (AI Mentor typing, notification push) without needing a separate persistent-connection server.

**Why WebSocket (via managed provider) specifically for Study Rooms:** Study Rooms need bidirectional, low-latency, multi-user sync (who's online, shared timer state) — this genuinely needs a real socket, and running our own socket server conflicts with the serverless deployment model, so we use a managed real-time provider (Pusher/Ably/Supabase Realtime) rather than self-hosting Socket.io.

**Leaderboard updates:** Polled via SSE-pushed invalidation (client refetches on a lightweight "leaderboard changed" event) rather than a raw socket — leaderboard doesn't need sub-second precision.

---

## 14. Chrome Extension Architecture

- **Communication:** Extension background script holds a JWT (obtained via a one-time "Connect to HireForge" OAuth-style handshake from the web app). All calls go to `/api/v1/extension/*` over HTTPS.
- **Authentication:** Short-lived JWT + refresh token pattern (separate from the web app's Clerk cookie session, since extensions can't share httpOnly cookies across origins cleanly).
- **Sync:** On detecting a solved problem (DOM observation on LeetCode/GFG), the extension posts a sync event immediately if online.
- **Security:** Extension only has scoped permissions (`activeTab`, host permissions for leetcode.com/geeksforgeeks.org) — never broad `<all_urls>` access. All API calls are authenticated; the extension never holds write access beyond submission-sync scope (can't modify resumes, settings, etc. — enforced by a dedicated, narrow JWT scope, not just "logged in").
- **Browser storage:** `chrome.storage.local` for the JWT and a small offline queue — never `localStorage` (isolated per-extension context anyway).
- **Offline queue:** If the sync call fails (offline, API down), the event is queued in `chrome.storage.local` and retried with backoff; queue is capped (e.g., 100 events) to avoid unbounded growth.
- **Conflict resolution:** Sync events are idempotent (keyed by `problemSlug + timestamp + userId`) — if the same solve is synced twice (e.g., queued then also live), the backend dedupes on that composite key rather than creating duplicate submissions.

---

## 15. Search Architecture

**Decision: Postgres Full-Text Search for V1; reassess Meilisearch at scale.**

| Option | Verdict |
|---|---|
| Postgres Full-Text (`tsvector`) | **Chosen for V1** — zero extra infrastructure, "good enough" relevance for a few thousand problems/topics/resources, and it's already our database. |
| Algolia | Rejected for V1 — excellent product but adds a paid third-party dependency and sync pipeline before we have the search volume to justify it. |
| Meilisearch | Reasonable future upgrade — self-hostable, fast, great typo-tolerance. Flagged as the Phase 2+ candidate once content volume (especially Resource Hub + Community threads) makes Postgres FTS relevance feel weak. |

Search covers Problems, Theory topics, Projects, Notes, and Resources through a single `SearchIndex` materialized view/table combining `tsvector` columns from each, refreshed via a lightweight trigger or nightly job — avoiding a live join across five tables on every keystroke.

---

## 16. File Storage

All binary assets go to **Supabase Storage**, bucketed by type with per-bucket access policy:

| Asset | Bucket | Access Policy |
|---|---|---|
| Resumes (PDF) | `resumes` | Private, signed URL, owner-only |
| Profile images | `avatars` | Public read (CDN-cacheable), owner-write |
| Notes attachments | `notes` | Private, signed URL |
| Voice recordings (interview practice) | `voice` | Private, signed URL, auto-delete policy after N days (privacy-conscious default, configurable) |
| Mock interview recordings (video, future) | `interviews` | Private, signed URL, same retention policy |

Signed URLs generated server-side per-request (never long-lived public links for private buckets) — enforced through the same RBAC layer as everything else.

---

## 17. Logging & Monitoring

- **Error logging:** Sentry (or equivalent) integrated at the Next.js level, capturing both client and server errors, tagged by module.
- **Performance monitoring:** Vercel Analytics + Speed Insights for frontend; custom timing spans around AI Orchestrator calls specifically (this is the most latency/cost-sensitive path and deserves dedicated visibility).
- **Analytics (product):** PostHog or similar, event-based, feeding both product decisions and the in-app Analytics module's aggregate stats (kept separate from user-facing HireScore data pipeline).
- **Audit logs:** Every Admin action (`modules/admin`) writes to an append-only `AuditLog` table — who changed what, when, from what to what.
- **Security logs:** Auth failures, rate-limit triggers, and RBAC denials logged with enough context to investigate abuse, without logging sensitive payload content (no raw resume/interview content in logs).
- **Crash reports:** Extension has its own lightweight error reporting (can't share the web app's Sentry session context, but reports to the same Sentry project with an `extension` tag).

---

## 18. Security

- **Validation:** Zod schemas shared between client forms and server actions/API handlers — single source of truth for what "valid input" means, no duplicate validation logic drifting between frontend and backend.
- **Rate limiting:** Redis-backed, per-user and per-IP, tiered by endpoint sensitivity — AI endpoints get the strictest limits (cost-sensitive), static content reads the loosest.
- **RBAC:** Enforced at middleware + service layer (defense in depth — even if middleware were bypassed, the service layer independently checks role).
- **XSS:** React's default escaping + strict Content-Security-Policy headers; any user-generated rich content (community threads, notes) sanitized server-side before storage, not just at render time.
- **CSRF:** Server Actions have built-in CSRF protection in Next.js (origin-checked); Route Handlers consumed by the extension use Bearer tokens (not cookies), which are inherently not CSRF-vulnerable.
- **SQL Injection:** Prisma's parameterized queries eliminate this by construction — no raw SQL string concatenation anywhere in the codebase (enforced by code review discipline / lint rule).
- **Prompt Injection:** User input destined for an LLM (resume text, chat messages, notes) is never concatenated directly into a system prompt — it's passed as clearly delimited user-role content, and agent system prompts explicitly instruct the model to treat user content as data, not instructions. Response Builder additionally screens for obvious instruction-override patterns before executing any "tool" the model requests.
- **AI Abuse:** Per-user daily AI call quotas (tiered by subscription plan), enforced in the Orchestrator itself (not just at the API gateway) so it can't be bypassed by hitting a different endpoint that happens to also call an agent.
- **File Upload Validation:** Type/size validation server-side (never trust client-reported MIME type), virus-scan hook point reserved for when resume uploads scale (not required day one, but the storage service call is structured to allow inserting a scan step later without refactor).
- **Secrets/Env vars:** All provider keys (OpenAI, Anthropic, Gemini, Clerk, Supabase, Redis) live in Vercel environment variables, scoped per environment (dev/preview/prod), never committed, never exposed to client bundles (only accessed inside `server/` code).

---

## 19. Testing Strategy

| Layer | Tooling | Focus |
|---|---|---|
| Unit | Vitest | Service-layer business logic (e.g., HireScore computation, spaced-repetition interval math, root-cause graph traversal) |
| Integration | Vitest + a test Postgres instance | Module service + repository interaction, e.g., "submitting a solution correctly updates Learning Memory and triggers a revision schedule entry" |
| E2E | Playwright | Critical user flows: sign-up → onboarding → solve a problem → see dashboard update; resume upload → analysis → download |
| AI Testing | Golden-set prompt evals (fixed test cases with expected qualitative properties, run against a cheap eval harness, not exact string matching) | Ensures agent responses stay on-topic, on-tone, and don't regress after prompt changes |
| Load Testing | k6 | AI Orchestrator endpoint and Dashboard aggregation endpoint specifically — these are the two most likely bottlenecks at scale |
| Performance Testing | Lighthouse CI in the deploy pipeline | Frontend performance budget enforcement per PR |

---

## 20. Deployment Architecture

- **Environments:** Development (local), Preview (auto-deployed per PR via Vercel), Production.
- **Hosting:** Vercel for the Next.js app and Chrome Extension build artifacts (extension itself is submitted to Chrome Web Store separately, but built/tested in the same CI pipeline).
- **Database:** Supabase project per environment (separate dev/preview/prod projects — preview can share a single "staging" Supabase project with prod-like seed data rather than one-per-PR, to avoid connection-pool exhaustion).
- **Redis:** Upstash, separate databases per environment (cheap enough to isolate).
- **CI/CD:** GitHub Actions — lint → typecheck → unit/integration tests → Playwright E2E (on a subset of critical flows for PRs, full suite on merge to main) → Vercel deploy.
- **Environment variables:** Managed in Vercel's dashboard per environment, synced to GitHub Actions secrets for tests that need them (test-only API keys, never prod keys in CI).
- **Rollback:** Vercel's instant rollback to any previous deployment; database migrations are written to be backward-compatible for one release cycle (expand/contract pattern) so a code rollback never leaves the DB schema in an incompatible state.

---

## 21. Scalability Plan

| Users | What changes |
|---|---|
| **~100** | Current architecture as designed handles this trivially. Single Supabase instance, no read replicas, no queue scaling needed. |
| **~1,000** | Introduce read replica awareness for the Dashboard aggregation query if it shows latency; start monitoring AI Orchestrator cost per user closely — this is the first real cost pressure point. |
| **~10,000** | Redis cache hit rates become critical — tune TTLs based on real access patterns observed in monitoring (Section 17). Background job queue (BullMQ) likely needs a dedicated small worker instance rather than piggybacking on Cron-triggered drains. Consider extracting AI Orchestrator into its own deployable if its latency/cost profile is meaningfully different from the rest of the app's traffic pattern — this is exactly the extraction the Modular Monolith was designed to make easy. |
| **~100,000** | Database likely needs read replicas for analytics-heavy queries (HireScore, insights) separate from the transactional write path. Contest Sync and other external-API-dependent jobs need their own rate-limit-aware backoff tuning. Search (Section 15) very likely needs to move from Postgres FTS to Meilisearch at this point. Community/Study Rooms real-time load may justify a dedicated managed real-time tier upgrade. |

At every stage, the module boundary discipline from Section 2 is what determines *which piece* gets extracted or scaled independently — we are never forced to scale the whole monolith uniformly.

---

## 22. Future Architecture

| Future Feature | How it's added without breaking current architecture |
|---|---|
| Voice AI (deeper) | Already isolated behind the Interview Mentor agent + a dedicated `scoreVoiceDelivery()` service — expanding this only touches that one agent and the Storage bucket policy for recordings. |
| Mobile App | Consumes the same `/api/v1/*` versioned surface the extension already uses — no new backend concept, just a new client. |
| Desktop App | Same as Mobile — versioned API surface is client-agnostic by design. |
| Enterprise (Campus/B2B tier) | New `Organization` and `OrganizationMember` tables + a new `modules/organizations` module; existing modules gain an optional `organizationId` scope rather than being rewritten. |
| More AI Agents | The Orchestrator's agent registry is a config-driven list — adding a 10th agent means adding one file in `server/ai/agents/` and a routing rule, not touching existing agents. |
| Marketplace (future monetization) | New `modules/marketplace` module, isolated per the same dependency rules as every other module — doesn't require touching DSA/Theory/etc. internals. |

---

*End of Phase 2 Architecture Document. Per your instruction, stopping here — no database schema, no code, no implementation. Awaiting review and approval before Phase 3 (Database Design).*
