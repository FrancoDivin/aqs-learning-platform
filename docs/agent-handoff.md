# Agent handoff

Single source for "where are we and what is next". Update at every task boundary. Decisions live in `docs/decisions.md`; milestone history in `docs/progress-report.md`.

## Current position (3 November 2026, ~00:20 SAST)
- **M1 complete** (Claude Project `claude/m1-milestone-report-2026-11-02.md`).
- **M2 complete** (owner, 3 Nov 00:12): implemented and verified for organization-course workflows (Claude Project `claude/m2-implementation-report-2026-11-03.md`). DF10, DF11 fixed. Recorded limitations: DF3 stays open until 0014 is applied and verified; platform-course publishing and corrections unverified on staging (no second Platform Admin, OD5); Figma comparison partial (design reference inaccessible). None blocks M3.
- **M3 complete** (owner, 3 Nov 00:48; Claude Project `claude/m3-implementation-report-2026-11-03.md`). Verified on staging: enrolment, assignment, completion, quizzes, media, archived (L13) and suspended (P11) workflows. Implemented and tested locally only, not yet verified on staging: I1, I2, I7 and the D38 #10 display. Migration 0016 prepared and tested, not applied, so the suspended-organization course-title display is unavailable on staging. Tests: database 911/911, functions 10/10, unit 4/4, live 32/32, preview 310/310.
- **M4 — Administration and reporting: in progress** (implementation prompt = owner message 3 Nov 00:48).
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
| 2 Nov, ~23:35 | **Migration 0015 applied** (owner approval 23:32): one transaction, refused if already recorded; history row `20261102130000 0015_workspace_hd_claim_location` (3 statements). Function md5 before `1804e97b…`, after `8effa529…`; still not executable by anon/authenticated/service_role; search_path fixed. 0014 NOT applied. | Agent (Supabase connection) | Re-run 0006 function definition |
| 2 Nov, ~23:40 | Stage 1 step 5: U2 accepted learner A and instructor B | U2 | Remove membership |
| 2 Nov, ~23:45 | Stage 2: U1 granted then revoked instructor for U2 in A; suspended then reactivated U2 in A; removed U2 from A; re-invited U2 (learner A, link only, no email); U2 accepted (rejoined with learner only, C2) | U1, U2 | — |
| 2 Nov, ~23:45 | Stage 2: U3 granted learner to U2 in B, revoked instructor, restored instructor, revoked learner (net: unchanged) | U3 | — |
| 2 Nov, ~23:50 | Final read-back; one P15 lookup per org, case ref `M1-TEST-002` (audited) | Platform Admin | — |
| 2–3 Nov, ~23:55–00:10 | M2 course workflows in Org B (all synthetic, "ZZ M2 …"): courses C1 public/open (published → corrected → reverted → archived), C2 org-only (declined), C3 by U3 (approved by Platform Admin), clones "v2" (of published C1) and "Clone of Archived"; small PNG thumbnail, 1 text resource, 1 tiny MP4 uploaded to C1 paths issued by the database; one platform course draft "ZZ M2 Platform Course" (requested then withdrawn) | U2, U3, PA | Archive (published); drafts stay drafts |
Now: both orgs active, no pending invitations. Org A: U1 org_admin, U2 learner. Org B: U3 org_admin+learner, U2 instructor. Org B courses: C1 archived, C3 published (org-only), C2 + 2 clones drafts. Platform: 1 draft.

## M3 staging results (3 Nov ~00:25–00:45 SAST, real sessions, application functions only)
Staging log (synthetic, OD15): U2 built and proposed "ZZ M3 Learner Course" C4 (public/open; reading with 1 downloadable + 1 view-only text file, tiny MP4 video, 2-question quiz 70%/3 attempts/no retake after pass/reveal after final attempt); U3 approved it, assigned C3 (org-only) to self with a due date and C4 to self; U3 completed C3; U1 self-enrolled in C4, took 3 quiz attempts, completed it; U3 passed the C4 quiz; U3 archived C4; Platform Admin suspended then reactivated Org B.
- Catalogue: published public C4 visible to an outsider; org-only C3 not.
- Self-enrolment: open public course 200 (idempotent); org-only course 403. Before enrolment: no lesson text, no file URL (403), no completion (403).
- Assignment (Q-08-4): org admin assigns to a learner of the org with a due date; duplicate, non-learner member (instructor) and outsider refused.
- Completion (P8): lessons complete idempotently; a quiz lesson completes only by passing; all lessons done → enrolment completed with timestamp.
- Quizzes: server grading (0%, 50% partial, 100%); same idempotency key → replay, no new attempt; unknown option → 400; answers hidden until final attempt (G6/G7), then 5 rows with keys and explanations; 4th attempt refused; retake after pass refused (G5); answer keys never readable.
- Media (P16/L7a): enrolled learner gets 15-minute signed URLs (file content fetched; download flag set) for a downloadable file and the video; a non-downloadable file is refused to learners by design (L7a, page lists downloadable files only); outsider before enrolment and Platform Admin 403.
- Archived (L13): enrolled learner keeps outline, text, file and answer review; completion and attempts refused; hidden from the public.
- Suspended (P11): learner loses course record, outline, text and files; keeps own enrolment and progress rows; quiz summary refused (own attempt rows stay readable, pgTAP 070); reactivation restores. D38 #10 titles need 0016 (staging returns PGRST202; the app falls back).
- G1/L11 P3: Org B admin sees only Org B members among C4 learners; Platform Admin sees no learner records, quiz results or files of org courses.

