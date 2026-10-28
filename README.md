# MentorConnect — Production-Ready Mentor–Mentee Management System

> **Academic Project Submission**: 7th Semester UI Task-2 / Full-Stack Enterprise Engineering  
> **Repository**: [https://github.com/bharathdnayak/mentorconnect-ui-task-2.git](https://github.com/bharathdnayak/mentorconnect-ui-task-2.git)  
> **Student Author**: Bharath D. Nayak (USN: `NNM23IS033`)  
> **Department**: Information Science & Engineering  
> **Institution**: NMAM Institute of Technology, Nitte  

---

## 1. Project Overview
**MentorConnect** is a full-stack, enterprise-grade mentoring and student development platform developed for higher education institutions. The system bridges the communication gap between undergraduate students and faculty mentors, providing the Head of Department (HOD) with comprehensive administrative control, capacity management, and data-driven mentoring analytics.

Unlike static prototypes or mock applications, **MentorConnect** features real PostgreSQL database persistence, server-side role-based access control (RBAC), an explainable mentor matching algorithm, scheduling workflows, meeting notes with privacy boundaries, feedback ratings, CSV data exports, security audit trails, and automated tests.

---

## 2. Problem Statement & Proposed Solution

### The Existing Problem
1. **Manual & Inefficient Allocation**: Student-mentor pairings in universities are predominantly executed via static spreadsheets or manual rosters, ignoring student career trajectories, domain passions, and faculty research specialties.
2. **Lack of Mentoring Continuity**: Mentoring sessions lack centralized note-taking, action-item tracking, and accountability. Important guidance given in 3rd semester is often lost by 7th semester.
3. **No Faculty Workload Enforcement**: High-demand faculty members become overloaded, degrading mentoring quality, while other mentors remain underutilized.
4. **Opaque Matching**: Institutions lack explainable criteria for why specific mentors are assigned.

### The MentorConnect Solution
- **Dynamic Explainable Recommendations**: Transparent algorithm ranking faculty mentors based on department affinity, expertise overlap, skills match, and open capacity margin.
- **Role-Centric SaaS Dashboards**: Custom dashboards tailored specifically for Students, Faculty Mentors, and HOD Administrators.
- **End-to-End Session Workflow**: Meeting scheduling, agenda tracking, action items with due dates, private vs. shared notes, and 5-star student feedback.
- **Institutional Governance**: Real-time workload heatmaps, capacity limit enforcement with administrative overrides, mentor change requests queue, and audit trails.

---

## 3. System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Application (React 18 + Vite)"]
        UI["Tailwind CSS + shadcn Design System"]
        Nav["Role-Based Navigation & Mobile Drawer"]
        State["TanStack React Query Cache"]
        Charts["Recharts Visualizations"]
    end

    subgraph Server["Backend REST API (Node.js + Express + TS)"]
        Guard["Helmet + Rate Limiting + CORS"]
        AuthMid["JWT Auth & Role Guard Middleware"]
        Router["Versioned Routes (/api/v1)"]
        Service["Business Logic & Audit Logger"]
        Engine["Explainable Match Engine"]
    end

    subgraph Data["Database Layer"]
        Prisma["Prisma ORM"]
        Postgres[("PostgreSQL 18 Database")]
    end

    Client -->|HTTPS / JSON REST API| Server
    Server --> Guard --> AuthMid --> Router --> Service
    Service --> Engine
    Service --> Prisma --> Postgres
```

---

## 4. Database Relational Design

```mermaid
erDiagram
    User ||--o| StudentProfile : "has profile"
    User ||--o| MentorProfile : "has profile"
    User ||--o{ AuditLog : "records action"
    User ||--o{ Notification : "receives"
    User ||--o{ Announcement : "authors"

    Department ||--o{ StudentProfile : "enrolls"
    Department ||--o{ MentorProfile : "employs"

    StudentProfile ||--o{ MentorAssignment : "assigned"
    MentorProfile ||--o{ MentorAssignment : "mentors"

    StudentProfile ||--o{ MentoringSession : "attends"
    MentorProfile ||--o{ MentoringSession : "conducts"

    MentoringSession ||--o{ MeetingNote : "contains"
    MentoringSession ||--o{ ActionItem : "tracks"
    MentoringSession ||--o{ Feedback : "receives"

    StudentProfile ||--o{ MentorChangeRequest : "submits"
```

---

## 5. User Roles and Capabilities

### A. Student / Mentee
- **Authentication**: Institutional login and self-registration with USN verification.
- **Profile Readiness**: Multi-tag management of Technical Skills, Career Ambitions, Guidance Needs, Hobbies, and Bio with automatic completion calculation.
- **Assigned Mentor**: Direct view of faculty guide, designation, email, phone, and expertise.
- **Explainable Recommendations**: View top-matched faculty mentors with transparent percentage scores and plain-language reasoning.
- **Change Request**: Official submission of mentor change requests with statement of reason.
- **Sessions & Follow-Ups**: Upcoming schedules, shared faculty notes, action item checkboxes, and 1–5 star rating submission.

### B. Faculty Mentor
- **Mentee Roster**: Filter and search assigned students by semester, name, and skills.
- **In-Depth Student Detail**: View complete mentee background, past meeting history, and goals.
- **Confidential vs. Shared Notes**: Add notes with strict visibility controls (`PRIVATE_MENTOR` vs. `SHARED_STUDENT`).
- **Session Lifecycle**: Schedule meetings (In-person, Virtual, Hybrid) and mark status (`COMPLETED`, `CANCELLED`).
- **Capacity Quota**: Set and monitor maximum mentee limit (e.g. 10 students).

### C. Head of Department (HOD Administrator)
- **Executive Analytics**: Real-time KPIs for Total Students, Mentors, Assigned Coverage %, Sessions, and Average Feedback.
- **Interactive Visualizations**: Recharts Bar Charts for Faculty Workload Utilization and Department Distributions.
- **Pairings & Allocations**: Pair unassigned students, enforce mentor capacity quotas, and execute reassignments with audit logging.
- **Change Request Decisions**: Review queue to approve or reject student change requests.
- **Audit Logs**: Immutable log tracking every administrative and security action with IP and timestamp.
- **Data Exports**: Authorized, formula-injection-safe CSV exports of assignments, sessions, and workloads.

---

## 6. Explainable Mentor Recommendation Algorithm

The recommendation engine calculates an explainable compatibility score ($0 \le \text{Score} \le 100$) based on transparent, university-aligned criteria:

```mermaid
flowchart LR
    Dept["Department Affinity (25 pts)"] --> Score["Total Compatibility Score (0 - 100%)"]
    Expertise["Expertise & Career Goal Match (35 pts)"] --> Score
    Skills["Technical Skills & Mentoring Topics (20 pts)"] --> Score
    Capacity["Faculty Availability & Margin (20 pts)"] --> Score
    Score --> Output["Ranked Advisory Matches + Plain-Text Explanation"]
```

1. **Department Affinity (25 points)**: Matches students with faculty in the same core department, while retaining a base score for interdisciplinary mentoring.
2. **Expertise & Career Alignment (35 points)**: Normalized tag overlap between student career goals/guidance needs and faculty domain expertise.
3. **Technical Skills Overlap (20 points)**: Tag intersection between student competencies and faculty mentoring focus.
4. **Workload Margin (20 points)**: Rewards faculty with available capacity; sets to 0 points if mentor is at max capacity.

---

## 7. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query v5, React Hook Form, Recharts, Framer Motion |
| **Backend** | Node.js, Express.js, TypeScript, RESTful architecture |
| **Database & ORM** | PostgreSQL 18, Prisma ORM 6 |
| **Security** | Bcrypt password hashing, JWT Access/Refresh tokens, Helmet, CORS, Express-Rate-Limit |
| **Testing** | Vitest, Supertest |
| **DevOps & Tooling** | Docker Compose, npm workspaces, ESLint, Prettier |

---

## 8. Installation & Quick Start

### Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- PostgreSQL `v14+` running locally or via Docker
- Git

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bharathdnayak/mentorconnect-ui-task-2.git
cd mentorconnect-ui-task-2
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mentorconnect?schema=public"
TEST_DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mentorconnect_test?schema=public"
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET="mentorconnect_local_dev_access_secret_token"
JWT_REFRESH_SECRET="mentorconnect_local_dev_refresh_secret_token"
CORS_ORIGIN="http://localhost:5173"
VITE_API_URL="http://localhost:5000/api/v1"
```

### 3. Database Initialization & Seeding
```bash
# Push schema to PostgreSQL database
npm run prisma:push

# Seed database with realistic development data
npm run prisma:seed
```

### 4. Start Development Servers
```bash
# Starts both Backend API (port 5000) and Frontend (port 5173) concurrently:
npm run dev
```

Visit the application at: **`http://localhost:5173`**

---

## 9. Development Login Credentials (For Evaluators)

All development accounts are pre-seeded with the password: **`Password123!`**  
*(Note: Evaluator quick-login buttons are also available directly on the login page for instant one-click switching!)*

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **HOD Administrator** | `hod.ise@college.edu` | `Password123!` | Department Head with full administrative & audit controls |
| **Faculty Mentor 1** | `dr.sharma@college.edu` | `Password123!` | Professor (Cloud & Distributed Systems Lead) |
| **Faculty Mentor 2** | `prof.anita@college.edu` | `Password123!` | Associate Professor (Full-Stack & UI/UX Specialist) |
| **Faculty Mentor 3** | `dr.vikram@college.edu` | `Password123!` | Associate Professor (AI & Machine Learning Lab Incharge) |
| **Student Mentee 1** | `bharath.is@college.edu` | `Password123!` | 7th Sem ISE Student (Assigned to Dr. Sharma) |
| **Student Mentee 2** | `priya.is@college.edu` | `Password123!` | 5th Sem ISE Student (Assigned to Prof. Anita) |
| **Student Mentee 3** | `kavya.ai@college.edu` | `Password123!` | 3rd Sem AIML Student (Unassigned mentee for pairing tests) |

---

## 10. Automated Testing Suite

Execute the comprehensive automated test suite (covering authentication, RBAC boundaries, note privacy, capacity enforcement, CSV exports, deployment probes, and prompt recording):

```bash
# Run all tests
npm test
```

### Verified Test Results:
```text
 ✓ tests/prompt-recorder.test.ts (5 tests)
 ✓ tests/api.test.ts (19 tests)

 Test Files  2 passed (2)
      Tests  24 passed (24)
```

---

## 11. Production Build

```bash
# Builds shared packages, API backend, and Vite frontend
npm run build
```

The compiled frontend is output to `apps/web/dist` and the backend to `apps/api/dist`.

---

## 12. Mandatory Development Prompt History Workflow

To uphold academic authenticity and provide college evaluators with a verifiable audit trail of AI-assisted engineering prompts:
1. **Master Prompt Recorded**: The initial master project prompt is preserved verbatim in [`prompts/entries/001-project-master-prompt.md`](./prompts/entries/001-project-master-prompt.md).
2. **Chronological Index**: Evaluators can inspect the prompt progression in [`prompts/prompt-history.md`](./prompts/prompt-history.md).
3. **Helper Script**: Subsequent development prompts are recorded using:
   ```bash
   node scripts/record-prompt.js ./path/to/prompt.txt "Milestone Title" "Objective summary"
   # Or using npm:
   npm run prompt:record -- ./my-prompt.txt "Milestone Title" "Objective summary"
   ```
   The script automatically assigns sequential IDs (`002-...`, `003-...`), prevents file overwriting, timestamps entries, and updates the index table.

---

## 13. Documentation Index
- [System Architecture Specification](docs/architecture.md)
- [Database Relational Design & Constraints](docs/database-design.md)
- [RESTful API Documentation](docs/api-documentation.md)
- [Security & Access Control Architecture](docs/security.md)
- [Automated Testing Strategy](docs/testing.md)
- [Deployment & Infrastructure Guide](docs/deployment.md)
- [26-Point University Evaluation Checklist](docs/evaluation-checklist.md)

---

## 14. Academic Context & Attributions
- **Course**: 7th Semester B.E. Information Science & Engineering
- **Task**: UI Task-2 (Student–Faculty Mentoring Platform)
- **Guided by**: Department of Information Science & Engineering, NMAMIT
- **License**: MIT
