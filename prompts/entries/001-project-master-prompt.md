# Prompt Entry #001: Project Master Specification & Architectural Mandate

- **Prompt ID**: 001
- **Timestamp**: 2026-10-28 18:03:38 IST
- **Author**: Project Initiator / Evaluator
- **Status**: Completed
- **Target Modules**: Entire System (Frontend, Backend API, Database, Shared Packages, Automated Testing, Architecture Docs)

---

## Verbatim Prompt Content

```markdown
github repo :https://github.com/bharathdnayak/mentorconnect-ui-task-2.git
# PROJECT: MentorConnect — Production-Ready Mentor–Mentee Management System

## 1. YOUR ROLE

Act as a senior full-stack software engineer, solution architect, database designer, UI/UX designer, QA engineer, and DevOps engineer.

Build a complete, functional, production-oriented Mentor–Mentee Management System for a college assignment.

Do not create only a static UI, landing page, prototype, or collection of disconnected components.

The final application must have:
- A fully functional frontend.
- A working backend.
- A properly designed PostgreSQL database.
- Authentication and role-based authorization.
- Real CRUD operations.
- Validated APIs.
- Meaningful dashboards.
- Error handling and loading states.
- Automated tests.
- Complete documentation.
- GitHub-ready project structure.
- A persistent record of every development prompt supplied to you.

Work directly within the existing project workspace.

Before creating or modifying files, inspect the repository and understand its current state. Preserve existing user work and do not overwrite unrelated files.

Do not claim a feature works unless it has been implemented and tested.

---

## 2. PROJECT OBJECTIVE

Develop MentorConnect, a web-based mentoring platform for educational institutions.

The platform connects students with faculty mentors and allows the Head of Department (HOD) to manage the overall mentoring process.

The application must support three roles:

1. Mentee — Student.
2. Mentor — Faculty member.
3. Administrator — HOD.

Each role must have a separate dashboard, appropriate permissions, and relevant functionality.

The application must support real database persistence. Data must remain available after logging out, refreshing the page, or restarting the server.

---

## 3. REQUIRED TECHNOLOGY STACK

Use the following stack unless the existing project has a compelling technical reason to use an equivalent.

Frontend:
- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- React Router.
- TanStack Query for server-state management.
- React Hook Form.
- Zod.
- Recharts for relevant dashboard visualizations.
- Framer Motion for restrained animations.

Backend:
- Node.js.
- Express.js.
- TypeScript.
- RESTful APIs.
- Prisma ORM.

Database:
- PostgreSQL.
- Prisma migrations.
- Proper foreign keys, unique constraints, indexes, and relational integrity.

Testing:
- Vitest.
- Supertest.
- Playwright.

Development:
- ESLint.
- Prettier.
- Environment variables.
- Git.
- Docker Compose for local PostgreSQL if appropriate.

Use compatible, stable package versions. Avoid unnecessary libraries and dependencies.

Keep the frontend, backend, database, and business logic clearly separated.

---

## 4. USER ROLES AND PERMISSIONS

Implement proper role-based access control on the backend.

### A. MENTEE / STUDENT

Students must be able to:

1. Register or access an institution-provisioned account.
2. Log in and log out securely.
3. View and edit their permitted profile information.
4. Complete their mentoring profile.
5. Add academic, personal-interest, and career information.
6. View their assigned mentor.
7. View mentor recommendations when authorized.
8. Request a mentor change.
9. View meeting schedules.
10. View announcements relevant to them.
11. View their mentoring history.
12. Submit feedback after completed meetings.
13. Track profile completion.
14. Manage their account settings.

Student profile fields should include:

- Full name.
- Student ID or USN.
- College email.
- Department.
- Degree or programme.
- Semester.
- Section, if applicable.
- Academic year.
- Contact information where appropriate.
- Hobbies and interests.
- Technical skills.
- Career goals.
- Areas in which guidance is needed.
- Preferred mentoring topics.
- Short self-introduction.
- Profile photograph, if implemented securely.

Keep sensitive information private and visible only to authorized users.

Do not require students to disclose sensitive personal information that is unnecessary for mentoring.

### B. MENTOR / FACULTY

Mentors must be able to:

1. Log in securely.
2. View their assigned mentees.
3. Search and filter mentees.
4. Open individual mentee profiles.
5. View relevant academic and mentoring information.
6. Add mentoring notes with appropriate access controls.
7. Schedule mentoring sessions.
8. Update meeting status.
9. Record meeting outcomes and action items.
10. Recommend another suitable mentor when necessary.
11. Track mentee progress.
12. View upcoming meetings.
13. Review previous mentoring sessions.
14. View relevant announcements.
15. Manage their faculty profile.

Mentor profile fields should include:

- Full name.
- Faculty ID.
- Institutional email.
- Department.
- Designation.
- Areas of expertise.
- Technical skills.
- Research interests, if relevant.
- Mentoring interests.
- Professional biography.
- Maximum mentee capacity.
- Current mentee count.

Mentors must not access students or administrative information outside their authorized scope.

### C. ADMINISTRATOR / HOD

The HOD must have an administrative dashboard with appropriate privileges.

The HOD must be able to:

1. View overall application statistics.
2. Manage student accounts.
3. Manage mentor accounts.
4. Create, update, deactivate, and reactivate accounts.
5. Assign mentees to mentors.
6. Reassign mentees when necessary.
7. Approve or reject mentor-change requests.
8. Review mentor recommendations.
9. Manage departments and academic information.
10. Configure mentoring capacity.
11. Publish announcements.
12. Create academic-year or semester settings.
13. View mentor workloads.
14. Identify unassigned students.
15. View mentoring activity reports.
16. Export authorized reports to CSV.
17. View audit logs.
18. Configure institution-specific information.

Implement confirmation dialogs for destructive or consequential administrative actions.

Do not allow users to elevate their own privileges.

Public registration must never allow someone to register as an administrator or mentor without authorization.

---

## 5. MENTOR ASSIGNMENT AND RECOMMENDATION SYSTEM

Implement a meaningful mentor recommendation feature.

The system should recommend suitable mentors using explainable matching criteria.

Consider:

- Department compatibility.
- Mentor areas of expertise.
- Student career goals.
- Student interests.
- Student guidance requirements.
- Mentor availability.
- Maximum mentee capacity.
- Existing mentee workload.

Create a simple, explainable matching algorithm.

For example, calculate a compatibility score from configurable weighted criteria.

Display:
- Mentor name.
- Department.
- Areas of expertise.
- Availability.
- Compatibility score.
- Short explanation of why the mentor is recommended.

Clearly distinguish recommendations from confirmed assignments.

A recommendation must not automatically change a student's assigned mentor.

Allow the authorized mentor or HOD to review recommendations and complete the assignment workflow.

Prevent assignments that exceed configured capacity unless an authorized administrator explicitly overrides the restriction.

Do not invent student or faculty information to produce recommendations.

Handle cases where no suitable mentor is available.

---

## 6. MEETING AND MENTORING WORKFLOW

Create a complete mentoring-session management module.

Each session should support:

- Session title.
- Mentee.
- Mentor.
- Scheduled date and time.
- Duration.
- Meeting type.
- Location or meeting link, when applicable.
- Agenda.
- Status.
- Meeting notes.
- Action items.
- Follow-up date.
- Creation and modification timestamps.

Meeting statuses may include:

- Scheduled.
- Completed.
- Cancelled.
- Rescheduled.

Provide:
- Upcoming meetings.
- Past meetings.
- Session details.
- Meeting history.
- Follow-up tracking.
- Relevant calendar or list views.

Apply permissions so only authorized participants can access meeting details.

Use appropriate date and time validation.

Avoid creating a complicated calendar system unless the core functionality is complete.

---

## 7. DATABASE DESIGN

Design a normalized PostgreSQL database using Prisma.

Consider the following entities:

- User.
- StudentProfile.
- MentorProfile.
- Department.
- AcademicTerm.
- MentorAssignment.
- MentorRecommendation.
- MentorChangeRequest.
- MentoringSession.
- MeetingNote.
- ActionItem.
- Announcement.
- Feedback.
- Notification.
- AuditLog.

Use suitable relationships and constraints.

Requirements:

1. Use primary keys and foreign keys.
2. Use unique constraints for email addresses and institutional identifiers.
3. Add indexes to frequently queried fields.
4. Use appropriate enums or constrained values for statuses.
5. Include creation and modification timestamps.
6. Handle deletion and deactivation carefully.
7. Preserve historical assignment and meeting records.
8. Prevent duplicate active assignments.
9. Use database transactions for multi-step operations.
10. Define appropriate deletion and update behavior.
11. Keep private data out of unnecessary API responses.
12. Add migrations for database changes.

Use soft deletion or account deactivation where historical records must remain intact.

Do not rely on frontend validation alone.

Implement backend validation and database constraints.

Create realistic seed data for local development, including:
- One development administrator.
- Several faculty mentors.
- Multiple students.
- Sample assignments.
- Sample recommendations.
- Sample mentoring sessions.
- Sample announcements.

Clearly document that seed accounts and sample data are for development only.

Never seed production with publicly known default credentials.

---

## 8. AUTHENTICATION AND SECURITY

Implement secure authentication and authorization.

Requirements:

- Password hashing with Argon2id or bcrypt using appropriate parameters.
- Secure session management or a properly implemented access-token and refresh-token strategy.
- HttpOnly cookies when using cookie-based authentication.
- Appropriate Secure and SameSite cookie settings.
- CSRF protection when required by the chosen cookie-based architecture.
- Login and registration validation.
- Server-side role checks.
- Resource ownership checks.
- Login rate limiting.
- Authentication error handling.
- Secure CORS configuration.
- Helmet security headers.
- Request payload validation.
- Protection against mass assignment.
- Protection against insecure direct object references.
- Safe handling of database errors.
- Appropriate session expiration and logout behavior.
- Secrets stored in environment variables.
- No hardcoded production credentials.
- No passwords or authentication tokens in logs.
- No sensitive information in client-side storage unnecessarily.

Use least-privilege access control.

Students must not be able to modify their roles through API requests.

Mentors must not be able to access other mentors' private notes or unauthorized student records.

Only administrators may access authorized administrative endpoints.

Validate authorization independently on the server, even when the frontend hides restricted buttons or pages.

Document the security decisions in the README.

---

## 9. REST API DESIGN

Create versioned APIs under `/api/v1`.

Organize the API into modules such as:

- Authentication.
- Users.
- Students.
- Mentors.
- Departments.
- Assignments.
- Recommendations.
- Mentor-change requests.
- Mentoring sessions.
- Announcements.
- Notifications.
- Feedback.
- Reports.
- Audit logs.

Follow REST conventions.

Implement:
- Appropriate HTTP methods.
- Meaningful status codes.
- Consistent response structures.
- Request validation.
- Pagination.
- Search and filtering.
- Sorting where appropriate.
- Centralized error handling.
- Authentication middleware.
- Authorization middleware.
- Request logging without exposing sensitive information.

Use database-backed endpoints for all essential application features.

Do not replace backend functionality with hardcoded arrays, mock API responses, or localStorage.

Local component state may be used for temporary interface interactions, but persistent application data must come from the backend.

Provide an API health endpoint.

Document important endpoints and their authorization requirements.

---

## 10. UI/UX DESIGN DIRECTION

Create a polished, modern, professional academic application.

The interface should feel like a well-designed SaaS dashboard: clean, approachable, organized, and functional.

Avoid both extremes:
- Do not make the application visually overwhelming with excessive gradients, animations, colors, cards, and charts.
- Do not make it look like a plain college assignment with unstyled HTML forms and generic tables.

### Visual direction

Use:
- A restrained primary color palette.
- Neutral backgrounds.
- Clear typography.
- Consistent spacing.
- Subtle borders.
- Moderate corner radii.
- Soft shadows only where useful.
- Clear visual hierarchy.
- Consistent iconography.
- Responsive layouts.

Use one primary brand color and a limited set of semantic colors.

Suggested direction:
- Deep blue or indigo as the primary color.
- White or light neutral backgrounds.
- Muted slate text.
- Green for success.
- Amber for warnings.
- Red for errors or destructive actions.

Keep colors accessible and maintain adequate text contrast.

### Application layout

Create a consistent application shell containing:

- Sidebar navigation on desktop.
- Collapsible sidebar.
- Mobile-friendly navigation.
- Top navigation bar.
- Page title and contextual description.
- Breadcrumbs where useful.
- User profile menu.
- Notification indicator.
- Main content area.

Do not place every possible feature in the main navigation.

Group related functionality logically.

### Dashboards

Each role must see a different dashboard.

Student dashboard:
- Welcome message.
- Profile completion.
- Assigned mentor.
- Upcoming session.
- Recommended mentors.
- Recent mentoring activity.
- Pending action items.

Mentor dashboard:
- Assigned mentee count.
- Upcoming sessions.
- Recent activity.
- Mentee list.
- Pending follow-ups.
- Recommendations requiring attention.

HOD dashboard:
- Total students.
- Total mentors.
- Assigned and unassigned students.
- Mentor workload.
- Pending assignment requests.
- Upcoming sessions.
- Relevant department-level statistics.

Use charts only when they provide meaningful information.

Do not fill dashboards with decorative or redundant charts.

### Forms and interactions

Implement:
- Clear field labels.
- Inline validation.
- Helpful error messages.
- Loading indicators.
- Disabled states during submissions.
- Success notifications.
- Confirmation dialogs.
- Empty states with useful next actions.
- Retry actions for recoverable errors.
- Search and filters.
- Pagination for large datasets.
- Accessible keyboard navigation.
- Focus indicators.
- Appropriate tooltips.
- Responsive tables or mobile-friendly list views.

Use skeleton loading where appropriate.

Avoid unnecessary full-page reloads.

### Animations

Use Framer Motion sparingly for:
- Sidebar transitions.
- Modal appearance.
- Page transitions when appropriate.
- Small interaction feedback.

Animations must be quick and subtle.

Respect reduced-motion preferences.

Do not animate every card or element.

### Responsive design

The application must work properly on:
- Desktop.
- Laptop.
- Tablet.
- Mobile.

Prevent horizontal overflow.

Make forms, tables, navigation, and dialogs usable on small screens.

### Accessibility

Use semantic HTML.

Associate form labels with inputs.

Support keyboard navigation.

Provide accessible names for icon-only buttons.

Use appropriate ARIA attributes where necessary.

Maintain visible focus states and adequate contrast.

---

## 11. REQUIRED PAGES

Build and connect the following pages.

### Public pages
- Login.
- Authorized account registration or invitation acceptance.
- Forgot password.
- Reset password.
- Unauthorized or access-denied page.
- Not-found page.

Only implement password-reset flows that can be completed securely. If an external email service is not configured, document the development limitation rather than pretending emails were sent.

### Student pages
- Student dashboard.
- My profile.
- Edit profile.
- My mentor.
- Recommended mentors.
- Mentoring sessions.
- Session details.
- Mentor-change request.
- Announcements.
- Notifications.
- Feedback.
- Account settings.

### Mentor pages
- Mentor dashboard.
- Faculty profile.
- My mentees.
- Mentee profile details.
- Mentor recommendations.
- Mentoring sessions.
- Create or update session.
- Session notes.
- Follow-up actions.
- Announcements.
- Notifications.
- Account settings.

### HOD pages
- Administrative dashboard.
- Student management.
- Mentor management.
- Department management.
- Academic-term management.
- Mentor assignments.
- Mentor recommendations.
- Mentor-change requests.
- Mentoring sessions overview.
- Announcements management.
- Reports and exports.
- Audit logs.
- Administrative settings.

Implement shared components where appropriate.

Do not create separate copies of identical components for each role.

---

## 12. SEARCH, FILTERING, AND DATA MANAGEMENT

Implement practical search and filtering.

Examples:

Student management:
- Search by name or student ID.
- Filter by department.
- Filter by semester.
- Filter by assignment status.

Mentor management:
- Search by faculty name or ID.
- Filter by department.
- Filter by available capacity.
- Filter by expertise.

Mentoring sessions:
- Filter by date.
- Filter by mentor.
- Filter by student.
- Filter by session status.

Use backend pagination for larger datasets.

Implement CSV export with correct authorization and appropriate escaping.

Avoid exposing information that the requesting user is not authorized to access.

---

## 13. NOTIFICATIONS AND AUDIT LOGGING

Implement useful in-application notifications.

Examples:
- Mentor assigned.
- Assignment changed.
- Mentor-change request reviewed.
- Session scheduled.
- Session rescheduled.
- New announcement published.
- Follow-up action approaching its due date.

Persist notifications in PostgreSQL.

Allow users to mark notifications as read.

Do not add real-time WebSocket infrastructure unless the core system works and there is a genuine need for it.

Implement audit logs for significant administrative actions, including:
- Account activation or deactivation.
- Mentor assignments.
- Mentor reassignments.
- Mentor-change request decisions.
- Department-level configuration changes.

Record the actor, action, relevant resource, timestamp, and appropriate metadata.

Never store passwords, tokens, or other secrets in audit logs.

Restrict access to audit logs.

---

## 14. ERROR HANDLING AND APPLICATION RELIABILITY

Implement a consistent error-handling strategy.

Handle:
- Invalid inputs.
- Unauthorized access.
- Forbidden operations.
- Missing resources.
- Duplicate records.
- Database connection failures.
- Expired sessions.
- Network errors.
- Empty results.
- Unexpected server errors.

Use appropriate HTTP status codes.

Show clear user-facing error messages without exposing stack traces or internal implementation details.

Log diagnostic information on the server without leaking credentials or personal information.

Add graceful handling for database unavailability.

Do not silently swallow errors.

---

## 15. PROJECT STRUCTURE

Use a clean monorepo structure similar to:

mentorconnect/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── config/
│       │   └── app.ts
│       └── package.json
├── packages/
│   └── shared/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-documentation.md
│   ├── security.md
│   ├── testing.md
│   ├── deployment.md
│   └── evaluation-checklist.md
├── prompts/
│   ├── README.md
│   ├── prompt-history.md
│   └── entries/
├── scripts/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── package.json

Adapt this structure when necessary, but preserve clear separation of responsibilities.

Do not create empty folders or placeholder files that serve no purpose.

---

## 16. MANDATORY PROMPT HISTORY AND EVALUATION DOCUMENTATION

This is a critical requirement.

I need to submit the project to my college and demonstrate the prompts used during development.

Every development prompt I provide to you must be recorded in the Git repository.

Create a persistent prompt-history workflow.

### Required files

`prompts/README.md`

Explain:
- Why prompt history is maintained.
- How prompts are recorded.
- How to add future prompts.
- How evaluators can review the development process.

`prompts/prompt-history.md`

Maintain a chronological index of all development prompts.

For each prompt, include:
- Prompt ID.
- Date and time, when available.
- Short title.
- Objective.
- Related files or modules.
- Status.
- Link to the full prompt entry.

`prompts/entries/`

Store the complete text of each development prompt in a separate Markdown file.

Use filenames such as:

- `001-project-master-prompt.md`
- `002-database-design.md`
- `003-authentication.md`
- `004-student-dashboard.md`
- `005-mentor-assignment.md`

These names are examples. Generate sequential IDs without overwriting existing entries.

### Mandatory prompt recording rules

1. Record this master prompt as the first prompt entry.
2. Whenever I provide another development prompt, add its complete text to a new prompt-entry file.
3. Update `prompts/prompt-history.md`.
4. Update `prompts/README.md` only when its instructions need to change.
5. Preserve previous prompt entries.
6. Never silently replace an earlier prompt.
7. Do not fabricate prompts or claim that a prompt was provided when it was not.
8. Include enough context to understand what each prompt was intended to change.
9. Preserve important implementation instructions and acceptance criteria.
10. Keep all prompt files in Markdown so they can be reviewed on GitHub.

### Important technical limitation

Do not pretend that you can automatically capture every future conversation message.

Implement a reliable workflow in the repository that makes prompt recording straightforward.

If Antigravity cannot automatically detect or record prompts from future conversation turns, create a helper script or a documented procedure for appending prompts.

For example, implement a command-line script that accepts a prompt from a text file and:
- Generates the next sequential prompt ID.
- Copies the exact prompt into `prompts/entries/`.
- Adds a corresponding entry to `prompts/prompt-history.md`.
- Includes a timestamp when available.
- Avoids overwriting previous records.
- Validates the input.
- Handles failures safely.

If feasible, provide a command such as:

`npm run prompt:record -- ./my-prompt.md`

Adapt the implementation to the final package structure.

The helper script must preserve the original prompt text without silently modifying its meaning.

Document exactly how to use it.

Do not claim that future prompts will be recorded automatically unless a working automatic integration actually exists and has been tested.

Git commits and prompt history are separate things. Maintain both appropriately.

---

## 17. README REQUIREMENTS

Create a professional root README.md suitable for a GitHub repository and college evaluation.

Include:

1. Project title.
2. Project overview.
3. Problem statement.
4. Project objectives.
5. Existing problem and proposed solution.
6. Features.
7. User roles.
8. Technology stack.
9. System architecture.
10. Database design overview.
11. Major application modules.
12. Mentor recommendation algorithm.
13. Authentication and security.
14. Screenshots section.
15. API overview.
16. Installation instructions.
17. Environment configuration.
18. Database setup.
19. Migration and seed instructions.
20. How to run the frontend and backend.
21. How to run tests.
22. How to build the application.
23. Deployment instructions.
24. Development prompt history.
25. Known limitations.
26. Future enhancements.
27. Evaluation checklist.
28. Author and academic context placeholders that I can fill in.

Add Mermaid diagrams for:
- High-level system architecture.
- Core database relationships.
- Main mentor-assignment workflow.

Do not invent evaluation results, deployment URLs, screenshots, or test results.

Clearly distinguish completed functionality from planned enhancements.

Provide accurate commands that work with the actual project.

---

## 18. ENVIRONMENT AND DEPLOYMENT

Create `.env.example` containing the required environment-variable names without real secrets.

Document:
- Database connection string.
- Session or token secrets.
- Frontend API base URL.
- Allowed frontend origin.
- Other required configuration.

Ensure `.env` files and secrets are ignored by Git.

Provide local development instructions.

Use Docker Compose for a convenient local PostgreSQL setup if appropriate.

Create production build scripts.

Provide deployment instructions for the selected hosting architecture.

Do not claim the application is deployed unless it actually is.

Include:
- Production database migration procedure.
- Environment-variable setup.
- Health checks.
- Logging considerations.
- Database backup considerations.
- HTTPS requirements.
- Deployment verification steps.

Do not use development credentials or sample data in production.

---

## 19. AUTOMATED TESTING

Write meaningful tests.

At minimum, test:

### Authentication
- Successful login.
- Invalid credentials.
- Unauthenticated access.
- Logout and session invalidation.

### Authorization
- Students cannot access HOD-only endpoints.
- Students cannot change their roles.
- Mentors cannot access unauthorized mentee records.
- Unauthorized users cannot read private mentoring notes.

### Student profiles
- Create or complete a profile.
- Update permitted fields.
- Reject invalid data.

### Mentor assignment
- Assign a student to a mentor.
- Prevent duplicate active assignments.
- Enforce mentor capacity.
- Reject unauthorized assignments.
- Preserve assignment history.

### Recommendations
- Generate explainable recommendations.
- Respect capacity restrictions.
- Handle missing matches.

### Mentoring sessions
- Create a session.
- Validate session details.
- Update session status.
- Enforce access restrictions.

### Prompt history
- Record a prompt.
- Increment prompt IDs correctly.
- Preserve existing entries.
- Reject missing or invalid input.
- Avoid overwriting files.

### End-to-end tests
Verify the main workflows:

1. Student logs in and completes a profile.
2. Mentor views an assigned mentee.
3. HOD assigns a student to a mentor.
4. A mentor recommendation is generated.
5. A mentoring session is scheduled.
6. An unauthorized user is denied access.

Run the tests and fix failures.

Report any tests that cannot be executed and explain why.

---

## 20. IMPLEMENTATION WORKFLOW

Follow these stages.

### Stage 1: Inspect and plan
- Inspect the repository.
- Identify existing code and dependencies.
- Review Git status and recent changes.
- Avoid overwriting existing work.
- Establish architecture and implementation milestones.
- Identify important technical decisions.

### Stage 2: Project foundation
- Configure the monorepo.
- Set up TypeScript.
- Configure linting and formatting.
- Configure environment variables.
- Set up PostgreSQL and Prisma.
- Add health checks.
- Create initial documentation.

### Stage 3: Database and authentication
- Design the schema.
- Add migrations.
- Implement seed data.
- Implement authentication.
- Add authorization middleware.
- Test the core security rules.

### Stage 4: Backend modules
- Implement profile management.
- Implement mentor assignments.
- Implement recommendations.
- Implement mentoring sessions.
- Implement announcements and notifications.
- Implement reports and audit logs.

### Stage 5: Frontend foundation
- Implement the design system.
- Create reusable components.
- Implement authentication pages.
- Build role-based layouts.
- Add responsive navigation.

### Stage 6: Feature development
- Build student workflows.
- Build mentor workflows.
- Build HOD workflows.
- Connect all screens to real APIs.
- Add loading, error, success, and empty states.

### Stage 7: Integration and testing
- Test database persistence.
- Test authorization boundaries.
- Test all core workflows.
- Run automated tests.
- Fix TypeScript and build errors.
- Check responsive layouts.
- Remove dead code and unnecessary dependencies.

### Stage 8: Documentation and GitHub readiness
- Complete README.md.
- Complete technical documentation.
- Verify prompt-history recording.
- Check `.gitignore`.
- Ensure no secrets or private information are committed.
- Add screenshots only after the corresponding screens exist.
- Verify installation instructions from a clean environment where feasible.
- Provide a final evaluation checklist.

Do not stop after creating the initial folder structure.

Continue implementing the application until the core workflows function end to end.

If a genuine external dependency prevents completion, explain the limitation and implement the remaining functionality without fabricating success.

---

## 21. ACCEPTANCE CRITERIA

The project is considered complete only when:

1. The frontend starts successfully.
2. The backend starts successfully.
3. PostgreSQL connectivity works.
4. Database migrations execute successfully.
5. Authentication works.
6. Role-based authorization is enforced by the backend.
7. Student profiles persist in the database.
8. Mentors can view their assigned mentees.
9. HOD can assign and reassign mentees.
10. Mentor recommendations produce meaningful, explainable results.
11. Mentor capacity is enforced.
12. Mentoring sessions can be created and managed.
13. Relevant notifications persist.
14. Administrative actions are audited.
15. Search and filtering work.
16. CSV export works for authorized users.
17. The interface is responsive.
18. Loading, error, and empty states are implemented.
19. Automated tests cover critical workflows.
20. Production build commands succeed.
21. README instructions match the actual code.
22. Prompt-history files contain this master prompt.
23. The prompt-recording helper works.
24. All generated files are organized and tracked appropriately.
25. No real secrets or credentials are committed.
26. No critical feature is represented by a fake success message or disconnected mock interface.

---

## 22. FINAL INSTRUCTIONS

Prioritize correctness, usability, maintainability, and security over adding excessive features.

Build the core functionality first.

Use realistic but clearly identified development seed data.

Do not add unnecessary microservices, complicated infrastructure, or artificial AI features.

Do not use localStorage as the primary database.

Do not leave important buttons nonfunctional.

Do not create fake charts disconnected from actual application data.

Do not claim testing, deployment, or prompt automation succeeded unless verified.

Make sensible technical decisions without repeatedly asking me about minor details.

If a major decision depends on an unavailable service, choose a practical development-friendly alternative and document the trade-off.

After implementation, provide a concise final report containing:

- Features completed.
- Architecture and technology stack.
- Database setup instructions.
- Commands to start the application.
- Development login instructions.
- Tests executed and their results.
- Prompt-history recording instructions.
- Known limitations.
- Steps needed before production deployment.

Begin by inspecting the existing workspace, then implement the project in stages. Continue beyond planning and scaffolding until the application is functional and the acceptance criteria have been verified.
```