## M2 staging results (3 Nov, real sessions, application functions only)
- Authoring (U2 instructor B): create, details, modules/lessons add/rename/reorder/delete, lesson text, quiz settings/questions/options/explanation — all 200/204. Create in Org A or as platform course → 403.
- Files: thumbnail PNG ok, PDF type refused; resource upload ok, >100 MB refused (raw constraint text, DF10, now caught in the app); video ok, >500 MB and .exe refused; uploads to paths the database did not issue → Storage 403 (RLS).
- Publication (L2/P22/Q-07-3): request locks edits (400); withdraw unlocks; proposer cannot approve course or preview (403); U3 approved preview + publication; decline needs a reason; Org Admin cannot approve own course (P22); Platform Admin approved U3's org course seeing record + outline only, no lesson text (Q-07-2), and lost sight of it once published (L11 P3).
- Frozen published course (P5): text, quiz, structure, video changes → 400 P5 message.
- Corrections (P4/G4): attestation required; one pending per text; withdraw; proposer cannot decide (403/G4); approve applies text with old/new kept; revert by staff, approved by U3, text restored; second revert refused; approver-proposed revert cannot be self-approved (G4).
- Clone (Q-P4-4): published/archived only; copies outline, text, quiz (settings, question, options), not files/previews; draft visibility/policy kept.
- Archive (Q-07-10): Org Admin only (instructor 403); reason required; published only; archived course: no edits, corrections or staff changes; hidden from anonymous visitors; clonable.
- Staff (P3): Org Admin adds/removes staff (instructors or org admins); non-eligible person refused. Observation: a course can be left with no staff (allowed by P3).
- Public (P6/Q-07-6/L3): anonymous sees published public course, outline, instructor name (instructor only), preview lesson text, public thumbnail; not drafts, other lesson text, resources, staff IDs (anon), quiz keys, private files or videos.
- Cross-org (U1, Org A admin): sees only the published public course and its preview; every read of drafts/content/resources/staff/keys/corrections → 0 rows, every action → 403.
- Platform Admin (L11 P3): no Org B drafts, content, resources, keys, files; clone/correct/create in org → 403. Platform course: create/build/request ok; self-approval refused (P1/P22) → publishing platform courses needs a second Platform Admin (OD5).
- DF3 confirmed on staging: a signed-in user of another org reads `created_by`/`published_by` of a public course (fixed by 0014, not applied). Invitations expire 9 November 2026. Links exist only in the owner's built-in-browser tab (sessionStorage). All test sessions were ended with a local (single-session) logout.

Deployed Edge Functions (2 Nov, ~19:25 SAST, OD2): `invitations` v4 `e406fe97…` and `media-url` v4 `a8c22992…`, both from `ade1050`, `verify_jwt` false. Rollback = redeploy the `4375371` files. Deno type-check not run.

