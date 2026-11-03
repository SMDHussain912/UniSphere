# UniSphere — Company Verification, Trust & Platform Security Requirements

**Document type:** Product Requirements Note
**Status:** Proposed — Not yet implemented
**Priority:** High
**Instruction:** Documentation only. Do not modify application code.

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 3 November 2026 | Engineering | Initial proposal document |

## 1. Objective

Expand the UniSphere Master PRD with requirements for company verification, recruiter and interviewer identity verification, platform security, payment security, purchase management and user trust.

UniSphere is intended to become a real-world platform involving learners, educators, developers, companies, recruiters, interviewers and organizations.

The platform must establish mechanisms to verify organizations and authorized representatives, protect users, prevent impersonation and securely process financial transactions.

## 2. Company and Organization Verification

Companies must not be allowed to claim an organization identity without providing appropriate evidence.

### 2.1 Company registration and verification

During company registration, collect relevant information:

- Legal company or organization name.
- Registered business name, where applicable.
- Business registration number or equivalent identifier.
- Country and jurisdiction.
- Official business address.
- Official company website.
- Company email domain.
- Authorized representative's details.
- Supporting registration documents.
- Contact information.

The exact evidence requirements must depend on the country and organization type.

**Current state in codebase:** The `User` model (`models/User.js`) has a `companyProfile` field (`companyName`, `website`, `industry`, `size`, `description`) but there is no separate `Organization` model or verification status. Company registration currently relies on the `role: 'company'` user role.

### 2.2 Verification workflow

Proposed workflow:

1. Company creates an organization account.
2. Company submits organization information.
3. Company uploads supporting documents.
4. Verification request enters pending review.
5. Automated checks may validate available information.
6. Authorized UniSphere verification staff review the evidence.
7. Organization is approved, rejected or asked for additional information.
8. Verification status is recorded.
9. Approved organization receives a verified organization indicator.

Possible statuses:

- Not submitted.
- Pending verification.
- Under review.
- Additional information required.
- Verified.
- Rejected.
- Suspended.
- Expired or requiring re-verification.

**Current state in codebase:** No verification workflow exists. The `Company.js` model exists but is linked to `Application` and `User` models and represents employment data, not organizational verification.

### 2.3 Verification principles

- A company email address alone must not be considered sufficient proof of legal company identity.
- Verification must distinguish domain ownership from legal organization verification.
- Supporting documents must be access-controlled.
- Verification decisions must be auditable.
- Verification must be renewable when documents expire or relevant information changes.
- False or misleading claims must be reportable.
- Suspended organizations must lose access to restricted organization capabilities.

**Current state in codebase:** Not implemented.

### 2.4 Verification statuses

Possible statuses:

- Not submitted.
- Pending verification.
- Under review.
- Additional information required.
- Verified.
- Rejected.
- Suspended.
- Expired or requiring re-verification.

**Current state in codebase:** Not implemented.

## 3. Recruiter and Interviewer Verification

A person claiming to be a recruiter, hiring manager or interviewer must demonstrate an authorized relationship with the relevant organization.

### 3.1 Representative verification

Collect and verify, as appropriate:

- Full legal name.
- Professional designation.
- Organization affiliation.
- Official company email.
- Organization invitation or approval.
- Proof of authorization when required.

**Current state in codebase:** The `User` model has a `role` field but no recruiter/interviewer-specific verification. The `Company.js` model stores designation but not verification status.

### 3.2 Organization membership

Verified companies must be able to invite employees and representatives.

Proposed organization roles:

- Organization Owner.
- Organization Administrator.
- Recruiter.
- Hiring Manager.
- Interviewer.
- HR Representative.

**Current state in codebase:** No organization hierarchy exists. Companies are represented as users with `role: 'company'`.

### 3.3 Authorization requirements

- A recruiter must belong to an approved organization.
- An interviewer must be associated with an authorized organization or hiring process.
- Organization owners and administrators must manage membership.
- Role changes must be recorded.
- Invitations must expire.
- Revoked representatives must lose organization access.
- A representative must not be able to impersonate another organization.
- Users must be able to report suspicious recruiter or interviewer accounts.

