# AQS Learning Platform — Decision Record

*Status: **provisional**, approved 13 October 2026 (D11 added the same day). Source: design audit `AQS-design-audit.md` (repo root) and the Project document `design/design-audit-2026-10-13.md`.*

> **This file is the authoritative decision record** (`aqs-platform/docs/decisions.md`). The Claude Project document `decisions/decision-record.md` is a read-only mirror: make changes here, then refresh the mirror. Never edit the mirror directly.

Each decision says what was decided, why, and what it means for future work. "Provisional" means it can be revisited, but nobody should build against it without updating this file first.

---

## D1 — Accessibility and the orange brand colour

**Decision**
- Primary (orange) buttons use **`#C2410C` with white text** (contrast 5.18:1, passes WCAG AA).
- `#F97316` stays as a **brand accent** only, where no text sits on it or uses it (decorative lines, illustrations).
- Orange-looking text (eyebrows such as "FEATURED COURSES") uses `#C2410C`. Text links use blue `#2563EB`.
- Every interactive element has a visible keyboard focus ring. Icon-only buttons have accessible labels.

**Why:** white on `#F97316` is only 2.80:1, which fails WCAG AA for every text size.

**Phase 1 implementation notes**
- A darker **hover** colour `#9A3412` was added. The design system page shows identical default and hover colours, so no hover state was actually designed.
- Form-control outlines use `#8391A7` (3.19:1). This is slightly darker than the light grey in the designs, because WCAG 1.4.11 requires 3:1 for control boundaries.
- Focus ring: 2px white gap plus a 2px blue ring. On navy surfaces it switches to light blue `#93C5FD` (6.38:1), because blue on navy is only 2.23:1.
- All token contrast ratios are listed in `src/styles/tokens.css` and calculated live on `/design-system`.

## D2 — Archived references

**Decision:** the older **Learner Home, Course Player and Quiz** designs in `design-reference/3 Pending & Archive/Learner/` are **archived, superseded references**. Everything else in `3 Pending & Archive/` is **pending**.

- Never delete, move, rename or modify any file in `design-reference/`.
- Useful concepts to revisit from the archived screens: organization badge in the header, "Assigned to you" with required courses and due dates (see D7), "Message your instructor" link in the player, and "Save and exit" on quizzes (deferred, see D7).

## D3 — Landing page hero

**Recommendation: Option A** (`Landing [Ready].png`, frame 1). **Awaiting your confirmation before the landing page is built.**

- In A, the person faces into the page, towards the headline and the buttons, and the laptop is fully in frame.
- In B, she faces out of the page and the laptop is cut off at the right edge.
- The two frames are otherwise identical. The source image must not be modified. The hero photo will need exporting from Figma as its own asset.

## D4 — Organization security and administration

These rules are **documented for future backend work. No backend security exists yet.**

- Verifying an email domain must **never** automatically grant organization membership.
- Domain-based admission must be **explicitly enabled** by an authorized administrator and follow the approved membership process. The General Admin "Invitations and domains" design (DNS-verified, opt-in, joins as Learner only) is the reference pattern.
- Organizations are created in **Draft**. Lifecycle: **Draft → Active → Suspended**.
- **Global Admins assign General Admins.** General Admins manage their organization's invitations and memberships.
- A user can hold **multiple roles** and belong to **multiple organizations**.
- Organization-scoped permissions are kept **separate** from platform-wide Global Admin permissions.
- These rules replace the conflicting copy in the "Create organization" and "Organizations" designs ("Users with this email domain join automatically", status defaulting to Active, assigning "Initial instructors"), and the single-role "Users and roles" design.

## D5 — Video hosting

- In the current phases, build **only the video-player presentation** with clearly labelled mock data.
- Do not implement real video hosting, and never present unlisted YouTube links as secure private content.
- Before production: recommend a hosting approach with access controls suitable for private organization content (for example signed, expiring playback URLs).

## D6 — Invitations

- For the MVP, organization invitations are managed by **General Admins**.
- Instructor-sent invitations (the "Invite learners" card and "Invitations" page in the instructor designs) are **out of scope** unless approved later.

## D7 — MVP scope

| Feature | Status |
|---|---|
| Offline downloads, background sync | **Deferred.** Offline/syncing banners may appear only as labelled **mock states**. Never claim offline capability. |
| Required courses and due dates | **In the MVP if feasible**, because org admins need to track overdue training. |
| Learner notes (mobile player "Notes" tab) | **Deferred.** |
| Course ratings (★ 4.8 on course cards) | **Deferred.** |
| Quiz "Save and exit" | **Deferred.** |

Deferred features must not be built as working functionality by accident. If a design shows them, leave them out or show them clearly as "coming later".

## D8 — Sign-up

- Public Google sign-up may create a **public learner account**.
- **Organization membership is a separate process** (invitation or approved admission).
- An organization entry link must never bypass authorization or membership checks.

## D9 — Responsive targets

- **Public and learner screens:** desktop and mobile.
- **Instructor and administrator screens:** desktop-first, but usable on tablets and smaller viewports.
- Do not call a screen "fully responsive" until it has been tested at those sizes.

Phase 1 layouts: PublicLayout switches to a menu button below 1024px. AppShell's sidebar becomes a slide-in drawer below 1024px. AuthLayout hides the navy panel below 900px. FocusLayout compacts its header below 768px. The preview page was tested at 390, 768, 1024, 1280 and 1440px wide with no sideways scrolling.

