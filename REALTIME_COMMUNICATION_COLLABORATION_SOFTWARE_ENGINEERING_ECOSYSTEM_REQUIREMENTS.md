# UniSphere — Real-Time Communication, Collaboration & Software Engineering Ecosystem Requirements

**Document type:** Product Requirements Expansion
**Status:** Proposed — Documentation and repository analysis only
**Priority:** High
**Instruction:** Documentation only. Do not modify application code, database schemas, dependencies, deployment configuration or existing functionality.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 3 November 2026 | Engineering | Initial expansion proposal |

---

## 0. Executive Summary

UniSphere is expanding from a learning/practice/project platform into a comprehensive ecosystem for real-time communication, software development collaboration, and professional growth.

**Existing Real-Time Infrastructure (verified from codebase inspection):**

- **Direct Messaging**: `/api/v1/chat/` routes with Conversation/Message models — 2-party DMs with auth gating, membership enforcement, message CRUD
- **Community/Discussion**: `/api/v1/community/` routes with Community/Discussion models — public listings, threaded discussions with answers
- **Frontend**: MessagesPage.jsx and CommunityPage.jsx exist; API calls to `/chat/*` and `/community/*`
- **Backend**: Mongoose models, express routes, auth middleware all present

**Critical Gaps Identified:**

- No WebSocket real-time transport (backend uses JWT auth only, long-polling not implemented)
- No group chat beyond 2-party DMs
- No audio/video calling
- No Git/repository integration
- No developer workspace or collaborative code editor
- No issues/PR/project tracking
- No calendar/scheduling system
- No AI engineering assistant
- Terminal has sandbox escape vulnerability (C4 in PHASE0_AUDIT.md)
- Sanitize middleware corrupts code input (C1 in PHASE0_AUDIT.md)
- /tmp noexec issue for compiled binaries (C2 in PHASE0_AUDIT.md)

**This document must:**
- Verify current state (not assume implementation)
- Classify each requirement
- Cross-reference Master PRD
- Provide prioritized roadmap
- Identify security criticalities from existing audit
- Guide future implementation without modifying existing code
# UniSphere — Real-Time Communication, Collaboration & Software Engineering Ecosystem Requirements

**Document type:** Product Requirements Expansion  
**Status:** Proposed — Documentation and repository analysis only  
**Priority:** High  
**Instruction:** Documentation only. Do not modify application code, database schemas, dependencies, deployment configuration or existing functionality.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 3 November 2026 | Engineering | Initial expansion proposal |

---

## 0. Executive Summary

UniSphere is expanding from a learning/practice/project platform into a comprehensive ecosystem for real-time communication, software development collaboration, and professional growth.

**Existing Real-Time Infrastructure (verified from codebase inspection):**

- **Direct Messaging**:  routes with Conversation/Message models — 2-party DMs with auth gating, membership enforcement, message CRUD
- **Community/Discussion**:  routes with Community/Discussion models — public listings, threaded discussions with answers
- **Frontend**: MessagesPage.jsx and CommunityPage.jsx exist; API calls to  and 
- **Backend**: Mongoose models, express routes, auth middleware all present

**Critical Gaps Identified:**

- No WebSocket real-time transport (backend uses JWT auth only, long-polling not implemented)
- No group chat beyond 2-party DMs
- No audio/video calling
- No Git/repository integration
- No developer workspace or collaborative code editor
- No issues/PR/project tracking
- No calendar/scheduling system
- No AI engineering assistant
- Terminal has sandbox escape vulnerability (C4 in PHASE0_AUDIT.md)
- Sanitize middleware corrupts code input (C1 in PHASE0_AUDIT.md)
- /tmp noexec issue for compiled binaries (C2 in PHASE0_AUDIT.md)

**This document must:**
- Verify current state (not assume implementation)
- Classify each requirement
- Cross-reference Master PRD
- Provide prioritized roadmap
- Identify security criticalities from existing audit
- Guide future implementation without modifying existing code

## 1. Unified Real-Time Communication Platform

### 1.1 Direct messaging — Current state: Partial implementation

**Existing (verified from codebase):**

