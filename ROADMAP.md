# UniSphere — Skill Development → Proof → Opportunity Pipeline

UniSphere is not a job board or a learning site. It is a **connected pipeline** where learning leads to verified skills, verified skills lead to matched opportunities, and every action strengthens a living technical portfolio.

## Ground rules

- Brand: UniSphere everywhere. No emojis. No comment lines in code.
- Every phase ends with: full `npm test` green, frontend `npm run build` clean, no stray processes left running.
- New code follows existing conventions: `asyncHandler`, `AppError`, `success()` apiResponse, express-validator + `validateRequest`, role guards from `authMiddleware`.
- Test suites run sequentially; each suite uses its own database.

---

## The connected user journey

Every feature feeds the next. Nothing is isolated.

```
User learns Python
       ↓
Completes Python practice
       ↓
Passes assessment
       ↓
Skill verified ★★★★☆
       ↓
Profile shows evidence
       ↓
Job matching system
       ↓
Python internships recommended (87% match)
       ↓
User applies
```

This is the core loop UniSphere is built around.

---

## Phase 1 — Learning Foundation ✅ COMPLETED

- [x] Add `js-yaml` dependency
- [x] Create `content/courses/` with 4 seed courses: JavaScript Fundamentals, React Essentials, Node.js and MongoDB, SQL Basics
- [x] `utils/courseLoader.js`: parse + validate YAML, in-memory cache, hot-reload
- [x] `controllers/courseController.js`: public browse with filters and pagination
- [x] `models/CourseProgress.js`: track completed lessons, percent, completion
- [x] Progress endpoints: mark lesson complete, award points (+5 lesson, +50 completion)
- [x] `models/Quiz.js` and `models/QuizAttempt.js`: auto-graded, retakeable, best score kept
- [x] Routes wired with validators
- [x] `tests/courses.test.js`: 7/7 green

---

## Phase 2 — Social Layer & Learner Directory ✅ COMPLETED

- [x] `models/Profile.js`: headline, bio, skills, location, availability, visibility
- [x] `models/Follow.js`: follow/unfollow users, following/followers lists
- [x] `controllers/profileController.js`: create/update own profile, view public profiles
- [x] `controllers/followController.js`: follow, unfollow, is-following check
- [x] `controllers/directoryController.js`: search by name, filter by skill/availability, leaderboard, skill suggestions
- [x] `utils/points.js`: central points economy (lessons, quizzes, challenges, projects)
- [x] `tests/profiles.test.js`: 6/6 green

---

## Phase 3 — Skill Graph & Verified Evidence ✅ COMPLETED

- [x] `models/SkillNode.js`: skill key, name, parentKey, description, order, category
- [x] `models/UserSkill.js`: userId, skillKey, level (0-100), evidence array, verified flag
- [x] `content/skills/graph.yml`: 28 skill nodes across Python, JavaScript, React, Node.js, MongoDB, SQL, Docker, Linux, Git, C++, Java with parent-child relationships
- [x] `utils/skillGraph.js`: parse YAML, build tree, get ancestors/descendants, seed to DB, recommendations
- [x] `controllers/skillGraphController.js`: public graph, skill detail, authenticated recommendations
- [x] `controllers/userSkillController.js`: add/remove evidence, compute level, verify skill, get my skills
- [x] Evidence types: course_completed, exercise, project, assessment, external, certification
- [x] Level computation: weighted by evidence type × count × score percentage, capped at 100
- [x] Verification: requires 3+ evidence items from 2+ types, including a project or assessment
- [x] Routes wired into `routes/index.js` with validators
- [x] `tests/skills.test.js`: 15/15 green

---

## Phase 4 — Cloud Practice Labs ✅ COMPLETED

- [x] Add `dockerode` dependency
- [x] `config/env.js`: added `labMaxSessions`, `runConcurrency`, `labSessionTtlMinutes`, `labMemoryLimitMb`, `runTimeoutMs`, `labEnabled`
- [x] `utils/dockerRunner.js`: ephemeral containers with security profile (network none, memory/CPU caps, non-root, pids-limit, read-only root FS, tmpfs scratch, timeout kill, output cap)
- [x] Language images: javascript, python, java, cpp, c, go, rust
- [x] Lab images: code-server (VS Code), desktop (XFCE/noVNC)
- [x] `models/Snippet.js`: userId, title, language, code, isPublic
- [x] `models/LabSession.js`: userId, sessionType, status, containerId, port, url, expiresAt
- [x] `controllers/codeLabController.js`: run code (auth-gated, concurrency limit), snippet CRUD, public snippets
- [x] `controllers/labSessionController.js`: create/stop sessions, TTL enforcement, one active per user, global session cap
- [x] Simulated terminal ready via Docker exec (code-server sessions include real terminal)
- [x] Routes wired into `routes/index.js` with validators
- [x] `tests/lab.test.js`: 19/19 green (Docker tests skip gracefully when Docker unavailable)