## D10 — Dependencies

- **React Router** for navigation: `react-router` **8.4.0 is declared in `package.json` and locked in `package-lock.json`, but not yet installed in the Windows development environment** (status as of 13 October 2026; run `npm install`). It requires Node.js **22.22 or newer**.
- **CSS Modules + CSS custom properties** for styling. No CSS framework.
- Keep the existing React + TypeScript + Vite project.
- No backend, database, authentication provider or UI framework in this phase.
- Inter is loaded from Google Fonts in `index.html` (no extra package). Self-hosting is an easy swap later if needed for privacy or offline development.

## D11 — Defer authentication; build the UI against replaceable interfaces

*Approved 13 October 2026.*

**Decision**
- Build in stages: design system → public pages → learner → instructor → admin workspaces, **before** real authentication.
- During UI work, use **clearly labelled mock users and mock data**, available in local development only.
- Keep routing, authentication and authorization behind **replaceable interfaces**, so a real auth provider and backend can be plugged in later without rewriting screens.
- **No** fake login security, **no** stored passwords, and no claim that mock role selection protects routes or data. Mock access must never become a production mechanism.
- Keep the agreed model: **user identity**, **organization membership** and **permissions** are separate concepts (see D4).
- **Do not build authentication pages or functionality** until explicitly instructed. The existing `AuthLayout` shell stays as an unused layout.

**Proposed architecture: PROVISIONAL, not approved (see A1–A6 below)**

| Layer | What screens use | Development implementation | Later replacement |
|---|---|---|---|
| Session | `useSession()` returns `{ status, user, memberships, platformRoles }` | Dev-only mock provider with a visibly labelled persona switcher | Real provider: Google sign-in + backend session |
| Permissions | `can(permission, scope)`, e.g. `can('course.edit', { orgId })` | Computed from the mock persona's memberships | The same function, fed by the backend's answer; **the server re-checks every request** |
| Data | Async service functions, e.g. `courses.listForOrg(orgId)` | Mock services returning promises, with fake delays and errors | HTTP client calling the real API |
| Routes | Workspace-scoped URLs, plus guard components for user experience only | Guards read the mock session | Same guards; real enforcement on the server |

**Rules to keep integration easy**
1. Screens never import mock data files directly. They only call services and hooks.
2. Screens never check role names (`role === 'admin'`). They check permissions via `can()`.
3. A user has many memberships; every org-scoped entity carries an `orgId`. IDs are opaque strings, never names or email domains.
4. All data access is asynchronous, so every screen gets real loading, empty, error and permission-denied states from the start.
5. The mock session lives only in development builds, excluded the same way as `/design-system`. A production build with no real provider shows everyone as signed out.
6. Nothing role-related is stored in `localStorage` as a source of truth. A remembered mock persona is a development convenience only.
7. Route guards are labelled "UX only". Security is enforced on the server and database (D4, project instructions §6).

**Open decisions to settle before Phase 2 routing (A1–A6)**

> **Status of A1–A6: PROVISIONAL, not approved.** These are recommendations only. Do not build against them until each is explicitly approved and this note is updated.
- **A1 — Workspace URLs.** Recommended: org-scoped areas carry the organization in the URL (e.g. `/o/:orgSlug/...`), public learning lives at top-level paths, and Global Admin at `/admin/...`. The URL selects a workspace; it never grants access.
- **A2 — Permission vocabulary.** Recommended: a fixed list of permission strings (e.g. `org.members.manage`, `course.edit`, `course.publish`) mapped from roles in one place.
- **A3 — Identity provider.** Google sign-in only (D8), through the provider chosen for the stack (earlier stated: Firebase Authentication). Identity only; roles and memberships live in Postgres and are checked by the backend.
- **A4 — Data-fetching approach.** Recommended: plain async service functions now; a caching library (e.g. TanStack Query) only when the real API arrives, and only if justified.
- **A5 — Mock persona set.** Recommended: Public learner; Org learner (one org); Learner in two orgs; Course Creator; General Admin who is also a Course Creator; Global Admin; plus a "signed out" state.
- **A6 — Development mode switch.** Recommended: mocks are enabled only by `import.meta.env.DEV` (no environment variable that could be switched on in production).

---

## Provisional choices made during Phase 1

These are small design-system choices that the designs left open. Change them here if you disagree.

1. **One warning colour.** The designs use two different offline-banner colours (`#FFF7ED` on the dashboard, `#FEF3C7` in the player). All warnings use `#FFF7ED` with `#9A3412` text.
2. **Two added button variants:** *Neutral* (grey outline, navy text, as used by "Previous", "Cancel", "Try again") and *Danger* (for "Revoke", "Deactivate").
3. **Eyebrow text style** (12px, semibold, uppercase, letter-spaced) added to the type scale. It's used throughout the designs but missing from the design system page.
4. **Status colours** (success, warning, danger, violet) added as tokens. They're used in screens but missing from the design system page.
5. **Wordmark** is text-only ("AQS / E-LEARNING") because no logo file exists yet.
6. **Footer contact details** are left blank until AQS confirms real ones. The design shows placeholders.
7. The **`/design-system` preview is development-only.** It is excluded from production builds.

---

# Decisions recorded after 13 October 2026

