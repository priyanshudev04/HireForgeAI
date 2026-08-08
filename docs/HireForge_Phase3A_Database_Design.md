# HireForge — Database Design Document (DDD)
### Phase 3A | Single Source of Truth for Prisma Schema & Migrations

*Companion to the frozen PRD (Phase 1), Architecture (Phase 2), and API Contract (Phase 2.5). None of those are modified here. No SQL, Prisma, or code appears in this document — entities and decisions only.*

---

## 1. Database Overview

**Why PostgreSQL:** Relational integrity is not optional for HireForge — a submission belongs to exactly one problem belongs to exactly one topic, a resume version belongs to exactly one user, and these facts must never silently drift. Postgres also gives us `JSONB`, `pgvector` (future), full-text search, and recursive CTEs (needed for Knowledge Graph traversal, Section 17) — all in one engine, avoiding a polyglot-persistence tax for a solo-developer-scale team.

**Why Supabase:** Managed Postgres + Storage + (optionally) Realtime and Row-Level Security under one vendor, reducing operational surface. We treat Supabase as "Postgres with batteries," not as a proprietary lock-in layer — everything here is standard Postgres design, portable to any Postgres host if ever needed.

**Why Prisma (design-level rationale, schema itself comes in Phase 3B):** Type-safe, migration-first workflow that keeps the single developer honest about schema drift — every change is a reviewed, versioned migration file, never a manual `ALTER TABLE` run by hand against production.

**Why UUIDv7 (not auto-increment integers, not UUIDv4):** Sequential integers leak business metrics (record counts, growth rate) through the API and invite enumeration attacks. UUIDv4 avoids that but is fully random, which hurts B-tree index locality on high-insert tables (Submissions, Messages) — every insert lands in a random leaf page. UUIDv7 is time-ordered, so recent rows cluster together physically, keeping index insert performance closer to that of sequential integers while remaining non-enumerable.

**Why JSONB (used deliberately, not by default):** JSONB is reserved for data that is genuinely schema-flexible or write-once/read-mostly blobs (AI-generated content structures, flexible metadata) — never for data we will ever need to filter/join/aggregate relationally at scale. Section 13 draws this line precisely per-entity.

**Why Modular Schema (domains, Section 2):** Mirrors the Modular Monolith application architecture (Architecture §2) — each domain's tables are conceptually owned by one application module, so the "which module can write to this table" question always has one obvious answer, and future extraction of a module into its own service is a schema-ownership question we've already answered.

---

## 2. Database Domains

| Domain | Owns |
|---|---|
| **Identity** | User, Profile, Role, Permission, UserRole, Session (mirror) |
| **Learning — DSA** | Topic, Pattern, Problem, Submission, Bookmark, RevisionSchedule |
| **Learning — Theory** | Subject, TheoryTopic, Note, Flashcard, Quiz, QuizAttempt |
| **Knowledge Graph** | KnowledgeNode, KnowledgeEdge |
| **AI & Memory** | Conversation, Message, ConversationSummary, LearningMemory, BehaviorMemory, ResumeMemory, InterviewMemory, FactMemory |
| **Roadmaps** | Roadmap, RoadmapNode, DailyPlan |
| **Analytics** | HireScoreSnapshot, DailyStat, WeeklyStat, MonthlyStat, Insight |
| **Resume** | Resume, ResumeVersion, JDAnalysis |
| **Projects** | Project, ProjectMilestone, ProjectTemplate |
| **Interview** | InterviewSession, InterviewQuestion, InterviewFeedback, VoiceRecordingRef |
| **Company** | Company, CompanyQuestion, InterviewExperience, CompanyReadinessScore |
| **Contest** | Contest, ContestResult |
| **Community** | Friendship, StudyRoom, StudyRoomMember, Thread, ThreadReply |
| **Notifications** | Notification, NotificationPreference |
| **Administration** | AuditLog, FeatureFlag |
| **Chrome Extension** | ExtensionSession (mirrors Session domain, scoped) |
| **Billing (future-ready)** | Subscription, Plan |

Every domain's tables are prefixed conceptually (not necessarily literally in table name) by their owning module — this is enforced by the Prisma schema being organized into one `.prisma` file per domain in Phase 3B, merged at build time.

---

## 3. Complete Entity List

