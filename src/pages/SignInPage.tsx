import { useId, type ReactNode } from 'react'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Banner, Button } from '../components/ui'
import { cx } from '../lib/cx'
import styles from './SignInPage.module.css'

/*
 * Mock sign-in screen (desktop) — DEVELOPMENT ONLY, registered at /sign-in under
 * import.meta.env.DEV (decision D27). It is presentation only: the Google button is
 * inert and the page makes no sign-in, provider, API, session, token or storage call
 * (decision D15). Real authentication is not approved.
 */

const DEMO_NOTICE = 'Demo only. Sign-in is not available yet. This page makes no sign-in or provider calls.'

/** A footer item without an approved destination (D24): dimmed, not a link, not focusable. */
function UnavailableItem({ children }: { children: ReactNode }) {
  return (
    <span className={styles.unavailable} aria-disabled="true">
      {children}
      <span className="visually-hidden"> (not available yet)</span>
    </span>
  )
}

export default function SignInPage() {
  const noticeId = useId()

  return (
    <AuthLayout
      illustration={<div className={styles.placeholder}>Hero photo placeholder (pending approved asset)</div>}
    >
      <div className={styles.notice}>
        <Banner tone="info">
          <span id={noticeId}>{DEMO_NOTICE}</span>
        </Banner>
      </div>

      <h1 className={cx('text-h2', styles.heading)}>Welcome</h1>
      <p className={cx('text-body', styles.lead)}>
        Sign in to continue your courses and pick up right where you left off.
      </p>

      <Button variant="neutral" fullWidth aria-describedby={noticeId}>
        Continue with Google
      </Button>

      <p className={cx('text-caption', styles.note)}>New here? Signing in with Google creates your learner account.</p>

      <div className={styles.footer}>
        <p className={styles.footerRow}>
          <UnavailableItem>Privacy Policy</UnavailableItem>
          <UnavailableItem>Terms</UnavailableItem>
        </p>
        <p className={cx('text-caption', styles.footerRow)}>
          Want to teach? <UnavailableItem>Learn about teaching.</UnavailableItem>
        </p>
      </div>
    </AuthLayout>
  )
}