Entries above this line are unchanged and keep their original wording, IDs and dates. Entries below use these status labels:

- **Confirmed in conversation** — agreed by the project owner in conversation on the date shown; this file records it.
- **Proposed** — a recommendation awaiting the project owner's approval. Do not build against it until its status is updated.
- **Open** — an unresolved question. No default has been chosen.

Entries below use the role terms proposed in D22 (Platform Admin, Organization Admin, Instructor, Learner).

## D12 — Implementation foundation, working copy and preservation

**Confirmed in conversation (19 October 2026)**
- The implementation working copy is `C:\Dev\aqs-platform`, on branch `phase-1-foundations` at commit `1ee920d`. It is outside OneDrive.
- Normal development is permitted in that working copy, within the other decisions in this file.
- The earlier folder `OneDrive\Desktop\AQS-New-Platform\aqs-platform` is preserved untouched and is not used for implementation.
- Project B (`owenganza01/aqs-landing-page-planning`, last audited at commit `38c4358`) is a **read-only reference**. It is not merged wholesale, and the recovery repository is never modified.
- The v0 chat connected to that repository stays **connected but unused** while auditing and planning continue, because any v0 edit creates commits in the recovery repository.
- The following remain preserved, unmodified and never moved, renamed or deleted: the original Figma designs; everything in `design-reference/`, including `new designs/`; all design ZIPs; `backups/`; the OneDrive folder; the recovery repository; and the untracked files `AQS-design-audit.md` and `decision-record.md` in both the OneDrive folder and the working copy. This preservation rule covers only the items listed. It does not restrict normal development of the project's tracked files in the working copy.

**Verified on 19 October 2026 (read-only)**
- `C:\Dev\aqs-platform`: branch `phase-1-foundations`, `HEAD` = `1ee920dd12df5399a405afefce2a8cf78b26c825` (same as GitHub). All 66 committed files match `1ee920d`. No tracked changes. Two untracked files (`AQS-design-audit.md`, `decision-record.md`), byte-identical to the copies in the OneDrive folder.
- OneDrive folder: branch `master` at `524c7d4`, unchanged since 13 October 2026.

**Proposed (19 October 2026)**
- Project A's approved Phase 1 foundation (design tokens, components, layouts and responsive behaviour at `1ee920d`) is the definitive implementation foundation.
- Project B may be used as a reference for its screen inventory, domain types, service contracts, mock-data shapes and useful copy, after correction against these decisions.

**Why:** Project A is the only codebase that implements D1, the measured type scale, focus states and tested responsive layouts. The 19 October 2026 audit found that Project B regresses D1 and conflicts with D4, D6, D8 and D10.

## D13 — Framework reaffirmed; hosting, backend, database and authentication deferred

**Confirmed in conversation (19 October 2026)**
- D10 stays in force: React, TypeScript, Vite, React Router, CSS Modules and CSS custom properties.
- Next.js, Tailwind, shadcn or any other framework may be introduced only with a separate, explicitly recorded approval.
- No hosting platform, backend, database or authentication provider is selected.
- A separate comparison will be prepared. It considers **Render first** and evaluates alternatives on: free tiers and their limits, total stack cost, limits and costs beyond free tiers, fit with D15–D21, tenant isolation and maintenance burden.
- Preparing a Render-first comparison does **not** select Render or any other provider. Hosting, backend, database and authentication-provider decisions remain open until separately approved and recorded.

**Proposed (19 October 2026)**
- The provisional approval given in conversation on 18 October 2026 to a Next.js, Neon and Better Auth stack ("Proposal A") is withdrawn. That approval was never recorded in this file.

**Open**
- The hosting platform, backend, database and authentication provider.
- Technologies discussed earlier but never recorded as decisions remain candidates only: PostgreSQL, Firebase Authentication, Render hosting, Node.js + Express, Drizzle ORM and Resend (stated in a 12 October 2026 conversation outside this Project, available only as a summary); Neon and Better Auth (18 October 2026). None is selected.

**Consequences:** a Vite single-page app has no server of its own, so the backend will be a separate API service or a hosted backend platform. This is a fact for the comparison, not a choice.

**Note (verified 19 October 2026):** `react-router` 8.4.0 is installed in the local development environment. D10's note of 13 October that it was not yet installed is out of date. D10's text is left unchanged.

## D14 — Design scope and asset handling

**Confirmed in conversation (18 October 2026) — design scope**
- Use the updated designs in `design-reference/new designs/` only for screens whose content changed: Landing; Authentication (updated sign-in and the new Google sign-up frame); Learner dashboard; and the minor changes to Admin › Organization detail and Admin › Users and roles.
- Keep the earlier designs for unchanged screens, including the Admin board, Course player, Instructor screens, Learner courses & quizzes, and all pending and archived screens. D2's classification is unchanged.
- Preserve every original design and recovery copy.

**Confirmed in conversation (19 October 2026) — measurement references**
- Verified, content-identical 2× exports may be used as measurement references for **unchanged screens only**. On 18 October 2026, the 2× exports of the Admin board, Course player, Instructor screens and Learner courses & quizzes differed from the originals by less than 0.5% of pixels. The original exports remain the primary reference and are preserved.

**Proposed (19 October 2026)**
- Build page structures against the relevant design reference first. Track missing assets in a list and use clearly labelled placeholders.
- Do not finalize or replace the landing page's original Figma assets yet. After all page structures exist, source the correct original assets and review visual fidelity.

