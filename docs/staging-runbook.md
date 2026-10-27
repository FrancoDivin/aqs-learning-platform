# Staging runbook — AQS Learning Platform

**Status (27 October 2026):** prepared, not executed. Every step that creates or changes a
cloud resource waits for the owner's approval (blocking questions 1–5 in
`docs/progress-report.md`). Staging uses **synthetic data only**; production is a separate,
owner-approved launch.

## 0. What staging is

| Part | Where | Cost |
|---|---|---|
| Database, Auth, Storage, Edge Functions | New Supabase project `aqs-staging` (Free plan, eu-central-1) | $0 |
| Frontend | Render static site `aqs-learning-staging` from `render.yaml`, branch `feature/first-release` | $0 |
| Email | Resend free tier, optional; without it invitations return a copyable link | $0 |

The existing project `eeoofujuouquhnxkpffs` is **not** used and must not receive migrations.

## 1. Supabase project (owner approval: Q1)

1. Create project `aqs-staging`, region eu-central-1, Free plan.
2. Note the project ref, the project URL and the **publishable** key (Settings → API). Never copy
   the secret / service-role key anywhere outside Supabase.

## 2. Migrations (owner approval: Q2)

Commit `20261022210000_0005_preview_email_gate.sql` first (T2), then from the repository:

```bash
npx supabase login                      # opens the browser
npx supabase link --project-ref <staging-ref>
npx supabase db push                    # applies 0001 … 0011 in filename order
```

Check: `npx supabase migration list` shows all 16 migrations applied remotely, and the
Advisors page shows no "RLS disabled" findings.

## 3. Auth (owner approval: Q3)

1. Google Cloud console → OAuth client (Web). Authorised redirect URI:
   `https://<staging-ref>.supabase.co/auth/v1/callback`.
2. Supabase → Authentication → Providers → Google: paste the client ID and secret yourself.
   Email sign-up stays off (D15).
3. Authentication → URL configuration:
   - Site URL: `https://aqs-learning-staging.onrender.com`
   - Redirect URLs: `https://aqs-learning-staging.onrender.com/auth/callback`
     and, for local testing, `http://localhost:5173/auth/callback`.

## 4. Edge Functions

```bash
npx supabase secrets set SITE_URL=https://aqs-learning-staging.onrender.com \
  ALLOWED_ORIGINS=https://aqs-learning-staging.onrender.com,http://localhost:5173
# optional, once a sending domain is verified in Resend (Q4):
npx supabase secrets set RESEND_API_KEY=<from Resend> EMAIL_FROM="AQS E-Learning <invitations@your-domain>"
npx supabase functions deploy invitations
npx supabase functions deploy media-url
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions
by Supabase; they are never set or stored by us.

## 5. Frontend on Render (owner approval: Q5)

1. Push `feature/first-release` to GitHub (never `master`).
2. Render → New → Blueprint → this repository. Render reads `render.yaml`.
3. Enter `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (public values) when asked.

## 6. First Platform Admin (owner only, F6)

1. Sign in once on staging with the owner's Google account (creates the profile).
2. Supabase → SQL editor:

```sql
select private.grant_platform_admin(
  (select id from auth.users where email = '<owner email>'),
  'AQS Owner', 'Staging setup');
```

A second Platform Admin is needed to approve platform courses (P1); repeat with a second
test account.

## 7. Synthetic data and smoke test

Use test Google accounts only. Suggested walk-through (each step is a real check):

1. Platform Admin: create organization "Demo Org A" → invite an Organization Admin.
2. Org Admin: accept the invitation (link or email) → Platform Admin activates the org (P12).
3. Org Admin: invite an Instructor and two Learners; each accepts.
4. Instructor: create a course with a reading lesson, a video (small MP4, under 50 MB on Free),
   a file and a quiz → propose for publication.
5. Org Admin: approve and publish → assign the course to a Learner with a due date.
6. Learner: open lessons, download the file, watch the video, take the quiz (fail, then pass).
7. Instructor: Learners page shows progress and quiz results; Org Admin sees members only.
8. Cross-tenant: create "Demo Org B" with its own admin; confirm B's admin cannot open A's
   course URLs or API rows (expect the no-access notice / empty results).
9. Platform Admin: Reports shows counts only; suspend Org A → its learner sees the
   unavailable notice; reactivate.
10. Run the API checks: `node tests/api/invitations.api.test.mjs` against staging (see file).

Record results in `docs/staging-results-<date>.md`.

## 8. Rollback

Staging holds synthetic data only: if anything goes wrong, pause or delete the staging project
and the Render site, fix, and repeat from step 1.
