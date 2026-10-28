# Prompt Entry #006: Production Deployment Preparation for Render and Netlify

- **Prompt ID**: 006
- **Timestamp**: 2026-10-28 14:55:00 UTC
- **Status**: Completed
- **Objective**: Prepare existing application for Render backend, Render PostgreSQL, Netlify frontend, and GitHub repository without modifying data or using Supabase

---

## Verbatim Prompt Content

```markdown
# MentorConnect: Production-Ready Database and Deployment

## Objective

Prepare my existing MentorConnect — Mentor–Mentee Management System — for production deployment.

Use:
- Frontend: React + Vite, deployed on Netlify.
- Backend: Existing Node.js + Express + TypeScript application, deployed on Render.
- Database: Render PostgreSQL.
- ORM: Existing Prisma setup.
- Source control: Existing GitHub repository.

Do NOT use Supabase or introduce another database provider.

The application must work locally during development and use the cloud PostgreSQL database after deployment. All application data must persist across browser refreshes, application restarts, and redeployments, subject to the database provider's retention and backup policies.

## Phase 1: Inspect the existing project

Before changing anything:

1. Inspect the repository structure, package.json files, workspace configuration, Prisma schema, migration history, environment variables, API routes, frontend API configuration, tests, and deployment files.
2. Run `git status`, inspect relevant diffs, and review recent commits.
3. Identify the existing database setup and determine how Prisma is currently initialized.
4. Identify all existing features, database models, seed scripts, and authentication mechanisms.
5. Identify how prompt history is recorded and how existing prompt entries are organized.

Do not assume file paths, scripts, model names, or framework versions. Discover them from the repository.

## Phase 2: Preserve the application

1. Preserve existing features, UI, API routes, validation, authentication, authorization, and database models.
2. Do not recreate the project or replace working code with a simplified implementation.
3. Do not delete, reset, or overwrite the local database.
4. Do not run destructive database commands.
5. Preserve existing tests and add or update tests only where necessary.
6. Keep all existing prompt history. Record this task using the repository's existing prompt-recording workflow, without replacing earlier entries.

## Phase 3: Configure PostgreSQL and Prisma

1. Configure the existing Prisma datasource to use PostgreSQL and read its connection URL from `DATABASE_URL`.
2. Reuse the existing Prisma schema and migration history.
3. Preserve a separate local development database configuration if one already exists.
4. Ensure the application can use a local PostgreSQL database during development and Render PostgreSQL in production.
5. Never hardcode credentials in source code.
6. Ensure `.env` is excluded from Git and `.env.example` contains placeholders only.
7. Never print database passwords or commit secrets.

Do not attempt a cloud connection until I have created the Render PostgreSQL database and configured its connection URL.

If the cloud database does not exist yet, prepare the project and give me the exact steps to create it and obtain its connection URL.

## Phase 4: Database migrations and persistence

1. Inspect the existing Prisma version and migration setup.
2. Determine the correct production migration command for this repository.
3. Prefer the existing Prisma migration workflow. If migrations are already configured, prepare the deployment process to apply pending migrations safely.
4. Do not use `prisma migrate reset`, drop existing tables, or delete production data.
5. Do not use `prisma db push` blindly against an existing production database.
6. Do not seed the production database automatically unless the existing design explicitly requires it and the operation is safe and repeatable.
7. Verify that the deployed backend can read and write records through Prisma.
8. Ensure the application does not depend on in-memory arrays or mock data for core persistent features.
9. Check that registration, login, profile updates, and other existing database-backed operations use the real database.
10. Ensure the database connection is configured correctly for Render and the chosen connection URL.

## Phase 5: Prepare the Render backend

1. Determine the correct backend root directory, build command, start command, and required environment variables from the actual repository.
2. Ensure the backend listens on Render's assigned port where required.
3. Configure the production database connection through Render environment variables.
4. Configure the deployed frontend's origin using the existing CORS setup.
5. Ensure production startup does not depend on local files, local-only services, or an unavailable development database.
6. Add a suitable health-check endpoint if the application does not already have one.
7. Do not expose database credentials in logs or API responses.

## Phase 6: Prepare the Netlify frontend

1. Determine the correct frontend root directory, build command, and publish directory.
2. Configure the frontend to call the deployed backend using an environment variable such as `VITE_API_URL`, adapting the name to the existing code where appropriate.
3. Remove hardcoded localhost API URLs from production paths.
4. Preserve local development API configuration.
5. Configure SPA routing redirects if the application requires them.
6. Document the required Netlify environment variables.

## Phase 7: Security and production checks

1. Confirm secrets are not tracked by Git.
2. Verify authentication and authorization remain enforced on the backend.
3. Ensure users cannot access or modify records they are not authorized to access.
4. Check input validation, error handling, and CORS configuration.
5. Avoid exposing internal errors or database connection details to users.
6. Run existing tests and add appropriate tests for database-backed operations.
7. Do not claim that cloud connectivity or production persistence has been verified until it has actually been tested.

## Phase 8: Documentation

Update the existing deployment documentation to explain:

- How to create a Render PostgreSQL database.
- How to configure its connection URL securely.
- How to deploy the backend on Render.
- How to configure production environment variables.
- How to apply Prisma migrations safely.
- How to deploy the frontend on Netlify.
- How to connect the frontend to the backend.
- How to verify that records are written to and retrieved from the cloud database.
- How to run the application locally.

Keep the instructions specific to the actual repository.

## Phase 9: GitHub safety

1. Inspect `git status` and review the final diff.
2. Ensure `.env`, database credentials, and other secrets are not staged or committed.
3. Preserve all earlier prompt-history entries.
4. Record this prompt through the existing prompt recorder.
5. Do not push to GitHub or deploy anything without my explicit approval.

## Final report

When finished, provide:

1. What you changed.
2. Which tests passed and failed.
3. Whether any blockers remain.
4. The exact steps I must perform in the Render dashboard.
5. The exact Render environment variables I must configure, without inventing secret values.
6. The exact steps for deploying the backend and frontend.
7. The commands I should run to apply migrations safely.
8. How I can verify that deployed application data is actually saved in PostgreSQL.

Stop and ask for the necessary action whenever a real cloud credential, database creation, or external configuration is required.

Do not use Supabase.
Do not invent credentials.
Do not reset or delete data.
Do not deploy or push without approval.
```
