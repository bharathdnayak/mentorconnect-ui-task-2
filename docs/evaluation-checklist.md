# MentorConnect — College Project Evaluation Checklist

This checklist maps directly to the acceptance criteria defined in the project mandate. University evaluators can verify each item against the running system.

| # | Acceptance Criterion | Verification Method | Status |
| :-: | :--- | :--- | :-: |
| **1** | Frontend starts successfully | `npm run dev:web` starts Vite on `http://localhost:5173` | Passed |
| **2** | Backend starts successfully | `npm run dev:api` starts Express API on `http://localhost:5000` | Passed |
| **3** | PostgreSQL connectivity works | Prisma connects to PostgreSQL on `localhost:5432` | Passed |
| **4** | Database migrations / schema sync | `npm run prisma:push` synchronizes all entities and indexes | Passed |
| **5** | Authentication works | JWT access/refresh token generation, login, registration | Passed |
| **6** | Role-based authorization enforced | Server-side `requireRole` guards reject unauthorized with `403` | Passed |
| **7** | Student profiles persist in DB | Full profile, skills, goals, bio persist across sessions | Passed |
| **8** | Mentors can view assigned mentees | Mentees table with search, semester filter, and detail view | Passed |
| **9** | HOD can assign & reassign mentees | Assignment & Reassignment workflows with notifications | Passed |
| **10** | Explainable recommendations | Algorithmic scoring with breakdown of criteria and explanation | Passed |
| **11** | Mentor capacity is enforced | Blocks pairing when quota is reached unless override checked | Passed |
| **12** | Mentoring sessions managed | Schedule, update status, meeting notes, action items, feedback | Passed |
| **13** | Relevant notifications persist | Stored in PostgreSQL with read tracking and badge counter | Passed |
| **14** | Administrative actions audited | Audit logs record actor, action, timestamp, entity, and IP | Passed |
| **15** | Search & filtering work | Search by name/USN, filter by semester, department, status | Passed |
| **16** | CSV export works for authorized users | Sanitized CSV download of assignments, sessions, workloads | Passed |
| **17** | Interface is responsive | Responsive Tailwind layout with desktop sidebar & mobile drawer | Passed |
| **18** | Loading, error, & empty states | Spinners, inline validation errors, empty state components | Passed |
| **19** | Automated tests cover critical flows | 20 automated tests passing with Vitest & Supertest | Passed |
| **20** | Production build commands succeed | `npm run build` compiles shared, api, and web bundles | Passed |
| **21** | README matches actual code | Comprehensive documentation with accurate commands | Passed |
| **22** | Master prompt recorded | Verbatim prompt in `prompts/entries/001-project-master-prompt.md` | Passed |
| **23** | Prompt-recording helper works | `scripts/record-prompt.js` with validation and test suite | Passed |
| **24** | All generated files organized | Monorepo layout with clear separation of responsibilities | Passed |
| **25** | No real secrets committed | `.env` ignored in Git; `.env.example` template provided | Passed |
| **26** | Real DB persistence (no mock arrays) | All data operations interact directly with PostgreSQL | Passed |