**Open**
- The landing hero choice. **D3 remains open and is not superseded**; it is reviewed with the landing assets.

## D15 — Authentication and invitation policy

**Proposed policy (19 October 2026) — amends D8; conflicts with provisional A3**
- Public Learners may sign in with email and password, or with Google.
- One authentication system serves everyone. Staff access is granted through a separate invitation and onboarding workflow, not a separate sign-in system.
- Staff access requires a valid invitation naming the intended role and organization.
- An existing account holder signs in to that account and may accept an invitation only when the account email matches the invited email.
- A new invitee completes the invitation and account-activation flow, including email verification, before receiving the invited access.

**Confirmed in conversation (19 October 2026) — what is authorized now. This is the explicit instruction D11 requires, limited as follows**
- Non-functional page layouts may be prepared **only** for the existing approved Google-only authentication designs: sign-in, sign-in error, mobile sign-in and Google sign-up (`design-reference/new designs/2 Screens/Auth [Ready].png`).
- **No authentication behaviour is authorized**, including password handling of any kind, sessions, tokens, provider integration and route protection.
- Email/password sign-in, password-reset, email-verification and invitation-activation layouts require **separate design approval** before any layout work.
- Real authentication requires its own separate authorization and a provider decision (D13).
- D11's "no stored passwords" is read as: no password storage in mock development, and never plaintext password storage anywhere in the application.

**Open**
- Designs for email/password sign-in, password reset, email verification and invitation activation.
- The pending "Accept invitation" and "Not linked" designs (`3 Pending & Archive/Auth/`) are not covered by the layout authorization above.

## D16 — Course ownership and sharing

**Confirmed in conversation (18 October 2026)**
- Courses may be platform-owned or organization-owned.
- Sharing a course with another organization requires explicit permission.

**Open:** who grants and who receives sharing permission; whether sharing can be withdrawn, and what Learners keep if it is.

## D17 — Administrative scope

**Confirmed in conversation (18 October 2026)**
- Organization Admins are restricted to their own organization.
- Platform Admins manage the platform globally but cannot impersonate users.

**Confirmed in conversation (19 October 2026)**
- Platform-wide administration does not automatically grant access to private learner content.

**Open:** which learner information, if any, Platform Admins may see (for example aggregate figures), and how any exceptional access would be granted and recorded.

## D18 — Staff invitations

*Relates to D4 and D6; their text is unchanged.*

**Confirmed in conversation (18 October 2026)**
- Organization Admins may invite Instructors for their own organization.
- Only Platform Admins may invite Organization Admins.
- Invitations expire after seven days.
- Acceptance and email verification are required. No further approval is needed once an authorized invitation is accepted and verified.

**Confirmed in conversation (19 October 2026)**
- Staff invitations must be revocable by authorized administrators.

**Open**
- Which administrators may revoke which invitations.
- Platform Admin provisioning: the procedure for creating Platform Admins, including whether any form of self-registration is allowed. No policy has been decided.
- Whether a revoked or expired invitation can be reissued.

## D19 — Quizzes

**Confirmed in conversation (18 October 2026)**
- The passing score defaults to 70%.
- Attempt limits are configurable per quiz. Retakes are allowed while attempts remain.
- Grading happens on the server.
- Historical attempts are retained.
- Duplicate submissions are handled idempotently.

**Open:** which attempt counts (for example highest, latest or first pass); the default attempt limit; whether the passing score can be changed per quiz; how historical attempts are treated when a quiz is edited.

## D20 — Protected resources

**Confirmed in conversation (18 October 2026)**
- Protected resources are available only to enrolled Learners or Learners with an explicit access grant.
- Public previews require separate, explicit approval.
- Signed URLs expire after 15 minutes.
- Downloads require both an authorization check and a downloadable flag on the resource.

**Open:** the scope of an access grant (resource, lesson or course); the video playback approach within the 15-minute limit (to be covered by the D13 comparison).

## D21 — Security and architecture baseline

**Existing requirements (restated here; not new decisions)**
- Project instructions §6 (Multi-Tenant Security): "Enforce authorization on the server and, where applicable, at the database level. Do not rely on frontend filtering, hidden navigation items, URLs, organization slugs, or email domains as security controls." Also: "Use explicit organization membership and scoped permissions."
- Project instructions §9 (Engineering Approach): "Prefer a modular architecture with clear boundaries. Avoid unnecessary microservices and premature complexity."
- D11 (approved 13 October 2026), **Decision** section: build the UI in stages before real authentication; use clearly labelled mock users and mock data in local development only; keep routing, authentication and authorization behind replaceable interfaces. D11's architecture table and A1–A6 remain provisional, as recorded in D11.

**Proposed (19 October 2026)**
- Roles and memberships used for authorization come only from trusted server-side data, never from client-supplied values (consistent with project instructions §6).
- Known Project B issues are not carried forward: fake partner endorsements; the "Northstar Learning" metadata; `typescript.ignoreBuildErrors`; production analytics without an approved privacy decision.

## D22 — Canonical role terminology

**Proposed (19 October 2026)**

New decisions use **Platform Admin**, **Organization Admin**, **Instructor** and **Learner**. Older entries keep their original wording. No code, permission names or interface labels are renamed as part of this documentation change.

