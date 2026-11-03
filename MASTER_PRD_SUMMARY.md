# UniSphere — Master PRD Summary & Reference

**Document version:** 1.0  
**Date:** 3 November 2026  
**Status:** Proposed product and engineering baseline  
**Product:** UniSphere  
**Product category:** AI-powered learning, practice, project development and professional growth ecosystem  

---

## Document Metadata
- **Version:** 1.0
- **Date:** 3 November 2026
- **Status:** Proposed product and engineering baseline
- **Product:** UniSphere
- **Category:** AI-powered learning, practice, project development and professional growth ecosystem

---

## Part I — Product Requirements Document

### 1. Executive Summary
- **Product vision:** Make quality technical and professional learning accessible, interactive and connected to real-world outcomes.
- **Product mission:** Help people progress from discovering a subject to understanding it, practicing it, building something with it, demonstrating their skills and connecting those skills to opportunities.
- **Product promise:** **Learn. Practice. Build. Prove. Connect. Grow.**

### 2. Product Decisions (Confirmed Constraints)
| Area | Decision |
|---|---|
| Target audience | Everyone |
| Product identity | Integrated ecosystem |
| Application structure | One unified application |
| First release | Learning, practice, projects and community |
| AI experience | Central assistant and embedded AI |
| Backend architecture | Modular monolith initially |
| Primary database | MongoDB |
| Web experience | React / Next.js |
| Mobile direction | Expo / React Native |
| Execution environment | Isolated workers |
| Career platform | Future expansion |

### 2.1 Unified Application Principle
- One shared application, not independently operated products
- Shared: auth, identity, navigation, design system, notifications, search, AI access, skills/achievements, permissions, billing
- Interface adapts to user's roles, permissions and active context

### 3. Goals and Non-Goals
**G1-G7 Product goals:**
- G1 — Accessible learning
- G2 — Practical learning
- G3 — Project-based development
- G4 — Collaborative learning
- G5 — AI-assisted learning
- G6 — Demonstrable progress
- G7 — Ecosystem continuity

**3.2 Non-goals for first release:** (not committed)
- Full college ERP, institutional admin suite, production exams, APT, unrestricted VMs, video conferencing replacement, foundation AI models, all runtimes, microservices migration, complex billing

### 3.1-4 Target Users and Personas
- **Learner:** Discover courses, follow learning paths, study lessons, ask AI questions, complete quizzes/challenges, track progress, build projects, participate in communities
- **Developer:** Coding playgrounds, programming challenges, technical projects, GitHub integration, project portfolios, skill assessments, technical discussions
- **Educator/Course Creator:** Course creation, module/lesson management, content publishing, AI-assisted content creation, quizzes/exercises, learner analytics, discussion/feedback tools
- **Mentor:** Assigned learner lists, project reviews, feedback/comments, mentorship conversations, progress visibility
- **Administrator:** User/role management, content moderation, reports/analytics, audit history, platform config, AI usage management
- **Future personas:** Recruiters, employers and institutions (later releases)

### 3.1-5 Product Architecture: Six Pillars
1. **Learn** — LMS
2. **Practice** — Interactive learning environment
3. **Build** — Project development ecosystem
4. **Prove** — Exams and credentials (future)
5. **Connect** — Community and collaboration
6. **Grow** — Career and opportunities (future)

### 5.1 Learn — LMS
- LRN-001 to LRN-010: Course discovery, details, content management, enrollment, lesson progress, learning paths, personal tools, recommendations, analytics
- **Acceptance:** Learner can discover/enroll in course, progress persists, duplicate enrollment prevented, course progress reflects lesson completion

### 5.2 Practice — Interactive Environment
- PRC-001 to PRC-008: Challenge catalogue, coding challenges, code editor, automated evaluation, SQL playground, practice history, AI practice assistant, practical environments
- **Acceptance:** Users can open/submit challenges, execution isolated, hidden test cases protected, repeated submissions don't overwrite history

### 5.3 Build — Project Development
- BLD-001 to BLD-008: Project catalogue, definitions, guided projects, enrollment, submissions, collaboration, evaluation, portfolio
- **Acceptance:** User can discover/join project, project has milestones, submissions versioned, team permissions enforced, portfolio visibility configurable

