# MentorConnect — Security Architecture & Access Control

## 1. Authentication & Password Security
- **Password Hashing**: Uses `bcrypt` with 10 salt rounds (or Argon2id equivalent) ensuring resistant key derivation against brute-force and dictionary attacks.
- **JWT Architecture**:
  - Short-lived Access Tokens (1–2 hours) containing user identity, role, and department identifiers.
  - Long-lived Refresh Tokens (7 days) verified in database to issue fresh access tokens upon expiration.
- **Rate Limiting**: `express-rate-limit` guards sensitive authentication routes (`/api/v1/auth/login`, `/api/v1/auth/register-student`) against automated credential stuffing (50 requests per 15-minute window).

---

## 2. Server-Side Role-Based Access Control (RBAC)
Client-side views toggle navigation items for convenience, but the API backend strictly enforces role boundaries independently using `requireRole(UserRole...)` middleware:
1. **Students**:
   - Cannot access administrative endpoints (`/assignments`, `/reports`, `/audit-logs`, `/users`).
   - Cannot escalate roles or modify institutional identifiers (`usn`, `departmentId`).
   - Can only submit feedback for their own completed sessions.
   - Cannot read private mentor notes (`visibility: PRIVATE_MENTOR`).
2. **Mentors**:
   - Strictly restricted from accessing students or mentoring notes of other faculty members (`403 Forbidden` if not assigned).
3. **Head of Department (HOD)**:
   - Only authorized role capable of modifying user active statuses, reviewing change requests, and enforcing capacity overrides.

---

## 3. Data Protection & Defense in Depth
- **Helmet Headers**: Configures Content-Security-Policy (CSP), frameguard, XSS filter, and HSTS headers.
- **CORS Protection**: Whitelists only trusted origins (`http://localhost:5173`, configured client domain).
- **Input Validation**: All request bodies and query parameters are parsed and sanitized via Zod schemas, preventing prototype pollution and mass assignment.
- **CSV Formula Injection Prevention**: The CSV generator prepends single quotes (`'`) to cells starting with `=`, `+`, `-`, or `@` to neutralize command execution in spreadsheet programs.
- **Zero Secrets in Logs**: Password hashes, tokens, and authorization headers are scrubbed from server diagnostic logs and audit entries.
