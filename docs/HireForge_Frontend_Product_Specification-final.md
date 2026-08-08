# HireForge AI — Frontend Product Specification
### Blueprint for Lovable AI Implementation

*This document implements the frontend layer of the already-frozen PRD, Architecture, API Contract, DDD, Freeze Report, and Prisma Schema. It does not redesign the product — it specifies exactly how the frozen product is experienced, screen by screen, component by component. Nothing here introduces new features, entities, or routes beyond what the backend documents already support.*

---

## PART 1 — Product Experience Vision

HireForge should feel like the tool a student *wants* to open every morning, not the one they force themselves into. The emotional target: **calm competence**. Placement prep is inherently anxious — deadlines, comparison, uncertainty about "am I doing enough." HireForge counters that anxiety not by minimizing it, but by making progress *visible and structured*, so the feeling shifts from "I don't know where I stand" to "I can see exactly where I stand, and exactly what's next."

**Core emotional beats:**
- **On open:** clarity, not overwhelm — the Dashboard answers "what do I do today" in under 3 seconds of looking at it.
- **While working:** flow — DSA/Theory/Interview screens minimize chrome, maximize the actual work surface, and never interrupt with unnecessary modals.
- **When stuck:** support, not judgment — the AI Mentor's tone throughout is a sharp senior engineer who's rooting for you, never a lecturing tool.
- **On progress:** quiet pride — HireScore, streaks, and milestone moments get restrained but real celebratory motion (Part 8), never confetti-spam.

**Overall philosophy:** premium through *restraint*, not decoration. Every screen earns its features — if a section doesn't help the student act, it's cut. The product should feel expensive the way Linear and Stripe Dashboard feel expensive: dense information, generous whitespace, and motion that clarifies rather than performs.

---

## PART 2 — User Personas

### College Student (2nd/3rd year — "Rahul," per PRD §4)
- **Goals:** Build a foundation without knowing what "enough" looks like yet.
- **Pain points:** Overwhelmed by scope, doesn't trust his own judgment on what to prioritize.
- **Expected journey:** Onboarding → gentle roadmap starting from fundamentals → daily small wins (Daily Planner) → early streak-building to form habit before pressure hits.

### Final Year Student / Placement Aspirant ("Priya," per PRD §4)
- **Goals:** Convert existing DSA volume into interview-readiness; fix resume and communication gaps.
- **Pain points:** Has grinded but freezes under interview pressure; doesn't know how to structure a resume.
- **Expected journey:** Dashboard → Company Mode (target company selection) → Mock Interview practice loop → Resume JD-comparison iteration → Analytics tracking Company Readiness trend.

### Working Professional (0–3 YOE, switching companies)
- **Goals:** Efficient, targeted prep around a day job — no time for generic content.
- **Pain points:** Limited hours, needs the platform to *tell* them what matters, not make them search.
- **Expected journey:** Onboarding sets "experienced" level → AI Career Planner generates a compressed roadmap → heavy reliance on Daily Planner + Revision Queue to fit prep into small windows.

### Career Switcher (non-CS background)
- **Goals:** Build fundamentals from near-zero without feeling patronized.
- **Pain points:** Imposter syndrome, needs foundational Theory content more than most personas.
- **Expected journey:** Onboarding flags "beginner" + non-CS background → roadmap leans Theory-heavy early → Knowledge Graph-driven sequencing prevents jumping ahead before fundamentals land.

---

## PART 3 — User Journey

```
Landing Page
   │
   ▼
Authentication (Sign Up / Sign In via Clerk)
   │
   ▼
Onboarding (target role, target companies, current level, timezone)
   │
   ▼
Dashboard  ◄─────────────────────────────────────────┐
   │                                                   │
   ├──▶ DSA (Topic → Problem List → Problem Detail) ───┤
   ├──▶ Theory (Subject → Topic → Flashcards/Quiz) ────┤
   ├──▶ Roadmap (full timeline view) ──────────────────┤
   ├──▶ Resume (Builder → Preview → JD Analyzer) ──────┤
   ├──▶ Projects (List → Detail → AI Generator) ───────┤
   ├──▶ Interview (Dashboard → Session → Feedback) ────┤
   ├──▶ AI Chat (Mentor conversations) ─────────────────┤
   ├──▶ Analytics (HireScore, Insights, Timeline) ─────┤
   ├──▶ Companies (List → Detail → Company Mode) ──────┤
   ├──▶ Community (Threads, Study Rooms, Leaderboard) ─┤
   └──▶ Settings / Profile ─────────────────────────────┘
```

**Alternate flows:**
- **Forgot Password** branches off Authentication, returns to Sign In on success.
- **Verify Email** is a gate that can interrupt the flow immediately post-signup, before Onboarding.
- **Extension-linked flow:** a user arriving via the Chrome Extension "Connect to HireForge" handshake lands directly on a lightweight Auth → immediate return-to-extension confirmation screen, skipping Onboarding if already completed.
- **Deep-linked flow:** a shared Company page, Thread, or Problem link can be opened pre-auth, prompting Sign In only when an interactive action (bookmark, submit) is attempted — content itself is publicly viewable where the API Contract permits.
- **Revision-due flow:** a Notification click can jump directly into the Revision Queue view, bypassing Dashboard.

---

## PART 4 — Information Architecture

```
/                              Landing
/pricing                       Pricing
/features                      Features
/sign-in                       Authentication (sign in)
/sign-up                       Authentication (sign up)
/forgot-password                Forgot Password
/verify-email                   Verify Email
/onboarding                     Onboarding wizard

/dashboard                      Dashboard (home after auth)

/dsa                             DSA — Topic/Pattern browse
/dsa/problems                    DSA — Problem list (filterable)
/dsa/problems/[slug]              Problem Detail
/dsa/roadmap                      DSA-specific roadmap view (subset of full Roadmap)

/roadmap                         Full Roadmap (all domains, timeline view)

/theory                          Theory — Subject list
/theory/[subjectSlug]              Subject Detail (topic list)
/theory/[subjectSlug]/[topicSlug]   Theory Topic reader
/theory/[subjectSlug]/[topicSlug]/flashcards  Flashcards
/theory/[subjectSlug]/[topicSlug]/quiz        Quiz

/resume                          Resume Builder (list of resumes)
/resume/[resumeId]                 Resume Editor
/resume/[resumeId]/preview          Resume Preview
/resume/[resumeId]/jd-analyzer       JD Analyzer

/projects                        Projects list
/projects/[projectId]              Project Detail
/projects/generate                 AI Project Generator

/interview                        Interview Dashboard
/interview/sessions/[sessionId]     Interview Session (live)
/interview/sessions/[sessionId]/feedback  Session Feedback/Replay

/mentor                          AI Chat (Mentor conversations list + active thread)
/mentor/[conversationId]            Specific conversation

/analytics                        Analytics overview (HireScore, Insights)
/analytics/timeline                 Learning Timeline

/companies                        Company list
/companies/[slug]                   Company Detail (Company Mode)

/contests                         Contest Tracker

/community                        Community hub
/community/leaderboard              Leaderboard
/community/study-rooms              Study Rooms list
/community/study-rooms/[roomId]       Study Room (live)
/community/threads                  Threads list
/community/threads/[threadId]         Thread Detail

/bookmarks                        Bookmarks (cross-module: problems/theory/projects)
/revision                         Revision Queue (due items today)

/notifications                    Notifications

/profile                          Profile (public-facing view)
/settings                         Settings (account, preferences, subscription)
/settings/preferences               Notification preferences
/settings/subscription               Plan management

/admin                            Admin console (future — role-gated, not built in Foundation phase)
/admin/users
/admin/problems
/admin/theory
/admin/companies
/admin/audit-logs
```

**No assumed routes beyond this tree.** Any page not listed here is out of scope for Lovable to invent (see Part 15).

---

## PART 5 — Page-by-Page Specification

*Every page below follows the same fixed template. Where a field is genuinely not applicable to a page (e.g., a static Landing page has no "Sorting"), it's marked N/A rather than omitted, so absence is a documented decision, not a gap.*

---

### Landing (`/`)
- **Purpose:** Convert visitors into signups; communicate the "AI Career Operating System" positioning.
- **Target user:** Unauthenticated prospective student.
- **Layout:** Full-width hero, sticky header, scroll-based sections, footer.
- **Sections:** Hero (headline + CTA + product visual), Problem framing (fragmentation pain, PRD §5), Feature grid (DSA/Theory/AI Mentor/Resume/Interview/Roadmap), "How it works" 3-step flow, Social proof placeholder (testimonials — empty state until real data exists), Pricing teaser (links to `/pricing`), Final CTA, Footer.
- **Components:** Header (marketing variant, no sidebar), Button (primary CTA "Get Started Free"), Feature Card, Footer.
- **Buttons:** "Get Started Free" (→ `/sign-up`), "See Pricing" (→ `/pricing`), "Sign In" (header, → `/sign-in`).
- **Cards:** Feature cards (icon + title + one-line description), no data-driven cards.
- **Tables:** N/A.
- **Search/Filters/Sorting/Pagination:** N/A.
- **Keyboard shortcuts:** N/A (marketing page).
- **Loading state:** Static content, no async load — hero renders immediately (no skeleton needed).
- **Empty state:** N/A.
- **Error state:** Standard 500 fallback only if the page itself fails to render (rare, static).
- **Responsive behaviour:** Hero stacks vertically below tablet breakpoint; feature grid goes from 3-col → 2-col → 1-col.
- **Accessibility:** All CTAs keyboard-reachable in logical tab order; hero heading is a true `<h1>`.
- **Future enhancements:** Real testimonial carousel, interactive product demo embed.

---

### Pricing (`/pricing`)
- **Purpose:** Present Free vs. Pro (PRD §14) clearly, drive Pro conversion.
- **Target user:** Unauthenticated or Free-tier authenticated user.
- **Layout:** Centered two/three-column plan comparison.
- **Sections:** Plan cards (Free, Pro, Campus-future-teaser), FAQ accordion.
- **Components:** Pricing Card, Accordion, Button.
- **Buttons:** "Start Free" (→ `/sign-up`), "Upgrade to Pro" (→ `/settings/subscription` if authenticated, else → `/sign-up?plan=pro`).
- **Tables:** Optional feature-comparison table (Free vs Pro rows) — implemented as a Table component, not cards, for scanability.
- **Search/Filters/Sorting/Pagination:** N/A.
- **Loading/Empty/Error states:** Static content; standard error fallback only.
- **Responsive:** Plan cards stack vertically on mobile.
- **Accessibility:** FAQ accordion fully keyboard-operable (Enter/Space to expand).
- **Future enhancements:** Annual/monthly billing toggle once Stripe (Group C, backend) ships.

---

### Features (`/features`)
- **Purpose:** Deeper feature walkthrough than the Landing page's teaser grid.
- **Layout:** Long-form scroll page, alternating text/visual sections per major feature (DSA, Theory, AI Mentor, Resume, Interview, Roadmap, Analytics).
- **Components:** Feature Section (repeatable: heading, description, illustrative visual/screenshot placeholder).
- **Everything else:** same pattern as Landing (static, no data states).

---

