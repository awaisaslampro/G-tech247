# GTech247 Mini Job Portal

A full-stack mini job-portal built with Next.js, Tailwind CSS, and Supabase.

## Features

- Public application form page at `/`
- CV upload plus required identity document upload (National ID Card or Residence Permit)
- Backend API routes for application submission and applicant management
- Admin portal at `/admin` with:
  - Applicant list
  - Total applicant count
  - Search by name/email
  - Filter by position
  - Download CV button
- Middleware-protected admin route using password cookie

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- Supabase (Postgres + Storage)
- Deploy on Vercel

## 1. Install and Run

```bash
npm install
npm run dev
```

## 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_COOKIE_NAME=admin_session
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.
- Never expose `ADMIN_PASSWORD` in client code.

## 3. Supabase Setup

1. Create a new Supabase project.
2. Run SQL from `supabase/schema.sql` in SQL editor.
3. Confirm Storage bucket `cvs` exists and is private.

## 4. Admin Access

1. Open `/admin/login`.
2. Enter password from `ADMIN_PASSWORD`.
3. Access `/admin` dashboard.

## 5. API Routes

- `POST /api/applications` submit application + upload CV
- `GET /api/applications` admin-only applicants list (supports `q`, `position`)
- `GET /api/applications/count` admin-only total applicants
- `GET /api/applications/:id/files/:fileType` admin-only signed download redirect (`cv`, `identity-document`)
- `POST /api/admin/login` set admin session cookie
- `POST /api/admin/logout` clear admin session

## 6. Deploy on Vercel

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add all environment variables in Vercel project settings.
4. Deploy.

## Optional Upgrade: Supabase Auth for Admin

Current implementation uses middleware + password cookie for simplicity.
For stronger access control, replace login with Supabase Auth and use role-based admin checks in middleware/API routes.