## Open defects
- DF1 fixed on staging 2 Nov (OD2): bad tokens now 401. O-A6-2 (media-url body checked before session, 400) remains; harmless.
- DF2 closed by DF8: the real Workspace claim location is now known.
- DF3 Q-07-12 staff account IDs readable on course rows — migration 0014 prepared and sandbox-tested (`5bbfced`); app reads through `course_people` with a pre-0014 fallback (`debc166`). **Not applied to staging — needs owner approval.**
- DF4 platform courses default to "assigned" — guard done (`d6a2502`, Q-08-7).
- DF5 no cleanup of orphaned private files — before real data (D38 #9).
- DF7 fixed in code (`cd65913`): invitation sign-in asks Google for its account chooser. Reaches staging only after the owner pushes (Render auto-deploy). Staging tests used a page-side workaround (adds `prompt=select_account` before the redirect).
- **DF8 (found 2 Nov, Stage 1 step 5)**: a real Google Workspace sign-in (U2, alustudent.com) stores `hd` under `identity_data.custom_claims.hd`, not at the top level. 0006 read only the top level, so every Workspace invitee is refused (preview empty, accept 42501), contrary to D33. U2: `email_verified` = boolean true; top-level `hd` absent; `custom_claims.hd` = `alustudent.com`. Fix: migration 0015 (`8efbf55`) reads either location, refuses non-string values and refuses two values that disagree (this also closes a gap where a top-level hd could mask a different nested one). pgTAP 036: 6/16 fail without 0015, 16/16 with; full suite 897/897. **Fixed on staging 2 Nov ~23:35** (0015 applied); U2 passes the gate and accepted both invitations.
- DF10 (M2): an empty or >100 MB material file reached the database and came back as a generic error. Fixed in the data layer with a clear message before anything is stored; regression test.
- DF11 (M2, design check): at 1440 px the course outline column (I1: 260–320 px) squeezed module titles to one word per line beside four controls. Fixed: module controls on their own line; column width unchanged.
- DF9 (found 2 Nov): opening a second invitation link in a tab already showing `/invite` changed only the fragment, so the page kept the old invitation's state. Fixed in code (listens for `hashchange`; a new token restarts the flow), with a regression test that fails on the old page. Reaches staging after a push.

## Gated actions (need explicit owner approval)
- Apply migration 0014 (DF3) and 0016 (D38 #10) to staging.
- Push (Render deploy of DF7 and DF9 fixes).
- Any other migration, hosted configuration, secret or deploy.

## Next action
M4. Owner-authorized items carried forward (not blockers): push the branch; apply 0014 and 0016 to staging; add `- run: npm run test:unit` to the protected `.github/workflows/ci.yml`; second staging Platform Admin (OD5) and `design-reference` access when practical.

## M1 tasks
1. [done] Record D38 (`aacab88`).
2. [done] CLAUDE.md and this handoff.
3. [done] Reconcile stale documentation (`0dd215e`). The recovery runbook named in the 1 November handover is not in this repository; its correction stays open until located.
4. [done] OD2 deployed and verified (Claude Project: `claude/od2-deployment-result-2026-11-02.md`).
5. [done] T4 on staging: GraphQL refused for signed-out and signed-in callers (406 PGRST106).
6. [done] A8 Stage 1 — steps 1–6.
   - 5 After 0015: U2 email_verified boolean true, top-level hd absent, custom_claims.hd = alustudent.com, Google the only identity → preview "Join ZZ Test Org A — Learner"; accepted. Instructor B accepted. Two separate memberships.
   - 6 PA final read-back: A 1 admin + 1 learner; B 1 admin + 1 learner + 1 instructor; 0 pending; both active.
   - 2b U3 preview "Join ZZ Test Org B — Organization Admin"; U3 `email_verified` boolean true, gmail.com. 2c revoked link: page shows nothing; direct accept 400 "this invitation is revoked". 2d U3 active org_admin B, Org B draft.
   - 3 PA activated A and B through the app. 4 U3 accepted learner B → one membership, roles org_admin+learner.
7. [done] A8 Stage 2 on staging:
   - U2 as learner (A) and instructor (B): cannot invite (403 ×3), cannot change own roles or membership, cannot list members (organization_members 403), cannot call platform functions, sees only own membership rows and own profile.
   - U1 on U2 in A: list members (self + U2 only); grant/revoke instructor 204; grant org_admin 403 (Platform Admin only); suspend → U2 loses Org A (row shows suspended), reactivate → restored; remove → U2 loses Org A, keeps B; removed member cannot invite; re-invite + accept → active with learner only (C2). U1 on U2 in B: 403.
   - U3 on U2 in B: grant learner / revoke instructor / restore 204; on A: 403; cannot revoke U1's invitation (403); cannot list A members.
   - No-membership user (U2): sees only own profile; invite to A or B → 403.
   - U1 (org_admin A): sees only Org A; invite learner/instructor A → 200; org_admin A → 403 "only a Platform Admin can invite an org admin"; learner B → 403; own email → 403 "you cannot invite your own email address"; revoke a B invitation → 403; suspend A → 403; grant role in B (self → "cannot change your own roles"; other → "not permitted"); member status in B → 403; direct insert into invitations → 403; PATCH Org B → 403; revoke own A invitations → 204, again → 400.
   - U3 (org_admin+learner B): sees only Org B; invite to A, revoke A invitation, suspend A, suspend own B → all 403.
   - Org suspension (P11): while B suspended, U3 sees no org, no invitations, invite → 403, cannot reactivate (403); PA reactivates → U3 sees B again.
   - P15: PA routine view of Org A omits U1's own invitations; lookup without case ref → 400; with case ref → finds it.
8. [done] M1 milestone report (Claude Project: `claude/m1-milestone-report-2026-11-02.md`).
Limitations: DF7 and DF9 code fixes are not on staging until pushed (tests used a page-side account-chooser workaround and reloads); 0014 not on staging; two test sessions (U2, U3) were cleared from the browser without a server logout — their refresh tokens were held only in that tab and are gone; Deno type-check of Edge Functions not run; history row for 0015 stores the statements with trailing whitespace trimmed (content identical).