- `/api/v1/chat/conversations` — GET fetch conversations, POST create/fetch DM conversation
- `/api/v1/chat/conversations/:id/messages` — GET fetch messages (limited to 200), POST send message
- `Conversation` model: `participants` (exactly 2 User IDs), `lastMessage`, `lastMessageAt`, `createdBy`
- `Message` model: `conversationId`, `senderId`, `content` (max 2000 chars), `readAt`, timestamps
- Authentication: All routes require `authenticate` middleware
- Authorization: `ensureMembership` checks participant status before operations
- Message format: `{_id, content, fromMe, createdAt}` — `fromMe` flag computed per viewer
- User population: Participants populated as `fullname` only (emails not leaked — C17 audit fix)
- Empty messages rejected at API boundary
- Conversation creation: validates participantId ≠ self, validates target user exists

**Classification: Existing but incomplete**

**Missing features (required for WhatsApp/Instagram/Discord experience):**

- Message replies and threaded conversations
- Message reactions and emojis
- Message editing and deletion
- Message forwarding
- Read receipts and delivery status
- Typing indicators
- Online/offline status and last-seen with privacy controls
- Message search
- Pinned messages
- Message bookmarking
- Conversation archiving
- Block and report functionality
- Multi-device synchronization
- Message history pagination beyond 200 limit
- Group messaging (beyond 2-party DMs)

**Infrastructure blockers (from PHASE0_AUDIT.md):**

- C1: Sanitize middleware HTML-escapes code input — must fix before adding rich messaging
- C4: Terminal sandbox escape — users can `cd /`, read `/etc/passwd`, access environment variables
- No WebSocket implementation — backend has no real-time transport for messaging

**Cross-references to Master PRD:**

- Part II, Section 14 — Identity, Roles and Authorization: DM membership enforcement
- Part II, Section 18 — Data Architecture: Conversation/Message MongoDB schemas
- Part II, Section 20 — Real-Time Architecture: No real-time implementation yet; Socket.IO or WebSockets needed
- Part III, Section 23 — Release Strategy: Chat & Community added in Phase 12/13; real-time is next logical step
- Part V, Section 29 — First Engineering Sprint: Repository audit completed; chat/community backend implemented

### 1.2 Group communication — Current state: Minimal implementation

**Existing:**

- `/api/v1/community/` — Communities and Discussions (broader than 2-party)
- `Community` model: unique slug, members count, category indexes
- `Discussion` model: with answer subdocs, replies
- Public community listings accessible without auth

**Classification: Existing but incomplete for group messaging**

**Missing for Discord-like group experience:**

- True group chats (more than 2 participants)
- Group creation and management UI
- Members, administrators, moderators roles
- Invitations and join requests
- Private vs public group distinction
- Member permissions and role management
- Group announcements
- Pinned messages at group level
- Replies and threads within groups
- File and media sharing in groups
- Group search
- Member removal and banning
- Group reporting and moderation
- Group ownership transfer
- Activity history logging

### 1.3 Discord-inspired servers and channels — Current state: Not implemented

**No server/channel infrastructure exists.**

**Required architecture:**

- **Servers**: Larger communities (programming, college, course, open-source, project, company workspaces)
- **Categories**: Organized channel groupings within servers
- **Channel types**:
  - General text channels
  - Announcement channels (post-only, mod-only)
  - Programming discussion channels
  - Help and support channels
  - Project channels
  - Private team channels
  - Voice channels (future)
  - Event channels

- **Permission systems** at three levels:
  - Server-level: who can create channels, manage members, change settings
  - Category-level: channel visibility, slowmode, NSFW marking
  - Channel-level: who can post, react, pin, manage topics

### 1.4 Social features — Current state: Partial (follow system exists)

**Existing (verified):**

- `Follow` model: follow/unfollow users, following/followers lists
- `DirectoryController`: search by name, filter by skill/availability, leaderboard, skill suggestions
- `Profile` model: headline, bio, skills, location, availability, visibility
- Navbar shows user achievements navigation

**Classification: Existing but incomplete**

**Missing Instagram/Discord social features:**

- User profiles with comprehensive display
- Following and followers lists with pagination
- Posts and media sharing
- Comments and reactions on posts
- Saved posts/bookmarking
- Activity feeds (what friends are doing)
- Community discovery
- Content reporting and moderation
- Developer portfolios integration
- Project showcases linkage
- Sharing learning achievements
- Stories or temporary updates (future option)
- Privacy settings and user-controlled visibility
SCRIPTEND
## 2. Audio and Video Calling Platform

**Current state: Not implemented**

### 2.1 Basic calling functionality

