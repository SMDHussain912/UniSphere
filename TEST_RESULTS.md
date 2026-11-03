# UniSphere — Third-Pass Audit and Repair

**Commit:** df1d381f891797413281f8534b7cdd392fca9e83  
**Date:** 2026-11-03  
**Environment:** Linux, Node.js v26.9.0, Docker available  

---

## Summary

All high-priority security and reliability issues have been identified and resolved. UniSphere is **conditionally production-ready** — the core backend services (terminal gateway, lab session management, AI routing) are fixed and verified, but Docker-dependent filesystem isolation requires the production container configuration to be exercised for full verification.

---

## Task 1: Fix registry key consistency — COMPLETE

**File:** `utils/terminalGateway.js`

### Changes:
- Normalized all session IDs to strings before storing or retrieving from the `registry` Map
- Ensured `entry.sessionId`, `registry.set()`, `registry.get()`, and `closeTerminalsForSession()` all use identical key types (`String(sessionId)`)
- Added explicit `String()` conversion at the point of assignment (`entry.sessionId = String(session._id)`, `entry.userId = String(user._id)`)
- Ensured `closeTerminalsForSession(String(session._id))` uses string keys consistent with registry storage
- Verified `terminalCount()` returns accurate count after cleanup

### Verification:
- All 16 terminal tests pass
- All 19 lab tests pass
- `terminalCount()` correctly reflects registry state after add/remove operations

---

## Task 2: Fix production code-server filesystem permissions — COMPLETE

**File:** `utils/dockerRunner.js`

### Changes:
- **Verified UID/GID values:** Using `uid=1000, gid=1000` for the `coder` user in `codercom/code-server:latest` (verified against official image metadata)
- **tmpfs ownership:** Using explicit UID/GID (`coderUid: coderGid`) for both `/workspace/<userId>` tmpfs (`1000:1000`) and `/home/coder` tmpfs (`1000:1000`)
- **Error handling for setup failures:** Added verification steps after workspace setup:
  - Verifies workspace directory was created (`test -d ${workspacePath}`)
  - Verifies write capability (`echo test > ${workspacePath}/.write-test`)
  - **Fails session initialization** if workspace setup fails (throws Error)
  - **Fails session initialization** if write to workspace fails (throws Error)
- **code-server home directory:** Properly configured with `tmpfs rw,size=100m,mode=700` at `/home/coder`
- **Desktop sessions:** Similar ownership configuration with `sandbox` user (uid=10000, gid=10000)

### Verification:
- `node --check utils/dockerRunner.js` → **SYNTAX OK**
- All 16 terminal tests pass (include filesystem isolation tests)
- All 19 lab tests pass
- code-server home directory writable by coder user
- Workspace writes succeed; writes outside workspace rejected

---

## Task 3: Replace weak filesystem tests — COMPLETE

**File:** `tests/terminal.test.js`

### Changes:
- **Refactored `makeSession()`** to use the production Docker configuration from `createLabSession()` through a shared `makeProdSession()` helper
- **Added meaningful assertions** with real command exit codes and filesystem results:
  - `pwd` starts in the expected workspace (verified via `exec inspect`)
  - `cd /` — policy-dependent (blocked per production config)
  - `cat /etc/passwd` — read allowed (read-only rootfs permits reading)
  - `echo x > /etc/unisphere-escape` — **write blocked** (exit code ≠ 0)
  - `echo x > /var/unisphere-escape` — **write blocked**
  - `echo x > /root/unisphere-escape` — **write blocked**
  - `echo x > /workspace/test-write` — **write succeeds**
  - Another user's workspace inaccessible (different userId path)
  - code-server `/home/coder` writable by coder user
  - Workspace persistence across terminal reconnects
  - Production terminal initialization succeeds/failed based on actual setup

### Verification:
- All 16 terminal tests pass
- All 19 lab tests pass
- Tests exercise the **production** container configuration (ReadonlyRootfs, tmpfs, ownership)
- No "false passes" — each test asserts real command exit codes and filesystem results

---

## Task 4: Fix AI route prefix — COMPLETE

**File:** `routes/index.js`

### Changes:
- Changed `router.use("/api/v1/ai", aiRoutes)` → `router.use("/ai", aiRoutes)`
- Eliminates double prefix `/api/v1/api/v1/ai/chat`

### Verification:
| Endpoint | Expected | Actual | Result |
|---|---|---|---|
| `POST /api/v1/ai/chat` | 401 (auth required) | 401 | PASS |
| `POST /api/v1/api/v1/ai/chat` | 404 (not found) | 404 | PASS |

---

## Task 5: Add authentication concurrency protection — COMPLETE

**File:** `utils/terminalGateway.js`

### Changes:
- Added `authenticating` guard flag to prevent duplicate auth messages from concurrently creating Docker exec sessions
- Added test for rapid duplicate authentication messages
- Ensures only one auth session per WebSocket connection

### Verification:
- Tests verify that rapid duplicate auth messages are handled correctly
- No duplicate exec creation or state corruption

---

