# AQS database sandbox

A throwaway PostgreSQL cluster for checking migration SQL **without touching any real
database**. Added 26 October 2026.

## What it is

- `run.sh` creates a brand-new PostgreSQL cluster in a new temporary folder. It listens
  only on a Unix socket inside that folder (no network port), so nothing else can
  connect to it and it cannot be confused with the local Supabase database
  (Docker container `supabase_db_aqs-platform`, port 54322). It deletes the cluster
  when it finishes.
- `supabase-shim.sql` recreates the small part of Supabase the migrations rely on:
  the `anon`, `authenticated` and `service_role` roles, the `auth` and `extensions`
  schemas, `auth.users`, `auth.identities`, `auth.uid()` and Supabase's default
  privileges. It refuses to run on a database that already has Supabase's schemas.

## What it proves, and what it does not

It shows that the SQL of a migration applies cleanly and that its pgTAP tests pass.
It does **not** prove Supabase behaviour: PostgREST, GoTrue, Storage, GraphQL, Supabase's
real role setup and its Postgres 17 version are not present (the sandbox uses the
PostgreSQL 16 installed in the workspace). Final verification stays on the local
Supabase stack after the backup, restore test and reset (D34, T2 and T11).

## Running it

Needs PostgreSQL server binaries and pgTAP (`pg_prove`). It must run as a non-root user.

```bash
scripts/db-sandbox/run.sh                                   # 0001-0005 + supabase/tests/database
scripts/db-sandbox/run.sh --draft path/to/draft.sql --test path/to/test.sql
```

`--draft` files are applied in the order given, after `supabase/migrations/*.sql`.
