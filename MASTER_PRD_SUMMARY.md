# UniSphere — Master PRD Summary & Reference

**Document version:** 1.1  
**Date:** 9 November 2026  
**Status:** Proposed product and engineering baseline  
**Product:** UniSphere  
**Product category:** AI-powered learning, practice, project development and professional growth ecosystem  

---

## Document Metadata
- **Version:** 1.1
- **Date:** 9 November 2026
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


---

# Part IV — Consolidated Ecosystem Expansion (Version 1.1)

> This part consolidates the requirements previously maintained in the company trust/security, office-suite/virtual-computing, and real-time collaboration/software-engineering expansion documents. It extends the existing six-pillar product model; it does not declare these capabilities implemented or automatically commit them to the first release.

## 32. Expansion Scope and Requirement Status

### 32.1 Status vocabulary

Every feature must be tracked using one of these states in implementation plans and release notes:

- **Existing — verified:** Repository inspection found an implementation path or working feature. This is not a substitute for current automated and manual testing.
- **Partial — verified:** A basic version exists, but important workflow, edge cases, permissions, or reliability work remains.
- **Proposed — not verified:** A requirement is documented, but implementation has not been demonstrated.
- **Blocked:** A dependency, security issue, provider decision, or infrastructure constraint prevents safe delivery.
- **Deferred:** Intentionally excluded from the current release and reconsidered at a later planning checkpoint.

Documentation presence, a roadmap checkbox, a UI placeholder, or a passing isolated test must not by itself be treated as proof that a production feature is complete.

### 32.2 Product boundaries

UniSphere remains one integrated application with shared identity, navigation, permissions, notifications, search, design system, and billing. The new requirements are grouped into capabilities within that application:

1. Learn, Practice, Build, Prove, Connect, and Grow remain the six product pillars.
2. Trust & Organization Services provide identity assurance and organization-level authorization across the pillars.
3. Communication & Collaboration extend Connect and support learning, projects, mentorship, and hiring workflows.
4. Developer Workspace extends Practice and Build.
5. Productivity & Office Suite provides shared document and file workflows across learning, projects, and organizations.
6. Virtual Computing provides isolated development environments; it is not an unrestricted general-purpose cloud computer.

## 33. Trust, Company Verification, and Organization Security

**Objective:** Establish trustworthy organization and professional workflows without treating an email domain or a self-declared company name as proof of identity.

### 33.1 Organization lifecycle

- **TRU-ORG-001:** Users can create an organization profile with legal/display name, organization type, website, business contact details, and a unique slug.
- **TRU-ORG-002:** Organization verification supports documented evidence and a review workflow with pending, verified, rejected, suspended, and expired states.
- **TRU-ORG-003:** Verification decisions record reviewer, timestamp, evidence references, decision reason, and expiry/reverification requirements.
- **TRU-ORG-004:** Organization owners can invite members and assign scoped organization roles.
- **TRU-ORG-005:** Membership supports invited, active, suspended, and removed states, with revocation taking effect on subsequent authorized requests.
- **TRU-ORG-006:** Organization ownership transfer and recovery require an auditable, explicit workflow.
- **TRU-ORG-007:** Public organization pages show verification status accurately and explain what the verification badge does and does not establish.

### 33.2 Recruiter and professional identity

- **TRU-ID-001:** Recruiter and interviewer accounts must be linked to an organization membership before accessing organization-only hiring tools.
- **TRU-ID-002:** Candidate-facing views identify the organization and the role of the person contacting the candidate.
- **TRU-ID-003:** Changes to organization affiliation, recruiter privileges, and verification status are auditable.
- **TRU-ID-004:** Candidate discovery and contact workflows enforce consent, visibility settings, and organization-level permissions.

### 33.3 Account and payment security

- **TRU-SEC-001:** Support MFA, with passkeys/WebAuthn as a preferred option where practical.
- **TRU-SEC-002:** Users can inspect and revoke active sessions and recover accounts through verified recovery channels.
- **TRU-SEC-003:** Sensitive account changes require re-authentication or step-up verification where risk warrants it.
- **TRU-SEC-004:** Payment provider tokens and references are stored instead of raw payment-card data. Payment processing remains delegated to a compliant provider.
- **TRU-SEC-005:** Subscription changes, refunds, billing events, and organization plan changes have an auditable history.
- **TRU-SEC-006:** Risk controls include abuse reporting, suspicious-activity review, rate limits, and account/organization suspension workflows.

### 33.4 Trust acceptance criteria

