# Agent handoff

Single source for "where are we and what is next". Update at every task boundary. Decisions live in `docs/decisions.md`; milestone history in `docs/progress-report.md`.

## Current position (2 November 2026)
- Milestone: **M1 — Platform foundations and identity** (approved 2 November 2026).
- Branch `feature/first-release`, local commits ahead of origin (owner pushes). Last pushed: `4375371`.
- Sandbox evidence on the committed tree: pgTAP 864/864, functions 10/10, lint and build pass, e2e live 22/22, e2e preview 310/310 (2 November 2026; browser build 1243 used in place of 1248).

## Staging state (synthetic data, OD15 log)
| When | Operation | By | Reversible by |
|---|---|---|---|
| 2 Nov, 08:51 SAST | Created draft orgs "ZZ Test Org A" `9c1c4af5-627b-418e-9b19-db4adeab7193`, "ZZ Test Org B" `23241870-62a7-4beb-a518-44e5a203e6e3` | Platform Admin (owner session) | Suspend (no hard delete, F8) |
| 2 Nov, 08:51 SAST | 6 invitations (U1 org_admin A; U2 learner A, instructor B; U3 org_admin B, learner B, instructor A) | Platform Admin | Revoke |
| 2 Nov, 08:51 SAST | Revoked U3 instructor A invitation | Platform Admin | — |
Invitations expire 9 November 2026. Links exist only in the owner's built-in-browser tab (sessionStorage).

Deployed Edge Functions (2 Nov, ~19:25 SAST, OD2): `invitations` v4 `e406fe97…` and `media-url` v4 `a8c22992…`, both from `ade1050`, `verify_jwt` false. Rollback = redeploy the `4375371` files. Deno type-check not run.

## Open defects
- DF1 fixed on staging 2 Nov (OD2): bad tokens now 401. O-A6-2 (media-url body checked before session, 400) remains; harmless.
- DF2 D33 `hd` claim location unverified with a real Workspace account — A8 Stage 1, step 5.
- DF3 Q-07-12 staff account IDs readable on course rows — migration 0014 prepared and sandbox-tested (`5bbfced`, pgTAP 881/881); app reads through `course_people` with a pre-0014 fallback (`debc166`). **Not applied to staging — needs owner approval.**
- DF4 platform courses default to "assigned" — M2 guard (D38 #13).
- DF5 no cleanup of orphaned private files — before real data (D38 #9).
- DF7 fixed in code (`cd65913`): invitation sign-in now asks Google for its account chooser. Found in Stage 1 (Google silently reused the Platform Admin). Reaches staging only after the owner pushes (Render auto-deploy).

## Gated actions (need explicit owner approval)
- A8 Stage 1 (checklist revision 3).
- Any migration, hosted configuration, secret or deploy.

## Next action
See the latest milestone task list in this file's "M1 tasks" section.

## M1 tasks
1. [done] Record D38 (`aacab88`).
2. [done] CLAUDE.md and this handoff.
3. [done] Reconcile stale documentation (`0dd215e`). The recovery runbook named in the 1 November handover is not in this repository; its correction stays open until located.
4. [done] OD2 deployed and verified (Claude Project: `claude/od2-deployment-result-2026-11-02.md`); evidence package (Claude Project: `claude/od2-edge-function-redeploy-evidence-2026-11-02.md`). Deployed functions are version 3, same bundle as the 2 November deploy (content = `4375371`). Staging tokens are ES256.
5. [done] T4 on staging: GraphQL refused for signed-out and signed-in callers (406 PGRST106; only `public` exposed).
6. A8 Stage 1 (approved 2 Nov 19:22 as part of M1). Step 1 attempt: PA was signed out and Google silently signed the PA back in (DF7); nothing written. Waiting for the owner to sign out of Google in the built-in browser (or push), then sign in as U1.
7. A8 Stage 2 (invitation permission matrix), suspension, removal, role change, support lookup → after Stage 1 and OD2.