- One-to-one audio calls
- One-to-one video calls
- Group audio calls
- Group video meetings
- Incoming and outgoing call notifications
- Accept, reject and end calls
- Microphone and camera controls
- Speaker selection where supported
- Screen sharing

### 2.2 Professional meeting functionality

For recruiters, HR, interviewers, mentors and organizations:

- Schedule interviews
- Schedule meetings
- Invite candidates and team members
- Calendar integration
- Meeting descriptions and agendas
- Interview rooms
- Candidate waiting rooms
- Interviewer permissions
- Private interview notes
- Post-interview feedback
- Meeting reminders
- Meeting attendance records

Recording must be optional, permission-controlled and supported by explicit participant consent and appropriate retention policies.

### 2.3 Technical investigation

Evaluate:

- WebRTC
- STUN and TURN servers
- Signaling infrastructure
- Socket-based signaling
- Group meeting architecture
- Media server options such as SFU architecture
- Network reliability
- Bandwidth management
- Mobile and browser compatibility

Do not assume peer-to-peer connections alone will be sufficient for large group calls.
SCRIPTEND
## 3. GitHub-Inspired Software Development Workspace

**Current state: Not implemented** (beyond basic project catalog)

### 3.1 Project repositories — verification required

Investigate a repository-management system with:

- Project repositories
- Public and private repositories
- Repository ownership
- Project members and permissions
- Source code management
- Git integration
- Branches and commits
- Commit history
- File browser
- README support
- Repository documentation
- Releases and version tags
- Repository search
- Repository visibility and access control

**Investigate whether UniSphere should host Git repositories itself or integrate with existing Git providers such as GitHub and GitLab.**

Do not assume that implementing Git hosting is necessary for the first release.

### 3.2 Issues and project tracking

- Issues and bug reports
- Feature requests
- Labels and priorities
- Assignees
- Milestones
- Due dates
- Issue discussions
- Project boards
- Kanban workflows
- Task dependencies
- Project timelines
- Sprint planning
- Activity history

### 3.3 Pull requests and code reviews

- Pull requests
- Code comparisons
- Review comments
- Inline code discussions
- Approval workflows
- Change requests
- Merge history
- Reviewer assignment
- Branch protection
- Review notifications

### 3.4 CI/CD and development automation

Investigate:

- Automated testing
- Build pipelines
- Deployment integrations
- GitHub Actions integration
- Webhook-based workflows
- Build logs
- Deployment status
- Environment management
- Secret management
- Artifact storage

Never expose environment secrets or execute untrusted workflows on the main application infrastructure.
SCRIPTEND
## 4. Collaborative Development Tools

**Current state: Partially — terminal exists but with critical vulnerabilities**

### 4.1 Terminal — verified but critical issues

From PHASE0_AUDIT.md:

- **C4**: Terminal has no workspace boundary — users can `cd /`, read `/etc/passwd`, access environment variables, explore entire container filesystem
- **C3**: No stdin support in code execution — programs reading from stdin hang or fail
- **C2**: /tmp mounted noexec — C, C++, and Rust code compiles to `/tmp/main` but then tries to execute `/tmp/main`. But the HostConfig mounts `/tmp` with `noexec`: `Tmpfs: { '/tmp': 'rw,noexec,size=10m' }`. This prevents any binary from executing in /tmp.

**Current implementation**: `utils/terminalGateway.js` and `utils/dockerRunner.js` exist but have the above critical issues.

**Required fixes BEFORE collaborative features:**

1. Fix /tmp noexec — either remove noexec from /tmp tmpfs or compile AND run in a different directory that is not noexec (e.g., `/home/coder/workspace` or `/run`). Option (b) is more secure — keep /tmp noexec but write binaries elsewhere.
2. Add stdin support to code execution — use Docker exec with attached stdin to write the input to the process, or pass input via a file or environment variable, or use `container.attach()` with stdin.
3. Restrict terminal to workspace directory (`/home/coder`), implement chroot or filesystem permissions to prevent users from running `cd /`, `cd /etc`, etc.
4. Implement session ownership verification — ensure a user can only access their own active lab sessions.
5. Add terminal cleanup and reconnect support — no abandoned containers, no orphan terminal connections.

### 4.2 Collaborative code editor — not implemented

If investigating technologies:

- WebSocket-based collaborative editing
- CRDT (Conflict-free Replicated Data Types) or Operational Transformation
- Shared terminals with proper isolation
- Shared development sessions
- Pair programming features
- Code execution in isolated environments
- Debugging support
- Screen sharing

