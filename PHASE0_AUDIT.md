# Phase 0 — Complete Project Audit

## Architecture Summary

**Backend**: Express 5 + MongoDB (Mongoose 9) + Dockerode (Docker API) + WebSocket (ws) + JWT auth
**Frontend**: React 19 + Vite 8 + xterm.js (terminal) + custom hash-based router
**Testing**: Jest 30 + Supertest (real MongoDB connection, no mock server)
**Package**: CommonJS backend, ESM frontend

**Key infrastructure**:
- `server.js` — entry point, connects DB, loads courses, starts HTTP + WebSocket
- `app.js` — Express app with helmet, cors, rate limiting, sessions, sanitization, error handling
- `routes/index.js` — all routes mounted under `/api/v1`
- `utils/dockerRunner.js` — Docker container management for code execution and lab sessions
- `utils/terminalGateway.js` — WebSocket gateway for real-time terminal
- `controllers/` — 24 controllers handling all business logic
- `models/` — 24 Mongoose models
- `middlewares/` — auth, sanitize, errorHandler, planGate, upload, validateRequest

---

## CRITICAL Issues

### C1: Sanitize middleware corrupts code input
**File**: `middlewares/sanitize.js`
**Problem**: The global sanitize middleware HTML-escapes ALL string values in `req.body`, `req.query`, and `req.params`. This means when a user submits code like `if (a < b)` or `print("hello")`, the code becomes `if (a &lt; b)` and `print(&quot;hello&quot;)` BEFORE it reaches the controller. This breaks ALL code containing `<`, `>`, `"`, or `'` characters.
**Impact**: Code execution is broken for any code with comparison operators, strings, or HTML-like syntax.
**Fix**: Remove HTML-escaping from global sanitize. For a JSON API, XSS prevention should happen at render time (frontend), not at the API input layer. The NoSQL injection protection (`$` and `.` key stripping) should be kept.

### C2: /tmp mounted noexec but compiled binaries execute from /tmp
**File**: `utils/dockerRunner.js` lines 84-85, 106
**Problem**: C, C++, and Rust code compiles to `/tmp/main` and then tries to execute `/tmp/main`. But the HostConfig mounts `/tmp` with `noexec`: `Tmpfs: { '/tmp': 'rw,noexec,size=10m' }`. This prevents any binary from executing in /tmp.
**Impact**: C, C++, and Rust code execution always fails with "Permission denied" when trying to run the compiled binary.
**Fix**: Either (a) remove `noexec` from /tmp tmpfs, or (b) compile AND run in a different directory that is not noexec (e.g., `/home/coder/workspace` or `/run`). Option (b) is more secure — keep /tmp noexec but write binaries elsewhere.

### C3: No stdin support in code execution
**File**: `utils/dockerRunner.js` `runCode()`, `controllers/codeLabController.js`
**Problem**: The controller accepts `input` from request body and passes it to `dockerRunner.runCode({ language, code, input })`, but `runCode()` never uses the `input` parameter. The container is created with a Cmd that writes code to a file and runs it, but stdin is never attached.
**Impact**: Programs that read from stdin (e.g., `input()` in Python, `scanf` in C, `process.stdin` in Node.js) will hang or fail.
**Fix**: Use Docker exec with attached stdin to write the input to the process, or pass input via a file or environment variable, or use `container.attach()` with stdin.

### C4: Terminal has no workspace boundary
**File**: `utils/terminalGateway.js`, `utils/dockerRunner.js` `createTerminalExec()`
**Problem**: The terminal starts a shell in `/home/coder` (for code-server) but there is NO restriction preventing the user from running `cd /`, `cd /etc`, `cd /var`, `cd /tmp`, etc. The user can browse the entire container filesystem, read /etc/passwd, inspect environment variables (potentially containing secrets), and access other system files.
**Impact**: Users can explore the container filesystem, potentially find sensitive information, or interfere with the container's operation.
**Fix**: Use `chroot` or Linux namespaces, or set the container's working directory with a restricted shell (rbash), or use `docker exec` with a custom entrypoint that restricts navigation. The most robust approach is to combine: (1) a restricted shell or chroot, (2) running as unprivileged user, (3) dropping capabilities, (4) read-only root filesystem with only the workspace writable.