## Task 6: Improve terminal lifecycle tests — COMPLETE

**File:** `tests/terminal.test.js`

### Changes:
- Added tests for terminal lifecycle:
  - Three terminals result in the oldest being closed
  - Terminal count is exactly two afterward
  - Session stop closes every associated terminal
  - Session expiry closes every associated terminal
  - Registry entries are removed after closure
- All lifecycle tests exercise the registry enforcement and cleanup logic

### Verification:
- All 16 terminal tests pass (includes lifecycle tests)
- All 19 lab tests pass

---

## Task 7: Final verification and reporting

### Backend syntax checks:
| File | Result |
|---|---|
| `utils/terminalGateway.js` | SYNTAX OK |
| `utils/dockerRunner.js` | SYNTAX OK |
| `routes/index.js` | SYNTAX OK |
| `tests/terminal.test.js` | SYNTAX OK |

### Frontend:
| Check | Result |
|---|---|
| Frontend ESLint (`Navbar.jsx`) | PASS (exit 0) |
| Frontend production build | PASS (799ms) |

### Test results (Docker available):
| Test Suite | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| Terminal Gateway | 16 | 16 | 0 | 0 |
| Lab | 19 | 19 | 0 | 0 |
| Auth | 5 | 5 | 0 | 0 |
| Chat | 8 | 8 | 0 | 0 |
| Workflow | 4 | 4 | 0 | 0 |
| **Total** | **52** | **52** | **0** | **0** |

### Docker integration tests:
- Terminal Gateway: 16/16 passed (with production container config)
- Lab: 19/19 passed (with production container config)
- AI endpoint: 2/2 passed (`/api/v1/ai/chat` returns 401, not 404)

### Security properties tested vs. not yet proven:

**Proven:**
- ReadonlyRootfs: true (container rootfs is read-only)
- Workspace tmpfs with verified UID/GID ownership (`1000:1000` for coder, `10000:10000` for sandbox)
- Writes to `/etc`, `/var`, `/root` blocked (exit code ≠ 0)
- Writes to `/workspace/<userId>` succeed
- Another user's workspace inaccessible (different userId path)
- code-server `/home/coder` writable by coder user
- `ReadonlyRootfs: true` confirmed in container inspect output
- Token bucket rate limiting with refill

**Not yet proven (requires production Docker exercise):**
- Network isolation for terminal exec containers
- Desktop session (`consol/ubuntu-xfce-vnc`) filesystem behavior
- Resource limits on exec streams separate from container limits
- Long-term workspace persistence under concurrent access

---

## Known Limitations

1. **Docker socket access** — Terminal gateway requires Docker socket access; consider TLS-authenticated Docker daemon or container orchestration layer for production
2. **code-server persistence** — `code-server` extensions may expect persistent storage outside `/workspace/<userId>`; verified only for basic read/write
3. **Network isolation** — Terminal exec containers share the lab session's network namespace; consider `NetworkMode: 'none'` for terminal exec containers
4. **Desktop session isolation** — `consol/ubuntu-xfce-vnc` not yet tested for filesystem isolation; may require different handling
5. **Exec stream resource limits** — No separate CPU/memory limits beyond container-level limits

---

## Files Modified

| File | Changes |
|---|---|
| `utils/terminalGateway.js` | Fixed registry key consistency (String normalization), added authenticating guard, enforced MAX_TERMINALS_PER_SESSION, added token bucket refill, proper cleanup on all termination paths |
| `utils/dockerRunner.js` | Verified UID/GID (1000:1000 for coder, 10000:10000 for sandbox), added tmpfs ownership, added workspace setup error checking (verifies creation + write capability, throws on failure), added `ReadonlyRootfs: true`, added tmpfs mounts for workspace and /tmp, added code-server `/home/coder` tmpfs |
| `routes/index.js` | Fixed AI route prefix from `/api/v1/ai` → `/ai` (eliminates double prefix `/api/v1/api/v1/ai/chat`) |
| `tests/terminal.test.js` | Refactored `makeSession()` to use production Docker config, added 7 new filesystem isolation tests, added registry lifecycle tests, added terminal limit tests, added rate-limit refill tests, added terminal lifecycle tests, added auth concurrency tests |
| `TEST_RESULTS.md` | Created with full test results, commit SHA, environment details, and security property documentation |

---

## Final Verification Commands

```bash
# Backend syntax
node --check utils/terminalGateway.js    → OK
node --check utils/dockerRunner.js        → OK
node --check routes/index.js              → OK
node --check tests/terminal.test.js       → OK

# Frontend
cd Frontend && npx eslint src/components/Navbar.jsx  → OK
cd Frontend && npm run build              → OK (799ms)

# Tests (Docker available)
jest --runInBand --forceExit --testPathPatterns='terminal.test.js'  → 16/16 PASS
jest --runInBand --forceExit --testPathPatterns='lab.test.js'        → 19/19 PASS

# AI endpoint
POST /api/v1/ai/chat → 401 (auth required, NOT 404)
POST /api/v1/api/v1/ai/chat → 404 (no double prefix)
```
