# MentorConnect — Deployment & Infrastructure Guide

## 1. Local Environment Requirements
- **Node.js**: v18.x, v20.x, or v22.x LTS
- **npm**: v9.x or later
- **PostgreSQL**: v14+ (Local installation or Docker container)

---

## 2. Docker Compose Deployment
A production-ready `docker-compose.yml` is included in the project root:

```bash
# Start PostgreSQL database container
docker compose up -d

# Verify container is healthy
docker compose ps
```

---

## 3. Environment Variable Configuration
Copy `.env.example` to `.env` and configure appropriate values:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mentorconnect?schema=public"
TEST_DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/mentorconnect_test?schema=public"
PORT=5000
NODE_ENV=production
JWT_ACCESS_SECRET="generate-a-strong-random-256-bit-key-for-access"
JWT_REFRESH_SECRET="generate-a-strong-random-256-bit-key-for-refresh"
CORS_ORIGIN="https://mentorconnect.yourcollege.edu"
VITE_API_URL="https://mentorconnect.yourcollege.edu/api/v1"
```

---

## 4. Database Setup & Migrations
```bash
# Push schema to PostgreSQL database
npm run prisma:push

# Populate database with realistic seed data
npm run prisma:seed
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
- [x] Configure HTTPS and SSL certificates via reverse proxy (Nginx / Caddy).
- [x] Replace default JWT secrets with cryptographically random keys.
- [x] Establish daily automated PostgreSQL WAL / dump backups.
- [x] Set log rotation for audit logs and API access logs.
- [x] Ensure `.env` is omitted from public source control (enforced in `.gitignore`).