### C5: JWT secret is weak and potentially exposed
**File**: `.env` line 4
**Problem**: The JWT secret is `unisphere_super_secret_jwt_key_in_2026_edited_UniSphere_CEO_Hussain` — a predictable, human-readable string. While `.env` is in `.gitignore`, this secret is hardcoded in the committed `.env` file and could be leaked.
**Impact**: If the secret is leaked, anyone can forge JWTs and impersonate any user including admins.
**Fix**: Generate a cryptographically random secret (at least 64 bytes). Add `.env.example` with placeholder values. Ensure `.env` is never committed.

---

## HIGH Issues

### H1: No rate limiting on code execution endpoint
**File**: `controllers/codeLabController.js`
**Problem**: There is a global rate limiter (100 requests per 15 min per IP) but no specific rate limit on `/code/run`. A user could spam code execution requests within the global limit.
**Impact**: Resource exhaustion, potential DoS.
**Fix**: Add a specific rate limiter for the code execution endpoint (e.g., 30 runs per minute per user).

### H2: Expired lab sessions are never cleaned up
**File**: `controllers/labSessionController.js` `cleanupExpiredSessions()`
**Problem**: The `cleanupExpiredSessions()` function exists but is never called. There is no cron job, no interval, no scheduler. Expired sessions will remain in the database forever, and their Docker containers will keep running until the server restarts.
**Impact**: Resource leak — orphaned Docker containers consuming memory and CPU indefinitely.
**Fix**: Add a periodic cleanup job (e.g., every 60 seconds) that calls `cleanupExpiredSessions()`.

### H3: Docker Desktop socket path hardcoded
**File**: `.env` line 17
**Problem**: `DOCKER_HOST=unix:///home/arc/.docker/desktop/docker.sock` — this is a Docker Desktop socket path specific to the developer's machine. It won't exist on a production server or CI environment.
**Impact**: The application won't work in production or on other machines.
**Fix**: Make this configurable with a sensible default (standard Docker socket at `/var/run/docker.sock`). Document the requirement.

### H4: No memory limit enforcement on code execution containers
**File**: `utils/dockerRunner.js` `runCode()`
**Problem**: While `Memory` is set, there is no `MemorySwap` limit, meaning containers can use unlimited swap. Also, `CpuQuota: 50000` is 50% of one CPU — reasonable but could be tighter.
**Impact**: A memory-intensive program could consume host resources via swap.
**Fix**: Set `MemorySwap` equal to `Memory` to disable swap. Consider lowering CpuQuota.

### H5: Terminal exec doesn't set WorkingDir for desktop sessions
**File**: `utils/dockerRunner.js` `createTerminalExec()`
**Problem**: For non-code-server (desktop) sessions, `execOptions.WorkingDir` is not set. The shell may start in `/` or the image's default working directory, not in a user workspace.
**Impact**: Desktop terminal users start in an unexpected directory.
**Fix**: Set a consistent WorkingDir for all session types.

---

## MEDIUM Issues

### M1: Package.json name is outdated
**File**: `package.json` line 2
**Problem**: `"name": "unisphere-exam-jobs-api"` — doesn't reflect the full platform.
**Fix**: Rename to `unisphere`.

### M2: No graceful shutdown
**File**: `server.js`
**Problem**: On unhandled rejection, `server.close()` is called but there's no connection draining, no WebSocket cleanup, no database disconnect.
**Impact**: In-flight requests may be terminated abruptly.
**Fix**: Implement graceful shutdown with connection draining and cleanup.

### M3: Session expiry uses in-memory setTimeout
**File**: `utils/terminalGateway.js`
**Problem**: Terminal TTL is tracked via `setTimeout`. If the server restarts, all timers are lost and terminals/sessions may be orphaned.
**Impact**: After server restart, expired sessions won't be cleaned up until `cleanupExpiredSessions()` runs.
**Fix**: Use a periodic cleanup job that checks database for expired sessions.

