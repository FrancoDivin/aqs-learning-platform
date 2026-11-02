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

Deployed Edge Functions: `invitations` v1 and `media-url` v1 from commit `4375371` (pre-hardening). Hardened code is commit `ade1050` (not deployed; OD2).

## Open defects
- DF1 staging functions are pre-hardening (500 for bad tokens, legacy keys) — fix = OD2 redeploy.
- DF2 D33 `hd` claim location unverified with a real Workspace account — A8 Stage 1, step 5.
- DF3 Q-07-12 staff account IDs readable on course rows — M2 migration (D38 #7).
- DF4 platform courses default to "assigned" — M2 guard (D38 #13).
- DF5 no cleanup of orphaned private files — before real data (D38 #9).

## Gated actions (need explicit owner approval)
- OD2: deploy hardened functions (evidence package: `claude/od2-…` in the Claude Project).
- A8 Stage 1 (checklist revision 3).
- Any migration, hosted configuration, secret or deploy.

## Next action
See the latest milestone task list in this file's "M1 tasks" section.

## M1 tasks
1. [done] Record D38 (`aacab88`).
2. [done] CLAUDE.md and this handoff.
3. [done] Reconcile stale documentation (`0dd215e`). The recovery runbook named in the 1 November handover is not in this repository; its correction stays open until located.
4. [done, awaiting approval] OD2 evidence package (Claude Project: `claude/od2-edge-function-redeploy-evidence-2026-11-02.md`). Deployed functions are version 3, same bundle as the 2 November deploy (content = `4375371`). Staging tokens are ES256.
5. [done] T4 on staging: GraphQL refused for signed-out and signed-in callers (406 PGRST106; only `public` exposed).
6. A8 Stage 1 → after owner approval only.
7. A8 Stage 2 (invitation permission matrix), suspension, removal, role change, support lookup → after Stage 1 and OD2.