- An unverified organization cannot use features that explicitly require verified status.
- A suspended or removed member loses organization-scoped access without requiring account deletion.
- A verification decision can be reconstructed from its audit record.
- A user cannot grant themselves organization-admin or recruiter privileges by changing client-side state or request data.
- Verification badges and labels never imply government endorsement, guaranteed legitimacy, or a background check unless that exact check was performed.

## 34. Communication and Collaboration

**Objective:** Support reliable communication around learning, projects, communities, mentoring, and professional workflows.

### 34.1 Messaging

- **COMX-MSG-001:** Support persistent one-to-one direct messages.
- **COMX-MSG-002:** Support group conversations with owner/admin/member roles and controlled invitation.
- **COMX-MSG-003:** Support conversation membership changes, leave, removal, and blocking.
- **COMX-MSG-004:** Support message history, pagination, unread state, read receipts, and optional typing/presence indicators.
- **COMX-MSG-005:** Support attachments through controlled object storage, file validation, access checks, and size/type limits.
- **COMX-MSG-006:** Provide message search only over conversations the requesting user is authorized to access.
- **COMX-MSG-007:** Persist messages as the source of truth; WebSocket delivery is a real-time enhancement, not the only persistence mechanism.
- **COMX-MSG-008:** Prevent duplicate message creation on retries through idempotency or equivalent safeguards.

### 34.2 Communities and group spaces

- **COMX-GRP-001:** Communities may be organized by skill, course, project, institution, or organization.
- **COMX-GRP-002:** Community owners can configure visibility, joining rules, roles, and moderation permissions.
- **COMX-GRP-003:** Group spaces support pinned posts/announcements and member management.
- **COMX-GRP-004:** Private groups and channels must verify membership on every read and write operation.
- **COMX-GRP-005:** Users can report content, block accounts, and control notification preferences.

### 34.3 Audio/video and meetings

- **COMX-CALL-001:** Support scheduled and ad-hoc one-to-one audio/video sessions as a later capability.
- **COMX-CALL-002:** Group calls require an explicit architecture decision covering SFU/provider selection, concurrency, recording policy, and cost.
- **COMX-CALL-003:** Meeting rooms support host controls, waiting rooms, invite permissions, and participant removal.
- **COMX-CALL-004:** Recording is off by default and requires clear participant notice and consent before capture.
- **COMX-CALL-005:** Interview and mentorship sessions may link to a candidate, project, mentor relationship, or organization, subject to access policy.

### 34.4 Communication acceptance criteria

- A user cannot read or send messages in a conversation after losing membership or being blocked.
- Messages survive reconnects and are not lost when real-time transport is unavailable.
- Retried requests do not create duplicate messages.
- Moderation actions and membership changes are auditable.
- Notifications respect mute, block, privacy, and user preference settings.

## 35. Developer Workspace and Engineering Collaboration

**Objective:** Connect learning and project work to practical software engineering workflows without rebuilding every third-party developer platform.

### 35.1 Repository and Git integration

- **DEV-REPO-001:** Users can connect supported Git providers through scoped OAuth permissions.
- **DEV-REPO-002:** Users can link repositories to projects and portfolio entries.
- **DEV-REPO-003:** Display repository metadata, default branch, activity, and permitted file views through provider APIs.
- **DEV-REPO-004:** Where supported, provide issue and pull-request links, status summaries, and contribution references.
- **DEV-REPO-005:** Never request or store raw Git provider passwords or personal access tokens when an OAuth flow is available.
- **DEV-REPO-006:** Users can revoke provider access and disconnect integrations.
- **DEV-REPO-007:** Repository visibility and provider permissions must be respected; private repository data must not leak into public profiles or AI context.

### 35.2 Collaborative engineering

- **DEV-COL-001:** Project workspaces support members, roles, tasks, milestones, comments, and activity history.
- **DEV-COL-002:** Collaborative editing is a future capability requiring conflict-resolution and persistence design; do not imply simultaneous editing from ordinary chat or file sharing.
- **DEV-COL-003:** Code review workflows may link submissions to commits, branches, pull requests, and review feedback.
- **DEV-COL-004:** Team activity and contribution summaries must be evidence-based and allow correction of provider synchronization errors.

### 35.3 API and system design tools

- **DEV-API-001:** A future API workspace may support saved requests, environments, collections, response inspection, and shareable workspaces.
- **DEV-DESIGN-001:** A future system-design workspace may support diagrams, architecture notes, and project-linked design decisions.
- **DEV-TOOLS-001:** Tool integrations must be modular adapters with explicit permission scopes, failure handling, and provider rate-limit handling.

## 36. Productivity Suite and File Management