| Canonical term | Earlier labels |
|---|---|
| Platform Admin | Global Admin |
| Organization Admin | General Admin |
| Instructor | Course Creator (project instructions); "Instructor" (designs) |
| Learner | Student/Learner; Public Learner |

**Open:** whether "Public Learner" is a Learner without organization membership or a separate role; whether the AQS Owner role (project instructions §4) is a separate role or a Platform Admin capability.

## D23 — Decision-record housekeeping

**Proposed (19 October 2026)**
- The authoritative record is `aqs-platform/docs/decisions.md` in the implementation working copy (D12). The Claude Project document `decisions/decision-record.md` is a secondary, read-only mirror, updated only after this file is approved and written.
- The root file `aqs-platform/decision-record.md` is **non-authoritative and stale**: it contains D1–D10 only and is untracked by Git. Identical copies exist in the working copy and the OneDrive folder. It is neither deleted nor archived.
- On 19 October 2026, no file in either folder (excluding `node_modules`, `dist` and `.git`) referred to it. The only match for "decision-record" is this file's reference to the Project mirror. Its eventual disposition will be proposed separately.
- On 19 October 2026, the Project mirror's decision content matched this file at `1ee920d` line for line. The only differences were the mirror's own title and its read-only notice.

## D24 — Unavailable navigation destinations

**Confirmed in conversation (20 October 2026)**
- Public navigation destinations that are not built yet are shown as **unavailable**, never as working links. This covers Sign in, Get started, About, Contact, and the unfinished footer destinations (Our Story, Instructors, Careers, Blog, Privacy Policy, Terms and Cookie Policy). They must not lead to a missing page or the Not Found page.
- Unavailable items are displayed as dimmed text and include a visually hidden "(not available yet)" label that is exposed to screen readers. Because these items are not interactive links or buttons, they are not included in the keyboard tab order.
- The footer **Courses** and **For Organizations** links go to the corresponding sections of the landing page (`/#courses` and `/#for-organizations`) until dedicated pages exist.
- **Sign in** and **Get started** stay unavailable until sign-in is separately approved. This entry does not approve or implement authentication. D11, D13 and D15 still apply.

**Why:** unbuilt features must not appear to work (D7), public screens must work on mobile and desktop (D9), and authentication work is limited to the approved layouts (D11, D15).

**Implemented in:** commit `09139a4` on `phase-1-foundations` (public header and footer, and the About and Contact items on the landing and course-detail pages).

## D27 — Development-only demo layer (A1, A2, A4, A5, A6)

*D25 and D26 are reserved for the 21 October 2026 stack and sign-in approvals, recorded separately. The original A1–A6 text in D11 is unchanged and keeps its provisional wording. This entry approves only the development-build demo architecture described below. It does not resolve production decisions or every provisional statement in A1–A6.*

**Confirmed in conversation (21 October 2026): scope**
- **Friday 23 October demo:** a local development-build demo on the owner's PC. No hosted or deployed demo build. If a hosted URL turns out to be required, stop and ask before changing A6.
- **Production is unchanged by this entry.** Production builds keep only `/` and the Not Found page. A route existing in the demo does not approve it for production.
- **Demo behaviour is not security.** Persona switching, permission checks in the interface and route guards are user-experience only. They are not authentication or authorization. The database is the security boundary. No real authentication is implemented for the demo.

**Confirmed in conversation (21 October 2026): demo architecture**
- **A4:** async service functions, with development-only sample data kept outside page components. No data-fetching library.
- **A6 (unchanged):** sample users and data are enabled only by `import.meta.env.DEV`. No environment-variable override, hosted demo build or production sample-data mode. Production output must not contain usable personas, sample data or development routes.
- **A2:** one central permission file, `can(permission, scope)`. Pages never check role names. Public browsing of public course outlines does not require a profile. Signed-in permission checks require an active profile. Organization-specific access and actions require the applicable permission in the list below and the organization state under F4: an active organization for learners, a draft or active one for staff. The only exception is `learning.own_records.view`, which lets a learner read their own existing records from a suspended organization and grants no organization access.
- **A1:** URLs, organization slugs, course IDs and organization IDs identify resources and never grant access. Checks use the organization recorded on the resource itself, so pairing a resource with another organization's URL shows "no access".
- **Suspended organizations, general rule (F4):** a suspended organization grants no organization access to any role: no courses, lesson content or quizzes, no new activity (enrolments, progress or attempts), no memberships and no other members' records.
- **Suspended organizations, exception:** a learner keeps **read-only** access to **their own existing** records (enrolments, progress and attempts) from that organization, through `learning.own_records.view` only. The exception grants no access to that organization's courses, lesson content or quizzes, no new activity, and no other members' records.

**Confirmed in conversation (21 October 2026): demo route map (development build only)**

| Area | Routes |
|---|---|
| Public | `/` (landing and navigation unchanged, D24); `/courses/:courseId` |
| Learner (personal; eligible courses from every organization) | `/learn`; `/learn/courses/:courseId/lessons/:lessonId`; `/learn/courses/:courseId/quizzes/:quizId`; `/learn/courses/:courseId/complete` |
| Instructor | `/o/:orgSlug/teach`; `/o/:orgSlug/teach/courses/:courseId`; `/o/:orgSlug/teach/courses/:courseId/quizzes/:quizId` |
| Organization Admin | `/o/:orgSlug/manage`; `/o/:orgSlug/manage/members`; `/o/:orgSlug/manage/invitations`; `/o/:orgSlug/manage/settings` |
| Platform Admin | `/admin/organizations`; `/admin/organizations/:orgId` |
| Development | `/design-system` |