### 5.4 Connect — Community and Collaboration
- COM-001 to COM-008: Communities, discussions, direct/group messaging, study groups, project collaboration, notifications, moderation
- **Acceptance:** Users can create/participate in authorized discussions, membership checked on every operation, reports reviewable by moderators, notifications generated

### 6. AI Platform Requirements
- **6.1 Central AI assistant:** Explain concepts, answer course questions, recommend activities, explain code, help plan projects, summarize progress, understand skill gaps
- **6.2 Feature-specific AI tools:** AI Tutor, Lesson Assistant, Lesson Generator, Quiz Generator, Challenge Generator, Code Assistant, Project Assistant, Community Assistant, Learning Recommender, Career Assistant
- **6.3 AI functional requirements (AI-001 to AI-010):** Provider independence, central gateway, context management, prompt management, usage tracking, rate limiting, output validation, human review, failure handling, transparency
- **6.4 AI safety requirements:** Never expose system prompts/credentials, never trust AI as executable instructions, validate structured data, prevent cross-user context retrieval, don't send hidden data, keep human review available, provide moderation controls, avoid presenting uncertain info as fact
- **6.5 AI architecture:** Client → AI Assistant → AI Gateway → Auth/Permission Check → Context Builder → Prompt Template Manager → Model Provider Adapter → LLM Provider → Output Validation → Usage Tracking → Feature Response

### 7. Future Ecosystem Modules
- **7.1 Prove** — Exams and credentials (question bank, MCQ/descriptive exams, timed assessments, hall tickets, automatic scoring, certificates, skill verification)
- **7.2 Grow** — Career and opportunities (job/internship listings, candidate profiles, resume builder, career recommendations, skill-based matching, applications, recruiter workspaces, candidate discovery, technical screening, interview scheduling, hiring workflows)
- **7.3 Institutional** — Institution profiles, student enrollment, educator management, institution-level analytics, organization-specific learning paths, academic assessments, administrative workspaces

### 8. Cross-Cutting Product Requirements
- UX-001: Responsive (desktop, tablet, mobile)
- UX-002: Accessibility (semantic controls, keyboard navigation, readable contrast, accessible forms)
- UX-003: Consistent design system (reusable: navigation, buttons, forms, cards, dialogs, tables, notifications, loading/error states)
- UX-004: Search (centralized, progressive search across courses, challenges, projects, communities)
- UX-005: Empty states (useful empty states and next actions)
- UX-006: Error handling (understandable, no internal stack traces or sensitive details)
- UX-007: User preferences (visibility, notification preferences, personalization)

---

## Part II — Implementation Architecture

### 9. Architecture Principles
1. Modular monolith before microservices
2. Shared identity and authorization
3. Clear module ownership
4. Explicit API contracts
5. Secure background processing
6. Isolated untrusted code execution
7. Provider-independent AI
8. Evidence-based skills and progress
9. Testable business logic
10. Incremental deployment and migration

### 10. High-Level System Architecture
```text
UNISPHERE CLIENTS
  +---------------------------+
  |                           |
Web App                    Mobile App
Next.js/React             Expo/React Native
  |                           |
  +-------------+-------------+
                |
              API Layer
                |
Authentication / RBAC
                |
UNISPHERE APPLICATION
  |
Learning          Practice             Projects
  |                   |                   |
Community              AI                Profiles
  |                   |                   |
Notifications         Skills             Gamification
  |                   |                   |
  +-------------------+-------------------+
                |
          Infrastructure Layer
                |
  +-------------------+-------------------+
  |                   |                   |
MongoDB              Redis            Object Storage
  |                   |                   |
  +-------------------+-------------------+
                |
       Background Workers
                |
  +-------------------+-------------------+
  |                   |                   |
AI Worker       Execution Worker     Event Worker
```