### 4.3 Project workspaces — not implemented

- Per-project isolated environments
- Team task management
- Code review assistance
SCRIPTEND
## 5. Developer Productivity Toolkit

**Current state: Partial — some tools exist, many gaps**

### 5.1 Programming tools — verification needed

Investigate what actually exists (do not assume):

- Online code editor
- Multi-language compiler and interpreter
- Coding challenges
- Debugging environment
- Code formatting
- Syntax highlighting
- Test runners
- Package and dependency information
- Code explanation
- AI-assisted development

### 5.2 Database tools — verification needed

- SQL playground
- Database schema viewer
- Query editor
- Query execution
- MongoDB playground
- Database design tools
- ER diagrams
- Database documentation

### 5.3 API development tools — verification needed

- REST API client
- API request builder
- API response viewer
- API documentation
- OpenAPI support
- Authentication testing
- API collections
- Webhook testing

### 5.4 Engineering tools — verification needed

- Git learning and visualization
- Linux terminal labs
- Docker learning labs
- Networking tools
- System design exercises
- UML diagrams
- Architecture diagrams
- Markdown editor
- Technical documentation workspace

### 5.5 Developer portfolio — partial (exists but limited)

- `Portfolio.jsx` frontend component exists
- `Project` model exists with milestones, submissions
- Project submissions via GitHub links or demo URLs
- **Missing**: Verified achievements integration, technology stack display, contributions tracking, certifications, resume/profile linkage
## 6. Professional Communication and Organization Workspaces

**Current state: Partial — admin workspace exists, recruiter workflow limited**

### 6.1 Organization workspace — partial

- Admin workspace exists (`adminRoutes.js`, `adminController.js`)
- Company verification not implemented (see COMPANY_VERIFICATION document)
- Organization member management not implemented

**Required:**

- Organization profile with verified identity
- Organization members management
- Department or team management
- Internal channels (text, voice)
- Private conversations within organization
- Team announcements
- File sharing with access controls
- Meeting scheduling
- Calendar
- Tasks and assignments
- Project collaboration tools
- Audit history logging

### 6.2 Recruitment communication — limited

- Job posting exists (`companyRoutes.js`, `companyController.js`)
- Candidate search exists (`searchCandidates` in companyController)
- Application workflow exists (`applicationRoutes.js`)

**Missing:**

- Recruiter-to-candidate messaging (beyond job application)
- Interviewer-to-candidate communication
- Interview scheduling functionality
- Interview invitations with links
- Meeting rooms for interviews
- Candidate waiting rooms
- Interviewer permissions control
- Private interviewer notes
- Post-interview feedback workflow
- Meeting reminders
- Meeting attendance records

**Professional messaging must respect user privacy and prevent unauthorized access to candidate information** (C17 audit fix: emails already stripped from follow lists and discussions).
SCRIPTEND
## 7. Calendar, Scheduling and Notifications

**Current state: not implemented**

- Personal calendar
- Team calendar
- Organization calendar
- Interview scheduling
- Meeting scheduling
- Project deadlines
- Learning schedules
- Assignment deadlines
- Reminders
- Event invitations
- RSVP
- Time-zone support
- Notification preferences
- Email and in-app notifications
- Push notifications
- Notification history
SCRIPTEND
## 8. AI-Powered Software Engineering Assistant

**Current state: AI gateway not yet architected** (see COMPANY_VERIFICATION document AI section)

**Investigate:**

- AI programming tutor
- Code explanation
- Code debugging assistance
- Error diagnosis
- Code review assistance
- Code generation
- Test generation
- Documentation generation
- Repository understanding
- Project planning
- Architecture recommendations
- Database schema assistance
- API design assistance
- Pull request summaries
- Issue analysis
- Learning recommendations
- Interview preparation
- Technical interview practice
- System design tutoring
- Personalized developer roadmap

**Critical constraints:**

- AI must respect repository permissions
- AI must respect organization boundaries
- AI must respect private conversation data access policies
- AI features must use shared AI gateway (ADR-007 from Master PRD)
- Provider independence required (no direct model dependency)
- Context management with authorized only data (AI-003 from Master PRD)
- Output validation required (AI-007 from Master PRD)
- Human review for consequential decisions (AI-008 from Master PRD)
SCRIPTEND
## 9. Security and Privacy Requirements

**Critical: Document from audit findings and existing gaps:**

### 9.1 Messaging security