| Entity | Domain | Purpose | Owner Module | Lifecycle |
|---|---|---|---|---|
| User | Identity | Core identity record, mirrors Clerk | Auth | Permanent; soft-deleted on account closure |
| Profile | Identity | Display name, avatar, bio | Auth | Permanent, edited freely |
| Role | Identity | Static role catalog (STUDENT/MODERATOR/ADMIN/SUPER_ADMIN) | Auth | Rarely changes, seed data |
| UserRole | Identity | Join: user ↔ role | Auth | Permanent |
| Permission | Identity | Fine-grained capability catalog | Auth | Seed data |
| Topic | DSA | DSA subject-area grouping (Arrays, Graphs...) | DSA | Permanent, admin-managed |
| Pattern | DSA | Cross-cutting technique tags (Sliding Window, Two Pointer) | DSA | Permanent, admin-managed |
| Problem | DSA | A single DSA question | DSA | Permanent, admin-managed, versionable |
| Submission | DSA | A user's attempt/solve of a Problem | DSA | Permanent (immutable append-only history) |
| Bookmark | DSA/Theory | Generic saved-item join (polymorphic, Section 7) | Shared | Permanent |
| RevisionSchedule | DSA/Theory | Spaced-repetition entry for a solved problem/flashcard | DSA/Theory | Permanent, mutated on each review cycle |
| Subject | Theory | Top-level theory subject (OS, DBMS, CN, OOP) | Theory | Seed/admin data |
| TheoryTopic | Theory | A topic within a Subject | Theory | Admin-managed |
| Note | Theory | Written content for a TheoryTopic | Theory | Admin-managed, versionable |
| Flashcard | Theory | Spaced-repetition card, may be AI-generated | Theory | Permanent, user- or admin-owned |
| Quiz | Theory | MCQ set for a TheoryTopic | Theory | Admin-managed |
| QuizAttempt | Theory | User's attempt at a Quiz | Theory | Permanent, immutable |
| KnowledgeNode | Knowledge Graph | A concept/skill node | Knowledge Graph | Admin-managed, rarely deleted |
| KnowledgeEdge | Knowledge Graph | Directed prerequisite relationship | Knowledge Graph | Admin-managed |
| Conversation | AI/Memory | An AI Mentor chat thread | AI Mentor | Permanent, summarized over time |
| Message | AI/Memory | Individual message in a Conversation | AI Mentor | Permanent, but pruned from active LLM context after summarization |
| ConversationSummary | AI/Memory | Rolling compressed summary of a Conversation | AI Mentor | Overwritten/appended periodically |
| LearningMemory | AI/Memory | Derived weak/strong topic profile | Memory Manager | Regenerated nightly, historized |
| BehaviorMemory | AI/Memory | Study habit/streak/active-hours profile | Memory Manager | Regenerated nightly |
| ResumeMemory | AI/Memory | Cross-version resume trend data | Memory Manager | Updated on each resume analysis |
| InterviewMemory | AI/Memory | Cross-session interview performance trend | Memory Manager | Updated on each interview completion |
| FactMemory | AI/Memory | Discrete, structured facts the AI should never "forget" (explicit user-stated preferences/goals) | Memory Manager | Permanent until explicitly revised |
| Roadmap | Roadmaps | A user's active learning plan | Roadmap | One active per user; historical ones archived |
| RoadmapNode | Roadmaps | A single step/topic within a Roadmap | Roadmap | Tied to parent Roadmap lifecycle |
| DailyPlan | Roadmaps | Generated daily task list | Planner | Ephemeral-ish; retained ~90 days for streak/history views |
| HireScoreSnapshot | Analytics | Point-in-time HireScore™ + sub-scores | Analytics | Append-only, one per computation cycle |
| DailyStat / WeeklyStat / MonthlyStat | Analytics | Pre-aggregated rollups | Analytics | Append-only, generated by scheduled jobs |
| Insight | Analytics | AI-generated narrative insight | Analytics Agent | Regenerated nightly, short retention (latest N kept) |
| Resume | Resume | A resume "document" container | Resume | Permanent |
| ResumeVersion | Resume | An immutable version of a Resume | Resume | Append-only, never edited after creation |
| JDAnalysis | Resume | Result of comparing a ResumeVersion to a job description | Resume | Permanent |
| Project | Projects | A tracked project (AI-generated or manual) | Projects | Permanent |
| ProjectMilestone | Projects | A checklist item within a Project | Projects | Tied to parent Project |
| ProjectTemplate | Projects | Curated starter template | Projects | Admin-managed |
| InterviewSession | Interview | A mock interview instance | Interview | Permanent |
| InterviewQuestion | Interview | A question asked within a session | Interview | Tied to parent session |
| InterviewFeedback | Interview | Scored feedback for a session | Interview | Permanent |
| VoiceRecordingRef | Interview | Metadata pointer to a Storage object | Interview | Permanent metadata; underlying file subject to retention policy (Section 15) |
| Company | Company | A target company profile | Company Mode | Admin-managed |
| CompanyQuestion | Company | Questions associated with a Company | Company Mode | Admin-managed |
| InterviewExperience | Company | Curated/anonymized interview experience entries | Company Mode | Admin-managed/moderated |
| CompanyReadinessScore | Company | User-specific readiness sub-score per Company | Analytics | Recomputed periodically |
| Contest | Contest | An external contest event | Contest Center | Synced, short-lived relevance |
| ContestResult | Contest | A user's result in a Contest | Contest Center | Permanent |
| Friendship | Community | Bidirectional friend relationship | Community | Permanent until unfriended (soft delete) |
| StudyRoom | Community | A synchronous co-working session | Community | Ends after session; retained for history |
| StudyRoomMember | Community | Join: user ↔ StudyRoom | Community | Tied to StudyRoom lifecycle |
| Thread | Community | A discussion thread | Community | Permanent, moderatable |
| ThreadReply | Community | A reply within a Thread | Community | Permanent, moderatable |
| Notification | Notifications | A single notification instance | Notifications | Permanent, short active-read window then archived |
| NotificationPreference | Notifications | Per-user delivery preferences | Notifications | Permanent, user-edited |
| AuditLog | Administration | Immutable record of admin actions | Admin | Permanent, append-only, never deleted |
| FeatureFlag | Administration | Toggle for gradual feature rollout | Admin | Permanent, admin-edited |
| Subscription | Billing | User's current plan state (future, schema reserved now) | Settings/Billing | Permanent |
| Plan | Billing | Static plan catalog | Settings/Billing | Seed data |

---

## 4. Relationship Design

**Representative core relationships** (full exhaustive list follows the same pattern; only the non-obvious/high-value ones are diagrammed):

```
User ──1:1── Profile
User ──1:N── UserRole ──N:1── Role
User ──1:N── Submission ──N:1── Problem ──N:1── Topic
Problem ──N:N── Pattern            (via ProblemPattern join)
Problem ──N:N── Company             (via CompanyQuestion join)
User ──1:N── Conversation ──1:N── Message
Conversation ──1:1── ConversationSummary
User ──1:1(active)── Roadmap ──1:N── RoadmapNode ──N:1── KnowledgeNode
KnowledgeNode ──N:N── KnowledgeNode  (via KnowledgeEdge, self-referential, directed)
User ──1:N── Resume ──1:N── ResumeVersion ──1:N── JDAnalysis
User ──1:N── InterviewSession ──1:N── InterviewQuestion
InterviewSession ──1:1── InterviewFeedback
User ──N:N── User            (via Friendship, self-referential)
StudyRoom ──1:N── StudyRoomMember ──N:1── User
Thread ──1:N── ThreadReply ──N:1── User
User ──1:N── HireScoreSnapshot
User ──1:N── Notification
```

### ER Diagram (conceptual, Section 26 detail lives here for cohesion)

```
                     ┌────────────┐
                     │    User     │
                     └─────┬───────┘
      ┌───────────┬────────┼─────────┬─────────────┬──────────────┐
      ▼           ▼        ▼         ▼             ▼              ▼
 ┌─────────┐ ┌─────────┐┌────────┐┌──────────┐ ┌──────────┐ ┌─────────────┐
 │ Profile │ │UserRole ││Roadmap ││Submission│ │Conversation│ │HireScore    │
 └─────────┘ └────┬────┘└───┬────┘└────┬─────┘ └─────┬──────┘ │Snapshot     │
                   ▼         ▼          ▼             ▼        └─────────────┘
               ┌───────┐ ┌────────────┐┌──────────┐┌────────┐
               │ Role  │ │RoadmapNode ││ Problem  ││Message │
               └───────┘ └─────┬──────┘└────┬─────┘└────────┘
                                ▼             ▼
                        ┌───────────────┐┌────────┐
                        │ KnowledgeNode ││ Topic  │
                        └───────┬───────┘└────────┘
                                ▼
                        ┌───────────────┐
                        │ KnowledgeEdge  │ (self-referential)
                        └───────────────┘
```

