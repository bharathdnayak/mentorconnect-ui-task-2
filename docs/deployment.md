# MentorConnect — Deployment & Infrastructure Guide

## 1. Local Environment Requirements
- **Node.js**: v18.x, v20.x, or v22.x LTS
- **npm**: v9.x or later
- **PostgreSQL**: v14+ (Local installation, Docker container, or Supabase cloud instance)

---

## 2. Cloud Database: Supabase PostgreSQL Configuration

MentorConnect is configured to connect to cloud-hosted PostgreSQL on **Supabase**.

### 2.1 Supabase Credentials & Connection String
- **Project Reference**: `tdoxexppqdzqhynmuyzh`
- **Host**: `db.tdoxexppqdzqhynmuyzh.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **SSL Mode**: Required (`sslmode=require`)

Connection string format:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tdoxexppqdzqhynmuyzh.supabase.co:5432/postgres?sslmode=require"
```

> [!IMPORTANT]
> The database password must be supplied in your local `.env` file or hosting provider's environment variables. Never commit actual passwords or `.env` files to Git.

### 2.2 Applying Prisma Migrations to Supabase
Once `DATABASE_URL` is configured in `.env`:
```bash
# Generate Prisma Client matching the current schema
npm run prisma:generate

# Push schema and create all relations, foreign keys, enums, and indexes in Supabase
npm run prisma:push

# Verify all tables and models are active and reachable in Supabase
npm run db:verify

# Populate realistic development and testing seed records
npm run prisma:seed
```

---

## 3. Local Development (Alternative: Local PostgreSQL)
If developing offline without Supabase cloud access, point `DATABASE_URL` to your local PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mentorconnect?schema=public"
```

---

## 4. Environment Variable Configuration
Copy `.env.example` to `.env` and configure appropriate values:

```env
DATABASE_URL="postgresql://postgres:[YOUR-SUPABASE-PASSWORD]@db.tdoxexppqdzqhynmuyzh.supabase.co:5432/postgres?sslmode=require"
TEST_DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mentorconnect_test?schema=public"
PORT=5000
NODE_ENV=production
JWT_ACCESS_SECRET="generate-a-strong-random-256-bit-key-for-access"
JWT_REFRESH_SECRET="generate-a-strong-random-256-bit-key-for-refresh"
CORS_ORIGIN="https://mentorconnect.yourcollege.edu"
VITE_API_URL="https://mentorconnect.yourcollege.edu/api/v1"
```

---

## 5. Production Build & Start
```bash
# Build all workspaces (packages/shared, apps/api, apps/web)
npm run build

# Start backend server
node apps/api/dist/index.js
```

---

## 6. Pre-Production Checklist
- [x] Configure Supabase PostgreSQL with SSL encryption (`sslmode=require`).
- [x] Configure HTTPS and SSL certificates via reverse proxy or cloud host.
- [x] Replace default JWT secrets with cryptographically random keys.
- [x] Ensure automated PostgreSQL backups are enabled in Supabase project settings.
- [x] Set log rotation for audit logs and API access logs.
- [x] Ensure `.env` is omitted from public source control (enforced in `.gitignore`).
