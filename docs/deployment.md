# MentorConnect — Production Deployment Guide
## Render PostgreSQL + Render Web Service + Netlify Frontend

This guide outlines the production deployment of the **MentorConnect** application using:
- **Database**: Cloud PostgreSQL on **Render**
- **Backend API**: Node.js + Express + TypeScript on **Render Web Service**
- **Frontend**: React 18 + Vite SPA on **Netlify**
- **ORM / Schema**: Prisma ORM with idempotent migration deployments

---

## 1. Architecture Overview

```mermaid
flowchart LR
    Browser["Client Browser"]
    Netlify["Netlify CDN (apps/web SPA)"]
    RenderAPI["Render Web Service (apps/api Express)"]
    RenderDB[("Render PostgreSQL Database")]

    Browser -->|HTTPS (HTML/JS/CSS)| Netlify
    Browser -->|REST API Requests (/api/v1)| RenderAPI
    RenderAPI -->|Prisma Client / SSL| RenderDB
```

- **Persistence Guarantee**: All data (users, student profiles, faculty profiles, meetings, notes, action items, feedback, audit logs) is stored directly in Render PostgreSQL. Data persists across browser refreshes, restarts, and redeployments.
- **Security**: JWT-based stateless authentication, strict role-based access control, hashed passwords (bcrypt), parameterized Prisma queries, Helmet HTTP security headers, and domain-restricted CORS.

---

## 2. Step 1: Create Render PostgreSQL Database

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **PostgreSQL**.
3. Configure the database instance:
   - **Name**: `mentorconnect-db`
   - **Database**: `mentorconnect`
   - **User**: `mentorconnect_user`
   - **Region**: Choose the region closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`).
   - **PostgreSQL Version**: `16` (recommended)
   - **Plan**: `Free`
4. Click **Create Database**.
5. Once provisioned, note the connection details from the database dashboard:
   - **Internal Database URL**: Format `postgresql://mentorconnect_user:...@dpg-xxxxx-a:5432/mentorconnect` (Used for Render Web Service).
   - **External Database URL**: Format `postgresql://mentorconnect_user:...@dpg-xxxxx-a.oregon-postgres.render.com/mentorconnect?sslmode=require` (Used for migrations from local machine or external tooling).

---

## 3. Step 2: Apply Prisma Migrations to Render PostgreSQL

Before starting the web service, initialize the database tables using the existing Prisma migration:

### Option A: Apply from your local terminal (using External Database URL)
Set the external database URL temporarily in your shell (or pass inline) and run:
```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://mentorconnect_user:[PASSWORD]@dpg-xxxxx-a.oregon-postgres.render.com/mentorconnect?sslmode=require"
npx prisma migrate deploy

# Optional: Populate initial departments and academic accounts
npx tsx prisma/seed.ts
```

### Option B: Automatic deployment during Render build
The build script in `render.yaml` or Render dashboard automatically runs `npx prisma migrate deploy` before launching the server.

> [!IMPORTANT]
> `prisma migrate deploy` is safe and idempotent. It applies only pending migrations from `prisma/migrations/`, without dropping tables, resetting sequences, or deleting records. Never use `prisma migrate reset` in production.

---

## 4. Step 3: Deploy Backend API on Render

1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository: `bharathdnayak/mentorconnect-ui-task-2`.
3. Configure the service settings:
   - **Name**: `mentorconnect-api`
   - **Region**: Same region as your PostgreSQL instance (e.g., `Oregon`).
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty or set to repository root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build:api && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     node apps/api/dist/index.js
     ```
   - **Plan**: `Free`
4. Click **Advanced** and configure **Environment Variables**:

| Environment Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | `production` |
| `DATABASE_URL` | Internal Connection String from Step 1 | `postgresql://mentorconnect_user:pass@dpg-xxxxx-a:5432/mentorconnect` |
| `PORT` | Render sets this automatically (defaults to `10000`) | Leave default or set `5000` |
| `JWT_ACCESS_SECRET` | Strong cryptographically random 256-bit string | `d3f8a9e4b7c1248...` |
| `JWT_REFRESH_SECRET` | Strong cryptographically random 256-bit string | `8a7b6c5d4e3f210...` |
| `JWT_ACCESS_EXPIRATION` | Token validity duration | `1h` |
| `JWT_REFRESH_EXPIRATION` | Refresh token duration | `7d` |
| `CORS_ORIGIN` | Your Netlify Frontend URL (can update after Step 4) | `https://mentorconnect-ui.netlify.app` |

