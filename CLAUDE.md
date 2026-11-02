# AQS Learning Platform — agent instructions

Read first, every session: `docs/agent-handoff.md` (current state and next action), then only the parts of `docs/decisions.md` that the task touches. `docs/decisions.md` is the authoritative product record; never contradict or duplicate it.

## Stack and layout
React 19 + TypeScript + Vite (`src/`, live app in `src/live/`), Supabase (Postgres, RLS, Auth, Storage, Edge Functions in `supabase/functions/`), Render static site (`render.yaml`). Migrations: `supabase/migrations/` (applied ones are never edited, T1). Tests: `supabase/tests/database/` (pgTAP), `supabase/functions/_shared/core.test.mjs`, `e2e/` (preview), `e2e-live/` (live mode, mocked API), `tests/api/`.

## Commands
- `npm run lint` · `npm run build`
- `npm run test:db` — throwaway PostgreSQL 16 sandbox, never a real database (must run as a non-root user)
- `npm run test:functions` · `npm run test:e2e` · `npm run test:e2e:live`
- Report counts only (passed/failed), not full logs.

## Hard rules (owner approval required for each)
- No `git push`, merge, branch deletion or history rewrite. Local commits are allowed during an approved milestone (OD14): small, grouped, Conventional Commits, explicit paths only (never `git add .`/`-A`).
- Never commit `.claude/settings.local.json` or `docs/archive/` (owner decision pending).
- No migrations applied to any hosted database, no hosted Auth/config/secret changes, no Edge Function or Render deploys.
- Staging (`aqs-staging`, ref `txpaszokduxewyojrnmq`): synthetic "ZZ Test" data only, logged in the handoff (OD15). Never touch the Supabase project `eeoofujuouquhnxkpffs`, never `supabase link`, never start Docker Desktop.
- Never handle Google credentials; the owner signs in. Never print tokens, invitation links, keys or personal data.
- Frontend checks are user experience only; the database is the security boundary (D21, D27).
- Do not rebuild existing features; verify them. Deferred features stay visibly unavailable (P21, D24).

## Evidence language
Label results as repository, sandbox, staging or production evidence. "Reported" is never "verified".

## Delivery rule (owner, 2 November 2026)
Five milestones (M1–M5, unchanged), at most two owner-facing prompts each: an implementation prompt (Claude plans, decides routine matters, implements, fixes and verifies the whole milestone) and a completion prompt (remaining material issues, final verification, milestone report, then straight on to the next milestone). Internal tasks, defects, migrations, test stages and deployment activities are never turned into extra milestones or routine approval checkpoints. Stop for the owner only for a genuine product or business decision, an action outside existing authorization or touching a protected system, or a material blocker that cannot be solved safely in scope; meanwhile continue all other safe work. Actions that the hard rules above reserve for the owner (push, hosted migrations, config, deploys) are collected into one decision list in the milestone report rather than asked one by one.