### Authentication — Sign In / Sign Up (`/sign-in`, `/sign-up`)
- **Purpose:** Clerk-hosted or Clerk-embedded auth flow entry.
- **Target user:** Unauthenticated.
- **Layout:** Centered single-column card on a subtle branded background (glass card over gradient).
- **Sections:** Clerk auth component (social + email), link to the alternate flow (Sign In ↔ Sign Up), link to Forgot Password.
- **Components:** Auth Card (wraps Clerk's component), Button, Divider ("or continue with").
- **Loading state:** Skeleton card shape while Clerk's component initializes.
- **Error state:** Inline error text under the relevant field (Clerk-provided), never a full-page error for auth failures.
- **Responsive:** Card is full-width with padding on mobile, fixed max-width centered on desktop.
- **Accessibility:** Form fields properly labeled; error messages associated via `aria-describedby`.

### Forgot Password (`/forgot-password`)
- Same layout pattern as Sign In. **Sections:** Email input → confirmation state ("check your email") replacing the form in place (no navigation away, so the user doesn't lose context).
- **Error state:** Inline, e.g., "No account found with that email" (careful phrasing to avoid account enumeration — actual copy should be reviewed with the backend team, flagged here rather than assumed).

### Verify Email (`/verify-email`)
- **Purpose:** Gate between Sign Up and Onboarding.
- **Layout:** Centered card, single message + "Resend email" action, auto-redirect to Onboarding on verification detection (polling or Clerk webhook-driven state).
- **Loading state:** Spinner on "Resend" while in-flight.
- **Empty/Error state:** "Verification link expired" state with a clear Resend CTA.

---

### Onboarding (`/onboarding`)
- **Purpose:** Capture target role, target companies, current level, timezone (API Contract Part B `/users/me/onboarding`) → triggers async Roadmap generation.
- **Target user:** Newly authenticated, pre-Dashboard user.
- **Layout:** Multi-step wizard, one question per screen, progress indicator at top (not a sidebar — this flow is deliberately full-screen and distraction-free).
- **Sections:** Step 1 (target role — card-select grid, PRD §26 tracks), Step 2 (target companies — multi-select search, max 5 per API Contract), Step 3 (current level — single-select: beginner/intermediate/advanced), Step 4 (confirmation + "Generate my roadmap" CTA).
- **Components:** Stepper/Progress Bar, Selectable Card Grid, Multi-select Search Input, Button.
- **Buttons:** "Back," "Continue," final "Generate my Roadmap" (triggers `202` async job per API Contract Part F).
- **Loading state:** After final submit, a dedicated "Building your roadmap..." full-screen state with an animated illustration (not a generic spinner — this is the product's first "wow" moment) while polling the job status.
- **Empty state:** N/A (wizard always has content).
- **Error state:** `422 ONBOARDING_INCOMPLETE`-type errors shown inline per step; roadmap generation failure shows a retry option, never a dead end.
- **Responsive:** Single-column on all breakpoints — this flow is intentionally not a multi-column layout at any size.
- **Accessibility:** Each step is a properly labeled `fieldset`/`legend`; progress announced via `aria-live` on step change.
- **Future enhancements:** Resume-upload-first onboarding path (skip manual role selection by parsing an uploaded resume).

---

### Dashboard (`/dashboard`)
- **Purpose:** The daily home screen — answer "what do I do today" immediately (Part 1 vision).
- **Target user:** All authenticated users, every session start.
- **Layout:** Sidebar (persistent nav) + main content grid. Grid: top row = HireScore widget + Streak widget + Quick Stats row; middle = Today's Tasks (largest block); side column = Upcoming Revision + Recent Activity + Notifications preview.
- **Sections:** Greeting header ("Good morning, [Name]"), HireScore Widget, Streak Calendar Heatmap, Today's Tasks card, Upcoming Revision list, Weekly Progress mini-chart, Recent Activity feed.
- **Components:** Header, Sidebar, HireScore Gauge (radial), Streak Heatmap, Task Card, Stat Card, Activity Feed Item, Notification Bell (badge count).
- **Buttons:** "View full roadmap," "Start today's problem," "Regenerate today's plan" (manual re-plan, API Contract `/planner/today/regenerate`).
- **Tables:** N/A (card-based, not tabular).
- **Search/Filters/Sorting/Pagination:** N/A on this page (each module owns its own).
- **Keyboard shortcuts:** `Cmd/Ctrl+K` opens Command Palette from anywhere, including here (Part 6).
- **Loading state:** Skeleton grid matching the exact card layout (never a single centered spinner for a composite page like this — every card skeletons independently so fast-loading sections render immediately rather than waiting on the slowest one).
- **Empty state:** New user with no activity yet — Today's Tasks shows "Your roadmap is ready — here's your first step" instead of a generic empty message; Recent Activity shows a friendly "Nothing yet — solve your first problem to see it here."
- **Error state:** Per-card error fallback (e.g., "Couldn't load HireScore — retry") rather than failing the whole dashboard if one sub-fetch fails — matches the Architecture's composite-read design.
- **Responsive:** 3-column grid → 2-column (tablet) → single-column stacked, Today's Tasks always first on mobile.
- **Accessibility:** Landmark regions (`<main>`, `<aside>`) properly defined; HireScore gauge has a text-equivalent value for screen readers, not just a visual gauge.
- **Future enhancements:** Customizable widget arrangement (drag-to-reorder).

---

### DSA — Topic/Pattern Browse (`/dsa`)
- **Purpose:** Entry point into the DSA module — browse by Topic or Pattern before diving into the full problem list.
- **Layout:** Sidebar + main content with two toggleable views (By Topic / By Pattern), each a card grid.
- **Sections:** View toggle, Topic/Pattern cards (each showing name, problem count, user's completion %).
- **Components:** Toggle Group, Topic Card (progress ring inline), Search bar (jumps to filtered Problem List).
- **Buttons:** Each card is clickable → `/dsa/problems?topic=X`.
- **Search:** Global-feeling search bar at top, scoped to DSA (`?q=` on Problem List).
- **Loading state:** Card grid skeleton.
- **Empty state:** N/A — Topic/Pattern catalog is always populated (admin-managed reference data).
- **Responsive:** Grid 4-col → 3 → 2 → 1.

### DSA Problem List (`/dsa/problems`)
- **Purpose:** Filterable, sortable catalog of all problems.
- **Layout:** Sidebar (filter panel) + main table/list.
- **Sections:** Filter sidebar (Difficulty, Topic, Pattern, Company, Status: solved/unsolved/bookmarked), Sort control, Problem rows.
- **Components:** Filter Panel, Table (or dense List — recommend Table for scanability at this density), Difficulty Badge, Status Icon, Pagination (cursor-based "Load more," matching API Contract's cursor pagination — never numbered pages here).
- **Search:** Inline search box, debounced, scoped query param.
- **Filters:** Difficulty (multi-select chips), Topic (dropdown), Pattern (dropdown), Company (searchable dropdown), Status (segmented control).
- **Sorting:** Newest, Difficulty (asc/desc), Acceptance Rate.
- **Keyboard shortcuts:** `/` focuses search from anywhere on this page.
- **Loading state:** Table row skeletons (5–8 placeholder rows).
- **Empty state:** "No problems match your filters" with a "Clear filters" action — never a dead end.
- **Error state:** Inline banner above the table, table area shows a retry card.
- **Responsive:** Filter sidebar collapses into a "Filters" drawer/sheet on mobile/tablet; table becomes a card-list layout below tablet width (table columns don't just shrink — they restructure into stacked cards, since raw table scrolling is a poor mobile pattern).
- **Accessibility:** Table has proper `<th scope="col">`; filter chips are real toggle buttons with `aria-pressed`.

### Problem Detail (`/dsa/problems/[slug]`)
- **Purpose:** The core DSA working surface — read, code, submit, get hints.
- **Layout:** Split-pane — left: problem description (scrollable), right: code editor + console/output area. Collapsible panes.
- **Sections:** Problem header (title, difficulty badge, topic/pattern tags, bookmark toggle), Description tab, Submissions tab (own history), Discussion tab (future — Community integration), Code Editor, Language selector, Run/Submit buttons, Hint panel (collapsible, progressive reveal per Architecture §7.2), AI Explanation panel (post-solve).
- **Components:** Split Pane, Tab Group, Code Editor (Monaco-style), Language Select Dropdown, Hint Card (with "Get another hint" progressive disclosure), Bookmark Toggle, Submit Button, Run Button.
- **Buttons:** Run, Submit, Get Hint (AI-tier rate-limited, shows remaining quota if near limit), Bookmark, "Explain this problem" (AI).
- **Loading state:** Editor shows a skeleton/placeholder while the problem content and starter code load; Submit shows a loading state on the button itself (not a full-page block) while the submission POST is in flight.
- **Empty state:** Submissions tab, first visit: "You haven't attempted this yet — give it a shot."
- **Error state:** Submission failure shows inline error near the Submit button with the specific error code translated to plain language (never raw API error codes shown to the user).
- **Responsive:** Split-pane becomes stacked (description above, editor below, both full-width) below laptop breakpoint; on mobile, a tab switcher replaces the split view entirely (Description / Code as separate full-screen tabs) since side-by-side coding on a phone isn't realistic.
- **Accessibility:** Code editor keyboard-fully-operable (standard editor a11y); hint reveal is `aria-live` polite so screen reader users are notified of new hint content.
- **Future enhancements:** Real-time collaborative solving in Study Rooms.

### Roadmap — DSA subset (`/dsa/roadmap`)
- Thin, DSA-filtered view of the full Roadmap timeline (below) — same component, scoped query.

---

### Full Roadmap (`/roadmap`)
- **Purpose:** Visualize the entire personalized learning path across all domains.
- **Layout:** Vertical timeline, sidebar + main content.
- **Sections:** Roadmap header (target role/company summary, "Regenerate" action), Timeline (grouped by phase/week), Node cards (topic name, status: locked/available/in-progress/complete, links into DSA/Theory).
- **Components:** Timeline component, Roadmap Node Card, Progress Bar (overall roadmap completion %).
- **Buttons:** "Regenerate Roadmap" (with confirmation modal — this is a meaningful action, not a casual one), individual node "Mark complete" / "Skip."
- **Loading state:** Timeline skeleton (a handful of placeholder node shapes).
- **Empty state:** Should never occur post-onboarding (roadmap always exists) — if it does (edge case: generation failed), show "We couldn't generate your roadmap — try again" with a direct retry CTA, not a silent blank page.
- **Error state:** `422 REGENERATION_ALREADY_IN_PROGRESS` shown as a disabled "Regenerate" button with a tooltip explaining why, not a jarring error toast.
- **Responsive:** Timeline remains vertical at all breakpoints (never forced horizontal on mobile) — this is the one layout pattern that doesn't need to change shape across screen sizes, only scale.
- **Accessibility:** Node status communicated via both color and icon/text (never color alone, for colorblind users) — this rule applies platform-wide but is called out here since status-heavy UI is exactly where it matters most.

---

### Theory — Subject List (`/theory`)
- **Layout:** Card grid, one card per Subject (OS, DBMS, CN, OOP), each showing topic count and completion %.
- **Everything else:** follows the same pattern as DSA's Topic Browse page.

### Subject Detail (`/theory/[subjectSlug]`)
- **Purpose:** List all TheoryTopics within a Subject.
- **Layout:** Sidebar + list (simpler than DSA's problem list — no difficulty/company filters, just topic list with completion status and revision-due indicator).
- **Components:** Topic List Item (with status icon), Search (scoped).

### Theory Topic Reader (`/theory/[subjectSlug]/[topicSlug]`)
- **Purpose:** Read the merged Note content (Prisma `TheoryTopic.contentMarkdown`).
- **Layout:** Centered reading column (not split-pane — this is a reading surface, not a working surface, deliberately different from Problem Detail).
- **Sections:** Markdown-rendered content, "Generate Flashcards" CTA, "Ask AI to explain" inline action, links to Flashcards/Quiz for this topic.
- **Components:** Markdown Renderer, Table of Contents (sticky, auto-generated from headings), Bookmark Toggle.
- **Loading state:** Content skeleton (text-block placeholders).
- **Responsive:** Reading column narrows appropriately; Table of Contents collapses into a dropdown on mobile/tablet.
- **Accessibility:** Proper heading hierarchy preserved from markdown source; reading column max-width tuned for line-length readability at all sizes.

### Flashcards (`/theory/[subjectSlug]/[topicSlug]/flashcards`)
- **Purpose:** Spaced-repetition review surface.
- **Layout:** Full-screen card-flip interface, minimal chrome.
- **Sections:** Card front/back flip interaction, self-rating buttons (Again/Hard/Good/Easy — feeds `intervalStage` per Prisma schema), progress indicator ("Card 3 of 12").
- **Buttons:** Flip, rating buttons (4-way).
- **Keyboard shortcuts:** Space to flip, number keys 1–4 for rating.
- **Empty state:** "No flashcards due right now — check back later" (if arriving with nothing due) with an option to generate new AI flashcards for this topic instead.
- **Loading state:** Card skeleton (single centered card shape).
- **Responsive:** Card scales down proportionally, remains centered and full-attention at every size.

### Quiz (`/theory/[subjectSlug]/[topicSlug]/quiz`)
- **Purpose:** MCQ assessment surface.
- **Layout:** Single-question-per-screen (not a long scrollable form) with a progress bar, results screen at the end.
- **Sections:** Question, options (radio-style selectable cards), Next button, final Results screen (score, per-question review).
- **Loading state:** Question skeleton.
- **Empty state:** N/A (quiz always has content once entered).
- **Error state:** Submission failure on the final "Submit Quiz" action shows an inline retry, preserving all answered selections (never loses user input on error).

---

### Resume Builder (`/resume`)
- **Purpose:** List of the user's Resumes (containers), entry point to create/edit.
- **Layout:** Sidebar + card/list of Resume containers, each showing latest version's ATS score badge.
- **Buttons:** "Create New Resume," per-resume "Edit," "Duplicate," "Delete" (soft delete, confirmation modal).
- **Empty state:** First-time user — "Build your first resume" with a prominent CTA and a brief explainer of what the tool does.

### Resume Editor (`/resume/[resumeId]`)
- **Purpose:** Structured resume content editing (not raw text — sectioned form: Experience, Projects, Skills, Education).
- **Layout:** Split — left: sectioned form editor, right: live Preview (updates as you type, debounced).
- **Sections:** Section accordion (Experience, Education, Projects, Skills, Certifications), each with add/edit/reorder (drag) entries.
- **Components:** Accordion Section, Draggable List Item, Rich Text-lite Input (bullet points), Live Preview Pane.
- **Buttons:** "Save Version" (creates immutable `ResumeVersion`), "Export PDF," "Analyze against JD."
- **Loading state:** Form skeleton on initial load; Preview pane shows a subtle "updating..." indicator during debounce, not a full reload flicker.
- **Error state:** Field-level validation inline; save failure shows a retry toast, never silently loses edits (draft state persisted client-side as a safety net).
- **Responsive:** Split view stacks (Preview becomes a "Preview" tab/toggle rather than always-visible) below laptop width.

### Resume Preview (`/resume/[resumeId]/preview`)
- **Purpose:** Full-screen, print-ready view of a specific ResumeVersion.
- **Layout:** Centered document-width column, minimal chrome, version selector dropdown (compare across `ResumeVersion` history).
- **Buttons:** "Export PDF," "Back to Editor," version selector.

### JD Analyzer (`/resume/[resumeId]/jd-analyzer`)
- **Purpose:** Paste/upload a job description, get the gap analysis (API Contract `/resumes/:id/analyze`).
- **Layout:** Input step (paste JD text or upload file) → Results step (replaces input in place after analysis completes).
- **Sections:** JD input textarea, "Analyze" button, Results: ATS score gauge, Missing Skills list, Missing Projects, Weak Bullet Points (with inline rewrite suggestions), Keyword Gap chips.
- **Loading state:** Given this is async (`202` per API Contract), show a dedicated "Analyzing your resume against this JD..." progress state with an estimated time, polling for completion — same pattern as Onboarding's roadmap generation, for consistency.
- **Error state:** Analysis failure shows a clear retry, JD text preserved (never re-typed).
- **Empty state:** N/A (this page is always either input or results).

---

### Projects List (`/projects`)
- **Purpose:** Track manually-added and AI-generated projects.
- **Layout:** Card grid, each card shows title, milestone progress bar, tags.
- **Buttons:** "Generate with AI" (→ `/projects/generate`), "Add Manually" (inline quick-add modal).
- **Empty state:** "No projects yet — generate one based on your skills" with direct CTA to the Generator.

### AI Project Generator (`/projects/generate`)
- **Purpose:** Input skills → get AI-generated project ideas (PRD §27).
- **Layout:** Input step (skill multi-select/search) → Results step (2–3 generated project cards to choose from, each expandable to see milestones/architecture before committing).
- **Loading state:** "Generating project ideas..." progress state (AI-tier call, may take a few seconds — never a bare spinner with no context).
- **Buttons:** "Add to my projects" per generated card, "Regenerate."

### Project Detail (`/projects/[projectId]`)
- **Purpose:** Milestone tracking for one project.
- **Layout:** Header (title, description, skills tags) + Milestone checklist (ordered, draggable if manually reordered).
- **Components:** Checklist Item (with complete toggle), Progress Bar.
- **Empty state:** N/A once a project exists (always has at least generated milestones or an "Add milestone" prompt).

---

### Interview Dashboard (`/interview`)
- **Purpose:** Entry point — start a new mock interview, view history.
- **Layout:** "Start New Session" prominent card (mode selector: Text/Voice, difficulty, optional company-specific flavor) + History list below.
- **Components:** Session Config Card, History List Item (score badge, date, mode icon).
- **Empty state:** First-time — explainer of what a mock interview involves before the first "Start" click (reduces anxiety about the unknown format).

### Interview Session — live (`/interview/sessions/[sessionId]`)
- **Purpose:** The actual interview simulation surface.
- **Layout:** Full-screen, minimal chrome, chat-like question/answer flow (text mode) or a voice-recording interface (voice mode, per Architecture §37) with a waveform/recording indicator.
- **Sections:** Current question display, answer input (text area or voice record button), progress indicator ("Question 3 of 6"), "End Session" (with confirmation — this shouldn't be a casual exit given the state it discards).
- **Components:** Voice Recorder widget (with permission-request state), Chat-style Q&A bubbles, Timer (optional, if timed mode).
- **Loading state:** Between questions, a brief "thinking..." state from the Interview Mentor agent (streaming where possible per Architecture §13).
- **Error state:** Voice upload failure → retry-record option, never silently loses the attempted answer.
- **Responsive:** Full-screen pattern holds at all sizes; voice recorder UI simplified (larger touch target) on mobile.
- **Accessibility:** Voice mode has a text-input fallback always available for accessibility, not voice-only.

### Session Feedback / Replay (`/interview/sessions/[sessionId]/feedback`)
- **Purpose:** Scored feedback report (Architecture §7.2 Interview Mentor output).
- **Layout:** Score summary header (overall + sub-scores: confidence, clarity, technical accuracy) + per-question breakdown (expandable, shows the question, the answer given, and specific feedback) + optional recording replay player (voice mode).
- **Components:** Score Gauge (multi-metric), Expandable Question Review Card, Audio Player (if voice).
- **Loading state:** If feedback is still being generated (async), a "Generating feedback..." state before this content is ready.

---

### AI Chat / Mentor (`/mentor`)
- **Purpose:** Conversation list + entry into the streaming chat interface (API Contract Part G).
- **Layout:** Two-pane — left: conversation list (like an email/chat client sidebar), right: active conversation thread.
- **Sections:** Conversation List (searchable, sorted by `lastMessageAt`), New Conversation button, Active Thread (message bubbles, streaming assistant response, input box at bottom).
- **Components:** Conversation List Item, AI Message Bubble (with subtle agent-type indicator icon, per `Message.agentUsed`), User Message Bubble, Streaming Cursor/typing indicator, Message Input (multiline, send on Enter/Shift+Enter for newline).
- **Buttons:** New Conversation, Send, "Regenerate response" (per-message action on the last assistant message).
- **Keyboard shortcuts:** `Cmd/Ctrl+Enter` to send from anywhere in the input; `Cmd/Ctrl+N` new conversation.
- **Loading state:** Streaming response renders token-by-token (SSE) with a typing-indicator cursor — this is the primary "loading state" for this page, deliberately visible rather than hidden behind a spinner, since watching the AI "think" is part of the intended experience.
- **Empty state:** No conversations yet — a friendly prompt with a few suggested starter questions ("Ask me to review my resume," "Ask why you're stuck on Graphs") to reduce blank-page hesitation.
- **Error state:** `429 AI_RATE_LIMIT_EXCEEDED` shown as an inline message in the thread itself (not a disruptive modal), with the plan's quota and a clear upgrade path if on Free tier.
- **Responsive:** Two-pane collapses to a single pane with back-navigation (conversation list ↔ thread) below tablet width — never both panes squeezed simultaneously on mobile.
- **Accessibility:** New streamed content announced via `aria-live="polite"` region so screen readers pick up the assistant's response as it completes (not token-by-token, which would be unusable — batched at sentence/completion boundaries).

---

### Analytics (`/analytics`)
- **Purpose:** HireScore, sub-scores, and AI-generated Insights (Architecture §30–31).
- **Layout:** Sidebar + main. Top: HireScore hero gauge + sub-score breakdown row. Below: Insights feed, Weak/Strong topics side-by-side, trend charts.
- **Sections:** HireScore Gauge (large, primary focal point), Sub-score bars (DSA/Theory/Resume/Interview/etc.), Insight Cards (narrative text), Weak Topics list, Strong Topics list, Trend chart (HireScore over time — line chart).
- **Components:** Radial Gauge, Bar/Progress rows, Insight Card, Line Chart (Recharts), Topic Chip.
- **Loading state:** Gauge and charts show skeleton shapes matching their final geometry (a circle skeleton for the gauge, not a generic rectangle).
- **Empty state:** New user with insufficient data — "Keep practicing — your HireScore and insights will appear here once you've completed a few problems," never a broken-looking zero-value chart.
- **Responsive:** Gauge + sub-scores stack above charts below laptop width; charts remain horizontally scrollable rather than illegibly compressed on mobile.
- **Accessibility:** All chart data available in an accessible table alternative (visually hidden or in a "View as table" toggle) — charts alone aren't sufficient for screen reader users.

### Learning Timeline (`/analytics/timeline`)
- **Purpose:** Full chronological journey view.
- **Layout:** Vertical timeline (visually distinct from Roadmap's timeline — this one is historical/past-facing, Roadmap is future-facing), cursor-paginated ("Load earlier").
- **Components:** Timeline Event Item (icon per event type: solved problem, completed interview, HireScore milestone, etc.).
- **Empty state:** "Your journey starts here" for a brand-new account.

---

### Companies List (`/companies`)
- **Layout:** Searchable card grid, each card: logo, name, difficulty distribution mini-indicator.
- **Search/Filters:** Search by name; filter by industry (future field) — currently just search per approved schema.
- **Loading state:** Card grid skeleton.

### Company Detail — Company Mode (`/companies/[slug]`)
- **Purpose:** The full Company Mode dashboard transformation (Architecture §25).
- **Layout:** Header (logo, name, salary range, "Set as target" action) + tabbed sections: Roadmap, Most Asked Questions, Interview Process, OA Pattern, Behavioral Questions, Past Experiences, Company Readiness Score.
- **Components:** Tab Group, Readiness Score Gauge (company-specific), Question List (links into `/dsa/problems/[slug]`), Experience Card (from `InterviewExperience`).
- **Buttons:** "Set as Target Company" (updates onboarding target list), "Start Company Mock Interview."
- **Empty state:** Sparse company profiles (admin content still being curated) show "More content coming soon for this company" per section rather than a blank tab.
- **Responsive:** Tabs become a horizontally-scrollable pill row on mobile rather than a dropdown (keeps all options visible/discoverable).

---

### Contest Tracker (`/contests`)
- **Purpose:** Aggregated upcoming contests + personal history/rating (Architecture §35, Group B backend).
- **Layout:** Sidebar + main: Upcoming Contests list (with countdown), Rating Graph, Contest History table.
- **Components:** Countdown Timer, Rating Line Chart, History Table row.
- **Empty state:** No linked platform accounts yet — prompt to connect via the Chrome Extension for auto-sync.
- **Loading state:** Table/list skeletons.

---

### Bookmarks (`/bookmarks`)
- **Purpose:** Unified view across `ProblemBookmark` / `TheoryTopicBookmark` / `ProjectBookmark`.
- **Layout:** Tab group (Problems / Theory / Projects) + list per tab, matching each source module's card style.
- **Empty state:** Per-tab: "No bookmarked [problems/topics/projects] yet."

### Revision Queue (`/revision`)
- **Purpose:** Today's due spaced-repetition items across DSA and Flashcards.
- **Layout:** Combined list, grouped by type (Problems Due / Flashcards Due), each item launches directly into the relevant review interface.
- **Empty state:** "You're all caught up — nothing due today," styled positively (this is a good state, not a failure state — deliberate visual distinction from other empty states which imply "go do something").

---

### Notifications (`/notifications`)
- **Purpose:** Full notification history/inbox (Dashboard shows only a preview).
- **Layout:** List, grouped by day, unread visually distinct (dot indicator + subtle background tint).
- **Buttons:** "Mark all as read," per-item click navigates to the relevant source (e.g., a Revision Due notification → `/revision`).
- **Filters:** Filter by `NotificationType`.
- **Empty state:** "No notifications yet."
- **Loading state:** List item skeletons.

---

### Profile (`/profile`)
- **Purpose:** Public-facing (or self-facing, if profile-sharing isn't yet a feature) summary — display name, avatar, HireScore badge, streak.
- **Layout:** Header card + stats summary, read-only.
- **Future enhancements:** Public shareable profile URLs (career-portfolio angle).

### Settings (`/settings`)
- **Purpose:** Account management hub.
- **Layout:** Sidebar sub-nav (Account, Preferences, Subscription) + content panel.
- **Sections:** Account (name, avatar, email — email is Clerk-managed, shown read-only with a "Manage in Clerk" link if applicable), Preferences (theme — though dark-first is default, notification toggles), Subscription (current plan, upgrade CTA).
- **Buttons:** "Save changes" per section, "Delete Account" (destructive, requires typed confirmation per standard SaaS pattern — not just a click-through).
- **Error state:** Field-level validation; destructive action failure shows a clear retry.

### Settings — Preferences (`/settings/preferences`)
- Notification channel toggles (email/push), revision reminder toggle — maps directly to `NotificationPreference` Prisma model.

### Settings — Subscription (`/settings/subscription`)
- Current plan display, usage against AI-tier quota (transparency on rate limits per API Contract Part A.12), upgrade/downgrade actions (future Stripe integration point — UI scaffolded now, action wired later per Group C backend status).

---

### Admin Console (`/admin`, future — not built in Foundation phase)
- **Purpose:** Content management per Architecture §3.16.
- **Note:** Specified structurally now (route tree, per Part 4) so the Information Architecture is complete, but explicitly **out of scope for initial Lovable implementation** (Part 16 phases) — flagged here to avoid ambiguity about whether it's forgotten vs. deliberately deferred. When built, it follows the same Table/Filter/Pagination patterns as the Problem List page, with offset pagination permitted per the DDD's stated Admin exception.

---

## PART 6 — Component Library

Every component below: **Variants / Sizes / Behaviour / Props (conceptual, not TypeScript signatures — that's an implementation detail for Lovable, not this spec) / Accessibility.**

**Button**
- Variants: Primary, Secondary, Ghost, Destructive, Link-style.
- Sizes: sm, md, lg, icon-only.
- Behaviour: Loading state replaces label with spinner + disables interaction; disabled state visually distinct (not just opacity — also `cursor-not-allowed`).
- Accessibility: Icon-only buttons always carry an `aria-label`.

**Card**
- Variants: Default (glass), Elevated (hover-lift, for clickable cards), Flat (nested inside another card, no shadow).
- Behaviour: Clickable cards show a hover state (subtle border-glow, per Part 8) and are real `<button>`/`<a>` elements, never a `<div onClick>`.

**Stat Card**
- Variants: With trend indicator (up/down arrow + delta), without.
- Sizes: Compact (dashboard grid), Large (analytics hero).

**Sidebar**
- Behaviour: Persistent on desktop/laptop, collapses to icon-only rail on tablet (toggleable), becomes a slide-over drawer on mobile.
- Contains: primary nav items (Dashboard, DSA, Theory, Roadmap, Resume, Projects, Interview, Mentor, Analytics, Companies, Community, Bookmarks/Revision grouped), footer (Settings, user avatar/menu).

**Header**
- Two variants: Marketing (Landing/Pricing/Features — logo, nav links, Sign In/Get Started), App (authenticated — search trigger, notification bell, user menu; sidebar handles nav, so app header stays minimal).

**Footer**
- Marketing pages only — standard link columns (Product, Company, Legal), not present in the authenticated app shell.

**Breadcrumb**
- Used on nested pages (Problem Detail, Theory Topic, Company Detail) to show path back to list views.

**Search**
- Inline (scoped to a page, e.g., Problem List) vs. Global (Command Palette, below).

**Command Palette**
- Trigger: `Cmd/Ctrl+K`.
- Behaviour: Fuzzy search across Problems, Theory Topics, Companies, and quick actions ("Start mock interview," "Go to Settings"). Recent items shown when query is empty.
- Accessibility: Full keyboard navigation (arrow keys + Enter), traps focus while open, closes on Escape.

**Table**
- Behaviour: Sticky header on scroll, sortable column headers (click to toggle sort), row hover state, restructures to card-list below tablet width (per Problem List spec above).

**Modal**
- Behaviour: Focus-trapped, closes on Escape and backdrop click (except for destructive-confirmation modals, which require explicit button interaction — no accidental backdrop dismissal on irreversible actions).

**Drawer**
- Used for mobile filter panels and the mobile sidebar. Slides from the edge, same focus-trap rules as Modal.

**Tooltip**
- Behaviour: Appears on hover (desktop) or long-press (touch), short delay (~300ms) before showing.

**Dropdown**
- Standard select-style and action-menu-style variants; both fully keyboard operable.

**Avatar**
- Sizes: xs, sm, md, lg. Fallback: initials on colored background if no avatar image.

**Badge**
- Variants: Difficulty (Easy/Medium/Hard, color-coded per Part 7), Status, Count (notification/unread badges).

**Progress**
- Variants: Linear bar, Circular/radial (used for HireScore, Company Readiness).

**Calendar / Heatmap**
- Streak calendar heatmap (GitHub-contribution-graph style) — used on Dashboard and Analytics.

**Timeline**
- Two contexts: Roadmap (future-facing, status-driven) and Learning Timeline (past-facing, event-log-driven) — visually differentiated per their page specs above, but share the same base Timeline component with different item renderers.

**Markdown Renderer**
- Used for Theory content, Problem descriptions, AI message content. Supports code blocks with syntax highlighting.

**AI Message Bubble**
- Variants: User, Assistant (with agent-type icon indicator), streaming (shows typing cursor).

**Code Editor**
- Monaco-based, language-switchable, theme matches app dark theme, supports keyboard shortcuts standard to code editors (not custom-reinvented).

**Charts**
- Line (trends), Bar (comparisons), Radial (scores) — Recharts-based per Architecture's frontend library list.

**Skeleton**
- Shape-matched to the content it replaces (never a generic gray rectangle for everything — text skeletons are line-shaped, avatar skeletons are circular, gauge skeletons are circular, etc.) per the loading-state philosophy stated throughout Part 5.

**Toast**
- Variants: Success, Error, Info. Auto-dismiss (success/info) vs. manual-dismiss (error, so the user has time to read it).

**Empty State**
- Standard shape: icon/illustration + heading + one line of supporting text + optional CTA button. Used consistently per Part 11.

**Error State**
- Standard shape: icon + heading + explanation + Retry action. Used consistently per Part 12.

**Loading State**
- Governed by Part 13.

---

## PART 7 — Design System

**Colors**
- Primary: Electric Blue (`#3B82F6`-range, exact hex finalized in implementation).
- Accent: Cyan (`#22D3EE`-range).
- Background: Rich Black (`#0A0A0B`-range, not pure `#000` — pure black reads harsh against glass cards).
- Surface/Card: Dark Glass — semi-transparent dark surface with a subtle blur backdrop, thin light-opacity border for edge definition.
- Semantic: Success (green), Warning (amber), Error (red/rose), Info (matches accent cyan).
- Difficulty semantic mapping: Easy = green, Medium = amber, Hard = rose — consistent everywhere difficulty appears (Problem List, Badges, Filter chips).

**Typography**
- Font: Geist (Sans for UI text, Geist Mono for code/technical values — problem constraints, submission stats).
- Scale: a standard modular scale (e.g., 12/14/16/18/20/24/32/40px) — headings use tighter line-height, body text uses relaxed line-height for readability.

**Spacing & Grid**
- 4px base spacing unit, standard Tailwind-compatible scale.
- Max content width: constrained on wide/ultra-wide screens (never full-bleed text content) — dashboard/app grids can use more width than reading-focused pages (Theory Topic Reader, Resume Preview).

**Breakpoints**
- Mobile: <640px. Tablet: 640–1024px. Laptop: 1024–1440px. Desktop: 1440–1920px. Ultra-wide: >1920px (content max-width caps rather than stretching further).

**Elevation, Borders, Radius, Shadows**
- Radius: Large throughout (per Design Language brief) — cards, buttons, inputs all share a consistent large-radius system (e.g., 12–16px for cards, slightly smaller for buttons/inputs, larger for modals).
- Shadows: Minimal — the Dark Glass aesthetic relies more on border + blur + subtle background differentiation than heavy drop shadows, which read poorly on dark backgrounds.

**Dark Theme / Light Theme**
- Dark-first is the default and primary experience. Light theme is a documented future toggle (Settings → Preferences) — not required for V1 Lovable implementation unless explicitly prioritized, flagged here as a scoping decision for Part 16.

**Icon Usage**
- Lucide icons exclusively, consistent stroke-width throughout, sized per context (16px inline, 20px standard UI, 24px feature/empty-state icons).

**Illustration Style**
- Minimal line-art / abstract geometric style for empty states and onboarding — never stock-photo-style imagery, consistent with the "premium through restraint" philosophy (Part 1).

---

## PART 8 — Animation System

- **Page transitions:** Subtle fade + slight vertical slide (8–12px) on route change, 200–250ms, ease-out. Never a jarring hard-cut, never an overlong transition that delays perceived load.
- **Hover:** Cards lift slightly (2–4px translate) + border-glow intensifies, 150ms ease-out.
- **Focus:** Visible focus ring (accent color), instant (no transition delay on focus rings — accessibility priority over animation polish here).
- **Loading:** Skeleton shimmer (subtle gradient sweep), 1.5s loop.
- **Sidebar/Navigation:** Collapse/expand transitions at 200ms ease-in-out; active nav item indicator slides/morphs between items rather than instantly jumping.
- **Modal:** Scale-in from 95% + fade, 200ms; backdrop fades in slightly faster (150ms) so the backdrop feels responsive even before the modal content settles.
- **Toast:** Slide-in from edge + fade, auto-dismiss items fade out; manual-dismiss items stay until interacted with.
- **AI Typing:** Token-by-token reveal for streaming responses (not a fake typewriter effect — actual SSE-driven reveal per API Contract Part G), with a subtle pulsing cursor indicator while waiting for the first token.
- **Charts:** Data entrance animation (bars grow, lines draw in) on first render only — never re-animates on every re-render/refetch, which would feel distracting on a page like Analytics that may auto-refresh.
- **Micro-interactions:** Button press (slight scale-down, 100ms), checkbox/toggle (spring-like snap, 150ms), streak/milestone celebration (a restrained, one-time confetti-adjacent burst — small, tasteful, never full-screen takeover, matching Part 1's "quiet pride" emotional target).

**Global rules:** All durations 100–300ms except deliberate exceptions noted above (skeleton shimmer, celebration moments). Easing: ease-out for entrances, ease-in for exits, ease-in-out for continuous/looping states. **Reduced motion:** every animation above must have a `prefers-reduced-motion` fallback that either removes the motion entirely or drastically shortens/simplifies it — this is a hard requirement, not optional polish (Part 10).

---

## PART 9 — Responsive Design

| Breakpoint | Sidebar | Grid behaviour | Notable changes |
|---|---|---|---|
| **Desktop (1440–1920px)** | Full persistent sidebar, expanded labels | Full multi-column grids (3–4 col) | Baseline design target |
| **Laptop (1024–1440px)** | Full sidebar, slightly narrower | Grids reduce one column (e.g., 4→3) | Split-panes (Problem Detail, Resume Editor) still side-by-side |
| **Tablet (640–1024px)** | Collapsible icon-rail sidebar (toggle to expand) | 2-column grids | Split-panes begin stacking (Problem Detail, Resume Editor); filter panels move to drawers |
| **Mobile (<640px)** | Slide-over drawer sidebar (hidden by default, hamburger trigger) | Single column throughout | Tab-based navigation replaces split-panes entirely (Problem Detail, AI Chat two-pane); tables restructure to card-lists; touch targets enforced at minimum 44px |
| **Ultra-wide (>1920px)** | Full sidebar | Grids cap at their laptop/desktop column count, content max-width constrains rather than stretching indefinitely | Prevents absurdly long line-lengths and sparse-feeling layouts |

**Touch interactions (mobile/tablet):** swipe-to-dismiss on Toasts and Drawers where natural; long-press for Tooltip-equivalent context on touch devices; no hover-dependent functionality anywhere (every hover-revealed action has a tap-accessible equivalent, e.g., card actions visible via a menu button on touch rather than only appearing on hover).

---

## PART 10 — Accessibility

- **Keyboard Navigation:** Every interactive element reachable via Tab in a logical order; Command Palette (`Cmd/Ctrl+K`) provides a fast keyboard-first path to any destination; no keyboard traps outside intentional focus-trapped Modals/Drawers (which correctly return focus on close).
- **Screen Reader:** Semantic HTML first (real `<button>`, `<nav>`, `<table>`, headings in logical hierarchy) before reaching for ARIA; live regions (`aria-live`) used specifically for: AI streaming responses (batched, per Part 5), notification count updates, form validation errors.
- **ARIA:** Applied only where semantic HTML is insufficient (custom components: Command Palette, Tabs, Accordion, Toggle Group) — never as a substitute for correct base markup.
- **Color Contrast:** All text meets WCAG AA minimum against the Rich Black/Dark Glass background system — Difficulty badges and status indicators specifically double-checked, since colored badges are the highest-risk pattern for contrast failure on a dark theme.
- **Focus Rings:** Always visible on keyboard focus (never `outline: none` without a replacement), accent-colored, sufficient contrast against dark surfaces.
- **Reduced Motion:** `prefers-reduced-motion` respected platform-wide per Part 8's closing rule — this is enforced as a global CSS-level rule, not a per-component opt-in, so no future component can accidentally skip it.

---

## PART 11 — Empty States

Consistent shape (icon/illustration + heading + supporting line + CTA where applicable) applied to every module's zero-data state, as specified per-page in Part 5. Full index for implementation reference:

| Module | Empty state trigger | Tone |
|---|---|---|
| Dashboard — Recent Activity | No activity yet | Encouraging, points to first action |
| DSA Problem List | Filters match nothing | Neutral, "Clear filters" CTA |
| Problem Detail — Submissions | No attempts yet | Neutral, "Give it a shot" |
| Resume list | No resumes | Encouraging, prominent "Build your first resume" |
| Projects list | No projects | Encouraging, direct to AI Generator |
| Interview Dashboard | No sessions yet | Explanatory (reduce anxiety about the format) |
| AI Mentor | No conversations | Encouraging, suggested starter prompts |
| Analytics | Insufficient data | Reassuring — "keep practicing," never looks broken |
| Bookmarks (per tab) | Nothing bookmarked | Neutral |
| Revision Queue | Nothing due | **Positive framing** (this is a good outcome — visually distinct from other empty states) |
| Notifications | None yet | Neutral |
| Contest Tracker | No linked accounts | Actionable — prompts Extension connection |

---

## PART 12 — Error States

Consistent shape (icon + heading + explanation in plain language + Retry action, never a raw error code shown to the user) applied platform-wide:

- **Full-page error** (route-level failure): used sparingly — only when the entire page genuinely cannot render (e.g., a 404 for an invalid problem slug, or a 500 from a critical single-resource page like Problem Detail).
- **Card/section-level error** (composite pages): Dashboard, Analytics — each card/section fails independently with its own small retry affordance, rather than one failure taking down the whole page (per Part 5's Dashboard spec).
- **Inline/field-level error**: form validation, submission failures — appears directly adjacent to the relevant input/action, never as a disruptive full-page interruption for a recoverable issue.
- **Toast error**: transient, non-blocking failures (e.g., a background sync hiccup) — manual-dismiss, per Part 6's Toast spec.
- **Specific mapped states:** `404` (Not Found — used for invalid slugs/IDs across Problem/Theory/Company/Thread detail pages), `403` (Access Denied — used if a Free-tier user hits a Pro-gated feature, shown with an upgrade CTA rather than a bare denial), `429` (Rate Limited — AI Mentor and Hint requests specifically, shown inline with quota info per Part 5), `503` (Service temporarily unavailable — used for AI Orchestrator/LLM provider outages specifically, phrased to reassure the user their data/progress is safe even if this one feature is briefly down).

---

## PART 13 — Loading States

- **Skeletons:** primary loading pattern for any page/section with predictable content shape (lists, cards, tables, gauges) — shape-matched per Part 6's Skeleton component spec. Used for: Dashboard cards, Problem List rows, Theory content, Resume Editor form, Analytics gauges/charts.
- **Spinners:** reserved for button-level in-flight actions (Submit, Save, Send) and short, unpredictable-shape operations — never used as the primary full-page loading pattern where a skeleton is feasible.
- **Progress (determinate/estimated):** used for async, multi-second AI operations with a known-ish duration (Roadmap generation, JD Analysis, Project Generation) — shown as a dedicated state screen with a message and either a real progress indicator (if the backend job reports progress) or an estimated-time framing, per Part 5's Onboarding/JD Analyzer specs.
- **Streaming UI:** AI Mentor chat responses render progressively via SSE (Part 8's "AI Typing" animation) — this is a loading state that is also the content arriving, deliberately visible rather than hidden.

---

## PART 14 — Frontend Folder Structure

*Mirrors the Architecture document's (Phase 2) established Modular Monolith folder structure exactly — this is not a new structure, it's the frontend-relevant subset of what Architecture §4 already specified, restated here for Lovable's direct reference.*

```
app/
├── (marketing)/
│   ├── page.tsx                 # Landing
│   ├── pricing/page.tsx
│   └── features/page.tsx
├── (auth)/
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── forgot-password/page.tsx
│   └── verify-email/page.tsx
├── onboarding/page.tsx
├── (dashboard)/
│   ├── layout.tsx                # Sidebar + Header shell
│   ├── dashboard/page.tsx
│   ├── dsa/
│   │   ├── page.tsx
│   │   ├── problems/page.tsx
│   │   ├── problems/[slug]/page.tsx
│   │   └── roadmap/page.tsx
│   ├── roadmap/page.tsx
│   ├── theory/
│   │   ├── page.tsx
│   │   └── [subjectSlug]/
│   │       ├── page.tsx
│   │       └── [topicSlug]/
│   │           ├── page.tsx
│   │           ├── flashcards/page.tsx
│   │           └── quiz/page.tsx
│   ├── resume/
│   │   ├── page.tsx
│   │   └── [resumeId]/
│   │       ├── page.tsx
│   │       ├── preview/page.tsx
│   │       └── jd-analyzer/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   ├── generate/page.tsx
│   │   └── [projectId]/page.tsx
│   ├── interview/
│   │   ├── page.tsx
│   │   └── sessions/[sessionId]/
│   │       ├── page.tsx
│   │       └── feedback/page.tsx
│   ├── mentor/
│   │   ├── page.tsx
│   │   └── [conversationId]/page.tsx
│   ├── analytics/
│   │   ├── page.tsx
│   │   └── timeline/page.tsx
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contests/page.tsx
│   ├── community/
│   │   ├── page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── study-rooms/page.tsx
│   │   ├── study-rooms/[roomId]/page.tsx
│   │   └── threads/
│   │       ├── page.tsx
│   │       └── [threadId]/page.tsx
│   ├── bookmarks/page.tsx
│   ├── revision/page.tsx
│   ├── notifications/page.tsx
│   ├── profile/page.tsx
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── preferences/page.tsx
│   │   └── subscription/page.tsx
│   └── admin/                    # future, structurally reserved only
├── layout.tsx
└── globals.css

components/
├── ui/                            # shadcn primitives
├── shared/                        # Header, Sidebar, Footer, CommandPalette, etc.
└── [feature]/                     # feature-specific components, mirrors modules/ boundary from Architecture §2

hooks/
lib/
providers/
styles/
```

This structure is a direct application of Architecture §4 — no new folders invented, no existing ones renamed.

---

## PART 15 — Lovable Implementation Guide

**Hard rules — do not deviate:**

- Do **NOT** redesign navigation. The Information Architecture in Part 4 is final.
- Do **NOT** invent pages beyond the list in Part 4/5.
- Do **NOT** rename routes.
- Do **NOT** modify the design system (Part 7) — colors, typography, spacing, radius are fixed.
- Do **NOT** introduce new UI libraries beyond those named below.
- Do **NOT** invent new API endpoints or data shapes — every page's data needs map to the frozen API Contract (Phase 2.5); if a page's spec implies data not covered by the API Contract, flag it rather than inventing a new endpoint.
- Do **NOT** skip empty/error/loading states — every page's spec includes them explicitly; implement all three, not just the "happy path."
- **Generate reusable components only** — every component in Part 6 should be built once and reused across every page that needs it, never re-implemented per-page.

**Required stack:**
- Next.js **App Router** (matching Architecture §1/§4 exactly).
- **TypeScript** throughout.
- **Tailwind CSS v4**.
- **shadcn/ui** as the component primitive base (Button, Card, Dialog, Dropdown, Accordion, Tabs, etc. — built on top of, not replaced).
- **Framer Motion** for all animation per Part 8.
- **Lucide Icons** exclusively per Part 7.
- **Recharts** for all charts per Part 6.

**Follow this PRD exactly.** Where any ambiguity remains after reading this document, the correct response is to flag the ambiguity for human review — not to improvise a design decision that isn't documented here.

---

## PART 16 — Implementation Phases

```
Phase 1 — Foundation
   Design system tokens, shared components (Button, Card, Sidebar, Header,
   Command Palette, Skeleton, Toast, Empty/Error State), app shell layout.
        │
        ▼
Phase 2 — Landing & Marketing
   Landing, Pricing, Features.
        │
        ▼
Phase 3 — Authentication & Onboarding
   Sign In, Sign Up, Forgot Password, Verify Email, Onboarding wizard.
        │
        ▼
Phase 4 — Dashboard
   Dashboard page + all its widget components (HireScore gauge, Streak
   heatmap, Task cards, Activity feed) — this phase produces several
   components (gauge, heatmap) that later phases (Analytics, Company Mode)
   reuse, so it's sequenced early deliberately.
        │
        ▼
Phase 5 — DSA
   Topic browse, Problem List (with filters), Problem Detail (editor +
   hints), Bookmarks (Problems tab), Revision Queue (Problems half).
        │
        ▼
Phase 6 — Theory
   Subject list, Subject Detail, Topic Reader, Flashcards, Quiz,
   Bookmarks (Theory tab), Revision Queue (Flashcards half).
        │
        ▼
Phase 7 — Resume
   Resume list, Editor, Preview, JD Analyzer.
        │
        ▼
Phase 8 — Projects
   Projects list, AI Generator, Project Detail, Bookmarks (Projects tab).
        │
        ▼
Phase 9 — Interview
   Interview Dashboard, live Session (text mode first, voice mode second
   within this phase), Feedback/Replay.
        │
        ▼
Phase 10 — AI Chat (Mentor)
   Conversation list, streaming thread interface.
        │
        ▼
Phase 11 — Analytics
   HireScore detail, Insights, Weak/Strong topics, Timeline — reuses
   Phase 4's gauge/chart components.
        │
        ▼
Phase 12 — Companies & Roadmap
   Companies list, Company Detail (full Company Mode), full Roadmap
   timeline (reuses Timeline component pattern established for Learning
   Timeline in Phase 11).
        │
        ▼
Phase 13 — Community & Contests
   Threads, Study Rooms, Leaderboard, Contest Tracker — sequenced last
   among feature modules since these are Group B backend priorities
   (Freeze Report Section 12) and least blocking for a usable core product.
        │
        ▼
Phase 14 — Settings, Profile, Notifications
   Rounds out the account-management surface.
```

**Admin Console is explicitly excluded from this phase sequence** per Part 5's note — structurally reserved in the route tree, not scheduled for initial implementation.

---

---

## PART 17 — Atomic Design Architecture

HireForge's component library (Part 6) is organized using Atomic Design, giving every component an unambiguous "home layer" and a clear rule for what it's allowed to depend on.

**Atoms** — the smallest indivisible UI pieces. Cannot be broken down further without losing meaning. Examples from Part 6: Button, Badge, Avatar, Tooltip, Icon wrapper, Input, Skeleton (a single shape), Progress Bar (linear or radial primitive).

**Molecules** — small groups of atoms combined to do one specific job. Examples: Stat Card (Icon + label + value + trend Badge), Search Input (Input + Icon + clear Button), Difficulty Badge (Badge atom + semantic color mapping), Topic Card (Card atom + Progress atom + text), Toast (Icon + text + dismiss Button).

**Organisms** — self-contained sections built from molecules (and atoms directly where a molecule would be overkill). Examples: Sidebar (nav items + Avatar + user menu), Header, Command Palette, Problem List Table (Table atom + Difficulty Badge molecules + Pagination), HireScore Widget (radial Progress atom + Stat Card molecules for sub-scores), AI Message Bubble thread (repeated Message Bubble molecules + streaming indicator).

**Templates** — page-level layout skeletons with organisms placed in position, but no real data — the *shape* of a page. Examples: the Dashboard Template (grid arrangement of HireScore Widget slot, Today's Tasks slot, Activity Feed slot), the Split-Pane Working Template (used by both Problem Detail and, with different organisms filled in, could theoretically serve any future split-view feature), the Two-Pane List/Detail Template (used by AI Mentor's conversation list + thread, and structurally reusable for any future list/detail need).

**Pages** — templates filled with real, live data — this is the `app/**/page.tsx` layer from Part 14's folder structure. A Page owns data-fetching and passes real props down into its Template's organism slots; Pages contain no bespoke UI markup of their own beyond composition.

**Component ownership:** each component lives in exactly one layer folder (`components/ui/` for atoms/molecules matching shadcn primitives, `components/shared/` for cross-feature organisms like Sidebar/Header/Command Palette, `components/[feature]/` for feature-specific organisms like HireScore Widget or Problem List Table, per Part 14's structure).

**Dependency direction (strict, one-way):** Atoms → Molecules → Organisms → Templates → Pages. A component may only import from its own layer or layers below it. An Atom never imports a Molecule. A Molecule never imports an Organism. This is what prevents the classic "everything imports everything" tangle as the component count grows toward the 1,000+-page scale referenced in Part 26.

**Reuse strategy:** before building any new UI, the correct question order is: (1) does an existing Atom/Molecule/Organism already cover this? (2) can an existing one be extended with a new *variant* (Part 24) rather than a new component? (3) only if neither applies, create a new component at the correct layer. This ordering is the enforcement mechanism behind Part 18's reusability rules.

---

## PART 18 — Maximum Component Reusability Strategy

**Core rule: never duplicate UI. If two screens share 80%+ of their visual/structural pattern, they use the same component with different data/props — not two separate implementations.**

**Concrete cross-module reuse map:**

| Shared Organism/Molecule | Used identically (different data only) in |
|---|---|
| Stat/Score Gauge (radial Progress) | Dashboard (HireScore Widget), Analytics (HireScore hero + sub-scores), Company Detail (Company Readiness Score), Interview Feedback (multi-metric score display) |
| Card Grid with Progress indicator | DSA Topic Browse, Theory Subject List, Company List, Contest list |
| Filterable/Sortable Table-to-Card-list | DSA Problem List, Contest History, Admin tables (future) — same component, different column/filter configuration |
| Timeline component | Roadmap (future-facing status items) and Learning Timeline (past-facing event log) — one base Timeline organism, two different item-renderer props, per Part 6's explicit note |
| Two-Pane List/Detail Template | AI Mentor (conversation list ↔ thread) and, structurally, could serve a future feature needing the same shape without rebuilding it |
| Empty State / Error State / Loading Skeleton | Every single page in Part 5 — one shared component each, parameterized by icon/heading/message/CTA, never rebuilt per-page |
| Bookmark Toggle | Problem Detail, Theory Topic Reader, Project Detail — one molecule, three different target-entity props |
| Revision-due List Item | Revision Queue page, Dashboard's "Upcoming Revision" preview — same molecule, `compact` size variant (Part 24) for the Dashboard context |
| Split-Pane Working Template | Problem Detail (Description/Editor) and Resume Editor (Form/Preview) both use the same Template organism with different content slots |

**Composition over duplication, worked example:** the Dashboard's "Today's Tasks" card, the Roadmap's node list, and the Revision Queue list all display "a list of actionable items with a status and a click-through." Rather than three bespoke lists, all three compose the same underlying **Actionable List Item** molecule, differing only in which status enum drives the icon and which route the click-through targets — this is passed as props, not re-implemented.

**Small components over giant components:** any organism exceeding roughly 150–200 lines of composition logic is a signal it should be decomposed further — e.g., the Company Detail page's tabbed sections (Roadmap tab, Questions tab, OA Pattern tab, etc.) are each their own small organism dropped into a shared Tab Group template, not one monolithic "CompanyDetailContent" component.

**Shared variants instead of separate implementations:** Difficulty Badge, Status Badge, and Notification-type Badge are not three components — they are the one Badge atom (Part 6) with different `variant`/`tone` props mapping to the same semantic color system (Part 7).

---

## PART 19 — Frontend Engineering Principles

- **SOLID, applied to components:** Single Responsibility (a Stat Card displays a stat — it does not fetch its own data or own business logic); Open/Closed (new Badge tones are added via the variant system, Part 24, never by forking the Badge component); Liskov-equivalent (any component implementing the shared "list item" contract can be dropped into the Actionable List Item slot from Part 18 interchangeably); Interface Segregation (component props are scoped to what that component actually needs — a Table doesn't receive a full API response object, it receives the exact row-shape it renders); Dependency Inversion (Pages depend on Organism interfaces, not on how an Organism internally fetches or formats data).
- **Composition over inheritance:** no component class hierarchies; shared behavior is achieved through composition (wrapping, slotting children, shared hooks) — matching React's own idioms and Part 17's Atomic layering.
- **Feature-first architecture:** mirrors Architecture §2's module boundaries exactly — `components/[feature]/` folders own their feature's organisms, never reaching into another feature's folder directly (a DSA organism never imports directly from `components/resume/`; if cross-feature reuse is needed, the shared piece belongs in `components/shared/` or `components/ui/`, per Part 17).
- **Reusable hooks:** data-fetching and derived-state logic lives in hooks (`hooks/`), never duplicated inline across pages — e.g., a `useHireScore()` hook is called identically by both the Dashboard and Analytics pages rather than each page writing its own fetch logic.
- **Reusable layouts:** the `(dashboard)` route group's `layout.tsx` (Part 14) is the single source of the Sidebar+Header shell — no page reimplements its own shell.
- **Reusable providers:** theme, auth-session mirror, and query-client providers live once at the root (`providers/`, per Part 14) and wrap the whole app — never re-instantiated per page.
- **Absolute imports:** all cross-folder imports use absolute paths (`@/components/...`, `@/hooks/...`) rather than relative `../../../` chains, matching standard Next.js/TypeScript project convention and keeping the Atomic dependency direction (Part 17) easy to audit.
- **Strict TypeScript:** no `any`, no implicit loose typing on component props — every component's prop shape is an explicit, exported interface/type, since this is what makes the "small reusable components" strategy (Part 18) safe to compose at scale.
- **No anonymous components:** every component is a named, exported function/const — never an inline anonymous function passed as a prop where a named, reusable component should exist instead (this is a direct enforcement mechanism for Part 18's "never duplicate UI" rule — anonymous inline components are where duplication hides).
- **Consistent naming conventions:** PascalCase component names matching their file name exactly (`StatCard.tsx` exports `StatCard`), hooks prefixed `use` (`useHireScore`), boolean props prefixed `is`/`has` (matching the DDD's own column-naming convention, Phase 3A §8 — deliberate consistency between frontend and backend naming philosophy).
- **Folder ownership:** every folder under `components/[feature]/` is "owned" conceptually by the module it mirrors (Architecture §2) — a change to DSA's UI never requires touching files inside `components/resume/`.
- **Code organization / maintainability / scalability:** the combination of Atomic layering (Part 17), strict feature-folder boundaries, and the reusability rules above is what makes Part 26's 1,000+-page, 100+-engineer scalability target achievable without a frontend-wide rewrite.

---

## PART 20 — State Management Philosophy

*Architecture only — no implementation, no library selection beyond what's already implied by the frozen stack.*

- **Server State:** any data originating from the API Contract (Phase 2.5) — Problems, Roadmap, HireScore, Conversations, etc. Owned by a data-fetching/caching layer (a React Query-style pattern is implied by "Reusable hooks" in Part 19, though the specific library is an implementation detail outside this spec's scope) — never duplicated into ad-hoc local component state once fetched.
- **Client State:** ephemeral, UI-only state that has no server counterpart — e.g., "is the filter drawer open," "which tab is active" — lives in local component state or a lightweight shared client-state mechanism, never conflated with Server State.
- **URL State:** anything that should survive a refresh or be shareable via link — filters on the DSA Problem List, the active tab on Company Detail, the current step in a paginated view — lives in the URL (query params/path segments), not in memory-only state, so a shared/bookmarked link reproduces the exact view.
- **Theme State:** dark/light preference (Part 7) — persisted (server-side via `UserSettings`/`NotificationPreference`-adjacent pattern per the Prisma schema, or a client-side fallback for unauthenticated marketing pages) and provided via the root Theme Provider (Part 19).
- **Session State:** mirrors the authenticated user's identity/role, sourced from Clerk (Architecture §6) — read-only from the frontend's perspective, never locally mutated.
- **Modal State / Drawer State:** owned by the specific Organism that triggers them (a Modal's open/closed state lives with the component managing it, not lifted to a global store) unless multiple unrelated triggers need to open the same Modal instance, in which case it's lifted only as far as their nearest common Template.
- **Form State:** owned locally per form (Resume Editor, Onboarding wizard, Settings forms), with the specific exception of Onboarding, whose multi-step answers persist across steps within that flow's own scoped state, discarded on flow completion (submitted to the server, not kept client-side afterward).
- **Optimistic Updates:** applied specifically to low-risk, high-frequency interactions — Bookmark toggle, marking a Roadmap node/Milestone complete, Notification "mark as read." Applied *only* where a failed request rolling back is low-stakes and clearly recoverable; **never** applied to Submission creation, Resume Version save, or Interview answer submission — these wait for real server confirmation given their downstream importance to Analytics/HireScore integrity (matching the backend's own Submission-integrity stance, DDD §7).
- **Caching Strategy (frontend-level):** Server State is cached client-side with the same TTL philosophy as the backend's Redis mapping (DDD §14) — e.g., the Problem catalog list is cached client-side roughly as long as it's cached server-side, since re-fetching more aggressively than the backend's own freshness guarantee is wasted work.
- **Data Synchronization:** cache invalidation follows the same event-driven-preferred-over-TTL-alone philosophy as DDD §14 — e.g., submitting a problem invalidates the local Dashboard/HireScore cache immediately rather than waiting for a TTL to lapse, so the UI never shows visibly stale state right after a user's own action.
- **Error Recovery:** every Server State fetch has a defined retry affordance (Part 12) — silent infinite-retry loops and silent permanent failures are both explicitly disallowed; failures are always visible and actionable.
- **Loading Strategy:** governed by Part 13 — skeleton-first for predictable-shape content, spinner for button-level actions, progress-state for long-running async jobs.
- **Streaming State:** AI Mentor responses (Part 5/8/13) are a distinct state category — neither fully "loading" nor fully "loaded," but progressively arriving; the UI must represent this third state explicitly (a partial-content-plus-typing-indicator state) rather than forcing it into a binary loading/loaded model.

---

## PART 21 — Design Token System

**Hierarchy:** raw values → semantic tokens → component tokens. Raw values (e.g., a specific blue hex) are never referenced directly in component code — components consume semantic tokens (e.g., `color-primary`), and semantic tokens reference raw values, so a future rebrand or theme change touches one mapping layer, not every component.

**Color Tokens:** `color-background`, `color-surface`, `color-surface-glass`, `color-border`, `color-primary`, `color-primary-foreground`, `color-accent`, `color-success`, `color-warning`, `color-error`, `color-info`, `color-difficulty-easy`, `color-difficulty-medium`, `color-difficulty-hard`, `color-text-primary`, `color-text-secondary`, `color-text-muted`.

**Typography Tokens:** `font-family-sans` (Geist), `font-family-mono` (Geist Mono), `font-size-{xs,sm,base,lg,xl,2xl,3xl,4xl}`, `font-weight-{regular,medium,semibold,bold}`, `line-height-{tight,normal,relaxed}`.

**Spacing Tokens:** `space-{0,1,2,3,4,6,8,12,16,24,32}` on the 4px base unit (Part 7).

**Radius Tokens:** `radius-sm` (inputs/small controls), `radius-md` (buttons), `radius-lg` (cards), `radius-xl` (modals), `radius-full` (avatars/pills).

**Border Tokens:** `border-width-thin`, `border-width-default`, `border-color-default`, `border-color-glass` (the subtle light-opacity border used on Dark Glass surfaces, Part 7).

**Shadow Tokens:** `shadow-sm`, `shadow-md`, `shadow-lg` — deliberately minimal/rarely used per Part 7's "shadows are minimal" rule; primarily reserved for Modal/Drawer elevation, not general card styling.

**Opacity Tokens:** `opacity-disabled`, `opacity-glass-surface`, `opacity-hover-overlay`.

**Animation/Transition Tokens:** `duration-fast` (100ms), `duration-base` (200ms), `duration-slow` (300ms), `easing-out`, `easing-in`, `easing-in-out` — directly backing Part 8's animation rules, so every component's motion pulls from this shared set rather than hardcoding ad-hoc durations.

**Breakpoint Tokens:** `breakpoint-mobile` (640px), `breakpoint-tablet` (1024px), `breakpoint-laptop` (1440px), `breakpoint-desktop` (1920px) — matching Part 9 exactly.

**Container Tokens:** `container-reading` (Theory Topic Reader / Resume Preview max-width), `container-app` (standard dashboard content max-width), `container-wide` (ultra-wide cap, Part 9).

**Layer (z-index) Tokens:** `z-base` (0), `z-sticky-header` (10), `z-sidebar-drawer` (20), `z-dropdown` (30), `z-command-palette` (40), `z-modal-backdrop` (50), `z-modal` (51), `z-toast` (60) — a single authoritative stacking order, preventing the common bug pattern of ad-hoc z-index values fighting each other as new overlay components get added over time.

**Naming convention:** `{category}-{concept}-{variant?}`, all-lowercase, hyphen-separated — consistent with Tailwind's own token-naming idiom, so tokens map cleanly onto Tailwind v4's theme configuration without a translation layer.

---

## PART 22 — Performance Architecture

- **Code Splitting:** route-level splitting is automatic via App Router (Part 14's structure); additionally, heavy Organisms not needed on initial paint (Code Editor on Problem Detail, Chart library on Analytics, Voice Recorder on Interview Session) are dynamically imported so their weight isn't in the shared bundle for pages that don't use them.
- **Dynamic Imports:** applied specifically to the Code Editor, Charts, Markdown Renderer (syntax-highlighting adds real weight), and the Command Palette (loaded on first `Cmd/Ctrl+K` invocation rather than on every page load).
- **Lazy Loading:** below-the-fold marketing content (Features page sections), avatar images, and card illustrations load lazily; above-the-fold content (Dashboard's primary widgets, Hero) never lazy-loads, since that would visibly delay the perceived "answer what do I do today" moment central to Part 1's vision.
- **Image Optimization:** Next.js Image component throughout, with explicit width/height (or fill + aspect-ratio container) to prevent layout shift — relevant especially for Avatar, Company logos, and any future illustration assets.
- **Streaming UI:** covered in depth in Part 13/20 — Next.js Server Component streaming is used for composite pages like Dashboard, so fast-resolving sections (e.g., static Roadmap summary) render before slower ones (e.g., a fresh Analytics computation), rather than the whole page waiting on the slowest data source.
- **Route Prefetching:** Next.js Link prefetching enabled by default for primary navigation (Sidebar items); Command Palette results are *not* aggressively prefetched on every keystroke (would be wasteful), only on hover/selection intent.
- **Bundle Size Strategy:** shared UI (Part 6 Atoms/Molecules) intentionally kept dependency-light; heavy third-party dependencies (Code Editor, Charting library, Markdown parser) are isolated to the specific Organisms that need them (per Dynamic Imports above) rather than imported at the root layout.
- **Skeleton Strategy:** as specified fully in Part 13 — shape-matched skeletons, not generic placeholders, minimizing perceived-loading-time complaints even when actual network latency is unavoidable.
- **Virtualization:** applied to any list that can realistically grow large and unbounded — Problem List (if not paginated tightly), Notification history, Learning Timeline, AI Mentor's long conversation threads — windowed rendering so DOM node count stays bounded regardless of history length.
- **Infinite Scrolling:** used specifically where "Load more" cursor pagination (API Contract Part A.3) naturally maps to continuous scroll — Notifications, Learning Timeline, Contest History; **not** used for Problem List or Company List, where a more deliberate "Load more" button click is preferred so users retain a sense of position/control while filtering (a UX choice, not just a technical one — ties to Part 23's Recognition/Control principles).
- **Caching Philosophy:** frontend cache freshness mirrors backend cache freshness (Part 20) — the frontend is not a second, independently-tuned cache layer with its own conflicting TTL philosophy.
- **Memoization Guidelines:** applied deliberately, not reflexively — expensive derived computations (e.g., client-side chart data transforms) are memoized; simple prop-drilling components are not wrapped in memoization by default, since over-memoization adds its own overhead and complexity without benefit at this component scale.
- **Rendering Strategy:** Server Components by default (matching Architecture §1's stated frontend approach exactly); Client Components only where interactivity genuinely requires it (forms, the Code Editor, streaming chat, any component using hooks/state) — this is a restatement, at the frontend-performance level, of a decision already made in the frozen Architecture, not a new one.
- **Core Web Vitals Goals:** LCP target <2.5s on the Dashboard and Landing (the two highest-traffic entry points), INP target <200ms across all interactive controls, CLS target near-zero (enforced by the Image Optimization and skeleton-shape-matching rules above, which are the two most common CLS sources in practice).

---

## PART 23 — UX Principles

Applying Jakob Nielsen's heuristics explicitly to HireForge:

- **Visibility of system status:** every async action has a corresponding state (Part 13/20) — the user is never left wondering if something happened (Roadmap generation's dedicated progress screen, streaming AI responses, Submit button's own loading state).
- **Match between system and the real world:** plain-language error messages (Part 12) instead of raw API error codes; HireScore and Difficulty labels use familiar, self-explanatory language rather than internal jargon.
- **User control and freedom:** destructive actions (Delete Account, Roadmap Regeneration, ending an Interview Session early) require explicit confirmation, never a single accidental click; Modals close on Escape (except destructive-confirmation ones, Part 6) so users can always back out of a non-critical action.
- **Consistency and standards:** the Atomic Design system (Part 17) and Component API Standards (Part 24) exist specifically to guarantee this — a Badge means the same thing everywhere, a primary Button always looks and behaves the same way.
- **Error prevention:** form validation is inline and immediate (Part 12) rather than only surfacing on submit; the Onboarding wizard's step-by-step structure (Part 5) prevents the overwhelm that a single giant form would invite, reducing input errors from cognitive overload.
- **Recognition over recall:** the Command Palette (Part 6) and persistent Sidebar mean users never need to remember a URL or navigation path — everything discoverable is visible or searchable; Recent Activity and Recent Conversations surfaces let users recognize where they left off rather than recalling it.
- **Flexibility and efficiency of use:** keyboard shortcuts (Part 5's per-page shortcuts, Part 10) serve power users without cluttering the interface for casual users — this is progressive disclosure applied to interaction method, not just content.
- **Aesthetic and minimalist design:** directly Part 1's "premium through restraint" philosophy — every section on every page in Part 5 exists because it helps the user act, not because it fills space.
- **Help users recognize, diagnose, and recover from errors:** Part 12's consistent error-state shape (plain language + Retry) applied everywhere, specifically designed so an error is never a dead end.
- **Help and documentation:** the AI Mentor itself doubles as in-context help (a student confused about a feature can ask the Mentor) — reducing the need for a separate, often-ignored traditional help center, consistent with the "AI-first experience" design philosophy stated in the original brief.

**Progressive disclosure, worked example:** DSA Hints (Part 5) reveal one level at a time rather than dumping a full solution — this is simultaneously a UX principle (minimal cognitive load, forgiveness for not immediately knowing the answer) and a product mechanic (Architecture §7.2's progressive hint design) — the two are the same decision viewed from two disciplines.

**Feedback loops:** every user action (submit, bookmark, save, complete a milestone) has an immediate, visible acknowledgment (Toast, inline state change, or optimistic update per Part 20) — the platform never leaves an action feeling like it disappeared into the void.

**Forgiveness:** soft-delete-by-default on the backend (DDD §9) is mirrored on the frontend by never presenting a delete/archive action as instant-and-final in the UI without a confirmation step, and where feasible (e.g., Notification "mark as read") actions are trivially reversible.

**Accessibility-first / Responsive-first UX:** not treated as a final QA pass but as inputs to every page spec in Part 5 from the start (each page's spec includes both Accessibility and Responsive Behaviour as first-class fields, not an afterthought section) — this section's principles were, in effect, already baked into Version 1's page specs; Part 23 makes the underlying rationale explicit.

---

## PART 24 — Component API Standards

Every reusable component in the Part 6 library follows the same prop/behavior contract shape:

- **Variants:** exposed via a single `variant` prop with a fixed, documented enum of allowed values (e.g., Button's `variant: "primary" | "secondary" | "ghost" | "destructive" | "link"`) — never multiple boolean flags (`isPrimary`, `isDestructive`) that could combine into invalid/contradictory states.
- **Sizes:** exposed via a single `size` prop (`"sm" | "md" | "lg"`, plus `"icon"` where applicable) — consistent scale names reused across every sized component (Button, Avatar, Badge), so `size="sm"` means the same relative scale everywhere.
- **States:** every interactive component supports, at minimum, default / hover / focus / active / disabled — implemented via consistent state-styling patterns tied to the Design Tokens (Part 21), never bespoke per-component state colors.
- **Loading:** components that trigger async actions (Button, Card actions) expose an `isLoading` prop that swaps content for a spinner and disables interaction — a single consistent pattern rather than each usage site building its own ad-hoc loading swap.
- **Disabled:** a single `disabled` prop, visually distinct per Part 6's Button spec (not just opacity), consistently disables both pointer and keyboard interaction together (never one without the other).
- **Error / Success:** form-adjacent components (Input, Select, Textarea) expose `error` (string message, triggers error styling + `aria-invalid` + `aria-describedby` linking to the message) and, where relevant, a `success` state (e.g., a validated field) — following the same visual language as Toast's error/success variants (Part 6) for platform-wide consistency.
- **Icons:** components accepting an icon do so via an explicit `icon` prop accepting a Lucide icon component reference — never a raw string name requiring internal lookup, and never hardcoded inline SVGs bypassing the icon system (Part 7).
- **Accessibility:** every interactive component ships with sensible default ARIA behavior out of the box (a custom Dropdown is already keyboard-operable and correctly labeled without the consuming page needing to remember to add anything) — accessibility is a component-contract guarantee, not a per-usage opt-in.
- **Composition:** components favor a `children`-based slot pattern for flexible content (Card accepts arbitrary children rather than rigid `title`/`body`/`footer` string props only) while still providing structured sub-components (`Card.Header`, `Card.Body`, `Card.Footer`) for the common case — giving both flexibility and consistency depending on the need.
- **Props naming:** consistent verbs/nouns across the whole library — `on{Event}` for callbacks (`onClick`, `onSubmit`, `onDismiss`), `is{State}`/`has{State}` for booleans (matching Part 19's naming convention), never inconsistent synonyms (`handleClick` vs. `onClick` used interchangeably across different components).
- **Children:** any component that can reasonably wrap arbitrary content accepts `children` rather than forcing all content through named props — this is what keeps Atoms/Molecules (Part 17) genuinely reusable across contexts the original author didn't anticipate.

---

## PART 25 — Design Decision Records

**Decision: Dark Theme (default and V1-only, per Part 7's note)**
- Reason: matches the "premium SaaS" brief and the Notion/Linear/Stripe Dashboard/Cursor reference points, all of which are dark-first or dark-native products; reduces eye strain for late-night study sessions, a genuinely common usage pattern for this audience.
- Alternatives considered: Light-first with dark toggle; theme-neutral (auto-detect only).
- Why rejected: Light-first would undercut the "premium, focused, AI-native" positioning the brief explicitly asked for; auto-detect-only removes deliberate brand identity and complicates the design system's primary reference (Dark Glass surfaces don't have an obvious light-mode equivalent without a full parallel token set, which wasn't in scope for V1).
- Final decision: Dark-first, single theme for V1; light theme explicitly deferred (Part 7), not abandoned.

**Decision: Persistent Sidebar Navigation**
- Reason: HireForge has many top-level modules (DSA, Theory, Resume, Projects, Interview, Mentor, Analytics, Companies, Community) — a persistent Sidebar keeps all of them one click away, matching Linear/Notion's proven pattern for multi-module productivity tools.
- Alternatives considered: Top navigation bar with dropdowns; bottom tab bar (mobile-app-style).
- Why rejected: Top nav with dropdowns would either overcrowd the header or hide modules behind extra clicks, working against Recognition-over-Recall (Part 23); bottom tab bar doesn't scale to this many top-level sections and isn't a desktop-native pattern, and this is a desktop-primary product (dashboard/coding work) even though it must remain responsive.
- Final decision: Persistent Sidebar (desktop/laptop), collapsible rail (tablet), slide-over drawer (mobile) — per Part 9.

**Decision: Dashboard as Composite Grid (not a single-purpose landing view)**
- Reason: Part 1's vision requires answering "what do I do today" in seconds — a composite, information-dense-but-organized grid (HireScore, Streak, Tasks, Revision, Activity) achieves this in one view better than a single-purpose screen would.
- Alternatives considered: A minimal "just today's tasks" single-focus dashboard; a fully customizable widget dashboard.
- Why rejected: Minimal single-focus would hide genuinely useful at-a-glance context (HireScore trend, streak) that the target personas (Part 2) care about daily; fully customizable widgets add real engineering/design complexity not justified for V1 and risk an inconsistent, un-opinionated first impression that undercuts "premium through restraint."
- Final decision: Fixed composite grid for V1, with customizable arrangement explicitly flagged as a Part 5 future enhancement, not built now.

**Decision: Command Palette as primary power-user navigation**
- Reason: matches the Linear/Vercel/Cursor reference points directly; serves Part 23's "flexibility and efficiency of use" heuristic without adding visual clutter for casual users who never touch it.
- Alternatives considered: A persistent global search bar in the header instead.
- Why rejected: A persistent search bar takes permanent header real estate for a feature most sessions won't use every visit, and doesn't scale well to also housing quick actions (not just navigation) the way a Command Palette naturally does.
- Final decision: `Cmd/Ctrl+K` Command Palette (Part 6), header keeps only a small search trigger icon as a discoverability affordance for users who don't know the shortcut yet.

**Decision: Glassmorphism used selectively, not globally**
- Reason: the brief calls for "Glassmorphism where appropriate" specifically, not wall-to-wall — applied to Cards/surfaces sitting on the Rich Black background to create depth, not to every single UI element (which would reduce legibility and feel dated/overused rather than premium).
- Alternatives considered: Full glassmorphism (every surface, including nav and inputs); no glassmorphism, flat dark surfaces only.
- Why rejected: Full glassmorphism hurts text contrast/legibility at scale and reads as trend-chasing rather than restrained; zero glassmorphism loses the depth cue that helps differentiate layered surfaces (Card-on-background, Modal-on-Card) in a predominantly dark, low-contrast palette.
- Final decision: Dark Glass applied to Cards and elevated surfaces (Part 7) specifically; Sidebar, Header, and base page background remain flat/solid for legibility and performance (backdrop-blur is not free, and shouldn't be applied to large, constantly-visible chrome elements).

**Decision: Restrained, functional animation (Part 8) over decorative motion**
- Reason: matches "Animation-rich but subtle" from the brief and Part 1's "never flashy" philosophy — motion should clarify state changes, not perform for attention.
- Alternatives considered: Heavier, more playful motion (larger celebratory moments, more elaborate page transitions) to differentiate from "boring" ed-tech competitors (PRD §6).
- Why rejected: Heavier motion risks undercutting the "calm competence" emotional target (Part 1) — an anxious user doesn't want a flashy interface, they want a trustworthy one; competitors' visual dullness (PRD §6's competitive analysis) is a UI-polish gap, not a motion-intensity gap, and the two shouldn't be conflated.
- Final decision: Motion durations capped at 100–300ms for nearly everything (Part 8), with celebratory moments deliberately restrained rather than maximized.

**Decision: Feature-first, Atomic-layered component architecture (Parts 17–19)**
- Reason: needs to remain maintainable at the 1,000+-page / 100+-engineer scale explicitly targeted in Part 26, not just at initial-Lovable-build scale.
- Alternatives considered: A flatter, page-first component organization (components live next to the page that first needed them, refactored into shared locations only when reuse is later discovered).
- Why rejected: Page-first organization is faster for a first draft but reliably produces duplicate UI at scale (Part 18's core concern) — refactoring shared components out *after* duplication has spread is significantly more expensive than establishing the layered/feature-first structure from the start, especially once many engineers are working in parallel.
- Final decision: Atomic layering + feature-first folders (Part 17/19) from the first Lovable implementation phase (Part 16's Phase 1 — Foundation), not retrofitted later.

**Decision: Mobile responsive, not mobile-first**
- Reason: the core work surfaces (Problem Detail's code editor, Resume Editor, Interview Session) are genuinely desktop-native tasks; the target personas (Part 2) primarily study at a desk, not exclusively on a phone.
- Alternatives considered: True mobile-first design (design for phone, scale up).
- Why rejected: Mobile-first would force awkward compromises on the desktop-native working surfaces (split-panes, code editing) to satisfy a constraint (phone screen) that isn't the primary use context for those specific screens; Part 9's approach — full-featured desktop/laptop experience, thoughtfully adapted (not degraded) responsive behavior down to mobile — better serves the actual usage pattern while still ensuring mobile isn't neglected (Dashboard, Revision Queue, Notifications, and browsing screens all remain fully functional and pleasant on mobile).
- Final decision: Desktop-primary design target, with every page in Part 5 carrying an explicit, considered (not an afterthought) Responsive Behaviour spec down to mobile.

---

## PART 26 — Scalability Strategy

**Assumptions per the review brief: 1 million users, 1,000+ pages, 100+ engineers, future Enterprise features.**

- **Modularity:** the Feature-first folder structure (Part 19) mirroring Architecture §2's module boundaries means a 1,000-page frontend is still organized as a bounded number of feature modules (DSA, Theory, Resume, Interview, etc.) rather than 1,000 undifferentiated page files — new pages are added *within* an existing module's folder, extending a known boundary rather than creating a new unbounded surface.
- **Code Ownership:** each `components/[feature]/` folder and its corresponding `app/(dashboard)/[feature]/` route folder is ownable by a specific team/engineer group, mapping cleanly to the same module boundaries the backend Architecture already established (Architecture §2) — frontend and backend team ownership can mirror each other 1:1 by module.
- **Feature Isolation:** per Part 19's dependency rule, a change within one feature's components cannot break another feature's UI, since features never import each other's internals directly — only through `components/shared/`/`components/ui/`, which are the two places requiring the highest review scrutiny precisely because they're the shared surface every feature depends on.
- **Component Isolation:** the Atomic layering (Part 17) means a change to an Atom (e.g., Button) is a deliberate, carefully-reviewed, platform-wide change (by design — Buttons should be globally consistent), while a change to a feature-specific Organism (e.g., HireScore Widget's internal layout) is isolated to that Organism's consumers only.
- **Design System Governance:** the Design Token system (Part 21) and Component API Standards (Part 24) are the enforcement mechanism — at 100+ engineers, "does this look right" can't be a matter of individual taste; it's a matter of "does this correctly consume the existing tokens/variants," which is reviewable and, over time, lintable/automatable.
- **Versioning:** the component library (Part 6/17) is treated as an internal, versioned package conceptually — breaking changes to a shared Atom/Molecule's API follow the same "never break existing consumers silently" discipline the API Contract (Phase 2.5) already applies to backend endpoints; this document (the Frontend Product Specification itself) is the versioned source of truth, with this Version 2 upgrade as the precedent for how future revisions are handled (additive, reviewed, never silently rewriting prior sections — per this very task's own constraint).
- **Documentation:** every component's Variants/Sizes/States/Props (Part 24) is expected to be documented at the point of creation, not retrofitted — at 1,000+ pages and 100+ engineers, undocumented shared components become a bottleneck (everyone re-asks "what does this prop do") rather than an accelerant.
- **Future Enterprise readiness:** mirrors the backend's own approach (DDD §25, Freeze Report Group C) — the frontend reserves layout/routing room (an `organizationId`-scoped route group could be added under `(dashboard)/org/[orgId]/...` later) without requiring today's Information Architecture (Part 4) to be redesigned; this is a additive-only extension point, consistent with how the backend already reserved its own Enterprise extension point.

---

## PART 27 — Frontend Quality Assurance

- **Visual Regression:** automated screenshot-diffing on every PR touching `components/ui/` or `components/shared/` (the highest-blast-radius folders per Part 26) — any pixel-level change to a shared Atom/Molecule must be an intentional, reviewed change, not an accidental side effect.
- **Responsive Testing:** every page in Part 5 is checked at all five breakpoints (Part 9) before merge — not just "does it not break," but "does it match the specific responsive behavior documented for that page."
- **Accessibility Testing:** automated audit (axe-core-equivalent) on every page for WCAG AA violations, plus manual keyboard-only and screen-reader spot-checks on the highest-complexity interactive surfaces specifically (Command Palette, Problem Detail's split view, AI Mentor's streaming thread, Onboarding wizard) — automated tooling alone reliably misses issues in exactly these kinds of custom-interaction-heavy surfaces.
- **Performance Testing:** Core Web Vitals (Part 22) measured in CI against the stated targets for the Dashboard and Landing specifically, with regressions blocking merge rather than being discovered post-deploy.
- **Cross-browser Testing:** current-version Chrome, Safari, Firefox, and Edge at minimum, with particular attention to the Code Editor and Voice Recorder organisms, which historically carry the most cross-browser API inconsistency risk.
- **Component Testing:** every Atom/Molecule/Organism (Part 17) has isolated tests covering its documented Variants/Sizes/States (Part 24) — if a component's spec says it supports a `disabled` state, a test asserts that state actually disables interaction, not just that it visually renders.
- **Integration Testing:** critical cross-component flows — Onboarding wizard end-to-end, DSA submit-then-see-Dashboard-update, AI Mentor send-then-receive-streamed-response — tested as flows, not just as isolated components, since these are exactly the places where Part 20's state synchronization rules are most likely to silently break.
- **UX Review Checklist:** does this page/flow satisfy the specific Nielsen heuristics called out as relevant in Part 23; does every async action have a corresponding Part 13 loading state; does every failure path have a corresponding Part 12 error state; does every zero-data path have a corresponding Part 11 empty state — checked explicitly per new page/flow, not assumed.
- **Code Review Checklist:** does this change follow the Atomic layer dependency direction (Part 17); does it introduce a new component where an existing one with a new variant would have sufficed (Part 18); does it use Design Tokens rather than hardcoded values (Part 21); does it follow the Component API Standards (Part 24); does it use absolute imports and strict typing (Part 19).
- **Design Review Checklist:** does this match the approved Design System (Part 7) exactly (no ad-hoc colors/spacing/radii); does new motion fall within Part 8's duration/easing rules; does the empty/error/loading treatment match the platform-wide consistent shape (Parts 11–13), rather than inventing a new one-off treatment for this specific screen.

---

## PART 28 — Self Review & Final QA Report

**Review performed against the complete document (Parts 1–27) for the items requested:**

- **Missing pages:** none found. Every page named in the original brief's page list appears in Part 4's Information Architecture and Part 5's page-by-page specification; the Admin Console is present but explicitly deferred (documented, not missing).
- **Missing routes:** none found — Part 4's route tree was cross-checked against every page referenced anywhere in Part 5, including nested destinations reached only via in-page navigation (e.g., Company Detail's "Start Company Mock Interview" correctly routes into the existing `/interview` flow rather than implying an undocumented route).
- **Duplicate UI:** none newly identified beyond what Part 18 already consolidates; the review specifically re-checked Dashboard/Analytics/Company Detail's three separate score-gauge usages and confirmed all three are documented as the same shared component (Part 18's reuse map), not three parallel implementations.
- **Duplicate components:** none found; Part 17's ownership model (one component, one layer, one folder) was checked against Part 6's original component list and no component appears to logically overlap with another (e.g., "Card" vs. "Stat Card" are correctly a base Atom vs. a composed Molecule, not two competing implementations of the same thing).
- **Component reuse opportunities:** the review surfaced one additional opportunity beyond Part 18's original list, now recorded here rather than silently added upstream (per the instruction not to modify prior sections): the **Session Config Card** (Interview Dashboard, Part 5) and the **Roadmap regeneration confirmation** share the same "confirm a consequential action with context" shape as a **Confirmation Card** molecule — flagged for consideration in implementation, not retroactively inserted into Part 6.
- **Design consistency:** verified Parts 7/21 (Design System / Design Tokens) use consistent naming for every shared concept (radius scale, spacing scale, color semantic names) — no naming drift found between the two sections.
- **Accessibility:** verified every page in Part 5 carries an explicit Accessibility line, and that Part 10's platform-wide rules (contrast, focus rings, reduced motion) are not contradicted by anything added in Parts 17–27.
- **Performance:** verified Part 22's guidance doesn't conflict with Part 13's loading-state philosophy or Part 20's caching philosophy — all three are mutually consistent (skeleton-first, event-driven cache invalidation, dynamic-import for genuinely heavy Organisms only).
- **Responsive Behaviour:** verified Part 9's breakpoint table is the single referenced source throughout — Parts 17–27 don't introduce a second, conflicting breakpoint scheme.
- **Animation consistency:** verified Part 25's animation decision record correctly reflects Part 8's actual documented durations/easing, and that Part 21's animation tokens are the same values referenced in both.
- **Engineering consistency:** verified Part 19's naming conventions (boolean prefixes, hook naming) match Part 24's Component API Standards exactly — no contradiction between the two.
- **Atomic Design compliance:** cross-checked every component named in Part 6 against Part 17's layer definitions — all classify cleanly into Atom/Molecule/Organism/Template with no ambiguous edge case requiring a ruling.
- **Design Token consistency:** verified every raw value referenced descriptively in Parts 7/8/9 (colors, durations, breakpoints, radii) has a corresponding named token in Part 21 — no orphaned "magic value" referenced in prose without a token backing it.

**Final QA Report:**

| Check | Result |
|---|---|
| Missing pages/routes | ✅ None found |
| Duplicate UI/components | ✅ None found |
| Reuse opportunities | ⚠️ One additional opportunity noted (Confirmation Card) — flagged, not silently added |
| Design consistency | ✅ Confirmed |
| Accessibility | ✅ Confirmed |
| Performance | ✅ Confirmed |
| Responsive behaviour | ✅ Confirmed |
| Animation consistency | ✅ Confirmed |
| Engineering consistency | ✅ Confirmed |
| Atomic Design compliance | ✅ Confirmed |
| Design Token consistency | ✅ Confirmed |

**Overall Version 2 readiness: production-grade, ready for Lovable implementation**, with the single flagged reuse opportunity (Confirmation Card) left as an explicit, visible note for human review rather than being retroactively folded into earlier sections — consistent with this task's own instruction to append, never silently rewrite.

---

*End of Frontend Product Specification — Version 2. Parts 1–16 preserved exactly as originally written; Parts 17–28 appended per this revision's scope. No React code, components, or Tailwind implementation generated, per instruction. This document is ready for Lovable AI to build against. Awaiting review before any implementation begins.*