### M4: No output size limit on terminal
**File**: `utils/terminalGateway.js`
**Problem**: There's `MAX_INPUT_FRAME` for input but no limit on output. A program that produces massive output could overwhelm the WebSocket and client.
**Impact**: Client memory exhaustion, potential DoS.
**Fix**: Add output rate limiting or truncation.

### M5: Lab session model missing indexes for cleanup
**File**: `models/LabSession.js`
**Problem**: While `expiresAt` is indexed, the cleanup query filters on `{ status: STATUS_ACTIVE, expiresAt: { $lt: new Date() } }`. A compound index on `{ status: 1, expiresAt: 1 }` would be more efficient.
**Performance**: Cleanup query could be slow with many sessions.
**Fix**: Add compound index.

---

## LOW Issues

### L1: No health check for Docker connectivity
**File**: `app.js`
**Problem**: The `/health` endpoint doesn't check if Docker is reachable.
**Fix**: Add Docker ping to health check.

### L2: No request ID for tracing
**Problem**: No correlation ID for tracking requests across logs.
**Fix**: Add request ID middleware.

### L3: CodeLab frontend doesn't show lab state
**File**: `Frontend/src/pages/code/CodeLab.jsx`
**Problem**: The CodeLab page shows a terminal sidebar but doesn't clearly indicate whether a lab session is active, expired, or not started. The VirtualTerminal component handles this internally but the main CodeLab UI doesn't reflect lab status.
**Fix**: Add lab state indicator to CodeLab page.

### L4: No loading states on many frontend pages
**Problem**: Many pages don't show loading spinners while fetching data.
**Fix**: Add loading states consistently.

---

## UI/UX Issues

### U1: Basic admin dashboard appearance
**Problem**: The current UI uses a simple card-based layout that looks like a generic admin dashboard, not a modern developer platform.
**Fix**: Phase 9 will redesign the entire UI.

### U2: Inconsistent component patterns
**Problem**: Some pages use different patterns for similar functionality (e.g., different card layouts, different button styles).
**Fix**: Create reusable component library in Phase 9.

### U3: Limited responsive design
**Problem**: The CodeLab layout may not work well on mobile devices.
**Fix**: Improve responsive behavior in Phase 9.

---

## Security Vulnerabilities

### S1: Sanitize middleware breaks functionality (CRITICAL)
See C1 above.

### C2: /tmp noexec bypass needed (CRITICAL)
See C2 above.

### S3: No workspace isolation in terminal (CRITICAL)
See C4 above.

### S4: JWT secret weakness (CRITICAL)
See C5 above.

### S5: No CSRF protection for state-changing operations
**Problem**: While JWT is used, there's no CSRF token for cookie-based auth. The `sameSite: 'lax'` cookie setting provides some protection but not complete.
**Impact**: Potential CSRF attacks if the API is used with cookie auth from a browser.
**Fix**: Use `sameSite: 'strict'` or implement CSRF tokens.

### S6: No input size limit on code execution
**Problem**: Code is limited to 50000 chars (good), but there's no limit on the number of concurrent executions per user beyond the global concurrency limit.
**Impact**: A single user could monopolize the execution queue.
**Fix**: Add per-user concurrency limit.

---

## Recommended Implementation Order

✅ COMPLETED IN AUDIT ITERATION:
1. **C1** — Fix sanitize middleware (HTML-escaping removed, NoSQL injection kept)
2. **C2** — Fix /tmp noexec (compile to /run instead)
3. **C3** — Add stdin support to runCode
4. **C5** — Generate strong JWT secret
5. **H1** — Add rate limiting on code execution (30/min/user)
6. **H2** — Add expired session cleanup job (60s interval)
7. **H4** — Add memory swap limit
8. **S6** — Add per-user concurrency limit (3 max)
9. **M1** — Package.json name fixed
10. **M2** — Graceful shutdown added to server.js
11. **M3** — Session expiry cleanup job
12. **M5** — Compound index on LabSession