**Current state in codebase:** Not implemented.

### 3.4 Verification indicators

Clearly distinguish:

- Verified organization.
- Verified organization representative.
- Unverified personal account.
- Verification pending.

Do not display a verified badge simply because someone entered a company name.

**Current state in codebase:** Not implemented. The Navbar shows role-based visibility but no verification badges.

## 4. Platform Security Architecture

UniSphere must follow a security-first design.

### 4.1 Authentication security

Consider:

- Strong password hashing — **Implemented**: Mongoose pre-save hook hashes passwords with bcrypt (12+ rounds) in `models/User.js`.
- Multi-factor authentication (MFA) — **Not implemented**.
- Passkeys where supported — **Not implemented**.
- Email verification — **Not implemented** (no verification token flow).
- Secure password recovery — **Partial**: Password reset flow exists but needs review.
- Session management — **Implemented**: JWT-based authentication in `middlewares/authMiddleware.js`.
- Refresh token rotation when applicable — **Not implemented** (access tokens only via cookies).
- Login attempt limits — **Partial**: Rate limiting exists in `middlewares/rateLimiters.js`.
- Suspicious login detection — **Not implemented**.
- Device and session management — **Partial**: JWT tokens but no session revocation UI.
- Session revocation — **Not implemented**.
- Account recovery protections — **Not implemented**.

### 4.2 Authorization security

Implement:

- Role-based access control — **Implemented**: `authMiddleware.js` has `authenticate`, `authorize`, `authorizeAdmin`.
- Resource-level authorization — **Partial**: Route-level authorization exists but resource-level checks need audit.
- Organization-level permissions — **Not implemented**.
- Project and course ownership checks — **Partial**: Some IDOR fixes mentioned in audit (C15-C17).
- Administrative permission boundaries — **Partial**: Admin routes exist with role checks.
- Least-privilege access — **In progress**.
- Audit logs for sensitive operations — **Partial**: Error handler logs gated on development mode (C19).

**Current state in codebase:** See audit notes in `PHASE0_AUDIT.md`.

### 4.3 Application security

Evaluate and document protections against:

- SQL/NoSQL injection — **Partial**: express-validator used but sanitize middleware (C1) corrupts code input.
- Cross-site scripting (XSS) — **Partial**: Frontend should handle; global sanitize middleware counterproductive.
- Cross-site request forgery (CSRF), where applicable — **Not documented**.
- Broken access control — **In progress**: Audit notes mention ownership checks.
- IDOR vulnerabilities — **Partial**: Fixes applied (C15-C17 in audit) but scope needs verification.
- Server-side request forgery (SSRF) — **Not documented**.
- Brute-force attacks — **Partial**: Rate limiting exists.
- Credential stuffing — **Partial**: Rate limiting exists.
- Account takeover — **Partial**: JWT auth + rate limiting.
- File upload attacks — **Partial**: `uploadMiddleware.js` exists.
- API abuse — **Partial**: Rate limiting exists.
- Denial-of-service attacks — **Not documented**.
- Dependency vulnerabilities — **Not documented**.
- Secret leakage — **Partial**: `.env.example` generated but secrets need rotation.

### 4.4 Data protection

Requirements:

- Encrypt sensitive network traffic — **Implemented**: HTTPS recommended but need to verify TLS config.
- Protect sensitive data at rest — **Partial**: Some data encrypted (passwords), other data not.
- Restrict access to personal information — **Partial**: Some privacy fixes applied (C16-C17 in audit).
- Secure identity and company documents — **Not implemented**.
- Define data retention and deletion policies — **Not implemented**.
- Keep audit records for sensitive access — **Partial**: Error handler gates stack traces.
- Provide secure backup and recovery procedures — **Not documented**.
- Avoid storing unnecessary personal information — **In progress**.
- Establish privacy and consent workflows — **Not implemented**.
## 5. Secure Payments and Purchases