`/dev/learner-dashboard` and `/dev/course-detail` are replaced by `/learn` and `/courses/:courseId`.

**Confirmed in conversation (21 October 2026): demo permission list**

| Permission | Granted to (demo rule) |
|---|---|
| `learning.own_records.view` | Any signed-in user: own existing enrolments, progress and attempts, read-only. Includes records from a suspended organization under the exception above. |
| `course.content.view` | Active enrolment in a published course; for organization courses, also an active membership in an active organization |
| `quiz.attempt.submit` | A separate permission: requires `course.content.view` and attempts remaining; shows score and pass/fail only |
| `teach.workspace.view` | `instructor` in that organization |
| `course.edit` | **Provisional demo rule, not a Q5 decision:** on that course's staff, draft courses only |
| `manage.workspace.view` | `org_admin` of that organization |
| `org.members.view` | `org_admin` |
| `org.members.manage_roles` | `org_admin`; `instructor` and `learner` roles only, never `org_admin` (F3); never removes the last org admin |
| `org.invitations.view` | `org_admin`, own organization |
| `org.invitations.create` | `org_admin`; Instructor and Learner invitations only (D6, D18) |
| `org.invitations.revoke` | **Provisional demo rule, pending the Priority 4 review of migration 0004 and D18:** `org_admin`; Instructor and Learner invitations in their own organization. D18's open question (which administrators may revoke which invitations) is not resolved by this entry. |
| `org.learning_records.view` | `org_admin`; organization members only, never public learners |
| `org.settings.view` | `org_admin`; view only |
| `platform.organizations.view` | Platform Admin |
| `platform.organizations.set_status` | Platform Admin |
| `platform.org_admin_access.view` | Platform Admin: an organization's org admins, its pending org-admin invitations and invitations they sent. No user list, support search or learning records (D17, L11) |
| `platform.org_admin_invitations.manage` | Platform Admin: create org-admin invitations (D18, F3). Revoking them is a **provisional demo rule**, pending the same Priority 4 review. |

Shown as unavailable in the demo, not granted: publishing and publication approval, editing settings, support search, inviting from an Instructor account, and creating organizations (on hold under D4).

**Confirmed in conversation (21 October 2026): A5 personas**
- Fictional names and `@example.com` addresses only; organizations "Sample Org A", "Sample Org B" and "Sample Org C (suspended)". Real people's names are not used. The persona switcher and every sample view are labelled as demo or sample data.
- Signed out; Alex Sample (learner, no organization); Bea Sample (learner, Org A); Chris Sample (learner, Org A and Org B); Dana Sample (instructor, Org A); Eli Sample (org admin and instructor, Org A); Fran Sample (Platform Admin); Gabi Sample (signed in, pending Learner invitation to Org A); Hugo Sample (learner, Org C suspended: own existing records read-only, nothing else from Org C).

**Provisional or open**
- Instructor editing scope (Q5): the demo rule above is not a final decision.
- Invitation revocation: which administrators may revoke which invitations (D18), pending the Priority 4 review of migration 0004.
- The publishing workflow (organization-admin approval, L2) is not shown in the demo.
- Which organization settings can be edited.
- The L11 wording, to be recorded with Priority 4.
- An Instructor persona for AQS-owned courses: excluded until it is decided who authors platform-owned courses.
- Not designed: suspended-organization, no-access and workspace-switching screens; invitation acceptance; certificates on course completion.
- A3's correction is deferred to the update recording the 21 October approvals.

## D28 — Phase 1: Foundations Acceptance Criteria

**Status:** Approved
**Approved:** 22 October 2026
**Scope:** Frontend foundations only

**Decision**

Phase 1 — Foundations will be accepted against the following criteria. Existing implementation must be inspected before changes are proposed; components or layouts that already satisfy the criteria must not be rebuilt unnecessarily.

1. Design tokens and global styles
   * Establish and verify reusable design tokens and global styles for colors, typography, spacing, borders, radii, shadows, and focus states.
   * Use the approved AQS design-system reference as the source of truth for visual decisions.
2. Reusable design-system components
   * Verify or implement the following reusable components as appropriate: `Button`, `FormField`, `Card`, `Badge`, `Avatar`, `ProgressBar`, `Skeleton`, `EmptyState`, `Banner`, `Table`, `Tabs`, and `Icon`.
   * Components must have clear, consistent interfaces and appropriate semantic and interactive behavior.
3. Application layouts
   * Verify or implement the `Public`, `Auth`, `AppShell`, and `Focus` layouts.
   * Provide a development-only `/design-system` route for inspecting the design-system components and their relevant states. It must not be exposed as a production application route.
4. Visual comparison
   * Compare the implemented design system against the approved `Design system.png` reference.
   * Record material discrepancies and resolve them, or explicitly document any remaining discrepancies for owner review.
5. Responsive behavior
   * Check the relevant design-system examples and layouts at viewport widths of 390, 768, 1024, 1280, and 1440 pixels.
   * Record the results and resolve unintended horizontal overflow and material layout failures.
