# Page state matrix (tasks 6-1 to 6-5)

Every live page × loading, empty, error, success and offline. Branch `cm3/page-states`.

How each state works everywhere (shared components, `src/live/components/States.tsx`):

- **Loading (6-1):** `Loaded` / `LoadingBlock` show a placeholder shaped like the content (`shape` /
  `loading`: rows, stats, table, cards, dashboard, editor, detail, form), announced once to screen
  readers ("Loading …", role status); the shapes are hidden from assistive technology and stop
  moving with reduced motion (global rule).
- **Error:** `ErrorBanner`: a plain message, announced at once (role alert), with "Try again"
  (except for "not allowed", where retrying cannot help).
- **Empty (6-2):** `EmptyState` with a title and the next step.
- **Success (6-3):** `ActionFeedback`, placed directly with the buttons of the form or panel it
  belongs to; the confirmation appears in a live region that is always on the page (role status), so
  it is announced reliably; errors use role alert.
- **Offline (6-4):** one notice at the top of every live page while the browser is offline;
  submit buttons and buttons with a loading state are disabled ("unavailable while offline") and
  enabled again when the connection returns. Nothing is queued or saved offline (D7).

"—" means the state does not apply (the page has no list, or no action).

| Page (route) | Loading shape | Empty state (next step) | Error | Success | Offline |
| --- | --- | --- | --- | --- | --- |
| Learner dashboard (`/learn`) | cards | No courses: browse the catalogue | Banner + retry | — | Notice |
| My courses (`/my-courses`) | cards | Per tab: browse the catalogue / start a course | Banner + retry | — | Notice |
| Catalogue (`/catalog`) | cards (catalogue skeleton) | No courses yet; no search match: try another word | Banner + retry | — | Notice |
| Course detail (`/courses/:id`) | detail | — | Banner + retry | Enrol confirmation | Notice; Enroll disabled |
| Lesson (`/learn/courses/:id/lessons/:id`) | lesson skeleton | — | Banner + retry | Mark complete | Notice; actions disabled |
| Quiz (`/learn/courses/:id/quizzes/:id`) | form | — | Banner + retry | Result page | Notice; Submit disabled |
| Completion (`/learn/courses/:id/complete`) | detail | — | Banner + retry | — | Notice |
| Profile (`/profile`) | rows | No organization: ask your administrator | Banner + retry | "Your name was saved." | Notice; Save disabled |
| Instructor dashboard (`/o/:org/teach`) | dashboard | No courses: create your first course | Banner + retry | Actions | Notice |
| Instructor courses (`/o/:org/teach/courses`) | table | No courses: create your first draft | Banner + retry | Create | Notice; Create disabled |
| Course editor (`/o/:org/teach/courses/:id`) | editor | No modules: add a module, then a lesson | Banner + retry | Each panel's save | Notice; saves disabled |
| Quiz builder | editor | No questions yet | Banner + retry | Save question | Notice; saves disabled |
| Lesson preview | detail | — | Banner + retry | — | Notice |
| Learners (`/o/:org/teach/learners`) | table | No one enrolled: how learners arrive; no attempts: when results appear | Banner + retry | — | Notice |
| Corrections panel | table | No corrections: where proposals appear | Banner + retry | Propose | Notice; Propose disabled |
| Org admin dashboard (`/o/:org/manage`) | dashboard | No courses: where courses are created | Banner + retry | — | Notice |
| Members (`/o/:org/manage/members`) | table | No match: try another name or tab | Banner + retry | Role and status changes | Notice; actions disabled |
| Invitations (`/o/:org/manage/invitations`) | table | No invitations: send the first with the form above | Banner + retry | "Invitation sent…" | Notice; Send disabled |
| Org settings (`/o/:org/manage/settings`) | form | — | Banner + retry | Save | Notice; Save disabled |
| Platform overview / organizations (`/admin`, `/admin/organizations`) | dashboard / table | No organizations: create the first | Banner + retry | — | Notice |
| Organization detail (`/admin/organizations/:id`) | detail | No Organization Admin: send an invitation; no invitations: where they appear | Banner + retry | Status, invite | Notice; actions disabled |
| Workspace requests (`/admin/requests`) | table | No requests: where they arrive | Banner + retry | — | Notice |
| Workspace request detail | detail | — | Banner + retry | Approve / decline | Notice; actions disabled |
| Platform courses (`/admin/courses`) | table | No platform courses: who creates them | Banner + retry | — | Notice |
| Users lookup (`/admin/users`) | rows | No match: check the address | Banner | — | Notice; Search disabled |
| Video reviews (`/admin/video-reviews`) | table | Nothing here: per filter | Banner + retry | — | Notice |
| Video review detail | detail | — | Banner + retry | Each gate's decision | Notice; decisions disabled |
| Sign-in, sign-up, callback, invitation | rows | — | Plain reason (cancelled, expired, failed; 2-4) | Check your email | Notice; sign-in buttons disabled |

Proof: `e2e-live/live-page-states.spec.ts` (offline notice and disabled actions, the table-shaped
placeholder, the empty state's next step, the always-present success live region); the existing
axe checks on every live page (`e2e-live/live-accessibility.spec.ts`).
