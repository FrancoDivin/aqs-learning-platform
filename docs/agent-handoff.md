# Agent handoff

Single source for "where are we and what is next". Update at every task boundary. Decisions live in `docs/decisions.md`; milestone history in `docs/progress-report.md`.

## Current position (2 November 2026, ~23:50 SAST)
- Milestone: **M1 — Platform foundations and identity** (approved 2 November 2026). **M1 staging identity and permission testing complete.** Migration 0015 applied to staging (owner approval 23:32). Remaining before M1 is fully closed on staging: owner push (DF7, DF9 code fixes reach staging) and the separate 0014 approval (DF3). Next: M2.
- Branch `feature/first-release`, local commits ahead of origin (owner pushes; never push). Last pushed: `4375371`.
- Sandbox evidence on the local tree: pgTAP 897/897 (with 0014 and 0015), functions 10/10, lint and build pass, e2e live 27/27, e2e preview 310/310 (browser build 1243 used in place of 1248).

## Staging state (synthetic data, OD15 log)
| When (SAST) | Operation | By | Reversible by |
|---|---|---|---|
| 2 Nov, 08:51 | Created draft orgs "ZZ Test Org A" `9c1c4af5-627b-418e-9b19-db4adeab7193`, "ZZ Test Org B" `23241870-62a7-4beb-a518-44e5a203e6e3` | Platform Admin (owner session) | Suspend (no hard delete, F8) |
| 2 Nov, 08:51 | 6 invitations (U1 org_admin A; U2 learner A, instructor B; U3 org_admin B, learner B, instructor A) | Platform Admin | Revoke |
| 2 Nov, 08:51 | Revoked U3 instructor A invitation | Platform Admin | — |
| 2 Nov, evening | Stage 1 step 1: U1 accepted org_admin A (U1 user and profile created by sign-in) | U1 | Remove membership |
| 2 Nov, ~22:00 | Stage 1 step 2: U3 accepted org_admin B (U3 user and profile created by sign-in) | U3 | Remove membership |
| 2 Nov, ~22:05 | Stage 1 step 3: Org A and Org B activated | Platform Admin | Suspend |
| 2 Nov, ~22:08 | Stage 1 step 4: U3 accepted learner B (same membership, roles org_admin+learner) | U3 | Revoke role |
| 2 Nov, ~22:10 | U2 signed in once (user and profile created); no invitation accepted (DF8) | U2 | — |
| 2 Nov, ~22:15 | Stage 2: two invitations to Org A for `zz-m1-u1-learner@example.com` (learner) and `zz-m1-u1-instructor@example.com` (instructor), both revoked straight away; no email sent (no provider configured) | U1 | — |
| 2 Nov, ~22:20 | Stage 2: Org B suspended, then reactivated | Platform Admin | — |
| 2 Nov, ~22:22 | Stage 2: one P15 support lookup, case ref `M1-TEST-001` (audited) | Platform Admin | — |
Now: both orgs active. Org A: U1 org_admin; U2 learner invitation pending. Org B: U3 org_admin+learner; U2 instructor invitation pending. Invitations expire 9 November 2026. Links exist only in the owner's built-in-browser tab (sessionStorage). All test sessions were ended with a local (single-session) logout.

Deployed Edge Functions (2 Nov, ~19:25 SAST, OD2): `invitations` v4 `e406fe97…` and `media-url` v4 `a8c22992…`, both from `ade1050`, `verify_jwt` false. Rollback = redeploy the `4375371` files. Deno type-check not run.