- End-to-end encryption feasibility: **Must verify architecture supports it** — do not claim without genuine support
- Encryption in transit: **HTTPS recommended** — verify TLS config on deployment
- Encryption at rest: **MongoDB field-level encryption or cloud provider** — currently passwords only hashed bcrypt
- Secure session management: **JWT-based** — session revocation not implemented
- Device and session management: **Not implemented** — no way to view/logout other sessions
- MFA and passkeys: **Not implemented**

### 9.2 Authorization and isolation

- Role-based and resource-level permissions: **Partial** — route-level exists; resource-level needs audit
- Organization isolation: **Not implemented** — no org separation beyond company role
- Private channel permissions: **Partial** — DM conversation membership checked, group channels not designed
- Secure file storage: **`uploads/` directory** — needs verification if outside public web tree
- Malware scanning: **Not implemented**
- Rate limiting: **Exists** in `middlewares/rateLimiters.js` — scope may need expansion
- Spam prevention: **Not implemented**
- Message abuse detection: **Not implemented**
- Account blocking and reporting: **Partial** — need to verify if implemented beyond concept
- Secure WebRTC signaling: **Not implemented** (no video calling)
- Call access authorization: **Not implemented** (no video calling)
- Meeting privacy: **Not implemented** (no video calling)
- Recording consent: **Not implemented** (no video recording)
- Secure Git repository access: **Not implemented**
- Secret management: **`.env.example` exists** — rotation procedure not documented
- Audit logs: **Partial** — error handler gates stack traces on development mode only
- Data retention and deletion: **Not implemented**
- Account recovery: **Partial** — password reset flow exists
- Moderation and abuse response: **Not implemented**

### 9.3 Critical PHASE0_AUDIT issues that block real-time features

**Must fix before implementing real-time communication:**

1. **C1: Sanitize middleware corrupts code input** — HTML-escapes ALL string values, breaking rich text, code, emoji in messaging. Fix: remove HTML-escaping from global sanitize; keep NoSQL injection protection selectively.

2. **C2: /tmp noexec for compiled binaries** — C, C++/Rust code always fails. Fix: relocate compile output or remove noexec from /tmp tmpfs (option b more secure).

3. **C4: Terminal workspace escape** — Users can browse entire container filesystem, read secrets. Fix: restrict to /home/coder, implement chroot or filesystem permissions.

4. **C3: No stdin support** — Code execution doesn't pass input parameter. Fix: attach stdin via Docker exec or file/env variable passing.

These 4 issues are **blockers** for any collaborative development, terminal, or code execution features.

### 9.4 Data privacy

- Avoid storing unnecessary personal information: **In progress** but review needed
- Establish privacy and consent workflows: **Not implemented**
- Secure backup and recovery procedures: **Not documented**
- Keep audit records for sensitive access: **Partial** — error handler only
SCRIPTEND
## 10. Unified User Experience

**Current state: coherent learning experience emerging, communication fragmented**

**Design principles (from Master PRD Part II, Section 13):**

- Shared navigation and component library
- Feature-based component organization
- Role-aware navigation
- Server-side permission enforcement (frontend hiding ≠ authorization)
- Consistent API client
- Central error handling
- Loading, empty and failure states
- Responsive layouts
- Reusable forms and validation

**Required unified experience:**

- One account and identity (verified from codebase: JWT auth with User model)
- One user profile (Profile model exists with basic fields)
- Unified notifications (partial — need to verify implementation completeness)
- Unified search (directory search exists; extend to messages, projects, communities)
- Unified navigation (Navbar.jsx exists with role-aware dropdowns)
- Shared design system (UI.jsx has reusable components; extend consistently)
- Role-aware workspaces (exists for learning/practice/projects/admin; extend to comms/dev)
- Permission-aware interfaces (authMiddleware exists; ensure consistent)
- Responsive web experience (need to verify mobile/tablet breakpoints)
- Mobile experience (Expo/React Native direction per Master PRD — need to verify)
- Consistent communication across features (currently: learning ✓, practice ✓, projects ✓, communication ✗ partial)

**Avoid turning UniSphere into disconnected applications** — the user should move naturally between learning, coding, projects, communication, professional networking and career opportunities.
SCRIPTEND
## 11. Architecture and Scalability Investigation

**Current architecture (verified):**