**Objective:** Provide practical document workflows connected to courses, projects, and organizations. These are proposed product modules, not a requirement to clone every feature of commercial office software.

### 36.1 UniDocs — document editor

- **OFF-DOC-001:** Create, edit, rename, organize, and delete user-owned documents.
- **OFF-DOC-002:** Support autosave, revision history, and recovery from accidental edits.
- **OFF-DOC-003:** Support common text formatting, headings, lists, tables, links, and export to interoperable formats.
- **OFF-DOC-004:** Support sharing with explicit viewer/editor permissions and revocation.
- **OFF-DOC-005:** Comments and collaborative editing are staged capabilities and require conflict handling and audit history.

### 36.2 UniSheets — spreadsheet workspace

- **OFF-SHEET-001:** Support workbooks, sheets, cells, basic formulas, sorting, filtering, and common data formats.
- **OFF-SHEET-002:** Validate formulas and imported files; prevent formula execution from becoming an arbitrary code-execution path.
- **OFF-SHEET-003:** Support CSV/XLSX import/export where library and compatibility constraints permit.
- **OFF-SHEET-004:** Large datasets must use pagination/virtualization or other bounded rendering strategies.

### 36.3 UniSlides — presentation workspace

- **OFF-SLIDE-001:** Support presentations, slides, text, images, shapes, themes, and slide ordering.
- **OFF-SLIDE-002:** Support export to PDF and interoperable presentation formats where feasible.
- **OFF-SLIDE-003:** Shared editing and presenter workflows are later-stage capabilities.

### 36.4 UniDrive — files and assets

- **OFF-FILE-001:** Provide user, project, and organization file areas with explicit ownership and access control.
- **OFF-FILE-002:** Store binary files in object storage, not as unbounded database documents.
- **OFF-FILE-003:** Enforce upload limits, content-type validation, malware-scanning integration where available, and private download authorization.
- **OFF-FILE-004:** Support folder organization, metadata, versioning, and retention/deletion policies.
- **OFF-FILE-005:** Shared links must be revocable, scoped, and optionally time-limited.

## 37. Virtual Computing and Cloud Development Environments

**Objective:** Offer controlled, disposable development environments for learning and project work.

- **VCE-001:** Users can request a predefined environment template for an allowed language or toolchain.
- **VCE-002:** Every environment is associated with an owner, workspace, resource quota, creation time, and expiry policy.
- **VCE-003:** Environments have explicit CPU, memory, disk, process, and runtime limits.
- **VCE-004:** Environments are isolated from the application host, production secrets, and other users' workspaces.
- **VCE-005:** Network access is disabled by default for untrusted code and enabled only through explicit, policy-controlled templates.
- **VCE-006:** Sessions support start, stop, expiry, cleanup, and recoverable workspace storage where configured.
- **VCE-007:** Users can inspect session state and resource consumption.
- **VCE-008:** Database and API workspaces use scoped credentials, isolated test data, and environment-specific permissions.
- **VCE-009:** No environment may expose the host Docker socket or unrestricted host filesystem.
- **VCE-010:** Virtual machines or persistent general-purpose cloud desktops are deferred until infrastructure cost, isolation, abuse controls, and operational ownership are validated.

## 38. Calendar, Scheduling, and Workflow Integration

- **CAL-001:** Users can create events for study groups, mentoring, project milestones, and interviews.
- **CAL-002:** Events have an owner, participants, start/end time with timezone, visibility, and status.
- **CAL-003:** Invitations support accept, decline, and tentative responses.
- **CAL-004:** Calendar notifications respect user preferences and event permissions.
- **CAL-005:** External calendar integration requires explicit authorization and revocable provider access.
- **CAL-006:** Meeting links and interview details are visible only to authorized participants.

## 39. Cross-Cutting Requirements for the Expanded Ecosystem

### 39.1 Authorization and privacy

- Every feature must define resource ownership, visibility, organization scope, and role/permission checks.
- Authorization is enforced on the server for every operation; hiding a UI control is not authorization.
- AI context retrieval, search indexing, exports, notifications, and integrations must preserve the same access boundaries.
- Users must be able to understand and control profile visibility, connected accounts, shared files, and notification preferences.

### 39.2 Auditability

- Record security-sensitive events including organization verification, membership/role changes, session revocation, payment state changes, moderation actions, file sharing, and integration connection/revocation.
- Audit events include actor, action, target, timestamp, outcome, and relevant request/correlation ID.
- Audit logs must not store passwords, access tokens, raw payment details, or unnecessary sensitive content.

### 39.3 Reliability and operations