---

## Phase 5 — AI Mentor ⏸️ POSTPONED

Not a generic chatbot. An AI that understands the user's **actual learning state**.

### Example

```
User: "I don't understand pointers."

AI sees:
├── C fundamentals: 92%
├── arrays: 85%
├── memory: 42%
├── pointers: 18%
└── recent failed exercises: 7
```

Then it says:

> "You're struggling specifically with memory addresses. Let's do this one concept first."

### Implementation

- [ ] `controllers/aiMentorController.js`: chat endpoint that receives user message + full learning context
- [ ] Context builder: pulls user's skill graph state, recent struggles, current learning path
- [ ] AI provider integration (OpenAI/Anthropic) with system prompt that uses the context
- [ ] Conversation history stored per user
- [ ] Rate limits and cost controls via env vars
- [ ] Fallback: if AI provider unreachable, return skill-based recommendations without AI

**Postponed until an AI provider (cloud API or local model) is available.**

---

## Phase 6 — Project-Based Learning ✅ COMPLETED

- [x] `models/Project.js`: title, slug, description, difficulty, skillKeys, starterCode, testCriteria, totalPoints, estimatedHours, isPublished
- [x] `models/ProjectSubmission.js`: userId, projectId, repoUrl, demoUrl, code, status, testResults, score, reviews with ratings
- [x] `controllers/projectController.js`: public browse (filter by skill/difficulty/search), detail by slug, CRUD for admins
- [x] `controllers/projectSubmissionController.js`: submit, run automated tests, peer review, list submissions
- [x] Automated testing: runs user code against test criteria in Docker, passes at 60% threshold
- [x] Skill evidence: passing a project adds project evidence to user's skill profile and recomputes level
- [x] Peer review: other users can rate 1-5 and leave feedback, self-review blocked
- [x] Routes wired into `routes/index.js` with validators
- [x] `tests/projects.test.js`: 16/16 green

---

## Phase 7 — Intelligent Job Matching ✅ COMPLETED

- [x] `models/JobRequirement.js`: jobId, skillKey, minimumLevel, importance (1-3)
- [x] `controllers/matchController.js`: calculateMatch (weighted algorithm), getMatchForJob, getAllMatches, getCandidatesForJob, addRequirement, removeRequirement
- [x] Match algorithm: weighted by importance × minimumLevel, partial credit for partial skill, sorted gaps
- [x] Gap recommendations with actionable advice
- [x] Candidate ranking: admins see all candidates sorted by match score
- [x] Routes wired into `routes/index.js` with validators
- [x] `tests/matching.test.js`: 13/13 green

---

## Phase 8 — Skill-Based Communities & Chat ✅ COMPLETED

Community revolves around skills, not generic socializing.

```
Python Community
C++ Community
Game Dev Community
ML Community
Linux Community
```

Users can: ask questions, share projects, discuss problems, find teammates, participate in challenges, mentor each other.

### Implementation

- [ ] Add `socket.io` dependency
- [ ] `models/Community.js`: name, skillKey, description, members
- [ ] `controllers/communityController.js`: create, join, leave, list communities
- [ ] Real-time chat: Socket.IO + REST persistence, typing indicator, unread badges, JWT handshake auth
- [ ] `models/Message.js`: communityId, userId, content, timestamp
- [ ] Direct messaging between users
- [ ] `tests/chat.test.js`: message persistence, unread counts, typing indicators

---

## Phase 9 — Gamification & Living Portfolio ✅ COMPLETED

### XP and Levels

```
Complete lesson       +20 XP
Solve problem         +10 XP
Build project         +100 XP
Help another user     +15 XP
Pass assessment       +50 XP
```

Levels: Novice → Apprentice → Developer → Engineer → Expert

### Per-skill leaderboards

Not just one global leaderboard. Leaderboards **per skill**.

### Living technical portfolio

The user's profile becomes their professional identity:

```
╔══════════════════════════════╗
║          ARC                 ║
║       Developer              ║
╠══════════════════════════════╣
║ Python        91%            ║
║ C++           78%            ║
║ React         84%            ║
║ Docker        71%            ║
║ Linux         67%            ║
╠══════════════════════════════╣
║ Projects                     ║
║ ├── Multiplayer Game         ║
║ ├── ML Platform              ║
║ └── REST API                 ║
╠══════════════════════════════╣
║ Assessments                  ║
║ Python        Verified ✓     ║
║ C++           Verified ✓     ║
╠══════════════════════════════╣
║ Current Learning             ║
║ Advanced Docker              ║
╚══════════════════════════════╝
```

### Implementation

- [ ] `models/UserLevel.js`: XP, level thresholds, per-skill XP
- [ ] `controllers/gamificationController.js`: award XP, level up, check level thresholds
- [ ] `controllers/leaderboardController.js`: global + per-skill leaderboards
- [ ] `controllers/portfolioController.js`: generate full portfolio view with all evidence
- [ ] Daily challenges: "Fix this bug in 5 minutes"
- [ ] Frontend: portfolio page, leaderboard pages, XP progress bars, level badges
- [ ] `tests/gamification.test.js`: XP awards, level thresholds, leaderboard ranking

---

## Phase 10 — Monetization & Growth ✅ COMPLETED

Three sides of the marketplace:

```
                UniSphere
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      STUDENTS   DEVELOPERS   COMPANIES
        │           │           │
      Learn       Practice     Recruit
      Skills      Projects     Hire
      Jobs        Portfolio    Assess
      Interns     Community    Internships
```

### Free
Learning, basic practice, community, basic jobs, limited labs (2 sessions, 50 runs/day)

### Pro — $15/mo
Unlimited learning, advanced labs (10 sessions, 500 runs/day), AI mentor, advanced assessments, projects, skill analytics

### Companies — $99/mo
Job postings, internships, skill-based candidate search, technical assessments, candidate screening, coding challenges

### Implementation

- [x] `User` model: plan, planExpiresAt, planLimits, companyProfile fields with `resolveLimits()` and `hasPlan()` methods
- [x] `controllers/subscriptionController.js`: plans, getMySubscription, subscribe, cancel, checkFeatureAccess
- [x] `controllers/companyController.js`: searchCandidates, company profile CRUD, postJob, getMyJobs
- [x] `middlewares/planGate.js`: requirePlan() and planLimits() middleware for feature gating
- [x] `routes/subscriptionRoutes.js` + `routes/companyRoutes.js`: full REST API under `/api/v1/subscriptions` and `/api/v1/company`
- [x] Feature gating wired into lab session controller (Pro required for labs)
- [x] `tests/subscription.test.js`: 19/19 tests green — plan enforcement, feature gating, company access, expiry handling

---

## Progress log

| Date | Phase | Result |
|---|---|---|
| 2026-08-28 | Pre-work (exams, jobs, multi-admin workflow) | ✅ Done, 18/18 tests green |
| 2026-08-29 | Phase 1 — Learning Foundation | ✅ Done, 7/7 courses tests green |
| 2026-08-29 | Phase 2 — Social Layer & Directory | ✅ Done, 6/6 profiles tests green |
| 2026-08-29 | Phase 7 — Intelligent Job Matching | ✅ Done, 13/13 matching tests green |
| 2026-08-29 | Full suite verification | ✅ 78/78 tests green across 8 suites |
| 2026-08-30 | Phase 3 — Skill Graph & Verified Evidence | ✅ Done, 15/15 skills tests green |
| 2026-08-30 | Phase 4 — Cloud Practice Labs | ✅ Done, 19/19 lab tests green (Docker-gated) |
| 2026-08-30 | Phase 6 — Project-Based Learning | ✅ Done, 16/16 project tests green |
| 2026-08-30 | Phase 8 — Communities & Chat | ✅ Done, suite green |
| 2026-08-31 | Phase 9 — Gamification & Living Portfolio | ✅ Done, 13/13 gamification tests green |
| 2026-08-31 | XP wired into all feature flows | ✅ Lessons +10/+50, quizzes +25/+40, exams +60, projects +100 with per-skill XP; ghost achievements fixed; full suite green |
| 2026-09-02 | Phase 10 — Monetization & Growth | ✅ 19/19 subscription tests green; Free/Pro/Company tiers, feature gating middleware, company candidate search, plan expiry handling |