- Backend: Express 5 + MongoDB (Mongoose 9) + Dockerode (Docker API) + WebSocket (ws) + JWT auth
- Frontend: React 19 + Vite 8 + xterm.js (terminal) + custom hash-based router
- Package: CommonJS backend, ESM frontend
- Key infrastructure: server.js, app.js, routes/index.js, utils/dockerRunner.js, utils/terminalGateway.js
- 24 controllers, 24 Mongoose models, 9 middlewares

**Investigate (do not prematurely commit):**

- WebSockets / Socket.IO: For real-time messaging, presence, group channels
- Redis: For presence tracking and distributed messaging
- Message queues: For background job processing
- Object storage: For file uploads (S3-compatible)
- Search infrastructure: For repository, message, content search
- Git provider integrations: GitHub/GitLab API integration vs. self-hosted Git
- CRDT or Operational Transformation: For collaborative code editing
- SFU media servers: For group audio/video (Jitsi, Daily.co, Agora)
- Isolated code execution: Docker-based (currently has C1-C4 issues)
- Observability and monitoring: Structured logs, request IDs, metrics

**Phased architecture plan (from Master PRD Part III, Section 24):**

- Phase 1: Modular monolith (current) — keep everything in one process
- Phase 2: Introduce background workers for long-running operations
- Phase 3: Add real-time infrastructure (Socket.IO, Redis for presence)
- Phase 4: Consider microservices for scaling (Git hosting, media processing)
- Phase 5: Scale AI infrastructure separately

**Maintain modular architecture** and identify which capabilities belong in the initial modular monolith and which may need separate infrastructure or services later.
SCRIPTEND

## 12. Product Scope and Prioritization

**Classify all capabilities:**

### 1. Existing and verified implementation ✅

- User authentication and authorization (JWT + bcrypt)
- Course learning management (CRUD, enrollment, progress)
- Practice challenges with code execution (Docker-based, has C1-C4 issues)
- Project portfolio (create, submit, review)
- Basic community discussions (Q&A format)
- Direct messaging DMs (2-party, backend API implemented)
- Subscription/Free-Pro-Company tiers
- Admin examination workflow (exams, hall tickets, grading)
- Profile system with skills and bio
- Follow system (follow/unfollow users)

### 2. Existing but incomplete ⚠️

- Direct messaging: 2-party API implemented, missing rich features (reactions, search, typing, multi-device)
- Community discussions: Q&A implemented, missing threads, reactions, media, group management
- Portfolio: Basic project submission, missing portfolio curation, verified achievements
- Calendar/scheduling: Not implemented
- Audio/video calling: Not implemented
- Git/repository integration: Not implemented
- AI assistant: Not implemented (gateway not architected)
- Real-time WebSocket transport: Not implemented
- Organization verification: Not implemented (see COMPANY_VERIFICATION document)
- MFA/passkeys: Not implemented

### 3. MVP requirements 🎯 (Phase 1-2)

- WebSocket real-time transport for messaging
- Group messaging (server + channel architecture)
- Typing indicators and read receipts
- Message reactions and editing
- Search across messages, projects, communities
- Basic audio calling (1-on-1 via WebRTC)
- Presence awareness (online/offline status)
- Notification system (in-app, configurable)
- Organization basic workspace (members, channels)
- Developer basic workspace (repo browsing without Git hosting)
- AI assistant with gateway (provider-independent, context-limited)

### 4. Post-MVP requirements 📈 (Phase 3-4)

- Group video calling (SFU architecture)
- Collaborative code editor (CRDT/OT)
- Git repository hosting or deep GitHub/GitLab integration
- CI/CD pipeline integrations
- Advanced AI coding features (code gen, review)
- Comprehensive organization workspaces
- Calendar and scheduling system
- Advanced moderation tools
- Mobile applications (Expo/React Native)

### 5. Long-term platform vision 🌟 (Phase 5-6)

- Metaverse-style virtual collaboration spaces
- AI pair programming with full context
- Decentralized identity (Web3)
- Plugin ecosystem
- Global infrastructure scaling
- Advanced analytics and insights

### 6. Research and architecture decisions required 🔍

