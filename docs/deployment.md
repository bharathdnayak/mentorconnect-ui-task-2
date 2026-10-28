# MentorConnect — Zero-Cost College Demonstration Deployment Guide
## Neon Free PostgreSQL + Render Free Web Service + Netlify Frontend

This guide outlines how to deploy **MentorConnect** entirely on **free-tier services** for a college evaluation or live demonstration at **$0.00 cost** without requiring any paid subscriptions or credit cards:

- **Database**: Cloud Serverless PostgreSQL on **Neon Free Tier** (0.5 GB storage, built-in connection pooler)
- **Backend API**: Node.js + Express + TypeScript on **Render Free Web Service** (512 MB RAM, zero cost)
- **Frontend**: React 18 + Vite SPA on **Netlify Free Tier** (100 GB/month bandwidth, global CDN)
- **ORM**: Prisma ORM with idempotent schema migrations

---

## 1. Zero-Cost Architecture Overview

```mermaid
flowchart LR
    Browser["Client Browser (Student / Mentor / HOD)"]
    Netlify["Netlify Free CDN (apps/web SPA)"]
    RenderAPI["Render Free Web Service (apps/api Express)"]
    NeonDB[("Neon Free Serverless PostgreSQL")]

    Browser -->|HTTPS (HTML / JS / Assets)| Netlify
    Browser -->|REST API Requests (/api/v1)| RenderAPI
    RenderAPI -->|Prisma Client / Pooled Connection| NeonDB
```

### Free-Tier Limitations to Keep in Mind:
1. **Render Cold Starts**: Render's free web services automatically spin down after 15 minutes of inactivity. When you visit the app after it has been sleeping, the first request takes ~30 to 50 seconds to boot up. Subsequent requests respond instantly.
2. **Neon Auto-Suspend**: Neon free databases auto-suspend after 5 minutes of zero traffic to conserve compute hours, waking up automatically within ~500ms when a query arrives.
3. **Storage & Bandwidth**: Neon offers 0.5 GB storage and Netlify offers 100 GB/month bandwidth, which is more than sufficient for college demonstrations and evaluation grading.

---

## 2. Step 1: Create Free Neon PostgreSQL Database