6. Accessibility
   * Check keyboard navigation and visible focus states, semantic structure, and color contrast for the approved color combinations.
   * Record findings and resolve identified issues within the Phase 1 scope.
7. Quality checks and evidence
   * Run the agreed frontend build, lint, and relevant test checks.
   * Record the commands, results, and any known failures or limitations.
   * Do not claim a check passed unless its result has been verified.

**Explicit exclusions**

Phase 1 does not include real Google OAuth configuration or implementation, completion of D18 invitation identity verification, backend workflows, database integration, or database migrations. These remain separate work items and must not be introduced as dependencies for Phase 1 acceptance.

**Acceptance rule**

Phase 1 may be declared complete only after the criteria above have been checked against the actual implementation and the results recorded. Missing evidence is not proof of failure, but it is also not proof of completion. Any unresolved material discrepancy or failed check must be documented for review before Phase 1 is declared complete.

**Implementation guardrail**

Inspect the current repository and existing implementation before making changes. Prefer targeted corrections over rebuilding working code. Preserve existing approved decisions, original design references, and historical records. This decision approves the acceptance baseline only; it does not authorize implementation, unrelated changes, staging, commits, or pushes.

**Acceptance evidence recorded so far (not a completion claim)**

* 22 October 2026, criterion 6 (semantic structure): the `/design-system` preview now has one page-level `h1` (the preview title). Two mock frame headings, "Welcome back" in the Auth frame and "Welcome back, Sample" in the AppShell frame, were changed from `h1` to `h3` in `src/dev/design-system/DesignSystemPage.tsx`. Their rendered width and height matched the previous `h1` rendering at 390, 768, 1024, 1280 and 1440 pixels. No horizontal page overflow was observed at those widths.
* Known remaining item: `FocusLayout` renders its title as `h3` (`src/components/layout/FocusLayout.tsx`), which skips the level under the page `h1` in the preview. This is not yet resolved.
* The flagged unnamed icon-only button was checked and found to be a false positive: the notification icon already has an accessible name through its `role="img"` and `aria-label`. No change was made.
* Lint passed on the changed source. The production build and Playwright e2e tests were not rerun after this change.

**Verification pass, 22 October 2026 (evidence only; not a completion claim)**

* Files changed in this pass: `src/dev/design-system/DesignSystemPage.tsx` and `src/dev/design-system/DesignSystemPage.module.css`. `FocusLayout.tsx` was not changed in this pass.
* Preview changes covered by this pass:
  * Skip links in the PublicLayout, AppShell and FocusLayout frames move focus to their own frame's `<main>`. The hash and URL do not change.
  * Ordinary links inside the four layout frames no longer have an `href`, so they are not in the tab order.
  * Do and Avoid panels were added under the button variants table, using the reference wording.
  * The corner-radius panel is navy with a 12px figure. Its sample button reads "12PX RADIUS".
  * Each of the PublicLayout, AppShell and FocusLayout frames has a visible cue: "Ordinary links and buttons are illustrative. The skip link works." The AuthLayout frame has no cue, because it has no skip link.
  * Between 1024 px and 1145 px, the button-variant grid uses four state columns with each variant name on its own row. The Avoid heading uses the navy token.
* Responsive results, measured in the browser:
  * Before the change, buttons overflowed their borders at 1024 px (12 buttons, up to 31 px) and 1100 px (12 buttons, up to 12 px), with 4 buttons overflowing by up to 2 px at 1140 px. It was clean at 1146 px.
  * After the change, there were 0 overflowing buttons and 0 text collisions at 1024, 1080, 1100, 1120, 1140 and 1145 px.
  * At 1146, 1151, 1152, 1280 and 1440 px, the column widths match the earlier baseline measurements (110.25, 111.5, 111.75, 143.75 and 183.75 px).
  * At 390, 768 and 800 px the grid is one column, and the page does not scroll sideways.
* Keyboard results, at 1440 px:
  * A forward traversal reached 52 tab stops in order, with no gaps or stray stops. Each stop showed a visible focus ring.
  * The three skip links are stops 41, 45 and 49. Activating each one with Enter moves focus to its own frame's `<main>`.
  * The Course sections and Filter courses tablists can each be reached with Tab. Arrow keys change the selected tab, and Home and End move to the first and last tab.
* Commands run on the current code, with exit codes:
  * `npm run lint`: exit 0.
  * `npm run build`: exit 0.
  * `npm run test:e2e`: exit 0, 11 of 11 tests passed.
* Remaining evidence gaps:
  * No pixel-diff comparison was saved. The layout checks rely on measured geometry and screenshots reviewed on screen, which were not stored.
  * Intermediate widths were sampled, not exhaustively covered. The 1024–1145 px band was checked at 1024, 1080, 1100, 1120, 1140 and 1145 px. The upper widths were checked at 1146, 1151, 1152, 1280 and 1440 px. The single-column widths were checked at 390, 768 and 800 px.
  * The accessibility-tree role of the ordinary mock links is unresolved. The browser inspection tool still reports them as "link", although they have no `href` and cannot receive focus. The platform role was not confirmed.
* Unresolved items, for owner decision (no approval has been given):
  * Body copy in the Do and Avoid panels: the reference colour `#64748B` gives 4.37:1 and 4.48:1 on the tinted panels, below the 4.5:1 AA threshold for body text. The preview keeps `#0F172A`.
  * The FocusLayout title is an `h3` under the "Layouts" `h2` in the preview, so the outline has no skipped level there. That heading was not changed.
  * Whether the AuthLayout frame should also have a cue.

