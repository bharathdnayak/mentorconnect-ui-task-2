# Prompt Entry #007: Zero-Cost College Demonstration Deployment (Neon + Render + Netlify)

- **Prompt ID**: 007
- **Timestamp**: 2026-10-28 15:17:40 UTC
- **Status**: Completed
- **Objective**: Deploy existing project using free-tier services: Neon free PostgreSQL, Render free Web Service, and Netlify with zero cost

---

## Verbatim Prompt Content

```markdown
# Zero-Cost College Demonstration Deployment: Neon Free PostgreSQL + Render Free Web Service + Netlify Frontend

I want to deploy my existing MentorConnect project for a short-term college demonstration. I do not want to pay for any cloud service or database.

GitHub repository:
https://github.com/bharathdnayak/mentorconnect-ui-task-2.git

## Objective

Deploy the existing project using free-tier services wherever available:
- Frontend: Netlify
- Backend: Render free web service, if available for my account and region
- Database: Neon free PostgreSQL tier, subject to current availability and limits
- ORM: Existing Prisma ORM
- Version control: Existing GitHub repository

Do not use Supabase. Do not select a paid Render PostgreSQL plan. Do not purchase subscriptions, upgrade plans, or incur any charges.

## Step 1: Audit the existing project before changing anything
Inspect: Git status, branch, commits, package.json, workspaces, Prisma schema and migrations, env handling, auth, API routes, netlify.toml, render.yaml, .env.example, .gitignore, docs/deployment.md, tests.
Preserve all existing work. Do not push new commits unless explicitly authorized.

## Step 2: Keep the current architecture
Retain React + Vite, Node + Express + TS, PostgreSQL, Prisma ORM, auth, models, business logic. Do not introduce Supabase.

## Step 3: Prepare the database for free hosting
Prepare connection to free Neon PostgreSQL database.
Use existing Prisma schema. Use DATABASE_URL. If Prisma requires direct connection URL for migrations, configure directUrl. Keep credentials in env vars. Keep .env.example sanitized. Preserve migrations. Do not run destructive commands. Explain Neon dashboard setup.

## Step 4: Configure the backend for free hosting
Inspect Render config for free web service. Verify build/start commands, TypeScript compilation, Prisma client, migration command, health check, PORT handling, 0.0.0.0 binding, CORS, env handling. Explain free hosting limitations (cold starts, sleeping).

## Step 5: Configure the frontend
Configure Netlify to build existing frontend. Use VITE_API_URL. Ensure publish dir, SPA routing fallback, no hardcoded localhost, no exposed secrets.

## Step 6: Validate the complete setup
Run tests, builds, Prisma schema validation, migration review, secret checks.

## Step 7: Report the result
Report files changed, tests passed, settings ready, dashboard steps, environment variables, deployment instructions, verification steps, and confirmation that no charges will be incurred.
```
