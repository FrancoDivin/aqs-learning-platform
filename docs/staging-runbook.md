# Staging runbook â€” AQS Learning Platform

**Status (27 October 2026):** prepared, not executed. Every step that creates or changes a
cloud resource waits for the owner's approval (blocking questions 1â€“5 in
`docs/progress-report.md`). Staging uses **synthetic data only**; production is a separate,
owner-approved launch.

## 0. What staging is

| Part | Where | Cost |
|---|---|---|
| Database, Auth, Storage, Edge Functions | Reported existing Supabase project `aqs-staging` (Free plan, eu-central-1); verify owner and exact ref (`txpaszokduxewyojrnmq` per D36) before use | $0 |
| Frontend | Render static site `aqs-learning-staging` from `render.yaml`, branch `feature/first-release` | $0 |
| Email | Resend free tier, optional; without it invitations return a copyable link | $0 |

The existing project `eeoofujuouquhnxkpffs` is **not** used and must not receive migrations.

## 1. Supabase project (owner approval: Q1)

1. Verify the existing `aqs-staging` project identity and owner access; **do not** create a duplicate project. D36 reports an existing project/ref `txpaszokduxewyojrnmq`, but that report is owner-provided and is not independently verified.
2. Note the project ref, the project URL and the **publishable** key (`sb_publishable_â€¦`,
   Settings â†’ API Keys). Never copy a secret (`sb_secret_â€¦`) or service-role key anywhere
   outside Supabase. The app and the Edge Functions use the current publishable/secret keys;
   the legacy `anon`/`service_role` keys are not needed (Supabase retires them at the end of
   2026), and the functions fall back to them only if the new keys are absent.

## 2. Migrations (owner approval: Q2)

The canonical sequence contains exactly 15 SQL migration files, in this order, including
recently added 0012 (service_role privilege cleanup, not yet applied to persistent
projects or authorized as applied during staging unless approved) and 0013
(public instructor names and course archiving). Do not commit or apply
`20261022210000_0005_preview_email_gate.sql`; it was repaired as `reverted` in the
disposable Supabase CLI validation (30 October 2026), which did not modify any hosted
Supabase resource, and it is not part of the canonical sequence. Apply them from the
repository:

1. `20261021150000_0001_foundation.sql`
2. `20261021160000_0002_profiles_platform_admins.sql`
3. `20261021170000_0003_organizations_memberships.sql`
4. `20261021180000_0004_invitations.sql`
5. `20261026120000_0005a_graphql_off.sql`
6. `20261026120100_0005b_activation_rule.sql`
7. `20261026120200_0006_verified_identity_invitation_visibility.sql`
8. `20261026120300_0007_courses.sql`
9. `20261026120400_0008_enrolment_progress.sql`
10. `20261026120500_0009_quizzes.sql`
11. `20261026120600_0009a_course_corrections_clone.sql`
12. `20261026120700_0010_storage.sql`
13. `20261026120800_0011_platform_reports.sql`
14. `20261030120000_0012_revoke_service_role_legacy_tables.sql`
15. `20261031120000_0013_public_instructors_and_archiving.sql`

```bash
npx supabase login                      # opens the browser
npx supabase link --project-ref <staging-ref>
npx supabase db push                    # applies the 15 canonical migrations listed above; 20261022210000 must remain absent
# Apply only the canonical sequence above; 20261022210000 must remain absent.
```

Check: `npx supabase migration list` shows exactly those 15 canonical migration files applied remotely; `20261022210000` is absent; and the Advisors page shows no "RLS disabled" findings.

Backup/recovery prerequisite: before applying migrations, confirm with the owner the available Supabase recovery option and the exact restore/pause/delete procedure. This repository does not establish a hosted recovery mechanism; if it cannot be confirmed, it remains an owner prerequisite and no destructive operation should run.
Edge Function rollback, if needed, consists of redeploying the prior function version while preserving the documented caller-session verification; function secrets are never stored by the repository.
Preserve the stop-and-record rule: if a migration stops with an error, stop, record it, and do not edit migrations on the fly.

If a migration stops with an error, **stop and record it**; do not edit migrations on the fly.
Two statements depend on hosted-only behaviour that the sandbox cannot reproduce:
- `0005a` (`drop extension if exists pg_graphql`): if refused, turn GraphQL off in the
  dashboard (Integrations â†’ GraphQL) and record it; T4 still requires it off.
- `0010` creates policies on `storage.objects`, which Supabase's `supabase_storage_admin`
  owns; `postgres` may do this through Supabase's `supautils` policy grants. An error such as
  "must be owner of table objects" means a support question, not a workaround.

Verified before staging (sandbox, not hosted): all 15 canonical migrations and the relevant database tests pass on PostgreSQL 17 (hosted runs 17.6), including the schema stand-in and Supabase Storage's real schema (`scripts/db-sandbox/run-real-storage.sh`, pinned Storage commit).

## 3. Auth (owner approval: Q3)

1. Google Cloud console â†’ OAuth client (Web). Authorised redirect URI:
   `https://<staging-ref>.supabase.co/auth/v1/callback`.