- Real-time transport: Socket.IO (fallback to long-polling) vs. custom WebSocket vs. third-party (Ably, Pusher)
- Video conferencing: Self-hosted SFU (Janus, Jitsi) vs. third-party API (Daily.co, Agora, Twilio) vs. P2P WebRTC
- Git strategy: Self-hosted GitLab vs. GitHub integration vs. hosting own repos
- AI provider strategy: Provider-agnostic gateway (more complex, flexible) vs. opinionated defaults (simpler, vendor lock-in)
- Encryption strategy: End-to-end possible with double ratchet (high security, complexity) vs. transit-only TLS (simpler, less privacy)
- Collaborative editing technology: CRDT library (Yjs, Yersonal) vs. Operational Transformation vs. custom solution
- Data retention for messages/calls: Compliance (GDPR, local laws) impact
- Message encryption: End-to-end vs. server-accessible
- Mobile strategy: Responsive web vs. separate Expo/React Native apps vs. progressive web app
- Modular monolith vs. microservices boundary: When to split real-time service from main API
- Presence tracking: Redis pub/sub vs. database polling vs. third-party service
- Notification delivery: In-app only vs. email + push vs. third-party service (FCM/APNs)
## 13. Required Documentation Deliverables

**For each feature, document:**

1. **Problem and user value** — What user need does this solve?
2. **Target users** — Learner, developer, educator, mentor, recruiter, administrator
3. **User stories** — As a [role], I want to [action], so that [benefit]
4. **Functional requirements** — Specific capabilities
5. **Non-functional requirements** — Performance, scalability, security
6. **Permissions and security** — RBAC, resource-level checks, data access
7. **Data requirements** — MongoDB collections, fields, indexes
8. **API and event requirements** — Endpoints, WebSocket events, payload schemas
9. **Dependencies** — External services, packages, infrastructure
10. **Acceptance criteria** — Testable definitions of done
11. **MVP versus future scope** — What for first release vs. later
12. **Risks and unresolved decisions** — Technical, security, product risks

**Specific deliverables list:**

1. **Real-Time Messaging PRD** — DM rich features, group messaging architecture
2. **Group and Server Communication PRD** — Server/channel model, permission systems
3. **Audio and Video Calling PRD** — WebRTC evaluation, signaling architecture
4. **Professional Communication and Interview Workflow PRD** — Scheduling, interview rooms, feedback
5. **Developer Workspace PRD** — Repo browsing, Git integration decision, collaborative tools
6. **Git and Repository Integration Architecture** — Self-hosted vs. provider-integrated, security
7. **Collaborative Development PRD** — Code editor, terminals, pair programming, isolation
8. **Developer Productivity Toolkit PRD** — Database tools, API tools, portfolio
9. **Organization Workspace PRD** — Orgs, teams, channels, announcements, audit
10. **Calendar and Scheduling PRD** — Personal/team/org, time-zones, reminders, notifications
11. **AI Software Engineering Assistant PRD** — Tutor, code help, generation, permissions, review
12. **Real-Time Infrastructure Architecture** — Socket.IO, Redis, presence, media servers
13. **Communication Security and Privacy Requirements** — Encryption, authentication, moderation, audit
14. **Unified Navigation and User Experience Requirements** — Role-aware, consistent, responsive
15. **Product Roadmap and Feature Prioritization** — Phased roadmap, dependency map
16. **Technical Risk Register** — C1-C4 audit issues, infrastructure dependencies, security risks
17. **Open Questions and Architecture Decisions** — Git strategy, AI provider, encryption, transport
SCRIPTEND
- Audit and compliance: What logging is required for GDPR, regional laws?
## 14. Implementation Phasing and Priority

**Proposed sequence (from Master PRD Part III, Section 24), adjusted for repository reality:**

### Phase 0 — Complete (DONE):
- Repository audit (PHASE0_AUDIT.md)
- Current-to-target architecture mapping
- Security critical fixes identification (C1-C4)

### Phase 1 — Foundation (Weeks 1-4):
- Fix C1: Sanitize middleware — remove HTML-escaping, keep NoSQL protection
- Fix C2: /tmp noexec — relocate compile output or remove noexec
- Fix C4: Terminal workspace escape — restrict to /home/coder, add ownership checks
- Implement WebSocket transport via Socket.IO for real-time
- Basic typing indicators and read receipts in chat
- Message search across conversations
- Notification system (in-app)

### Phase 2 — Group Communication (Weeks 5-8):
- Group DM/chat beyond 2-party
- Server/channel architecture (Discord-inspired)
- Member roles (admin, moderator, member)
- Group creation and management
- Pinned messages and announcements
- Member removal and banning

