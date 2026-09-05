# UniSphere Development Roadmap

UniSphere is a full developer/student platform where users can:
- Learn programming and technical subjects
- Practice coding
- Use a virtual Linux/code environment
- Run code
- Complete challenges
- Take courses and quizzes
- Build projects
- Create portfolios
- Track skills
- Earn achievements
- Compete on leaderboards
- Find internships and jobs
- Communicate with other users
- Receive notifications
- Eventually use AI-powered features

==================================================
CORE DEVELOPMENT RULE
==================================================

Work in phases. For EVERY phase:
1. Inspect the existing implementation.
2. Identify the exact problems.
3. Explain what you found.
4. Make a minimal, maintainable implementation.
5. Run relevant tests.
6. Test the affected frontend/backend functionality.
7. Check for regressions.
8. Only then move to the next phase.

Never assume something is broken without checking it.
Do not silently remove features.
Do not create duplicate systems when an existing system can be improved.
Keep the code readable and production-oriented.

==================================================
PHASE 0 — COMPLETE PROJECT AUDIT ✅ COMPLETED
==================================================

Before changing code, inspect the complete repository.

Inspect:
- server.js, routes, controllers, models, middleware, validators
- Docker runner, lab session management, terminal gateway
- authentication, authorization, database connection, configuration
- error handling, logging, uploads, tests
- Frontend: App, routing, API layer, AuthContext, components, pages
- CodeLab, terminal, courses, challenges, community, messages
- projects, portfolio, jobs/internships, notifications, achievements
- leaderboard, skills, responsive behavior, global CSS
- package.json files, environment configuration, Docker configuration
- Vite configuration, test configuration

==================================================
PHASE 1 — BACKEND CORRECTNESS 🚧 IN PROGRESS
==================================================
✅ Fixed so far:
- Sanitize middleware: stops HTML-escaping code/input (C1)
- Portfolio IDOR: /portfolio/:userId no longer trusts client IDs; hides email for other users
- Strong JWT secret generated; .env.example updated (C5)
- Rate limiting on /code/run + lab creation (H1) with IPv6-safe keyGenerator
- Per-user code execution concurrency limit (S6)
- Package name corrected (M1)

Pending:
- Verify remaining ownership checks (messages, chat, applications)
- Centralized error handling audit (no stack traces in prod)
- MongoDB model/index audit

Fix backend bugs before changing the UI.

1. Authentication
- JWT verification, token expiration, protected routes
- Ownership checks, user ID handling, authorization
- Admin authorization, invalid token handling
- A user must NEVER access another user's lab, files, projects, applications, messages, private data, results, sessions

2. Validation
- Every API accepting user input must validate it
- body, params, query, uploaded files, language, code
- Return proper HTTP status codes and useful errors

3. Error handling
- Do not expose stack traces, MongoDB internals, Docker internals, secrets, environment variables
- Use centralized error handling

4. Database
- Inspect all MongoDB models: indexes, unique constraints, references, timestamps, validation
- No duplicate records, orphan records, unnecessary queries
- Database connection must fail safely

==================================================
PHASE 2 — FIX CODE EXECUTION 🚧 IN PROGRESS
==================================================
✅ Fixed so far:
- /tmp noexec: compiled binaries now go to /run (C2)
- stdin now actually reaches the program via heredoc (C3)
- Docker client timeouts raised (Docker Desktop slow ops)
- Syntax/runtime verification needed for all languages

The code execution system must be treated as an untrusted-code sandbox.

KNOWN ISSUE: The current runner uses /tmp with noexec while compiled C/C++/Rust binaries are placed in /tmp and then executed. This must be corrected.

Verify execution for: Python, JavaScript, Java, C, C++, Rust, Go
Test: normal program, syntax error, runtime error, infinite loop, large output, empty code, invalid language, stdin, timeout, memory limit, process limit

The input parameter must actually reach stdin.

==================================================
PHASE 3 — DOCKER SECURITY 🚧 IN PROGRESS
==================================================
✅ Fixed so far:
- Lab containers: MemorySwap disabled, OomKillDisable false, explicit CpuPeriod
- Terminal shells run as unprivileged user (coder / sandbox uid 10000)
- runCode already: no network, read-only rootfs, no capabilities, tmpfs /run exec

Harden the execution environment.
Each lab container must: run as unprivileged user, drop capabilities, use no-new-privileges, have memory/CPU/PID/time limits, controlled filesystem/networking, never expose Docker socket, prevent privilege escalation.