## Open defects
- DF1 fixed on staging 2 Nov (OD2): bad tokens now 401. O-A6-2 (media-url body checked before session, 400) remains; harmless.
- DF2 closed by DF8: the real Workspace claim location is now known.
- DF3 Q-07-12 staff account IDs readable on course rows — migration 0014 prepared and sandbox-tested (`5bbfced`); app reads through `course_people` with a pre-0014 fallback (`debc166`). **Not applied to staging — needs owner approval.**
- DF4 platform courses default to "assigned" — guard done (`d6a2502`, Q-08-7).
- DF5 no cleanup of orphaned private files — before real data (D38 #9).
- DF7 fixed in code (`cd65913`): invitation sign-in asks Google for its account chooser. Reaches staging only after the owner pushes (Render auto-deploy). Staging tests used a page-side workaround (adds `prompt=select_account` before the redirect).
- **DF8 (found 2 Nov, Stage 1 step 5)**: a real Google Workspace sign-in (U2, alustudent.com) stores `hd` under `identity_data.custom_claims.hd`, not at the top level. 0006 read only the top level, so every Workspace invitee is refused (preview empty, accept 42501), contrary to D33. U2: `email_verified` = boolean true; top-level `hd` absent; `custom_claims.hd` = `alustudent.com`. Fix: migration 0015 (`8efbf55`) reads either location, refuses non-string values and refuses two values that disagree (this also closes a gap where a top-level hd could mask a different nested one). pgTAP 036: 6/16 fail without 0015, 16/16 with; full suite 897/897. **Not applied to staging — needs owner approval.** Step 5 and the U2 parts of step 6 and Stage 2 wait for it.
- DF9 (found 2 Nov): opening a second invitation link in a tab already showing `/invite` changed only the fragment, so the page kept the old invitation's state. Fixed in code (listens for `hashchange`; a new token restarts the flow), with a regression test that fails on the old page. Reaches staging after a push.

## Gated actions (need explicit owner approval)
- Apply migration 0014 (DF3) and 0015 (DF8) to staging.
- Push (Render deploy of DF7 and DF9 fixes).
- Any other migration, hosted configuration, secret or deploy.

## Next action
Owner approval to apply 0015 (and 0014); then Stage 1 step 5 (U2 accepts learner A and instructor B; recheck the D33 gate), step 6 read-back, and the U2-dependent Stage 2 checks (learner and instructor cannot invite; member suspension, removal, role change between two members). M2 preparation continues meanwhile.

## M1 tasks
1. [done] Record D38 (`aacab88`).
2. [done] CLAUDE.md and this handoff.
3. [done] Reconcile stale documentation (`0dd215e`). The recovery runbook named in the 1 November handover is not in this repository; its correction stays open until located.
4. [done] OD2 deployed and verified (Claude Project: `claude/od2-deployment-result-2026-11-02.md`).
5. [done] T4 on staging: GraphQL refused for signed-out and signed-in callers (406 PGRST106).
6. A8 Stage 1 — steps 1–4 [done]; step 5 [blocked: DF8, needs 0015 on staging]; step 6 [partial: PA read-back matches; U2 rows pending].
   - 2b U3 preview "Join ZZ Test Org B — Organization Admin"; U3 `email_verified` boolean true, gmail.com. 2c revoked link: page shows nothing; direct accept 400 "this invitation is revoked". 2d U3 active org_admin B, Org B draft.
   - 3 PA activated A and B through the app. 4 U3 accepted learner B → one membership, roles org_admin+learner.
7. A8 Stage 2 on staging [done except U2-dependent items]:
   - No-membership user (U2): sees only own profile; invite to A or B → 403.
   - U1 (org_admin A): sees only Org A; invite learner/instructor A → 200; org_admin A → 403 "only a Platform Admin can invite an org admin"; learner B → 403; own email → 403 "you cannot invite your own email address"; revoke a B invitation → 403; suspend A → 403; grant role in B (self → "cannot change your own roles"; other → "not permitted"); member status in B → 403; direct insert into invitations → 403; PATCH Org B → 403; revoke own A invitations → 204, again → 400.
   - U3 (org_admin+learner B): sees only Org B; invite to A, revoke A invitation, suspend A, suspend own B → all 403.
   - Org suspension (P11): while B suspended, U3 sees no org, no invitations, invite → 403, cannot reactivate (403); PA reactivates → U3 sees B again.
   - P15: PA routine view of Org A omits U1's own invitations; lookup without case ref → 400; with case ref → finds it.
8. M1 milestone report → after step 5.