**Phase 1 acceptance, 22 October 2026: accepted with documented limitations**

Basis: each criterion above was checked against the evidence recorded in this entry and in the verification pass of 22 October 2026. No criterion has an unresolved failure. The limitations below are recorded for owner review. Accepting Phase 1 does not resolve them.

1. Tokens and global styles: **verified.** Colours, type scale, spacing, radius and shadow values match the reference values.
2. Reusable components: **verified** in the preview, with lint, build and E2E passing. The Neutral and Danger button variants are labelled "(added)" as extensions.
3. Application layouts: **verified** in the preview frames. `/design-system` is development-only (`src/App.tsx`). The links inside the frames are inert by design.
4. Visual comparison: **verified qualitatively** against the reference. Remaining discrepancies for owner review:
   * No saved pixel-diff comparison exists.
   * Body copy in the Do and Avoid panels: the preview keeps `#0F172A`. The reference grey `#64748B` gives 4.37:1 and 4.48:1 on the tinted panels, below the 4.5:1 AA threshold.
   * The primary button colour (`#C2410C`) and its hover (`#9A3412`) are the approved D1 exception to the reference `#F97316`.
   * The corner-radius label uses the D1 light blue (`#93C5FD`) on navy, not the reference orange.
5. Responsive behaviour: **verified** at 390, 768, 1024, 1280 and 1440 px, and at 800 px. The button-variant overlap in the 1024–1145 px band was corrected and re-measured. Intermediate widths were sampled, not covered exhaustively.
6. Accessibility: **verified** for the 52-stop forward keyboard traversal with visible focus, the three skip links, the Tabs controls, a single page-level `h1`, and the D1 colour pairings. Remaining limitations:
   * The platform accessibility role of the ordinary mock links is unconfirmed. They have no `href` and cannot receive focus, but the browser inspection tool still reports them as "link".
   * In the preview, the FocusLayout title is an `h3` under the Layouts `h2`, so the outline has no skipped level.
7. Quality checks: **verified** on the current code. `npm run lint` exit 0. `npm run build` exit 0. `npm run test:e2e` exit 0, 11 of 11 passed. Known limitation: the database test suite (`supabase test db`) has previously reported failures in 010, 020 and 030 from local test residue. It was not rerun. Database checks are outside Phase 1 scope under the explicit exclusions.

The explicit exclusions are unaffected. Phase 1 does not include Google OAuth, D18 completion, backend work, database integration or migrations.

No approval decision has changed. D1 colours, D24 unavailable navigation and the D27 demo layer remain as approved. This acceptance does not approve the open owner decisions listed above.

**Implemented in:**

* Phase 1 foundation commit `1ee920d` (`chore: establish platform foundations`): design tokens, the `/design-system` preview and the UI components.
* Phase 1 layout and focus commits: `09139a4`, `e34f884`, `f1ad3a8`, `38a7f60`, `ffb7fe6` and `90e8752`.
* Verification tooling: `bc3d796` (Playwright end-to-end setup).
* **Uncommitted at acceptance:** the 22 October 2026 preview corrections in `src/dev/design-system/DesignSystemPage.tsx`, `src/dev/design-system/DesignSystemPage.module.css` and `src/components/layout/FocusLayout.tsx` (heading level), plus this file. These changes need a separate commit, which requires owner approval, before the accepted state is fully recorded in Git.
## Amendment index

The older entries listed here keep their original text. This index records how later entries relate to them.

| Older entry | Related entry | Relationship |
|---|---|---|
| D2 | D12, D14 | Consistent: design references are preserved; D2's classification is unchanged. |
| D3 | D14 | Remains open. The landing design it refers to has since been updated. |
| D4, D6 | D18 | Refined in conversation: Organization Admins are appointed by invitation from Platform Admins, and staff invitations must be revocable. D4's opt-in domain admission and D6's exclusion of Instructor-sent invitations are unchanged. |
| D8 | D15 | Proposed amendment: email and password sign-in for Public Learners. |
| D10 | D13 | Reaffirmed in conversation. The installation note is out of date (see D13). |
| D11 | D15 | Limited explicit instruction: non-functional layouts for the approved Google-only authentication designs only. The "no stored passwords" interpretation is recorded in D15. |
| A3 (provisional) | D13, D15 | **Proposed amendment note:** A3's "Google sign-in only" conflicts with D15's proposed email/password sign-in, and its naming of Firebase Authentication conflicts with D13 (no provider selected). A3's text is unchanged; it remains provisional and is not approved. |
| A2 | D16–D20, D27 | A2's text in D11 is unchanged. D27 approves a central minimal permission list for the development-build demo only. Still open: permissions for course sharing, preview approval, invitation revocation (D18) and resource grants, and production authorization. |
| A5 | D16, D22, D27 | A5's text in D11 is unchanged. D27 approves the revised fictional persona set for the demo. An Instructor persona for platform-owned courses stays excluded until that authoring question is decided. |
| A1, A4, A6 | D27 | Their text in D11 is unchanged. D27 approves them for the development-build demo only, with the route map in D27; A6 is unchanged in substance. Production routes and other unresolved production decisions are not settled by D27. |