==================================================
PHASE 4 — REAL TERMINAL SANDBOX 🚧 IN PROGRESS
==================================================
✅ Implemented:
- Per-user workspace boundary: /workspace/<userId> (WorkingDir + HOME)
- Real interactive shell (sh/bash) starts inside the container (no fake parser)
- Terminal always runs as unprivileged user (coder, or sandbox uid 10000)
- Writes outside workspace blocked by OS permissions
- Verified: pwd returns /workspace/<userId>; /etc not writable
Pending:
- Full terminal test suite with live Docker (in progress)

The terminal must be a real interactive shell inside the user's lab container.
Support: pwd, ls, cd, mkdir, touch, cat, echo, rm, cp, mv, editors, compiler commands, Python, shell commands, Ctrl+C, resize, ANSI output, interactive stdin/stdout.

THE USER MUST NOT BE ABLE TO ESCAPE THEIR WORKSPACE.
Implement a real workspace boundary: /workspace/<user> or properly isolated workspace.
Do NOT implement a fake shell by parsing commands.
Prevent traversal outside the intended workspace.

==================================================
PHASE 5 — TERMINAL WEBSOCKET 🚧 IN PROGRESS
==================================================
✅ Audited/tightened:
- Output cap (5MB/connection) + backpressure on saturated sockets
- Auth state machine, session ownership, expiry, rate limiting, resize all verified
Pending:
- Live test suite results (in progress)

Audit terminalGateway.js.
Requirements: authenticated WebSocket, JWT auth, active LabSession verification, session ownership, session expiration, terminal cleanup, resize, connection cleanup, reconnect, input size limits, input rate limiting, output handling, graceful shutdown.
Prevent: unauthenticated shell access, accessing another user's container, random container IDs, expired sessions, keeping terminal alive after session termination.

==================================================
PHASE 6 — LAB SESSION ARCHITECTURE
==================================================

Review LabSession lifecycle:
START LAB → CREATE SESSION → CREATE CONTAINER → CONNECT TERMINAL → USER WORKS → SESSION EXPIRES/USER STOPS → TERMINAL CLOSES → CONTAINER STOPS → CONTAINER REMOVED → SESSION MARKED CLOSED

No abandoned containers. No orphan terminal connections. No orphan sessions.

==================================================
PHASE 7 — CODELAB FRONTEND
==================================================

Fix CodeLab integration. Clearly distinguish: Code Editor, Run Code, Program Input, Output, Virtual Terminal, Lab Session.
UI should show: NO ACTIVE LAB [Start Lab], ACTIVE LAB ● Running [Open Terminal] [Stop Lab], EXPIRED [Start New Lab].

==================================================
PHASE 8 — FRONTEND ARCHITECTURE
==================================================

Audit the React application. Fix: broken routes, incorrect API calls, stale state, missing loading/error states, race conditions, unnecessary requests, bad auth handling, incorrect redirects, inconsistent components.

==================================================
PHASE 9 — COMPLETELY REDESIGN THE UI
==================================================

Create an original UniSphere design language. Modern, professional, technical, clean, slightly futuristic, friendly, premium, developer-focused.
Create: responsive sidebar/navigation, modern top nav, consistent spacing/typography/buttons/inputs/cards/badges/tabs/dropdowns/modals/toasts/skeletons/empty states/error states.
Redesign: Dashboard, Learn, CodeLab, Projects, Portfolio, Challenges, Jobs/Internships, Community, Messages, Achievements/Leaderboard.

==================================================
PHASE 10 — TESTING
==================================================

Create/improve tests for: AUTH, CODE EXECUTION (Python, JS, C, C++, Rust, stdin, timeout, errors, resource limits), LAB (create, ownership, start, stop, expiration, cleanup), TERMINAL (auth, pwd, ls, mkdir, cd, echo, Ctrl+C, resize, reconnect, expiration, cross-user isolation, workspace escape), DATABASE, FRONTEND.

==================================================
PHASE 11 — SECURITY AUDIT
==================================================

Final security review: command injection, path traversal, container escape, privilege escalation, arbitrary file access, unauthorized session access, JWT vulnerabilities, IDOR, NoSQL injection, XSS, rate limiting, file upload vulnerabilities, oversized requests, resource exhaustion, Docker socket exposure, secret leakage.

==================================================
PHASE 12 — PRODUCTION READINESS
==================================================

Verify: frontend production build, no console errors, no broken routes, responsive layouts, configurable API URLs, production environment config, logging, error handling, health endpoint, graceful shutdown, database reconnect, cleanup jobs, Docker resource limits/cleanup/security/networking/filesystem isolation, MongoDB indexes/auth/backups.
