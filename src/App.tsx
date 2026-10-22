import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { LandingPage } from './pages/LandingPage'
import { NotFound } from './pages/NotFound'

/*
 * The design-system preview is a development tool, not a product page.
 * `import.meta.env.DEV` is true only under `npm run dev`, so the preview —
 * and its code — is left out of production builds (`npm run build`).
 */
const DesignSystemPage = import.meta.env.DEV
  ? lazy(() => import('./dev/design-system/DesignSystemPage'))
  : null

/* Development-only preview of the learner dashboard (frame 1). Same pattern:
 * excluded from production builds until routing (A1) and sign-in exist. */
const LearnerDashboardPage = import.meta.env.DEV
  ? lazy(() => import('./pages/LearnerDashboardPage'))
  : null

/* Development-only demo of the public course detail page at /courses/:courseId (D27).
 * Provisional: its design is still "Needs review". Excluded from production builds. */
const CourseDetailPage = import.meta.env.DEV ? lazy(() => import('./pages/CourseDetailPage')) : null

/* Development-only mock sign-in screen at /sign-in (D27). Presentation only: no sign-in,
 * provider, API or session behaviour (D15). /sign-in/error and /sign-up come in later batches. */
const SignInPage = import.meta.env.DEV ? lazy(() => import('./pages/SignInPage')) : null

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {DesignSystemPage ? (
          <Route
            path="/design-system"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Loading design system…</p>}>
                <DesignSystemPage />
              </Suspense>
            }
          />
        ) : null}
        {LearnerDashboardPage ? (
          <Route
            path="/dev/learner-dashboard"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Loading learner dashboard…</p>}>
                <LearnerDashboardPage />
              </Suspense>
            }
          />
        ) : null}
        {CourseDetailPage ? (
          <Route
            path="/courses/:courseId"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Loading course detail…</p>}>
                <CourseDetailPage />
              </Suspense>
            }
          />
        ) : null}
        {SignInPage ? (
          <Route
            path="/sign-in"
            element={
              <Suspense fallback={<p style={{ padding: 24 }}>Loading sign-in…</p>}>
                <SignInPage />
              </Suspense>
            }
          />
        ) : null}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
