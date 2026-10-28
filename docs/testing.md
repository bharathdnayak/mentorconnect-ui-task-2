# MentorConnect — Automated Testing Strategy & Execution

## 1. Testing Frameworks
- **Vitest**: High-performance test runner for unit, integration, and security tests.
- **Supertest**: Direct HTTP assertion framework against the live Express application.
- **Test Database**: Dedicated isolated PostgreSQL test database (`mentorconnect_test`).

---

## 2. Test Suites Executed

### A. Authentication & Security (`tests/api.test.ts`)
- `rejects invalid login credentials with 401`
- `rejects access to protected routes without a token with 401`
- `prevents students from accessing HOD-only administrative endpoints (403)`
- `prevents students from viewing audit logs (403)`
- `allows valid token refresh`

### B. Student Profiles & Matching (`tests/api.test.ts`)
- `retrieves student profile and updates permitted fields`
- `retrieves active assigned mentor details for student`
- `retrieves explainable mentor recommendations for student`

### C. Mentor Operations & Boundaries (`tests/api.test.ts`)
- `lists assigned mentees for faculty mentor`
- `prevents mentor from accessing mentees not assigned to them (403)`

### D. HOD Administration & Capacity Rules (`tests/api.test.ts`)
- `lists unassigned students`
- `prevents duplicate active assignment for already assigned student`
- `generates report overview and exports CSV files`

### E. Mentoring Sessions & Note Visibility (`tests/api.test.ts`)
- `allows mentor to schedule a mentoring session`
- `enforces note visibility: student cannot view private mentor notes`

### F. Prompt History Recorder Verification (`tests/prompt-recorder.test.ts`)
- `rejects recording when no prompt file argument is provided`
- `rejects recording when prompt file does not exist`
- `rejects recording when prompt file is empty`
- `preserves existing prompt entries and verifies entry 001 exists`
- `verifies prompt-history.md contains index entry #001`

---

## 3. Running Automated Tests

```bash
# Execute test suite once:
npm test

# Run tests in continuous watch mode:
npm run test:watch
```