### Phase 3 — Audio/Video Calling (Weeks 9-12):
- 1-on-1 audio/video via WebRTC
- Evaluate SFU vs. third-party service
- Meeting scheduling integration
- Professional interview workflows
- Waiting rooms and permissions

### Phase 4 — Developer Workspace (Weeks 13-16):
- Repository browsing (GitHub/GitLab API integration decision)
- Git integration (lightweight, no self-hosting initially)
- Project search and discovery
- Basic project metrics

### Phase 5 — AI Assistant (Weeks 17-20):
- AI gateway implementation (provider-independent)
- Context management with authorization
- Code explanation and debugging assistance
- Output validation and human review
- Limited AI features within permission bounds

### Phase 6 — Organization & Calendar (Weeks 21-24):
- Organization workspace with verified identity
- Calendar and scheduling system
- Recruiter-candidate communication workflows
- Notification preferences and management

### Phase 7 — Polish and Scale (Weeks 25+):
- Mobile experience (Expo/React Native)
- Advanced moderation and abuse tools
- Performance optimization
- Scaling infrastructure
- Ecosystem integrations

## 15. Technical Risk Register

**High Risk (must address before expansion):**

| Risk | Description | Mitigation |
|------|-------------|-----------|
| C1: Sanitize middleware | HTML-escaping corrupts code and rich text input | Fix global sanitize; handle XSS at frontend |
| C2: /tmp noexec | Compiled binaries cannot execute | Relocate compile output or remove noexec |
| C4: Terminal escape | Users can access host filesystem | Restrict to workspace, add chroot/permissions |
| C3: No stdin | Code execution hangs on input-dependent programs | Attach stdin via Docker exec/env |

**Medium Risk:**

| Risk | Description | Mitigation |
|------|-------------|-----------|
| WebRTC complexity | Browser compatibility, signaling, STUN/TURN | Evaluate third-party service for MVP |
| AI cost growth | Token usage, model pricing unpredictable | Quotas, caching, usage monitoring (ADR-007) |
| Scope creep | Adding features without boundary enforcement | Phase roadmap, MVP first |
| Real-time scaling | WebSocket connection management, load balancing | Redis presence, horizontal pod autoscaling |
| Data privacy compliance | GDPR, regional laws for messaging/calls | Privacy by design, consent workflows |

**Low Risk:**

| Risk | Description | Mitigation |
|------|-------------|-----------|
| Third-party API changes | Git/GitLab/ Daily.co API changes | Abstract behind adapters, monitor changelogs |
| Dependency vulnerabilities | Packages with known CVEs | Regular `npm audit`, dependency updates |
| Browser compatibility | New WebRTC features not in old browsers | Feature detection, fallbacks, browser support policy |
SCRIPTEND
## 16. Summary and Final Instructions

**This document represents the comprehensive expansion requirements for UniSphere into real-time communication, software development collaboration, and professional ecosystem.**

**Key findings from repository inspection:**

✅ **Existing and verified:** Authentication, course learning, practice challenges, project portfolio, basic community discussions, 2-party DMs, subscription tiers, admin examination workflow, profile/follow system

⚠️ **Existing but incomplete:** Rich messaging features, group chat, portfolio curation, search extensibility

❌ **Not implemented:** Audio/video calling, Git/repository integration, AI assistant, real-time WebSocket, organization verification, calendar/scheduling, collaborative code editor

🚫 **Critical blockers (from PHASE0_AUDIT.md):** C1 (sanitize middleware), C2 (/tmp noexec), C4 (terminal escape) — must fix before any collaborative development features

**Mandatory restrictions (from instructions):**

- ✅ Documentation and repository analysis only
- ✅ Do not modify application code
- ✅ Do not change database schemas
- ✅ Do not install packages
- ✅ Do not change deployment configuration
- ✅ Do not delete or rewrite existing modules
- ✅ Preserve working functionality
- ✅ Verify incomplete functionality before building on it
- ✅ Introduce new architecture incrementally, not by rewriting

**Final delivery principle (from Master PRD Part III, Section 31):**

"UniSphere should help people move from learning something to being able to do something meaningful with it."

**This expansion enables:** moving from learning → practicing → building → **collaborating** → **connecting** → **growing** careers.

**The guiding principle remains: UniSphere should help people move from learning something to being able to do something meaningful with it — now including collaborating with others and discovering professional opportunities through a unified, secure, scalable platform.**
SCRIPTEND
**These are proposed phases, not final commitments. Recommend changes based on repository reality, complexity, security and user value.**