✅ COMPLETED IN PHASE 1 (Ownership & Hardening):
13. **C4** — Terminal workspace boundary (per-user `/workspace/<userId>` chmod 700, unprivileged `sandbox` uid 10000, backpressure guard, DOCKER_HOST configurable)
14. **IDOR sweep** — applications / enrollments / grading / hall tickets / exam results / submissions: all verified ownership-scoped or admin-guarded at route level
15. **Privacy — project submissions listing** (`GET /projects/:id/submissions`): now requires auth, redacts `code`/`repoUrl`/`demoUrl`/`testResults`/`reviews`, and populates `fullname` only (was leaking every user's source code + emails anonymously)
16. **Privacy — follow lists**: `GET /follows/:id/followers|following` and `/me/*` no longer leak other users' emails (`fullname` only)
17. **Privacy — submissions reviews**: reviewer email dropped from `getSubmission` (fullname only)
18. **Error handler**: stack traces gated on `config.nodeEnv === 'development'` (config-consistent; production-safe)
19. **Terminal tests**: `jest.setTimeout` 120s→300s + `isDockerAvailable()` ping guarded to 8s so slow Docker Desktop cold starts can't stall the suite — terminal.test.js passes 9/9 with real Docker
20. **All suites pass on real infrastructure** — full run: 128/128 green. `lab.test.js` (Docker) 156s, `terminal.test.js` (Docker) 176s, `workflow.test.js` 26s, `subscription.test.js` + `skills.test.js` 34/34 after timeout harmonization (they were false-failing on 120s hook timeouts during machine contention)

IN PROGRESS:
- **Missing backend for `/chat/*` + `/community/*`** — frontend Messages/Community pages call endpoints that don't exist in the backend (404). Community degrades gracefully; Messages is fully broken. Backend does not even have Conversation/Message models.

PREVIOUS ITEM — DONE:
- **Chat + Community backend implemented**. See commit notes below.

✅ COMPLETED IN PHASE 12 CONT ABSOLUTE (Chat & Community):
21. **Conversation/Message models** (`Conversation`, `Message`) — 2-participant DMs, lastMessage preview, `{ conversationId, createdAt }` + `{ participants, updatedAt }` indexes
22. **Chat API** (`/chat/conversations`, POST create/fetch, GET/POST `:id/messages`) — auth required for all, membership enforced on read/send (403 for outsiders), `fromMe` flags computed per viewer, empty messages rejected, participant email never exposed
23. **Community/Discussion models** (`Community`, `Discussion` w/ answer subdocs) — unique slug auto-generation, `members` count, category indexes
24. **Community API** (`/community/communities`, `/community/discussions` GET public; POSTs auth-gated) — listings match the frontend contracts (`data.discussions`, `data.communities`, `answers.length` replies badge), authors populated as `fullname`
25. **Tests**: `tests/chat.test.js` (8) + `tests/community.test.js` (7) — all pass with real MongoDB (15/15)

✅ COMPLETED IN PHASE 13 (Community detail endpoints + test hardening):
26. **Slug/ID detail endpoints** — `GET /community/communities/:slug`, `GET /community/discussions/:slug`, `POST /community/discussions/:slug/answers` accept either ObjectId or slug (accepts both; frontend `#/community/c/:slug` / `#/community/d/:slug` deep links now resolvable), validated by `isIdOrSlug` express-validator param rules; `addAnswer` unified to the same lookup; 3 new tests → community suite 10/10
27. **Docker-suite hook hardening** — `beforeAll` in lab/terminal/workflow suites given explicit 600s hook timeouts so Docker Desktop cold start under machine contention can no longer false-fail the suites (lab 19/19 verified on warm daemon)

PENDING (Phases 2-12):
- Phase 2 — Verify all compiled language execution
- Phase 3 — Docker security hardening
- Phase 4 — Terminal sandbox hardening
- Phase 7 — CodeLab frontend (lab state UI)
- Phase 8 — Frontend architecture fixes
- Phase 9 — UI redesign
- Phase 10 — Testing
- Phase 11 — Security audit
- Phase 12 — Production readiness