- External providers must be accessed through adapters with timeouts, retries, rate-limit handling, and clear failure states.
- Background jobs must be idempotent where retries are possible.
- Real-time features must degrade gracefully to persisted REST workflows.
- File and workspace cleanup must be observable and retryable.
- Define operational metrics for message delivery, call quality, workspace startup, job failure, file processing, and provider synchronization before general availability.

### 39.4 Accessibility and user control

- New workspaces must remain responsive and keyboard accessible.
- Provide clear loading, empty, offline, permission-denied, and failure states.
- Users control notification categories, presence visibility, connected integrations, and sharing permissions.
- Audio/video features must expose captions or accessible alternatives where technically available.

## 40. Prioritization and Release Boundaries

The following is a recommended sequencing proposal, not a promise of delivery dates.

| Priority | Capability | Recommended scope | Release guidance |
|---|---|---|---|
| P0 | Existing platform correctness | Resolve known security/runtime blockers; reconcile inconsistent roadmap and test status; verify existing flows | Required before expanding risky capabilities |
| P1 | Trust foundation | Organization membership, scoped roles, audit events, verification review workflow, session controls | Build the authorization foundation before recruiter/organization features |
| P1 | Messaging reliability | Verify current DMs; persistence, membership checks, unread state, blocking/reporting, real-time transport | Deliver reliable text communication before calls |
| P1 | Developer integrations | Repository linking and read-only metadata through scoped OAuth | Start with provider integration; avoid self-hosting Git |
| P2 | Group collaboration | Group conversations, channels, roles, moderation, project-linked discussions | After messaging and authorization foundations |
| P2 | UniDrive foundation | Private file storage, permissions, upload validation, folders, versioning | Needed before office editors and attachments scale |
| P2 | UniDocs | Basic document creation/editing/export and revision history | Deliver a focused editor, not a full office clone |
| P3 | Calendar and scheduling | Events, invitations, timezone handling, notifications | Enable mentorship and interview workflows |
| P3 | UniSheets and UniSlides | Basic spreadsheet and presentation workflows | Validate user demand and maintenance cost |
| P3 | Audio/video | One-to-one calls and meeting controls | Requires provider/SFU, consent, moderation, and cost decision |
| P3 | API/system design workspace | Project-linked API collections and architecture artifacts | Build only after developer workspace usage is validated |
| P4 | Persistent VMs/cloud desktops | Persistent compute and advanced virtual environments | Deferred pending cost and isolation review |

### 40.1 Explicit first-release exclusions

Unless separately approved in a release decision, the first release does not include:
- A full commercial-grade Word/Excel/PowerPoint replacement.
- Unrestricted public cloud VMs or arbitrary network-enabled compute.
- A self-hosted GitHub/GitLab replacement.
- Large-scale video conferencing or call recording.
- Automatic legal/business verification without a human review and evidence process.
- A claim that a company, recruiter, candidate, or skill is trustworthy solely because a profile is complete or a badge is present.

## 41. Expansion Acceptance and Definition of Done

A feature is not complete merely because its UI exists or its API returns success. Before marking a requirement **Existing — verified**:

1. The user journey is implemented end to end.
2. Authentication, resource authorization, ownership, and organization boundaries are tested.
3. Validation, failure, retry, and duplicate-request behavior are tested.
4. Relevant unit and integration tests pass.
5. Frontend production build passes for affected applications.
6. Accessibility and responsive behavior receive a practical check.
7. Logs and audit events exist for security-sensitive operations.
8. Documentation and roadmap status agree with the actual implementation.
9. Any external integration has a documented permission scope, disconnect path, and failure behavior.
10. Deployment-specific dependencies and operational limits are documented.

## 42. Source Documents Consolidated

This PRD now incorporates the requirements and analysis from:

- [Company Verification, Trust & Platform Security Requirements](COMPANY_VERIFICATION_TRUST_SECURITY_REQUIREMENTS.md)
- [Office Suite, Virtual Computing & Complete Developer Workspace Expansion](OFFICE_SUITE_VIRTUAL_COMPUTING_WORKSPACE_EXPANSION_REQUIREMENTS.md)
- [Real-Time Communication, Collaboration & Software Engineering Ecosystem Requirements](REALTIME_COMMUNICATION_COLLABORATION_SOFTWARE_ENGINEERING_ECOSYSTEM_REQUIREMENTS.md)

These source documents remain useful as detailed supporting analyses. If a requirement changes, update this master PRD first and then keep the supporting documents and roadmap aligned. Where source documents conflict with repository evidence or one another, implementation status must be marked **needs verification** rather than silently treating the most optimistic status as correct.