UniSphere may eventually support purchases such as:

- Paid courses.
- Premium learning paths.
- Subscriptions.
- Certification or assessment fees.
- Institutional plans.
- Other approved digital services.

### 5.1 Payment architecture

Use a reputable payment gateway rather than directly handling raw card information.

Evaluate providers appropriate for the launch markets, including applicable Indian payment requirements.

Possible integration categories:

- Hosted checkout.
- Payment gateway APIs.
- Subscription billing.
- Payment webhooks.
- Refund processing.
- Transaction reconciliation.

**Current state in codebase:** Subscription system exists (`subscriptionRoutes.js`, `subscriptionController.js`, `planGate.js`) with Free/Pro/Company tiers. Payment gateway integration not present - current system appears to use plan-based feature gating rather than real payments.

### 5.2 Payment security requirements

- Never store raw card numbers or CVV values — **Not applicable** (no payment gateway integrated yet).
- Use gateway-hosted payment collection where possible — **Not implemented**.
- Verify webhook signatures — **Not implemented**.
- Process webhook events idempotently — **Not implemented**.
- Prevent duplicate purchases — **Not implemented**.
- Validate payment status on the server — **Not implemented**.
- Never trust client-provided payment success — **Not implemented**.
- Maintain transaction records — **Not implemented**.
- Provide purchase receipts — **Not implemented**.
- Support refunds and cancellation workflows — **Not implemented**.
- Record failed and pending transactions — **Not implemented**.
- Protect payment endpoints with rate limits and authorization — **Not implemented**.

### 5.3 Purchase and entitlement management

Separate payment transactions from user access rights.

A successful verified transaction may create an entitlement.

Entitlements should define:

- User or organization.
- Purchased product.
- Purchase reference.
- Access start and end dates.
- Current status.
- Refund or revocation state.

Access must be checked by the backend.

A failed, pending or refunded transaction must not incorrectly grant permanent access.

**Current state in codebase:** Plan system exists in `User.model.js` with `plan`, `planExpiresAt`, `planLimits`. Feature gating via `planGate.js`. No payment gateway integration.

## 6. Financial Fraud and Abuse Prevention

Consider:

- Suspicious transaction detection — **Not implemented**.
- Repeated payment failure monitoring — **Not implemented**.
- Duplicate purchase detection — **Not implemented**.
- Account takeover signals — **Partial**: Rate limiting and suspicious login detection not fully implemented.
- Coupon and promotional abuse prevention — **Not implemented**.
- Refund abuse monitoring — **Not implemented**.
- Rate limiting — **Implemented**: `middlewares/rateLimiters.js`.
- Manual review for suspicious transactions — **Not implemented**.

Automated risk signals should support investigation and should not automatically make unsupported accusations against users.
## 7. Document and File Security

Company registration documents, identification evidence and other sensitive uploads require special protection.

Requirements:

- Validate file type and actual content — **Not implemented** (uploadMiddleware exists but needs verification).
- Enforce file size limits — **Partial**: Configuration in `env.js` (`labMemoryLimitMb`, etc.) but not for user uploads.
- Scan uploads for malware — **Not implemented**.
- Store private documents outside public web directories — **Partial**: `uploads/` directory exists but needs verification.
- Use short-lived authorized download links — **Not implemented**.
- Restrict access to designated verification personnel — **Not implemented**.
- Record access and review activity — **Not implemented**.
- Define retention and deletion policies — **Not implemented**.
- Prevent executable file uploads from being served or executed — **Not implemented**.

**Current state in codebase:** `middlewares/uploadMiddleware.js` exists but scope and security needs verification.
## 8. Administrative Trust and Safety

Create a restricted verification and security administration capability.

Authorized staff should be able to:

- Review company verification submissions — **Not implemented**.
- Review representative verification — **Not implemented**.
- Request additional evidence — **Not implemented**.
- Approve or reject submissions — **Not implemented**.
- Suspend organizations — **Not implemented**.
- Revoke representative access — **Not implemented**.
- Investigate reported impersonation — **Not implemented**.
- Review relevant audit records — **Partial**: Error handler logs gated on development mode.
- Track verification history — **Not implemented**.

All sensitive administrative actions must be logged.

Administrative accounts must receive stronger authentication and strict permissions.

**Current state in codebase:** Admin workspace exists (`adminRoutes.js`, `adminController.js`) but verification-review capabilities not implemented.
## 9. User Trust and Transparency

Users should be able to:

- Identify verified organizations — **Not implemented**.
- Identify verified representatives — **Not implemented**.
- Report suspicious companies or interviewers — **Not implemented**.
- Report fraudulent job listings — **Partial**: Job posting exists but fraud reporting not implemented.
- Review their own purchases — **Partial**: Subscription status visible but purchase history limited.
- Access transaction receipts — **Not implemented**.
- Manage active sessions — **Partial**: JWT tokens but no session management UI.
- Request account and personal data actions where applicable — **Not implemented**.

UniSphere must communicate what verification actually means. A verified company badge must not be presented as a guarantee that every job listing, interview or individual interaction is safe.

**Current state in codebase:** Not implemented. No verification indicators in UI.
## 10. Additional Security Areas to Evaluate

Document requirements and recommendations for:

- Security monitoring and alerting — **Not implemented**.
- Incident response procedures — **Not implemented**.
- Backup and disaster recovery — **Not documented**.
- Dependency and container image scanning — **Not documented**.
- Secure development lifecycle — **In progress** (Phase 11 in roadmap).
- Penetration testing — **Not performed**.
- API security testing — **Not documented**.
- Security audit history — **Partial**: PHASE0_AUDIT.md exists.
- Privacy compliance for supported jurisdictions — **Not implemented**.
- Age-appropriate safeguards where applicable — **Not implemented**.
- Secure code execution and virtual labs — **In progress** (Docker-based, see C2-C4 audit issues).
- AI prompt injection and data leakage protection — **Not implemented** (AI gateway not yet architected).
- Third-party integration security — **Not documented**.
## 11. Required Deliverables

Create or update the appropriate product documentation with:

1. **Company Verification PRD** — Not yet created. See this document.
2. **Recruiter and Interviewer Verification PRD** — Not yet Created. See this document.
3. **Platform Security Requirements** — Partially covered in this document; existing code needs audit.
4. **Authentication and Authorization Security Requirements** — Partially implemented; see `middlewares/authMiddleware.js`.
5. **Payment and Purchase Architecture Requirements** — Subscription system exists but payment gateway not integrated.
6. **Document Storage and Verification Security** — `uploadMiddleware.js` exists; security needs verification.
7. **Trust and Safety Administration Requirements** — Not implemented.
8. **Security Risk Register** — Not created. See Section 27.
9. **Open Questions and Decisions Required** — See Section 12.

Add cross-references to the UniSphere Master PRD.
## 12. Important Implementation Restrictions

**This task is documentation only.**

- Do not implement any verification feature.
- Do not modify authentication code.
- Do not change database schemas.
- Do not install packages.
- Do not change payment integrations.
- Do not modify deployment configuration.
- Do not delete or rewrite existing modules.

First inspect the existing UniSphere documentation and repository architecture.

Where existing functionality already exists, document its current state instead of assuming it is missing.

Clearly classify each requirement as:

- **Existing and implemented** — Already working in the codebase.
- **Existing but incomplete** — Code exists but is broken, limited, or needs integration.
- **Planned** — Intended for future implementation per roadmap.
- **Not implemented** — No code exists.
- **Requires investigation** — Needs code review to determine current state.

The final note must distinguish confirmed requirements, proposed solutions, technical recommendations and unresolved decisions.
## 13. Requirement Classification Summary