5. Configure **Health Check Path**:
   - Set to `/health` (or `/api/v1/health`).
6. Click **Create Web Service**.
7. Once deployed, note your service URL (e.g., `https://mentorconnect-api.onrender.com`).
   - Test it by visiting: `https://mentorconnect-api.onrender.com/health`
   - It will return: `{"status":"UP","timestamp":"...","service":"MentorConnect API","version":"1.0.0"}`

---

## 5. Step 4: Deploy Frontend on Netlify

1. Log in to [Netlify](https://app.netlify.com).
2. Click **Add new site** > **Import an existing project** > **GitHub**.
3. Select repository `bharathdnayak/mentorconnect-ui-task-2`.
4. Configure build settings:
   - **Base directory**: (Leave blank — root directory)
   - **Build command**: `npm run build -w packages/shared && npm run build -w apps/web`
   - **Publish directory**: `apps/web/dist`
5. Configure Environment Variables:
   - Click **Add variable**:
     - Key: `VITE_API_URL`
     - Value: `https://mentorconnect-api.onrender.com/api/v1` *(Replace with your actual Render API URL)*
6. Click **Deploy site**.
7. Netlify will build the project and assign a domain (e.g., `https://mentorconnect-ui.netlify.app`).

### SPA Routing Fallback
Netlify routing is pre-configured via `netlify.toml` and `apps/web/public/_redirects`:
```text
/*    /index.html   200
```
This guarantees that direct URLs (e.g., `/login`, `/student`, `/hod/departments`) resolve seamlessly without 404 errors on page reload.

---

## 6. Step 5: Connect Frontend and Backend

1. In the Render Dashboard under `mentorconnect-api` > **Environment**:
   - Update `CORS_ORIGIN` to match your actual Netlify domain:
     ```env
     CORS_ORIGIN="https://mentorconnect-ui.netlify.app"
     ```
2. Render will automatically perform a zero-downtime redeploy with the updated CORS origin.

---

## 7. Step 6: End-to-End Production Verification

Verify full database read/write and persistence across browser refreshes and restarts:

1. **Health Verification**:
   - Open `https://<render-api>.onrender.com/health`.
   - Confirm response is `{"status":"UP"}`.

2. **Frontend Loading**:
   - Open your Netlify URL in an Incognito / Private window.
   - Verify the login screen renders with active branding and role cards.

3. **Authentication & Persistence**:
   - Log in with pre-seeded evaluator credentials:
     - HOD: `hod.cse@college.edu` / `Password123!`
     - Mentor: `dr.sharma@college.edu` / `Password123!`
     - Student: `bharath.cs@college.edu` / `Password123!`
   - Or click **Register as Student Mentee** to create a fresh student profile.

4. **Database Write Operation**:
   - Log in as Student (`bharath.cs@college.edu`).
   - Navigate to **Sessions** > **Schedule New Mentoring Session**.
   - Fill in date, topic, meeting mode, and click **Schedule Session**.
   - Verify the session appears in the dashboard.

5. **Persistence Across Refreshes & Sessions**:
   - Refresh the browser (tests client SPA persistence).
   - Log out and log back in (tests database retrieval).
   - Open a different browser or device and log in as the assigned Mentor (`dr.sharma@college.edu`).
   - Verify the newly scheduled session appears on the mentor's dashboard in real time.

---

## 8. Local Development Workflow

To run the application locally with your local PostgreSQL database:

```bash
# 1. Start local PostgreSQL (ensure service is active on localhost:5432)
# 2. Check local database status
npm run db:verify

# 3. Start both backend (port 5000) and frontend (port 5173) concurrently
npm run dev

# Alternatively on Windows: double-click run.bat
```

To run the automated tests:
```bash
npm test
```