### 11. Recommended Technology Stack
| Component | Technology | Purpose |
|---|---|---|
| Web application | Next.js / React | Main user interface |
| Mobile application | Expo / React Native | Mobile experience |
| Language | TypeScript | Shared type safety |
| Backend | Node.js / Express | API and business logic |
| Database | MongoDB | Application data |
| Cache | Redis | Caching and temporary data |
| Job queue | BullMQ | Background jobs |
| Real-time | Socket.IO | Messaging and live events |
| Code execution | Docker-based workers | Isolated execution |
| File storage | S3-compatible storage | Files and media |
| AI integration | Provider adapters | Model access |
| Validation | Zod or equivalent | Input and output validation |
| API documentation | OpenAPI | API contracts |
| Testing | Vitest/Jest + Supertest | Unit and integration testing |
| Deployment | Existing Render/Vercel infrastructure | Initial hosting |

### 12. Backend Module Architecture
```text
backend/src/modules/
├── auth/
├── users/
├── profiles/
├── organizations/
├── permissions/
├── learning/ (courses/, modules/, lessons/, enrollments/, progress/, learning-paths/)
├── ai/ (gateway/, providers/, prompts/, context/, conversations/, usage/)
├── practice/ (challenges/, submissions/, labs/)
├── projects/ (projects/, labs/)
├── skills/
├── community/ (chat/, notifications/)
├── gamification/
├── assessments/
├── exams/
├── careers/
├── matching/
├── subscriptions/
└── administration/

Each module owns: routes, controllers, business services, data models, validation schemas, authorization policies, tests.

### 13. Frontend Architecture
One application with one shared shell:
```text
frontend/app/ ( (public)/, (auth)/, (platform)/dashboard/, learn/, practice/, build/, community/, messages/, profile/, ai/, educator/, admin/ )
frontend/components/ (ui/, layout/, navigation/, forms/, shared/)
frontend/features/ (auth/, learning/, practice/, projects/, community/, ai/, profile/)
frontend/hooks/, lib/, services/, stores/, types/, styles/
```
**Frontend design rules:** Shared navigation/library, feature-based organization, role-aware navigation, server-side permission enforcement, consistent API client, central error handling, loading/empty/failure states, responsive layouts, reusable forms/validation. Hiding navigation item ≠ authorization.

### 14. Identity, Roles and Authorization
- **14.1 Identity model:** User has one primary identity, may have multiple roles (learner, developer, educator, mentor, recruiter, organization_admin, moderator, platform_admin)
- **14.2 Authorization model:** RBAC + resource-level policies. Example: User has roles/permissions (course:create, course:update:own, lesson:publish, course:enroll). Considers: role, permission, resource ownership, organization membership, project membership, course ownership, resource visibility.
- **14.3 Security requirements:** Secure password hashing, short-lived access tokens, refresh token rotation, secure cookie config, login rate limiting, password reset expiry, email verification, session revocation, audit logging, no hardcoded prod credentials, no shared default admin passwords. All dev seed accounts must use dev-only credentials.

### 15. Database Architecture
**15.1 Core identity collections:**
- `users`: _id, email, passwordHash, status, roles, createdAt, updatedAt
- `profiles`: _id, userId, displayName, avatar, bio, interests, learningGoals, visibility
- `organizations`: _id, name, slug, type, status, createdAt
- `organization_memberships`: _id, organizationId, userId, roles, status, joinedAt

**15.2 Learning collections:** courses, course_modules, lessons, enrollments, lesson_progress, learning_paths, learning_path_steps, notes, bookmarks, learning_activity

**15.3 AI collections:** ai_conversations, ai_messages, ai_prompt_templates, ai_generation_jobs, ai_usage_records, ai_feedback

**15.4 Practice collections:** challenges, challenge_test_cases, challenge_submissions, execution_jobs, execution_results, lab_environments

**15.5 Project collections:** projects, project_members, project_milestones, project_submissions, project_reviews, project_comments

**15.6 Community collections:** communities, community_members, posts, comments, reactions, conversations, conversation_members, messages, notifications, moderation_reports

**15.7 Skill collections:** skills, skill_relationships, user_skills, skill_evidence, skill_assessments

**15.8 Database design rules:** (1-10) Add indexes, unique constraints, pagination, avoid unbounded arrays, store large files outside MongoDB, retention policies, transactions, UTC timestamps, validate at API boundary, define ownership/deletion rules.

**15.9 Important relationships:** User → Profile, Enrollments → Course → Modules → Lessons; User → Challenge Submissions, Project Memberships, Skill Evidence, AI Conversations, Community Memberships, Notifications.

### 16. Skill Graph and Evidence Architecture
- A skill may contain: name, description, category, parent skill, prerequisites, associated technologies, learning resources, assessment criteria.
- **Evidence types:** Course completion, quiz performance, coding challenge result, project submission, practical assessment, educator/mentor review.
- **Evidence rules:** Skill level must not be determined solely by XP/lesson completion. Considers: evidence type, quality, recency, assessment difficulty, verification status. Scores/levels should be explainable and recalculable.

### 17. API Architecture
- Versioned REST API, base path: `/api/v1`
- **Standard success:** `{"success": true, "data": {}, "meta": {}}`
- **Standard error:** `{"success": false, "error": {"code": "RESOURCE_NOT_FOUND", "message": "The requested resource was not found"}}`
- **17.1 Authentication:** POST /api/v1/auth/register, login, logout, refresh, forgot-password, reset-password, GET /api/v1/auth/me
- **17.2 Learning:** GET /api/v1/courses, /:courseId; POST /api/v1/courses; PATCH /:courseId; POST /:courseId/publish; GET /:courseId/modules; GET /api/v1/lessons/:lessonId; POST /:courseId/enroll; GET /api/v1/learning/enrollments; POST /:lessonId/complete; GET /api/v1/learning/progress
- **17.3 Practice:** GET /api/v1/challenges, /:challengeId; POST /:challengeId/submissions; GET /:submissionId; GET /:submissions/history
- **17.4 Projects:** GET /api/v1/projects; POST /:projectId; GET /:projectId; POST /:projectId/join; POST /:projectId/submissions; GET /:projectId/submissions; POST /:submissionId/reviews
- **17.5 Community:** GET /api/v1/communities; POST /; GET /:communityId/posts; POST /api/v1/posts; POST /:postId/comments; POST /:postId/reports
- **17.6 AI:** POST /api/v1/ai/chat; GET /:conversations; GET /:conversationId; POST /:lessonId/explain; POST /api/v1/quizzes/generate; POST /:challengeId/hint; POST /:code/explain; GET /:ai/usage
- **API rules:** Validate request bodies/params, authenticate protected routes, enforce resource-level permissions, use pagination, consistent error codes, request IDs, idempotency controls, avoid exposing internal docs, document with OpenAPI.

### 18. Background Jobs and Event Processing
- Operations: AI generation, code execution, notifications, email delivery, project evaluation, large file processing, analytics aggregation
- **Recommended job flow:** API Request → Validate/Authorize → Create Job Record → Enqueue Job → Return Job ID → Worker Processes Job → Save Result → Publish Event → Notify Client
- **Job support:** Retry policies, failure handling, timeout limits, dead-letter handling, job status, idempotency, observability. Use Redis and BullMQ when queue infrastructure introduced.

### 19. Secure Code Execution Architecture
- **Never execute user submissions directly in primary API process.**
- **Execution workflow:** User Submission → API Validation → Create Submission Record → Create Execution Job → Queue → Isolated Worker → Disposable Container → Execute Test Cases → Collect Result → Destroy Environment → Save Evaluation → Notify User
- **Mandatory controls:** Non-root execution, CPU limits, memory limits, execution timeout, process limits, disk quotas, network isolation by default, restricted filesystem access, read-only base images, disposable environments, container cleanup, output size limits, rate limits, worker isolation from application secrets. **Never mount the host Docker socket into untrusted execution containers.**

### 20. Real-Time Architecture
- Use Socket.IO or WebSockets for: direct messages, group messages, typing indicators, presence, live notifications, project collaboration events
- **Rules:** Authenticate socket connections, authorize room membership, validate every message event, apply rate limits, persist messages before acknowledging delivery, use database as source of truth, treat real-time as enhancement not only persistence mechanism

### 21. Security Architecture
- **21.1 Application security:** Input validation, output encoding, secure authentication, CSRF protection (where applicable), CORS restrictions, security headers, rate limiting, password hashing, secret management, audit logs, dependency vulnerability checks
- **21.2 Data security:** TLS for network traffic, appropriate encryption at rest, sensitive-field minimization, private file access controls, backup/restore procedures, data retention rules, account deletion workflow, access logging for sensitive records
- **21.3 AI security:** Context authorization, prompt injection resistance, output validation, sensitive data minimization, tool permission boundaries, AI usage quotas, human review for consequential decisions
- **21.4 Community safety:** Reporting, moderation, user blocking, spam protection, content visibility rules, audit history for moderation actions

### 22. Observability and Reliability
- **Implement:** Structured logs, request correlation IDs, API latency metrics, error monitoring, worker health metrics, queue depth metrics, database performance monitoring, AI usage/cost monitoring, execution failure monitoring
- **Every critical workflow should be traceable** across API requests, jobs and worker results
- **Reliability expectations:** API failures shouldn't corrupt progress, background jobs should be safely retryable, duplicate event delivery shouldn't produce duplicate rewards, database backups must be tested, failed AI requests shouldn't block non-AI workflows, worker failures shouldn't crash main application

---

## Part III — First Release and Implementation Roadmap

### 23. Release Strategy
First release is a coherent learning ecosystem, not a miniature version of every future feature. Includes: Learning, Practice, Projects, Community, Central and embedded AI, Shared user profiles and progress. **Exclusions:** Formal examination administration, full career recruitment, institution ERP, advanced virtual machines, complex enterprise billing.

### 24. Implementation Phases
- **Phase 0:** Existing Repository Audit and Foundation — inspect frontend/backend, inventory routes/models, map modules to target architecture, identify duplicated functionality, identify incomplete workflows, review tests/deployment, review auth/permissions, establish module ownership, define coding standards, establish API contracts. **Deliverables:** Repository audit, architecture decision records, module mapping, technical debt register, initial implementation backlog.
- **Phase 1:** Unified Application Foundation — Authentication, Profiles, Roles and permissions, Shared navigation, Responsive design system, API response standards, Error handling, Logging, Database configuration, Test infrastructure.
- **Phase 2:** Learning Ecosystem — Course catalogue, details, authoring, modules/lessons, enrollment, lesson progress, notes/bookmarks, learning paths, learning dashboard.
- **Phase 3:** AI Learning Platform — AI gateway, provider adapters, prompt templates, central assistant, lesson explanation, quiz generation, usage tracking, rate limiting, output validation, AI feedback.
- **Phase 4:** Practice Platform — Challenge catalogue, authoring, code editor, submission API, execution queue, isolated workers, evaluation results, practice history, AI hints/explanations.
- **Phase 5:** Project Platform — Project catalogue, guided projects, enrollment, team membership, milestones, submissions, GitHub links, reviews, portfolios.
- **Phase 6:** Community Platform — Communities, posts/comments, messaging, group conversations, study groups, notifications, moderation.
- **Phase 7:** Integration and Public Release — End-to-end testing, performance testing, security testing, accessibility review, backup validation, deployment checks, monitoring, documentation, production data migration.

**Exit criteria for each phase** defined in the full PRD.

### 25. First-Release Definition of Done
A feature is not complete merely because a page or API endpoint exists. Every feature must include: defined user journey, frontend implementation, backend implementation, data persistence, authorization, validation, error handling, loading/empty states, automated tests, documentation, observability, acceptance criteria.

**First-release end-to-end scenarios:**
- **Scenario A — Learner:** Register → Complete profile → Discover course → Enroll → Study lesson → Ask AI tutor → Complete quiz → Complete coding challenge → Join project → Submit work → Participate in community
- **Scenario B — Educator:** Register → Obtain educator permissions → Create course → Add modules → Add lessons → Use AI to draft content → Review/publish → Monitor learner progress
- **Scenario C — Project collaborator:** Discover project → Join team → View milestones → Complete task → Submit contribution → Receive feedback
- **Scenario D — Administrator:** Access admin workspace → Manage user roles → Review content reports → Take authorized moderation action → Inspect audit history

---

## Part IV — Product Metrics and Governance

### 26. Key Performance Indicators
- **Learning metrics:** Course enrollment rate, course activation rate, lesson completion rate, weekly active learners, learning path completion, returning learner rate
- **Practice metrics:** Challenge participation, challenge completion, test-case success, repeat attempts, improvement in assessment performance
- **Project metrics:** Project enrollment, project completion, submission rate, review turnaround time, portfolio activity
- **Community metrics:** Active communities, discussion participation, response time, study group participation, moderation response time
- **AI metrics:** AI feature usage, successful request rate, user feedback, estimated cost per feature, latency, AI-generated content approval rate
- **North-star metric:** Weekly active learners completing at least one meaningful learning activity (lesson, quiz, challenge, project milestone). Registrations alone NOT a measure of educational impact.

### 27. Major Risks and Mitigations
| Risk | Mitigation |
|---|---|
| Too many features | Enforce release boundaries |
| Existing code duplication | Audit and consolidate before expansion |
| Permission vulnerabilities | Central policies and resource-level tests |
| Unsafe code execution | Isolated workers and strict limits |
| AI cost growth | Quotas, caching and usage monitoring |
| AI misinformation | Review workflows and output validation |
| Poor content quality | Publishing controls and feedback |
| Database performance | Indexing and query monitoring |
| Real-time complexity | Introduce only where useful |
| Scope expansion | Product backlog and acceptance criteria |
| Maintenance burden | Modular monolith and clear ownership |

### 28. Architecture Decision Records (ADR-001 to ADR-010)
| ID | Decision | Reason |
|---|---|---|
| ADR-001 | Unified application | One ecosystem and shared identity |
| ADR-002 | Modular monolith | Lower operational complexity |
| ADR-003 | TypeScript | Consistent contracts and maintainability |
| ADR-004 | MongoDB | Existing data and backend direction |
| ADR-005 | Background job processing | Keep long-running work out of HTTP requests |
| ADR-006 | Isolated code execution | Security boundary for untrusted code |
| ADR-007 | AI gateway | Provider independence and centralized governance |
| ADR-008 | Shared skill graph | Connect learning, projects and future careers |
| ADR-009 | Resource-level authorization | Prevent cross-user and cross-organization access |
| ADR-010 | REST API first | Straightforward web and mobile integration |

### 29. First Engineering Sprint (Workstreams A-D)
- **Workstream A:** Repository audit — inspect frontend/backend, inventory routes/models, inspect auth/permissions/AI integrations/project/community workflows/tests/deployment
- **Workstream B:** Architecture mapping — map existing modules to target architecture, identify duplicated/missing modules, cross-module dependencies, define module ownership, API conventions, shared error handling, event conventions
- **Workstream C:** Security review — auth, token/session handling, password reset, role assignment, resource authorization, file uploads, AI access controls, code execution isolation, secrets/default credentials
- **Workstream D:** Product foundation — confirm first-release user journeys, define learning content schema, course publishing workflow, progress rules, skill evidence model, AI gateway contract, first-release API specification
- **Sprint deliverables:** 1) Existing repo audit, 2) Current-to-target architecture mapping, 3) Tech debt and security report, 4) Initial DB schema spec, 5) API contract spec, 6) Prioritized development backlog

### 30. Product Governance Rules (1-10)
1. Every feature must serve a defined user need
2. Every module must have an owner
3. Every feature must have measurable acceptance criteria
4. Every API must enforce authorization
5. Every important workflow must have tests
6. Every AI feature must use the shared AI gateway
7. Every user-generated code workflow must use isolated execution
8. Every skill claim must have a defined evidence policy
9. Every new major feature must have a product justification
10. No module is complete solely because its interface exists

### 31. Final Product Definition
- **UniSphere** is a unified, AI-powered learning and professional development ecosystem
- **Central experience:** Learn → Practice → Build → Prove → Connect → Grow
- **Initial release:** Complete experience across learning, practice, projects and community, supported by shared AI infrastructure
- **Long-term ecosystem:** Expand into assessments, credentials, recruitment and institutional services without fragmenting into separate applications
- **Guiding principle:** UniSphere should help people move from learning something to being able to do something meaningful with it

**Document status:** Master PRD v1.0 — Proposed baseline  
**Next required engineering artifact:** Existing Repository Audit and Current-to-Target Architecture Mapping  
**Implementation rule:** Preserve working functionality, verify incomplete functionality, and introduce new architecture incrementally rather than rewriting the entire platform without evidence