| Requirement Area | Classification |
|---|---|
| Company verification workflow | Not implemented |
| Representative verification | Not implemented |
| Organization membership roles | Not implemented |
| Verification statuses and indicators | Not implemented |
| Authentication security (MFA, passkeys, session revocation) | Partial — bcrypt hashing implemented; MFA, passkeys, session revocation missing |
| Authorization security (resource-level checks) | Partial — route-level exists; resource-level needs audit |
| Application security (XSS, injection, CSRF) | Partial — sanitize middleware has bugs (C1); frontend XSS handling needed |
| Data protection (encryption at rest, access controls) | Partial — passwords hashed; other data needs assessment |
| Payment architecture and security | Partial — plan-based gating exists; payment gateway not integrated |
| Financial fraud prevention | Not implemented |
| Document and file security | Partial — upload middleware exists; security needs verification |
| Administrative trust and safety | Partial — admin workspace exists; verification review missing |
| User trust and transparency | Not implemented |
| Security monitoring and incident response | Not implemented |
| Privacy compliance | Not implemented |
| Secure code execution | Partial — Docker-based but has critical issues (C2-C4 in audit) |
| AI security | Not implemented (not yet architected) |
## 14. Cross-References to UniSphere Master PRD

This document should be read in conjunction with the UniSphere Master PRD (version 1.0, 3 November 2026). Key cross-references:

- **Part I, Section 5** — Product Architecture: Maps to the Learn, Practice, Build, Connect pillars
- **Part I, Section 6** — AI Platform Requirements: AI gateway and safety requirements apply to future verification workflows
- **Part II, Section 12** — Backend Module Architecture: Company/organization modules would follow module patterns
- **Part II, Section 13** — Frontend Architecture: Role-aware navigation and verification indicators UI patterns
- **Part II, Section 14** — Identity, Roles and Authorization: Foundation for organization roles and verification status
- **Part II, Section 15** — Database Architecture: Organization and verification collections would extend MongoDB schema
- **Part II, Section 18** — Background Jobs and Event Processing: Verification workflow automation could use job queues
- **Part II, Section 20** — Real-Time Architecture: Notification system for verification status updates
- **Part III, Section 23** — Release Strategy: Verification features would be phased into future releases
- **Part III, Section 24** — Implementation Phases: Phase 0 audit completed (PHASE0_AUDIT.md); verification features planned for later phases
- **Part III, Section 25** — First-Release Definition of Done: Verification features would need user journeys, tests, documentation
- **Part IV, Section 26** — Key Performance Indicators: Verification rate, user trust metrics
- **Part IV, Section 27** — Major Risks and Mitigations: Critical for verification implementation planning
- **Part IV, Section 28** — Architecture Decision Records: ADR-001 (unified application), ADR-006 (isolated code execution) relevant
- **Part V, Section 29** — First Engineering Sprint: Repository audit already completed (PHASE0_AUDIT.md)
## 15. Unresolved Questions and Decisions Required

1. **Organization model**: Should companies be represented as separate `Organization` documents linked to `User` profiles, or should the `User` model's `companyProfile` field be extended?

2. **Verification authority**: Who performs verification — automated checks, staff review, or a combination? What's the escalation path?

3. **Verification evidence**: What document formats are acceptable? How are documents stored and accessed securely?

4. **Verification cost**: Will verification be free, paid, or tiered? How does this affect adoption?

5. **Recruiter/Interviewer onboarding**: Should individual recruiters be verified independently, or only through organizational affiliation?

6. **Badge design**: What visual indicators distinguish verified organizations, verified representatives, and unverified accounts?

7. **Integration with existing auth**: How does verification status interact with the existing `role: 'company'` user role and `plan: 'company'` subscription tier?

8. **Fallback for missing documentation**: What happens when a company cannot provide the standard verification documents? What's the alternative path?

9. **Internationalization**: How do verification requirements differ by country/jurisdiction? What's the minimum viable verification for each region?

10. **Data retention for verification records**: How long are verification documents retained? When are they deleted upon organization suspension or user departure?