1. Sign up or log in at [neon.tech](https://neon.tech) (using GitHub or Google account — no credit card needed).
2. Click **Create Project**:
   - **Project Name**: `mentorconnect`
   - **Database Name**: `neondb` (default)
   - **Region**: Choose the region closest to your college (e.g. `US East (Ohio)` or `Europe (Frankfurt)`).
   - **PostgreSQL Version**: `16`
3. Click **Create Project**.
4. In the **Connection Details** modal on the Neon dashboard:
   - Select **Connection string** > **Prisma** from the dropdown.
   - Neon will display both:
     1. **`DATABASE_URL` (Pooled Connection)**: Format:  
        `postgresql://[user]:[password]@[ep-xyz]-pooler.[region].aws.neon.tech/neondb?sslmode=require`  
        *(Used by the runtime Express application)*
     2. **`DIRECT_URL` (Direct Connection)**: Format:  
        `postgresql://[user]:[password]@[ep-xyz].[region].aws.neon.tech/neondb?sslmode=require`  
        *(Used by Prisma CLI for running migrations without connection pooler interference)*
5. Keep these two connection strings handy for the next steps.

---

## 3. Step 2: Apply Prisma Migrations to Neon

Initialize the database schema in Neon using the existing migration script:

```powershell
# In your local PowerShell terminal:
$env:DATABASE_URL="postgresql://[user]:[password]@[ep-xyz]-pooler.[region].aws.neon.tech/neondb?sslmode=require"
$env:DIRECT_URL="postgresql://[user]:[password]@[ep-xyz].[region].aws.neon.tech/neondb?sslmode=require"

# Apply pending migrations safely without dropping any tables
npx prisma migrate deploy

# (Optional) Seed initial department records and academic demo accounts:
npx tsx prisma/seed.ts
```

> [!IMPORTANT]
> `prisma migrate deploy` is safe and idempotent. It applies only pending migrations from `prisma/migrations/`, without dropping tables, resetting sequences, or deleting records. Never use `prisma migrate reset` against production.

---

## 4. Step 3: Deploy Backend on Render Free Web Service

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Web Service**.
3. Connect your GitHub repository: `bharathdnayak/mentorconnect-ui-task-2`.
4. Configure the service settings:
   - **Name**: `mentorconnect-api`
   - **Region**: Same or closest region as your Neon database.
   - **Branch**: `main`
   - **Root Directory**: `.` *(leave blank or set to repository root)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install --include=dev && npx prisma generate && npm run build:api
     ```
   - **Start Command**:
     ```bash
     node apps/api/dist/index.js
     ```
   - **Plan**: Select **Free** ($0/month).
5. Click **Advanced** and add the following **Environment Variables**:

| Environment Variable | Value / Source |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Paste your Neon Pooled Connection String* |
| `DIRECT_URL` | *Paste your Neon Direct Connection String* |
| `PORT` | `10000` *(Render sets this automatically)* |
| `JWT_ACCESS_SECRET` | *Any random 32+ character string* |
| `JWT_REFRESH_SECRET` | *Any distinct random 32+ character string* |
| `JWT_ACCESS_EXPIRATION` | `1h` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `CORS_ORIGIN` | `https://[your-site].netlify.app` *(Can update after Netlify deploy)* |

6. Configure **Health Check Path**:
   - Set to `/health` (or `/api/v1/health`).
7. Click **Create Web Service**.
8. Once deployed, note your service URL (e.g., `https://mentorconnect-api.onrender.com`).
   - Test it by visiting: `https://mentorconnect-api.onrender.com/health`
   - It will return: `{"status":"UP","timestamp":"...","service":"MentorConnect API","version":"1.0.0"}`

---

## 5. Step 4: Deploy Frontend on Netlify Free Tier

1. Log in to [app.netlify.com](https://app.netlify.com).
2. Click **Add new site** > **Import an existing project** > **GitHub**.
3. Select repository `bharathdnayak/mentorconnect-ui-task-2`.
4. Configure Build settings:
   - **Base directory**: *(Leave blank)*
   - **Build command**: `npm run build -w packages/shared && npm run build -w apps/web`
   - **Publish directory**: `apps/web/dist`
5. Configure Environment Variables:
   - Click **Add variable**:
     - Key: `VITE_API_URL`
     - Value: `https://mentorconnect-api.onrender.com/api/v1` *(Replace with your actual Render API URL)*
6. Click **Deploy site**.
7. Netlify will build the project and assign a domain (e.g., `https://mentorconnect-demo.netlify.app`).

### Client-Side SPA Routing
Netlify routing is pre-configured via `netlify.toml` and `apps/web/public/_redirects`:
```text
/*    /index.html   200
```
This guarantees that URLs like `/login`, `/student`, and `/hod/departments` work smoothly on page reload without 404 errors.

---

## 6. Step 5: Connect Frontend and Backend

1. In the Render Dashboard under `mentorconnect-api` > **Environment**:
   - Update `CORS_ORIGIN` to match your actual Netlify domain:
     ```env
     CORS_ORIGIN="https://mentorconnect-demo.netlify.app"
     ```
2. Render will automatically redeploy with the updated CORS origin.

---

## 7. Step 6: Live Demonstration & Persistence Verification

Verify full database read/write and persistence across browser refreshes and restarts:

1. **Wake Up the Services**:
   - Open `https://<render-api>.onrender.com/health`.
   - If sleeping, wait ~40 seconds for the free container to initialize.
   - Confirm response: `{"status":"UP"}`.

2. **Frontend Loading**:
   - Open your Netlify URL in an Incognito / Private window.
   - Verify the login screen renders.

3. **Authentication & Account Provisioning**:
   - **Method A (Seed Script Demonstration Accounts)**: If you executed `npx tsx prisma/seed.ts` in Step 2, the standard academic evaluation accounts (`hod.ise@college.edu`, `dr.sharma@college.edu`, `bharath.is@college.edu`) are available using the password configured in `prisma/seed.ts`.
   - **Method B (Self-Registration)**: Click **Register as Student Mentee** on the login page to create a new demonstration student profile with your own credentials and department selection.

4. **Database Write Operation**:
   - Log in with your demonstration student account.
   - Navigate to **Sessions** > **Schedule New Mentoring Session**.
   - Fill in date, topic, meeting mode, and click **Schedule Session**.
   - Verify the session appears in the dashboard.

5. **Persistence Across Refreshes & Sessions**:
   - Refresh the browser (`Ctrl + Shift + R`).
   - Log out and log back in.
   - If using the seeded accounts, log in as the assigned Mentor (`dr.sharma@college.edu`) to verify cross-role data retrieval.
   - Verify the session appears on the mentor's dashboard, proving genuine cloud persistence in Neon PostgreSQL.

---

## 8. Local Development Workflow (Preserved)

To run the application locally on your computer with your local PostgreSQL database:

```bash
# Verify local database status
npm run db:verify

# Start both backend (port 5000) and frontend (port 5173) concurrently
npm run dev

# Or double-click run.bat on Windows
```

To run the automated tests:
```bash
npm test
```