**Why these shapes:**
- `User ↔ Profile` is 1:1 — kept as a separate table (not columns on `User`) because `User` is the identity-sync record (mirrors Clerk, written by webhook), while `Profile` is user-editable app data; separating them means the Clerk webhook handler never risks clobbering user-edited fields.
- `Problem ↔ Pattern` and `Problem ↔ Company` are N:N via join tables — a problem can belong to multiple patterns (e.g., "Two Sum" is both HashMap and Array) and be asked by multiple companies.
- `KnowledgeNode ↔ KnowledgeNode` is self-referential N:N through `KnowledgeEdge`, which is what makes the Knowledge Graph a graph rather than a tree — a topic can have multiple prerequisites and be a prerequisite for multiple downstream topics.
- `Friendship` is a self-referential N:N on `User` — modeled as a single row per accepted friendship (not two directional rows) with a `status` field (`pending`/`accepted`/`blocked`) to avoid data duplication and sync bugs between "my friend list" and "their friend list."

---

## 5. Cardinality, Required/Optional, Cascade Rules

| Relationship | Cardinality | Required? | On Parent Delete |
|---|---|---|---|
| User → Profile | 1:1 | Required | Cascade delete (Profile is meaningless without User) |
| User → UserRole | 1:N | Required (min 1 role) | Cascade delete |
| User → Submission | 1:N | Optional (0 to many) | Cascade delete on hard-delete; but User deletion is soft by default (Section 9), so this rarely fires |
| Problem → Submission | 1:N | Required (Submission always references a Problem) | **Restrict** — a Problem cannot be hard-deleted while Submissions reference it; must be archived/soft-deleted instead |
| Roadmap → RoadmapNode | 1:N | Required | Cascade delete |
| RoadmapNode → KnowledgeNode | N:1 | Required | **Restrict** — KnowledgeNode is foundational reference data, never deleted out from under active roadmaps |
| Conversation → Message | 1:N | Optional (a Conversation can exist with zero messages briefly at creation) | Cascade delete |
| Resume → ResumeVersion | 1:N | Required (at least one version on creation) | Cascade delete |
| InterviewSession → InterviewFeedback | 1:1 | Optional until session completes | Cascade delete |
| User → Friendship (both sides) | N:N (self) | Optional | Cascade delete both directions |
| StudyRoom → StudyRoomMember | 1:N | Required | Cascade delete |
| KnowledgeNode → KnowledgeEdge | 1:N (both `fromNode`/`toNode`) | Optional | **Restrict** on delete if edges reference it — must remove edges first (explicit admin action, prevents silently orphaning the graph) |

**General rule:** cascade deletes are used only where the child record is *meaningless* without the parent (Profile, RoadmapNode, Message, ResumeVersion). Restrict is used wherever deleting the parent would silently corrupt historical integrity (Problem, KnowledgeNode) — those go through soft-delete/archival instead, never hard delete, in production.

---

## 6. Normalization

