# Prompt Entry #005: Supabase Database Connection and Migration

- **Prompt ID**: 005
- **Timestamp**: 2026-10-28 14:47:55 UTC
- **Status**: Completed
- **Objective**: Connect Prisma and Express backend to Supabase PostgreSQL cloud instance, run migrations, and verify persistence.

---

## Verbatim Prompt Content

```markdown
Connect my existing MentorConnect project to my Supabase PostgreSQL database now.

Supabase project reference: `tdoxexppqdzqhynmuyzh`

Database configuration:
- Host: `db.tdoxexppqdzqhynmuyzh.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Provider: Supabase PostgreSQL

Perform the implementation directly in the existing project. Do not rebuild the application or change its UI.

### Tasks

1. Inspect the existing repository, Git status, Prisma schema, migration history, package files, and `.env` configuration.

2. Configure the existing Prisma application to connect to Supabase using the correct PostgreSQL connection string and SSL configuration.

3. Read the database password from a local environment variable or `.env` file. Do not hardcode it, print it in logs, or commit it to GitHub.

4. Preserve the existing local development configuration where possible. Configure the cloud connection without unnecessarily breaking local PostgreSQL.

5. Inspect the existing Prisma schema and migrations. Apply the existing migrations to Supabase using the appropriate Prisma command for the installed version. Do not reset the database or delete existing data.

6. Generate the Prisma client and verify that the connection works.

7. Verify that all expected database tables exist and that the backend can read and write records.

8. Start the backend and test an actual database operation. Confirm that data persists after the operation completes.

9. Run the existing automated tests and fix any issues caused by the database configuration.

10. Update `.env.example` with placeholder values only. Ensure `.env` is excluded from Git.

11. Update `docs/deployment.md` with the Supabase configuration and migration instructions.

12. Record this prompt as the next entry in the existing `prompts/` history using the project's prompt-recorder script. Preserve all previous entries.

13. Do not push changes to GitHub or deploy to Netlify yet. First establish and verify the Supabase connection.

### Important

Use the existing application architecture and preserve all features.

If the connection fails, diagnose the actual error, including network access, database credentials, SSL requirements, and connection method. Do not report success without verification.

If the database password is unavailable, stop and tell me to configure it securely. Do not guess the password.

When finished, report:
- Whether the Supabase connection succeeded
- The tables created or verified
- The persistence test result
- The automated test results
- Any environment variable changes
- The next step for backend and frontend deployment
```