2. Supabase â†’ Authentication â†’ Providers â†’ Google: paste the client ID and secret yourself.
   Use the configuration inputs `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`;
   set and verify them in approved staging/hosting configuration, but do not commit their values.
   Email sign-up stays off (D15).
3. Authentication â†’ URL configuration:
   - Site URL: `https://aqs-learning-staging.onrender.com`
   - Redirect URLs (the app returns to `/auth/callback?next=â€¦`, so each entry ends in `**`,
     Supabase's wildcard for "anything after this", including the query string):
     `https://aqs-learning-staging.onrender.com/auth/callback**`
     and, for local testing, `http://localhost:5173/auth/callback**`.

    Local URL reconciliation before sign-in tests:
    - Local Vite (default, no Vite port set): http://localhost:5173
    - Local Supabase Auth config (supabase/config.toml): Site URL http://127.0.0.1:3000, redirect https://127.0.0.1:3000 - change deliberately before local Google sign-in.
    - Playwright E2E only: fixed ports 5180 (default suite) and 5181 (live-mode suite), which are not local Auth callback URLs.
    - Staging frontend/callback: https://aqs-learning-staging.onrender.com and .../auth/callback**

   - Check on the first sign-in: you must land on `/auth/callback` and then the page you came
     from. Landing on the bare site root instead means the entry did not match.
4. **After the first Google sign-in (before any invitation is accepted):** check the stored
   Google identity matches what 0006 relies on (A1â€“A3). In the SQL editor; it shows no email
   addresses, only shapes:

   ```sql
   select jsonb_typeof(i.identity_data -> 'email_verified')          as email_verified_type,   -- A1: boolean
          i.identity_data -> 'email_verified' = 'true'::jsonb         as email_verified_true,
          lower(i.identity_data ->> 'email') = lower(u.email)         as email_matches_account,
          split_part(lower(u.email), '@', 2) = 'gmail.com'            as is_gmail,
          case when i.identity_data ? 'hd'
               then lower(i.identity_data ->> 'hd') = split_part(lower(u.email), '@', 2) end
                                                                     as hd_matches_domain,     -- A2: Workspace only
          (select count(*) from auth.identities x
            where x.user_id = i.user_id and x.provider <> 'google')  as other_identities
     from auth.identities i join auth.users u on u.id = i.user_id
    where i.provider = 'google'
    order by i.created_at desc limit 5;
   ```

   Pass: `boolean`, `true`, `true`, then `is_gmail` true or `hd_matches_domain` true, and
   `other_identities` 0. Anything else: invitations fail closed for that account; stop and
   record the row (no emails) before changing anything.

## 4. Edge Functions

`supabase/config.toml` sets `verify_jwt = false` for both functions: the platform's built-in
check understands only the legacy keys, so each function verifies the caller's session itself
(signature, expiry, signed-in user) before doing anything. After deploying, confirm in the
dashboard (Edge Functions â†’ each function â†’ Details) that "Verify JWT" is off.

```bash
npx supabase secrets set SITE_URL=https://aqs-learning-staging.onrender.com \
  ALLOWED_ORIGINS=https://aqs-learning-staging.onrender.com,http://localhost:5173
# optional, once a sending domain is verified in Resend (Q4):
npx supabase secrets set RESEND_API_KEY=<from Resend> EMAIL_FROM="AQS E-Learning <invitations@your-domain>"
npx supabase functions deploy invitations
npx supabase functions deploy media-url
```

`SUPABASE_URL` and the API keys (`SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, and the
legacy `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`) are provided to functions by
Supabase; they are never set or stored by us.

## 5. Frontend on Render (owner approval: Q5)

1. Push `feature/first-release` to GitHub only after owner Git authorization. The branch currently has no upstream configured; this runbook does not authorize or perform a push.
2. Render â†’ New â†’ Blueprint â†’ this repository. Render reads `render.yaml`.
3. Enter `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (public values) when asked.

## 6. First Platform Admin (owner only, F6)

1. Sign in once on staging with the owner's Google account (creates the profile).
2. Supabase â†’ SQL editor:

```sql
select private.grant_platform_admin(
  (select id from auth.users where email = '<owner email>'),
  'AQS Owner', 'Staging setup');
```

A second Platform Admin is needed to approve platform courses (P1); repeat with a second
test account.

## 7. Synthetic data and smoke test

Use test Google accounts only. Suggested walk-through (each step is a real check):

1. Platform Admin: create organization "Demo Org A" â†’ invite an Organization Admin.
2. Org Admin: accept the invitation (link or email) â†’ Platform Admin activates the org (P12).
3. Org Admin: invite an Instructor and two Learners; each accepts.
4. Instructor: create a course with a reading lesson, a video (small MP4, under 50 MB on Free),
   a file and a quiz â†’ propose for publication.
5. Org Admin: approve and publish â†’ assign the course to a Learner with a due date.
6. Learner: open lessons, download the file, watch the video, take the quiz (fail, then pass).
7. Instructor: Learners page shows progress and quiz results; Org Admin sees members only.
8. Cross-tenant: create "Demo Org B" with its own admin; confirm B's admin cannot open A's
   course URLs or API rows (expect the no-access notice / empty results).
9. Platform Admin: Reports shows counts only; suspend Org A â†’ its learner sees the
   unavailable notice; reactivate.
10. Run the staging API checks with the publishable key and the test accounts' access tokens
    (instructions at the top of the file; it never prints keys or tokens and refuses the
    legacy project and any secret key):
    `node tests/api/staging-checks.mjs`. It covers anonymous access, cross-tenant reads and
    writes between Org A and Org B, GraphQL, Storage listing, both Edge Functions, and the
    15-minute signed URLs. `tests/api/invitations.api.test.mjs` is for the **local** stack only
    (it uses email sign-up, which staging does not allow).

Record results in `docs/staging-results-<date>.md`.

## 8. Rollback

Staging holds synthetic data only: if anything goes wrong, pause or delete the staging project
and the Render site, fix, and repeat from step 1.

## 9. Backup and Recovery (before any application)

No restore or migration application has been tested against staging. Before applying the 15
canonical migrations:

1. The owner records the Supabase plan (`Free` or paid), available backup list, latest
   timestamp, retention and whether PITR is enabled. Free-tier documentation does not provide
   automatic daily backup and recommends external logical exports.
2. A logical export should be taken only after owner approval, using `supabase db dump`
   (`schema`, `--data-only --use-copy`, and, if needed, `--role-only`) to a destination outside
   the repository. Never place backup artifacts in Git.
3. The export must not be restored into staging. It may only be restored into a fresh,
   separate disposable PostgreSQL environment for rehearsal. The persistent staging project
   must never be overwritten or reset without a documented owner-authorized procedure.
4. Supabase-managed schemas and object contents require separate recovery treatment:
   - Ordinary CLI dumps exclude managed `auth` and `storage` schemas; the official Platform-to-self-hosted procedure uses separate CLI roles/schema/data exports and explicitly states `auth.users` is included. JWT secrets differ target-to-target, so restored database state does not promise existing tokens validity.
   - Storage object contents are not restored by a database export.
   - `supabase/functions/invitations` and `supabase/functions/media-url` can be redeployed
     from repository source but need their secrets set by the owner.
5. Operators use only absolute paths and checksums, verify the export file is non-empty, and
   report all results in `docs/staging-results-<date>.md`.
6. If a migration stops or fails, stop and record it. Do not edit migrations on the fly.

### Read-only pre-restore verification requirements (future, not executed)
- Record exact Supabase CLI version: `npx supabase --version`. The official docs specify the backup commands but do not establish a universally unique release; use current documented-supported flags (`-f`, `--linked`, `--db-url`, `--role-only`, `--data-only`, `--use-copy`, `-x`) and do not assume future CLI behavior.
- Inspect export metadata before restore, with no credentials shown.
  - `roles.sql` must be non-empty and contain only role statements.
  - `schema.sql` must define `public.profiles`, etc.
  - `data.sql` must contain `COPY` or `INSERT`, but the inspection may only aggregate counts and shapes, not display rows.
- Required zero-result SQL after restoring into a disposable target (using `psql -v ON_ERROR_STOP=1`):
  - `select p.id from public.profiles p left join auth.users a on a.id = p.id where a.id is null;`
  - `select a.id from auth.users a left join public.profiles p on p.id = a.id where p.id is null;`
  - `select ai.user_id from auth.identities ai left join auth.users au on au.id = ai.user_id where ai.provider = 'google' and au.id is null;`
  - `select ai.user_id from auth.identities ai left join auth.users au on au.id = ai.user_id where ai.id is null;`
  - `select ai.user_id from auth.identities ai join auth.users au on au.id = ai.user_id where ai.provider = 'google' and coalesce((ai.identity_data -> 'email_verified')::boolean,false) is not true;` (identity-data shape only)
  - `select google identity records count: select id from auth.identities where provider='google'`
  - `select m.id ... memberships;`
  - `select i.id ... invitations;`
  - `select cs.user_id ... course_staff;`
  - `select e.id ... enrollments;`
  - `select lp.id ... lesson_progress;`
  All expected counts are compared against the source disposable baseline, not invented.
- Confirm that Google provider checks are database-identity only; do not retrieve OAuth credentials.
- Restore handling: fresh target only. Stop on the first error. Record exact stop location. Recreate the disposable database before retry. Never retry against a partially loaded target.

### Exported identity requirements
- The logical export must be inspected for both `COPY auth.users` and `COPY auth.identities`.
- If either is absent, stop and do not call the export a platform backup.
- Google `auth.identities` data must be preserved as identity state, but independent self-hosted OAuth credentials and callback configuration are still required later.
- Google authentication must be tested separately with independently issued test credentials and a fresh session. Existing tokens must not be reused.

### Separate migration stages on the disposable target
1. Restore the source database exactly as exported.
2. Validate Auth UUID equality, orphan check, identities, memberships, invitations, course/enrolment/progress references, grants and RLS support.
3. Separately apply 0012 and run 065.
4. Separately apply 0013 and run 055 plus the changed `050` test expectations.
5. Never imply that migrations 0012 and 0013 were part of the exported source database. They remain promoted but unapplied to persistent databases.