- **1NF:** Every table has atomic column values — no comma-separated lists in a single column (e.g., a Problem's associated Patterns live in a join table, `ProblemPattern`, never as a text column of tag names).
- **2NF:** Every non-key column depends on the whole primary key — relevant mainly for join tables (`ProblemPattern`, `UserRole`) which carry only the two foreign keys plus metadata that genuinely describes the *pairing* (e.g., `UserRole.assignedAt`), not data that belongs to just one side.
- **3NF:** No transitive dependencies — e.g., `Submission` stores `problemId`, not a duplicated `topicId`/`difficulty` copied from `Problem`, even though those are frequently needed together (see denormalization exception below for where this rule is deliberately broken).
- **BCNF:** Checked specifically on `KnowledgeEdge` and `ProblemPattern` (the composite-key join tables) — every determinant is a candidate key; no partial dependency exists.

**Deliberate denormalization (with justification):**
- **`HireScoreSnapshot`** stores the full computed sub-score breakdown (DSA, Theory, Resume, etc.) as columns *at the time of computation*, rather than only a foreign key to "current" values elsewhere — because HireScore history must remain historically accurate even if, say, a Problem's difficulty is later reclassified. This is a snapshot table by design, not a normalization failure.
- **`DailyStat`/`WeeklyStat`/`MonthlyStat`** store pre-aggregated counts (problems solved, minutes studied) rather than requiring a live aggregation query across `Submission` every time the Dashboard loads — a deliberate read-optimization trade-off, refreshed by scheduled jobs (Architecture §11), not a normalization oversight.
- **`Notification`** stores a denormalized `title`/`body` snapshot at send-time rather than a live reference to "the thing that triggered it" — because the source event (e.g., a Problem) might change or be deleted later, but the notification the user already received must still read the same historically.

---

## 7. Table Design (representative deep-dives; full catalog follows the same template)

**`Problem`**
- **Purpose:** Canonical DSA question record.
- **Important columns:** `title`, `slug` (URL-safe, unique), `difficultyLevel` (enum), `descriptionMarkdown`, `constraintsJson` (JSONB — see Section 13), `acceptanceRateCache` (denormalized for list sorting).
- **Primary key:** `id` (UUIDv7).
- **Foreign keys:** `topicId → Topic.id`.
- **Unique constraints:** `slug`.
- **Nullable fields:** `videoExplanationUrl` (optional), `companyTagsCache` (nullable JSONB denormalization of associated companies, refreshed on `CompanyQuestion` change, for fast list filtering without a join).
- **Indexes:** composite `(topicId, difficultyLevel)` for catalog filtering; GIN index on `constraintsJson` only if it's ever queried into (currently not — flagged as unnecessary for V1).
- **Soft delete:** `deletedAt` — problems are archived, never hard-deleted (Section 5 restrict rule).
- **Audit fields:** full standard set (Section 9).
- **Lifecycle:** admin-created, occasionally revised (creates no new row — Problem is mutable content, unlike ResumeVersion which is immutable).

**`Submission`**
- **Purpose:** Immutable record of one attempt/solve.
- **Important columns:** `code` (text, not JSONB — it's a single string, not structured), `language` (enum), `status` (enum: `solved`/`attempted`), `timeTakenSeconds`, `hintsUsedCount`.
- **Primary key:** `id` (UUIDv7 — time-ordered, critical here given this is the highest-insert-volume table in the system).
- **Foreign keys:** `userId → User.id`, `problemId → Problem.id`.
- **Unique constraints:** composite `(userId, problemId, idempotencyKey)` to enforce the API contract's idempotency guarantee (Part A.10 of the API Contract) at the database level, not just the application level.
- **Nullable fields:** none critical — this table intentionally has few nullable columns since it's an append-only fact log.
- **Indexes:** composite `(userId, createdAt DESC)` for submission history queries; composite `(problemId, status)` for computing acceptance rates.
- **Soft delete:** none — Submissions are never deleted, even on account closure they're anonymized (`userId` nulled/replaced with a tombstone reference) rather than removed, to preserve aggregate platform stats integrity.
- **Lifecycle:** created once, never updated — pure append-only log. This is a deliberate design choice: mutable submission records would complicate revision/analytics logic for no benefit.

**`KnowledgeEdge`**
- **Purpose:** Directed prerequisite relationship between two KnowledgeNodes.
- **Important columns:** `fromNodeId`, `toNodeId` (meaning "fromNode is a prerequisite of toNode"), `weight` (float, optional strength of dependency).
- **Primary key:** composite `(fromNodeId, toNodeId)` — a given pair can only have one edge (no need for a surrogate key here; the pair *is* the identity).
- **Foreign keys:** both reference `KnowledgeNode.id`, **restrict** on delete (Section 5).
- **Indexes:** the composite primary key already indexes `fromNodeId` first; a *second* index on `toNodeId` alone is required for efficient backward traversal (Root Cause Analysis walks edges backward — Architecture §23) — this is a deliberate, explicitly-called-out extra index, not an oversight.

**`Conversation` / `Message`**
- **`Conversation`:** `id`, `userId`, `title` (nullable — can be auto-generated from first message), `lastMessageAt` (denormalized for sorting the conversation list without joining Message every time).
- **`Message`:** `id`, `conversationId`, `role` (enum: `user`/`assistant`), `content` (text), `agentUsed` (nullable enum — which of the 9 agents produced this, for debugging/analytics), `tokensUsed` (int, for cost tracking).
- **Indexes:** `Message(conversationId, createdAt)` composite for chronological retrieval.
- **Lifecycle:** Messages accumulate indefinitely but are excluded from live LLM context beyond a rolling window (Architecture §8) — `ConversationSummary` is what's actually read for context, `Message` rows exist for user-facing history display and audit.

**All remaining entities** follow this exact template (Purpose / Important Columns / PK / FK / Unique / Nullable / Indexes / Soft Delete / Audit / Lifecycle) — the four above were chosen as deep-dives because they represent the four hardest patterns in the schema (mutable admin content with restrict-delete, append-only high-volume fact log, self-referential graph, and AI conversation memory). Every other table is a straightforward application of the same template and the standards in Sections 6, 8, 9, and 10.

---

## 8. Naming Convention

| Element | Convention | Example |
|---|---|---|
| Database name | `hireforge_{env}` | `hireforge_production` |
| Tables | PascalCase singular (Prisma convention, maps to snake_case at SQL level automatically) | `Problem`, `RoadmapNode` |
| Columns | camelCase (Prisma), maps to snake_case in actual Postgres DDL | `createdAt` → `created_at` |
| Join tables | `{EntityA}{EntityB}`, alphabetical unless one direction reads more naturally | `ProblemPattern`, `UserRole` |
| Foreign key columns | `{referencedEntity, camelCase}Id` | `problemId`, `topicId` |
| Indexes | `idx_{table}_{columns}` | `idx_submission_user_created` |
| Unique constraints | `uq_{table}_{columns}` | `uq_problem_slug` |
| Enums | PascalCase type, SCREAMING_SNAKE values | `DifficultyLevel { EASY, MEDIUM, HARD }` |
| Triggers | `trg_{table}_{purpose}` | `trg_problem_updated_at` |
| Views (Section 12/18 rollups, if materialized) | `vw_{purpose}` | `vw_daily_active_users` |
| Timestamps | always `*At` suffix, UTC | `createdAt`, `deletedAt`, `lastMessageAt` |
| Boolean columns | `is{Adjective}` or `has{Noun}` | `isActive`, `hasCompletedOnboarding` |

This convention is chosen because it matches Prisma's own idiomatic default mapping (PascalCase models, camelCase fields, auto-generated snake_case columns), meaning the Phase 3B Prisma schema requires zero custom `@map`/`@@map` overrides for the common case — reducing schema verbosity.

---

## 9. Audit Strategy

**Every table includes**, at minimum: `createdAt`, `updatedAt`. Tables holding user-mutable or admin-mutable content additionally include `deletedAt` (soft delete) and, where the *who* matters (Admin-touched content, user profile edits with compliance relevance), `createdBy`/`updatedBy`.

- **Soft delete:** used for anything a user or admin might want to "undo" or that other records still reference historically (Problem, TheoryTopic, Resume, Project, Thread). A `deletedAt IS NULL` filter is applied at the Prisma query-builder middleware level globally, so soft-deleted rows never leak into normal queries without an explicit override.
- **Hard delete:** reserved for genuinely ephemeral/regenerable data only — cache-adjacent tables like expired `DailyPlan` entries beyond their retention window, or explicit GDPR-style user-initiated data erasure requests (which cascade genuinely, as a deliberate, logged exception to the soft-delete-by-default rule).
- **Version history:** entities where *every* past state matters (not just "not currently deleted") use an explicit versioning pattern rather than relying on audit timestamps alone — `ResumeVersion` (immutable rows per version) and `HireScoreSnapshot` (append-only per computation) are the two clearest examples; `Problem` content edits, by contrast, are *not* versioned (admin content edits are corrections, not meaningful history worth preserving row-by-row).
- **Audit log:** `AuditLog` (Administration domain) is separate from per-table `updatedBy` — it captures *who did what to what* for every Admin-role mutation specifically, as an independent, append-only, non-deletable table, satisfying the Architecture's security requirement (Architecture §17) at the data layer, not just the application-logging layer.

---

## 10. Index Strategy

| Table | Index | Type | Why |
|---|---|---|---|
| `Problem` | `(topicId, difficultyLevel)` | Composite B-tree | Primary catalog filter pattern |
| `Problem` | `slug` | Unique B-tree | URL lookups |
| `Submission` | `(userId, createdAt DESC)` | Composite B-tree | Submission history, most recent first |
| `Submission` | `(problemId, status)` | Composite B-tree | Acceptance rate computation |
| `Submission` | `(userId, problemId, idempotencyKey)` | Unique composite | API-level idempotency enforced at DB level |
| `KnowledgeEdge` | `toNodeId` | B-tree (secondary, PK already covers `fromNodeId`) | Backward graph traversal (Root Cause Analysis) |
| `Message` | `(conversationId, createdAt)` | Composite B-tree | Chronological message retrieval |
| `Notification` | `(userId, readAt, createdAt DESC)` | Composite B-tree | Unread-first, recency-sorted inbox query |
| `HireScoreSnapshot` | `(userId, computedAt DESC)` | Composite B-tree | Latest-score and trend-history queries |
| `Note`, `TheoryTopic`, `Problem.descriptionMarkdown` | GIN index on `tsvector` column | Full-text search (Section 19) | Postgres FTS backing (Architecture §15) |
| `Problem.constraintsJson` | *No index in V1* | — | Not queried into directly; flagged to revisit only if a future feature needs to filter by structured constraint data |
| `ContestResult` | `(userId, contestId)` | Unique composite | One result per user per contest |
| `Friendship` | `(userAId, userBId)` | Unique composite (canonicalized ordering) | Prevents duplicate/reverse-duplicate friendship rows |

**GIN indexes** are reserved specifically for `tsvector` full-text columns and would apply to any JSONB column *if and only if* that JSONB is ever queried by key (none currently are in V1 — flagged, not assumed).

---

## 11. Query Pattern Analysis

Predicted hot paths, and how the schema/indexing above serves each:

| Query | Frequency | Served by |
|---|---|---|
| "Get today's dashboard" | Every session load | Composite reads across `DailyPlan`, `HireScoreSnapshot` (latest), `Notification` (unread count) — all indexed for `(userId, ...DESC)` access; result cached in Redis (Section 14) so this rarely hits Postgres on repeat loads within the TTL window |
| "List problems with filters" | High, DSA module | `(topicId, difficultyLevel)` composite index; cursor pagination via `(id)` or `(createdAt, id)` keyset |
| "Get my submission history" | Medium-high | `(userId, createdAt DESC)` index |
| "Get current HireScore" | Every dashboard load | Latest row via `(userId, computedAt DESC)`, cached in Redis with short TTL |
| "Leaderboard rank" | High (Community) | **Not served by Postgres at read-time at all** — lives in Redis sorted set (Section 14), Postgres only holds the authoritative underlying stats that feed it |
| "AI Mentor: get context for this user" | Every AI Orchestrator call | `ConversationSummary` (1 row) + `LearningMemory`/`BehaviorMemory` latest snapshot — small, indexed by `userId`, and itself cached |
| "Roadmap: get active roadmap + nodes" | Every roadmap page load, feeds Dashboard | `Roadmap(userId, isActive)` + `RoadmapNode(roadmapId, orderIndex)`; cached (Architecture §12) |
| "Knowledge Graph: prerequisite chain" | On-demand, AI-triggered | Recursive CTE over `KnowledgeEdge`, results cached as adjacency list in Redis, rarely hits Postgres live |

The consistent pattern: **every high-frequency read has both a Postgres index that makes the query itself cheap, and a Redis cache in front of it** (Architecture §12) — the index strategy is the fallback/source-of-truth path, not the primary-hot-path itself.

---

## 12. Partition Strategy

**Candidates for partitioning (range partitioning by time), and the threshold at which each becomes worth doing** (not applied on day one — Postgres handles millions of rows in a single table fine; this is a documented future action, not a V1 requirement):

| Table | Partition key | Trigger point |
|---|---|---|
| `Submission` | `createdAt` (monthly range) | When table exceeds ~10-20M rows and old-month queries start showing index bloat |
| `Message` (AI conversations) | `createdAt` (monthly range) | Similar threshold — highest-volume table alongside Submission |
| `Notification` | `createdAt` (monthly range) | Once old, read notifications significantly outnumber active ones and archival queries slow down |
| `DailyStat`/`WeeklyStat`/`MonthlyStat` | Already naturally time-bucketed by design (one row per user per period) — partitioning less urgent, but monthly range partitioning on `DailyStat` specifically is the next candidate if it grows fastest |
| `AuditLog` | `createdAt` (yearly range) | Append-only, rarely queried except for a specific incident window — yearly partitions keep it manageable at very large scale without being premature |

**Why not applied now:** premature partitioning adds migration complexity (partition-aware queries, constraint management) that a solo developer doesn't need at hundreds-to-low-thousands of users. This section exists so the *decision* is pre-made and the *trigger conditions* are explicit — when Architecture §21's "100,000 users" stage arrives, this table tells the engineer exactly what to partition and why, without a fresh design session.

---

## 13. JSONB Strategy

**Use JSONB when:**
- The shape is genuinely variable across rows and not worth a join (e.g., `Problem.constraintsJson` — different problems have wildly different constraint shapes: array length bounds, value ranges, string length — modeling this relationally would require a sparse, awkward table).
- The data is AI-generated structured output that we don't currently query into by key, only read whole (e.g., `InterviewFeedback.detailedBreakdownJson` — a structured but flexible scoring rubric).
- The data is a denormalized cache of a relational fact for read performance (e.g., `Problem.companyTagsCache` — an array of company slugs, refreshed whenever the real `CompanyQuestion` join table changes, read far more often than written).

**Use relational tables when:**
- The data needs to be filtered, joined, sorted, or aggregated at the database level — anything analytics touches (`Submission`, `HireScoreSnapshot` sub-scores as actual columns, not a JSON blob) must be relational columns, full stop, or every analytics query becomes a slow JSONB scan.
- The data has referential integrity requirements (foreign keys) — JSONB cannot enforce a foreign key constraint, so anything that must always point to a valid other row stays relational.
- The data is core to RBAC/security decisions (`UserRole`, `Permission`) — these must be queryable/joinable efficiently and are security-critical, where JSONB's lack of constraint enforcement is an unacceptable risk.

**Explicit per-entity calls:** `constraintsJson` (Problem) → JSONB. `detailedBreakdownJson` (InterviewFeedback) → JSONB. `answersJson` (QuizAttempt, storing the submitted answer set) → JSONB (variable question-count shape). Everything else in the Complete Entity List (Section 3) is relational columns.

---

## 14. Redis Mapping

**Never queried directly from Postgres at read-time (Redis is the only read path):**
- Leaderboards (Redis sorted sets — Postgres holds the underlying stats, not a queryable leaderboard view)
- Live session validity mirror (Clerk is source of truth, Redis is the fast-check cache)
- Rate limit counters (don't exist in Postgres at all)

**Cached (Postgres remains source of truth, Redis is a TTL'd read-through cache):**

| Data | TTL | Invalidation |
|---|---|---|
| Dashboard composite | `no-store` at HTTP layer, but internally composed from cached sub-reads below — no single "dashboard cache" blob | — |
| HireScore (latest) | 1 hour | Explicit invalidation on new `HireScoreSnapshot` write (event-driven, not just TTL expiry) |
| Roadmap (active, with nodes) | 1 hour | Invalidated on `RoadmapNode` update or regeneration event |
| Problem catalog list (per filter combination) | 6 hours | Invalidated on any `Problem` admin edit (cache key includes a global `problemsCacheVersion` counter, bumped on write — avoids needing to enumerate/clear every filter permutation) |
| AI response (identical prompt+context hash) | 15 minutes | Natural TTL expiry only — these are inherently short-lived by design |
| Long-term AI memory summary | 24 hours | Invalidated early on significant events (interview completed, major milestone) via explicit event-driven bust, matching Architecture §8.4 |
| Contest data | 15 minutes | Matches sync job cadence (Architecture §11), TTL expiry only |
| Company profile | 6 hours | Invalidated on admin edit |

**Pattern used throughout:** cache-aside (read from Redis, on miss read Postgres and populate Redis), with **event-driven invalidation preferred over relying on TTL alone** wherever staleness would be user-visible and jarring (HireScore, Roadmap) — TTL alone is acceptable only where staleness is harmless (Contest data, Problem catalog for a few hours).

---

## 15. Storage Strategy (Supabase Storage)

**Folder/bucket structure:**

```
resumes/{userId}/{resumeVersionId}.pdf
avatars/{userId}/avatar.{ext}
notes/{userId}/{noteAttachmentId}.{ext}
voice/{userId}/{interviewSessionId}/{questionId}.webm
interviews/{userId}/{interviewSessionId}/recording.mp4   (future, video)
project-files/{userId}/{projectId}/{filename}
```

**Why user-scoped path prefixes:** enables Supabase Storage bucket policies to enforce `auth.uid() = {userId path segment}` as a Row-Level Security-style check at the storage layer itself — defense in depth beyond the application-level signed-URL generation (Architecture §16).

**Signed URLs:** every private-bucket read goes through a server-generated, short-lived (default 10 minutes) signed URL — the database only ever stores the *object path* (e.g., `Resume.storagePath`), never a raw public URL, so access control is enforced at request time, every time, not baked into a stored link that could leak or outlive its intended access window.

**Retention:** `voice/` and `interviews/` objects are subject to an explicit, configurable auto-delete policy (default: 90 days) — enforced by a scheduled job that reads `VoiceRecordingRef.createdAt` and deletes both the Storage object and the metadata row together, keeping the two in sync rather than orphaning either side.

---

## 16. AI Memory Database

| Table | Retention | Compression/Summarization |
|---|---|---|
| `Conversation` | Permanent | N/A (container only) |
| `Message` | Permanent (user-facing history) | Not summarized itself — excluded from live LLM context after the rolling window, but never deleted, since users can scroll their own chat history |
| `ConversationSummary` | Permanent, but **overwritten** (not appended) each time it's regenerated — one current row per Conversation | Generated by summarizing all `Message` rows beyond the short-term window into a compact paragraph; this is what's actually injected into agent prompts (Architecture §8.3) |
| `LearningMemory` | Historized — one row per nightly regeneration, not overwritten, so trend-over-time is queryable | Derived, not summarized text — structured columns (weak topics array, mastery scores), regenerated nightly from `Submission`/`QuizAttempt` directly (this table does not duplicate raw facts, only derived aggregates — consistent with Architecture §8.2's "read-aggregator, not a second source of truth" rule) |
| `BehaviorMemory` | Historized, same pattern | Derived from login/activity timestamps, rolling-window aggregated |
| `ResumeMemory` | Historized, one row per analysis | Derived from `JDAnalysis` history — trend of ATS score over time, not a duplicate of resume content itself |
| `InterviewMemory` | Historized, one row per session | Derived from `InterviewFeedback` — trend of scores over time |
| `FactMemory` | Permanent, mutable (unlike the historized tables above) | Explicit user-stated facts ("I prefer Python," "my target is Amazon SDE-2") — these are corrected/overwritten when the user states something new, not historized, since only the *current* fact matters for personalization, not its history |

**Why this split matters:** `LearningMemory`/`BehaviorMemory`/`ResumeMemory`/`InterviewMemory` are all **derived/historized** (append new snapshot, never edit past ones — supports trend charts), while `FactMemory` and `ConversationSummary` are **current-state** (overwritten in place, since only "what's true now" matters for prompt injection). Conflating these two patterns into one table shape would either bloat the historized tables with meaningless duplicate "current fact" rows, or lose trend history on the derived-memory tables — so the schema explicitly encodes which pattern each memory type needs.

---

## 17. Knowledge Graph Storage (PostgreSQL only, no Neo4j)

- **Nodes:** `KnowledgeNode` — `id`, `name`, `subjectArea` (enum: DSA/OS/DBMS/CN/OOP/etc.), `description`.
- **Edges:** `KnowledgeEdge` — composite PK `(fromNodeId, toNodeId)`, `weight` (optional).
- **Prerequisites/dependencies:** modeled purely through edge direction (`fromNode` = prerequisite of `toNode`) — no separate "Prerequisite" entity needed, the edge *is* the prerequisite relationship.
- **Learning paths:** not a stored entity at all — a "path" is a *computed* topological sort over a subgraph at roadmap-generation time (Architecture §9), not a persisted table, because persisting every possible path would be combinatorially wasteful; only the *result* of a specific generation (a user's `Roadmap`/`RoadmapNode` sequence) is persisted.
- **Traversal without Neo4j:** Postgres recursive CTEs (`WITH RECURSIVE`) walk `KnowledgeEdge` forward (for roadmap generation — "what comes after this") or backward (for Root Cause Analysis — "what does this depend on"). At the node/edge counts expected here (hundreds to low thousands, not millions), a recursive CTE is fast enough that a dedicated graph database would be solving a problem HireForge doesn't have — this is revisited only if the graph grows to a size where CTE depth/performance genuinely degrades, which is not expected within any realistic content-catalog size for this product.

---

## 18. Analytics Database

- **`HireScoreSnapshot`:** one append-only row per computation cycle, storing overall + all sub-scores (Architecture §31) as explicit columns (deliberate denormalization, Section 6) — enables both "current score" (latest row) and "trend over time" (all rows) from one table with one index.
- **`DailyStat`/`WeeklyStat`/`MonthlyStat`:** pre-aggregated rollups (problems solved, minutes studied, quizzes taken) computed by scheduled jobs (Architecture §11), one row per user per period — exists purely so Dashboard/Analytics screens never run a live `GROUP BY` over raw `Submission` history at request time.
- **Charts/Timeline:** served directly from the above rollup tables plus `HireScoreSnapshot` history — no separate "chart data" table; charts are a presentation concern over already-aggregated data.
- **Predictions (`placementProbability` etc.):** computed and cached, not stored as a persisted history table in V1 — framed as a current, recomputed-on-read (or short-TTL-cached) estimate rather than something requiring its own historized entity, since the underlying model/heuristic is expected to evolve and we don't want to be locked into an early prediction schema shape.

---

## 19. Search Strategy

- **Postgres Full-Text Search (V1, chosen — Architecture §15):** `tsvector` generated columns on `Problem.descriptionMarkdown`, `TheoryTopic` content, `Project` descriptions, `Community.Thread` content — combined into a single searchable materialized view refreshed on write-trigger or nightly batch (matches Architecture §15's `SearchIndex` design).
- **GIN Index:** backs every `tsvector` column above — this is the concrete mechanism behind "Postgres FTS."
- **pgvector / embeddings (future, not V1 — Architecture §8.5 decision restated here at the schema level):** schema reserves the *option* by choosing Supabase (native `pgvector` support) but does **not** provision an embeddings column or index in V1. The trigger for adding it: semantic ("find conceptually similar") search over Community threads/Resource Hub content once volume makes exact-keyword FTS relevance feel weak — at that point, an `embedding vector(1536)` column + `ivfflat`/`hnsw` index is an additive migration, not a redesign.
- **Similarity search (future):** would apply pgvector cosine-similarity queries once the embeddings column exists — explicitly not needed for the Knowledge Graph (which is exact-structure, not similarity-based, Section 17) or for AI Memory (which is structured/derived, not semantic-search-based, Section 16).

---

## 20. Security

- **Row-Level Security (RLS):** enabled on Supabase as a **defense-in-depth** layer, not the primary authorization mechanism — the primary mechanism is application-level RBAC (Architecture §6), because RLS policies alone can't express the richer role hierarchy (STUDENT/MODERATOR/ADMIN/SUPER_ADMIN) as cleanly as application code can, and because Prisma's connection typically runs as a single service role. RLS policies here are a safety net: e.g., a policy ensuring `Submission.userId = auth.uid()` for any direct Supabase client access, guarding against the scenario where a future feature (e.g., a client-side real-time subscription) bypasses the Next.js API layer entirely.
- **Tenant isolation (future Enterprise/Campus):** the schema is designed so every user-owned table already carries `userId` as a foreign key — adding an `organizationId` column (nullable in V1, populated once Campus tier ships — Architecture §22) to `User` and cascading it as an optional scope filter is additive, not a redesign. Tenant isolation for Campus tier would then be enforced both by application-level scoping (all Campus-context queries filter by `organizationId`) and an RLS policy mirroring the same rule.
- **Permission granularity:** `Permission` table + `RolePermission` join (not detailed as a separate row in Section 3's table but implied by the Role/Permission entities) allows finer-grained capability checks than role alone where needed (e.g., a `MODERATOR` might get `community:moderate` but not `admin:content:edit`).

---

## 21. Migration Strategy

- **Migration rules:** every schema change is a Prisma migration file, reviewed like code, never a manual production `ALTER TABLE`. Migrations follow an **expand/contract** pattern for anything backward-incompatible (add new column nullable → backfill → make non-nullable in a *later* migration → drop old column in a *third*, later migration) so a mid-deploy rollback never leaves the app pointing at a schema it doesn't understand.
- **Rollback:** every migration has a corresponding down-migration tested in CI before merge; production rollback = redeploy previous app version + run the down-migration only if the schema change hasn't already been safely "contracted" per the pattern above.
- **Seed data:** `Role`, `Permission`, `Plan`, and initial `KnowledgeNode`/`KnowledgeEdge` catalog, `Topic`/`Pattern` taxonomy, and a starter `Problem` set are seeded via a dedicated seed script, run against Development and a controlled one-time run against Production at launch — never re-run destructively against Production afterward.
- **Environment:** separate Supabase projects for Development, Preview/Staging, and Production (Architecture §20) — migrations run against Preview automatically in CI before being promotable to Production, never tested against Production directly.

---

## 22. Backup Strategy

- **Daily:** automated full snapshot (Supabase-managed) retained for a rolling window (minimum 7 days).
- **Weekly:** retained snapshot held longer (4-8 weeks) for recovery from slower-to-notice data issues (e.g., a bad migration that corrupts data silently for days).
- **Monthly:** retained for 6-12 months for long-term audit/compliance needs, especially once any Enterprise/Campus customers exist and may contractually require longer retention.
- **Point-in-Time Recovery (PITR):** enabled via Supabase's PITR feature for the production project specifically — allows recovery to any point within the retention window (not just daily snapshot boundaries), critical for recovering from an accidental bad write/delete rather than only catastrophic data loss.
- **Disaster recovery:** documented runbook (outside this DDD's scope to fully write, but the requirement is stated here) covering: restore-from-snapshot procedure, expected RTO/RPO targets (initially generous — hours, not minutes, given current scale — tightened as the product matures and uptime commitments increase).

---

## 23. Performance

- **Cold start:** minimized by keeping Prisma's connection pooling configuration tuned for serverless (Prisma Accelerate or PgBouncer in transaction mode via Supabase's connection pooler) — avoids exhausting Postgres's max connections under Vercel's serverless function scaling behavior, which is the single most common failure mode for Prisma + serverless + Postgres stacks.
- **Hot cache:** the Redis mapping in Section 14 is precisely the "hot cache" layer — Postgres is sized and indexed to serve cache-miss and write traffic, not to be the primary read path for the highest-frequency queries.
- **Connection pooling:** Supabase's built-in pooler (PgBouncer) in transaction mode for all serverless function connections; a small number of persistent connections reserved for background job workers (Architecture §11), which don't have the same connection-churn problem serverless functions do.
- **Read optimization:** covered by Sections 10 (indexes) and 11 (query pattern-matched indexing) — every predicted hot query has a corresponding index.
- **Write optimization:** high-volume writes (`Submission`, `Message`) are kept lean — few nullable columns, no unnecessary triggers on the hot insert path, denormalized read-helper columns (like `Problem.acceptanceRateCache`) updated asynchronously via a job rather than synchronously on every write, to avoid slowing down the insert path itself.

---

## 24. Scalability

| Users | Database posture |
|---|---|
| **~100** | Current design, single Supabase instance, no partitioning, no read replicas — trivially handled. |
| **~1,000** | Monitor `Submission`/`Message` table growth and Redis cache hit rate; no structural change needed yet. |
| **~10,000** | Evaluate first partitioning candidates (Section 12) if `Submission`/`Message` are approaching tens of millions of rows (unlikely at this user count alone, but flagged as the checkpoint to actually measure rather than assume). Consider a read replica specifically for Analytics queries (Section 18 rollups) to keep them off the primary's write path. |
| **~100,000** | Partitioning (Section 12) very likely necessary for `Submission`, `Message`, `Notification`. Read replica(s) for Analytics/Dashboard reads becomes close to mandatory rather than optional. Search (Section 19) likely migrates off Postgres FTS to Meilisearch, per Architecture §21. |
| **~1,000,000** | Full read-replica topology (writes to primary, reads distributed); partitioning matured into a routine operational pattern rather than a one-time migration; Knowledge Graph traversal performance re-evaluated at this point (still expected to be fine given graph size is bounded by *content*, not *user count* — this is one of the few places user-scale doesn't directly drive data-scale). Redis likely moves from a single instance to a clustered configuration given the leaderboard/session/cache load at this volume. |

The consistent theme: **user count drives write volume on user-owned tables** (Submission, Message, Notification — these scale with users), while **content-owned tables** (Problem, KnowledgeNode, Company) scale with *content curation effort*, not user count, and remain small and fast regardless of how many users the platform has — this distinction is why the scalability plan targets specific tables rather than "the database" as an undifferentiated whole.

---

## 25. Future Expansion (schema-level readiness)

| Future capability | Schema readiness already built in |
|---|---|
| Enterprise/Campus | `organizationId` nullable FK slot reserved on `User` (Section 20); no redesign needed, purely additive |
| Recruiter Dashboard | Would introduce a new `Recruiter`/`RecruiterOrganization` domain, reading existing `HireScoreSnapshot`/`Profile` data via new read-only views — doesn't require altering existing tables, only additive new ones with appropriate RLS/RBAC scoping |
| Hiring Platform / Job Board integration | New `JobPosting`/`Application` entities, linkable to existing `User`/`Resume` via standard FKs — additive domain, same pattern as every other domain in Section 2 |
| Mobile App | No schema impact at all — mobile consumes the same API Contract (Phase 2.5), which already abstracts away the database entirely |
| Open API (third-party developers) | Would need an `ApiKey`/`ApiScope` entity pair (mirroring the existing `Permission` pattern) — additive, not a redesign, since RBAC's scope-based model already generalizes to API-key-based scoping |
| Plugin Marketplace | New `Plugin`/`PluginInstallation` domain, following the same modular-domain pattern as every existing feature — the domain-per-module discipline from Section 2 is precisely what makes this "just another domain" rather than a schema-wide change |

---

## 26. ER Diagram (Conceptual Summary)

*(Full diagram appears inline in Section 4; restated here per your requested structure for completeness — no new content, same diagram, positioned as the formal Section 26 deliverable.)*

```
User ─┬─ Profile
      ├─ UserRole ─ Role ─ Permission
      ├─ Submission ─ Problem ─ Topic
      │                     └─ Pattern (N:N)
      │                     └─ Company (N:N via CompanyQuestion)
      ├─ Roadmap ─ RoadmapNode ─ KnowledgeNode ═ KnowledgeEdge (self N:N)
      ├─ Conversation ─ Message
      │             └─ ConversationSummary
      ├─ LearningMemory / BehaviorMemory / ResumeMemory / InterviewMemory / FactMemory
      ├─ Resume ─ ResumeVersion ─ JDAnalysis
      ├─ Project ─ ProjectMilestone
      ├─ InterviewSession ─ InterviewQuestion
      │                  └─ InterviewFeedback
      ├─ HireScoreSnapshot
      ├─ Notification
      ├─ Friendship ═ User (self N:N)
      └─ StudyRoomMember ─ StudyRoom
```

---

## 27. Database Review Checklist

- [x] **Scalable** — partitioning candidates identified with explicit trigger thresholds (Section 12); scale plan mapped 100 → 1M users (Section 24).
- [x] **Normalized** — 1NF/2NF/3NF/BCNF applied throughout; every denormalization exception explicitly justified (Section 6).
- [x] **Indexed** — every predicted hot query path has a matching index (Sections 10–11).
- [x] **Secure** — RBAC as primary mechanism, RLS as defense-in-depth, tenant-isolation slot reserved for Enterprise (Section 20).
- [x] **Auditable** — standard audit fields on every table, dedicated immutable `AuditLog`, explicit soft-vs-hard-delete policy per table (Section 9).
- [x] **Cache-friendly** — explicit Redis mapping with TTL and invalidation strategy per cached entity, cache-aside pattern applied consistently (Section 14).
- [x] **AI-ready** — dedicated Memory domain with the correct historized-vs-current-state pattern per memory type; Knowledge Graph fully modeled in Postgres without external graph DB dependency (Sections 16–17).
- [x] **Future-ready** — Enterprise, Recruiter Dashboard, Job Board, Mobile, Open API, and Plugin Marketplace all mapped to additive-only schema changes, no redesign required for any of them (Section 25).

---

*End of Phase 3A Database Design Document. No Prisma schema, SQL, or migrations generated, per instruction. Awaiting approval before Phase 3B (Prisma Schema Generation).*
