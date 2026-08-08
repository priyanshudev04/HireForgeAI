# HireForge — Prisma Schema: Decisions, Validation & Migration Risk
### Phase 3B Companion Document (to `schema.prisma`)

---

## 1. Explanation of Important Decisions

**Datasource split (`url` vs. `directUrl`):** Runtime queries go through Supabase's PgBouncer pooler (transaction mode); migrations use the direct connection, since Prisma Migrate needs advisory locks and DDL capabilities that don't work reliably through a transaction-mode pooler. This is the single most common Prisma+serverless+Postgres footgun, addressed up front (DDD §23).

**`uuid_generate_v7()` via `dbgenerated()`:** Prisma doesn't have native UUIDv7 generation as of the current stable client, so IDs are generated at the database level via a Postgres function (assumed available through Supabase's `pgcrypto`/custom function setup, to be provisioned in the Phase 3B.5 migration step) rather than faked with `@default(uuid())` (which is v4). This preserves the time-ordered insert-locality benefit the DDD (Section 1) specifically called out as the reason for choosing UUIDv7.

**`RoleCatalog` naming (not `Role`):** The enum `Role` (used for fast in-code/RBAC checks — Architecture §6) and the queryable/joinable reference-data table (Freeze Report Section 20's "Permission granularity" requirement) are two different concerns. Naming them both `Role` would force an awkward Prisma naming collision. `RoleCatalog` is the table; `Role` remains the enum. This is a naming resolution, not a schema addition — the Freeze Report's "Final naming conventions" section didn't anticipate this specific collision, so it's called out explicitly here rather than silently deviating.

**`KnowledgeNode.topicId` / `.theoryTopicId` are both nullable, both `SetNull` on delete:** A KnowledgeNode may correspond to a DSA `Topic`, a `TheoryTopic`, or (in principle) neither yet (admin-created but not yet linked to content) — hence nullable, with `SetNull` rather than `Restrict`, since losing the link to a specific Topic/TheoryTopic shouldn't cascade-delete the graph node itself (the node's prerequisite relationships remain valid even if its content link is temporarily removed during a content restructure).

**`AuditLog.actorId` is `Restrict`, not `Cascade`:** deleting a User must never silently delete the historical record of actions they took as an admin — this is a deliberate, security-relevant exception to "soft delete User" being the norm; if a User row is ever hard-deleted (rare, GDPR-path only per DDD §9), the AuditLog rows referencing them as `actor` must block that deletion until handled explicitly (e.g., anonymized), not silently cascade away accountability history.

**`Friendship` canonicalization is application-enforced, not DB-enforced:** Postgres composite primary keys don't have a native "always store the smaller ID first" constraint without a `CHECK` constraint (which this document was instructed not to generate — that's a Phase 3B.5/migration-level concern). The schema comment flags this explicitly so the constraint isn't forgotten when migrations are written.

**Group B entities are fully modeled now, not stubbed:** Per the Freeze Report's Section 12 classification and DDD §21's migration philosophy ("modeled now so migrations aren't retrofitted later"), `Contest`, `ContestResult`, `Friendship`, `StudyRoom`, `StudyRoomMember`, `Thread`, `ThreadReply`, `InterviewExperience`, `CompanyReadinessScore`, and `ProjectTemplate` all appear as complete models — they are simply not yet wired into application features per the PRD's milestone sequencing.

**Group C entities (`Subscription`, `Plan`, `Organization`) are absent, not stubbed:** Per the Freeze Report, these remain schema-reserved-only via the nullable `User.organizationId` slot (no FK yet, since no `Organization` model exists) — adding placeholder models for them now would violate the review's explicit finding that they are future-vision-only and would add unused surface area to the frozen V1 schema.

---

## 2. Validation Checklist

- [x] **Missing relations:** none found. Every FK declared in the Freeze Report's relationship map (Section 2) has a corresponding Prisma `@relation` on both sides.
- [x] **Circular references:** checked specifically around `KnowledgeNode ↔ KnowledgeEdge` (self-referential, resolved via named relations `"FromNode"`/`"ToNode"`) and `Friendship` (self-referential on `User`, resolved via `"FriendshipUserA"`/`"FriendshipUserB"`) — both compile cleanly with no ambiguous relation errors.
- [x] **Duplicate indexes:** none found. Every `@@index`/`@@unique` maps 1:1 to an entry in DDD Section 10 or a Freeze Report Section 5 addition (`RolePermission`, bookmark tables, `Notification` type index).
- [x] **Nullable mistakes:** reviewed every field against DDD Section 7's "nullable fields" guidance per entity — `Submission` deliberately has almost no nullable columns (append-only fact log); `KnowledgeNode`'s dual topic links are deliberately nullable (explained above); `Company.logoUrl`/`salaryRangeJson`/`requiredSkillsJson` are nullable since not every company profile is fully populated at creation.
- [x] **Naming consistency:** PascalCase models, camelCase fields, explicit `@@map` to snake_case table names throughout — matches DDD Section 8 exactly, with the one documented, deliberate exception (`RoleCatalog`) explained above.
- [x] **Prisma best practices:** `onDelete` explicitly declared on every relation (never left to Prisma's default), composite primary keys used for pure join tables (no wasted surrogate `id` column on `ProblemPattern`, `UserRole`, `RolePermission`, bookmark tables, `Friendship`, `StudyRoomMember`, `CompanyQuestion`, `ContestResult`, `CompanyReadinessScore`), `@updatedAt` used instead of manual timestamp management, `Json` type reserved strictly per the DDD Section 13 / Freeze Report Section 6 approved list.

---

## 3. Potential Migration Risks

| Risk | Mitigation |
|---|---|
| `uuid_generate_v7()` function must exist in Postgres before the first migration runs, or every insert fails | Provision this as the **first** migration (a raw SQL function creation via `prisma migrate` using a `.sql` migration file) before any model migration — flagged now so it isn't discovered as a runtime surprise later |
| `Friendship` canonical-ordering isn't enforced at the DB level | Either add a `CHECK (userAId < userBId)` constraint in the first migration, or accept application-level enforcement only — this needs an explicit decision before migrations are written, not left implicit |
| `KnowledgeNode.subjectArea` is a free-text string, not an enum | Deliberate (DDD reasoning: spans both DSA and Theory taxonomies which don't share one clean enum) — but means no DB-level validation of allowed values; worth a lightweight app-level enum/constant list even though the column itself stays a string |
| Large `Json` columns (`Problem.constraintsJson`, `InterviewFeedback.detailedBreakdownJson`) have no schema validation at the database level | Zod validation at the application boundary (Architecture §18) is the enforcement point — this is by design per the JSONB philosophy (DDD §13), not an oversight, but worth restating so it isn't mistaken for a gap |
| `RoleCatalog` naming deviates slightly from the Freeze Report's literal entity name (`Role`) | Documented explicitly above; recommend a one-line addendum to the Freeze Report acknowledging this naming resolution, so the two documents don't appear to silently disagree |
| Composite-key join tables (no surrogate `id`) can be marginally less convenient for some ORMs/tools expecting a single-column PK | Accepted trade-off — matches Prisma idiomatic practice for pure join tables and avoids a wasted index; flagged only because it's worth confirming the team is comfortable with composite-key `findUnique` calls in application code |

---

*End of Phase 3B companion notes. `schema.prisma` is presented as the primary deliverable alongside this document. No SQL, migrations, or seed scripts generated, per instruction. Awaiting review before migration generation.*
