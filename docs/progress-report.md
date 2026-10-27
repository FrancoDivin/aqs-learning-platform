# Progress report — first release

Branch `feature/first-release` (local commits only; nothing pushed, applied or deployed).

| Milestone | Commit | Result |
|---|---|---|
| M0 Baseline of reviewed frontend and drafts | `dfcbe0d` | — |
| M1–M2 Migrations 0005a–0009 (GraphQL off, P12, identity and invitations, courses, enrolment, quizzes) | `92e3bea` | DB tests 654/654 |
| M3 0009a corrections/revert/clone, 0010 Storage and video, 0011 platform report | `a7ec266` | DB tests 764/764 |
| M4 Live frontend on real data for all four roles; Edge Functions `invitations`, `media-url` | `c94ee2f` | lint, build, 310/310 preview e2e |
| M5 Live-mode e2e (mocked API), CI workflow, Render blueprint, staging runbook | (this commit) | 17/17 live e2e, 7/7 function tests |

All database results are **simulated** (PostgreSQL 16 sandbox, not Supabase). Live-mode UI
tests use a mocked Supabase API. Nothing has run against a real Supabase stack yet: that is
the staging step.

## Working defaults built in (for confirmation)

Q-06-1/2, Q-07-1…15, Q-08-1…5, Q-09-1 as recorded in the review package; plus:
- **Q-P4-1** Corrections: proposed by course staff or org admins; approved by another org admin
  (platform courses: another Platform Admin); Platform Admins never touch org-course content.
- **Q-P4-2/3/4** Correctable: titles, summary, lesson text, quiz prompts, options, explanations;
  never keys, settings or structure. Stale text must be re-proposed. Clone copies outline,
  text and quizzes, not files.
- **Q-07-5 / Q-10-1 / Q-10-2** Video: stored MP4/WebM (500 MB bucket limit; Free plan caps at
  50 MB) or unlisted YouTube on public courses with a non-sensitive attestation. Org-only
  course thumbnails are private. 15-minute signed URLs from `media-url`.
- Lesson text is plain text (paragraphs, auto-linked URLs); no HTML is rendered.

## Not from Figma (built in the existing design language, flagged)

Workspace switcher; suspended-organization notice; staff, corrections, publication and
assignment panels on the course page; support lookup page. Fields the data model does not
hold (category, level, duration, outcomes, "last active", activity feed, org branding) are
omitted rather than invented. Certificates and messaging stay "coming later" (P21).

## Blocking questions (sent 27 October 2026; awaiting answers)

1. Create Supabase project `aqs-staging` (free, eu-central-1).
2. Commit 0005 (T2) and apply 0001–0011 to staging only.
3. Google OAuth client for staging (owner enters the secret).
4. Email provider: Resend free tier (until then, copyable links).
5. Push `feature/first-release` and deploy the Render static site.
6. Accept the working defaults above.
7. Video size vs. plan cost (stay on Free for staging).
8. Record edits: T1 amendment, D34 count (21), F7 superseded, `config.toml` fix.
9. Migration 0012 revoking `service_role` on older tables.
10. Pause the existing project with RLS disabled.
11. Before production: legal texts, company details, P23 wording.

## Known limits

- CI's database job needs 0005 committed (Q2) to pass on a fresh checkout.
- Edge Functions are not type-checked with Deno here (no Deno available); helpers are unit-tested.
- Module rename and some confirmations use the browser's own dialogs.
