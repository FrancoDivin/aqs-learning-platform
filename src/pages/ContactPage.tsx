import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PublicLayout } from '../components/layout/PublicLayout'
import { cx } from '../lib/cx'
import { publicHeaderNav } from '../lib/public-navigation'
import { CONTACT_CONTENT, LEGAL_PAGES_AVAILABLE, REQUEST_WORKSPACE_AVAILABLE } from '../content/public-site'
import { PlaceholderNote } from './info/PlaceholderNote'
import styles from './PublicInfoPages.module.css'

/*
 * Contact at /contact (landing page Concept C amendment, approved by the owner on 10 November 2026).
 *
 * Owner decisions: the page is implemented, but its navigation links stay hidden and production
 * builds do not register the route until the owner approves the contact details
 * (content/public-site.ts). No email address, phone number or address is invented: each is a
 * marked placeholder until set in CONTACT_CONTENT. There is no contact form (it would need its own
 * server check and privacy review).
 */

function ContactCard({ title, value, href, placeholder, note }: { title: string; value: string | null; href?: string; placeholder: string; note: string }) {
  return (
    <div className={styles.contactCard}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {value ? (
        <p className={styles.contactValue}>{href ? <a href={href}>{value}</a> : value}</p>
      ) : (
        <>
          <PlaceholderNote label={title} inline>
            {placeholder}
          </PlaceholderNote>
          {import.meta.env.DEV ? <p className={styles.cardNote}>{note}</p> : null}
        </>
      )}
    </div>
  )
}

function ContactRoute({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className={styles.route}>
      <h3 className={styles.routeTitle}>{title}</h3>
      {children}
    </li>
  )
}

export default function ContactPage() {
  const { email, phone, address, replyTimes } = CONTACT_CONTENT
  return (
    <PublicLayout navItems={publicHeaderNav()}>
      <section className={styles.intro} aria-labelledby="contact-title">
        <div className={styles.container}>
          <p className="eyebrow">Contact</p>
          <h1 className={cx('text-h1', styles.title)} id="contact-title">
            Contact AQS
          </h1>
          <p className={styles.lead}>Choose the route that fits your question.</p>
        </div>
      </section>

      <section className={styles.section} aria-label="Contact details">
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <ContactCard
              title="Email"
              value={email}
              href={email ? `mailto:${email}` : undefined}
              placeholder="[AQS email address]"
              note="Shown as an email link once approved."
            />
            <ContactCard
              title="Phone"
              value={phone}
              href={phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : undefined}
              placeholder="[AQS phone number, with country code]"
              note="Shown as a tap-to-call link on mobile."
            />
            <ContactCard
              title="Address"
              value={address}
              placeholder="[AQS physical or postal address]"
              note="Shown only if AQS wants it public."
            />
          </div>
          {replyTimes ? (
            <p className={styles.replyTimes}>{replyTimes}</p>
          ) : (
            <p className={styles.replyTimes}>
              <PlaceholderNote label="Reply times" inline>
                [When AQS replies, if AQS wants to publish it]
              </PlaceholderNote>
            </p>
          )}
        </div>
      </section>

      <section className={cx(styles.section, styles.muted)} aria-labelledby="contact-routes">
        <div className={styles.container}>
          <h2 className={cx('text-h2', styles.sectionTitle)} id="contact-routes">
            Looking for something specific?
          </h2>
          <ul className={styles.routes}>
            <ContactRoute title="Training for your organization">
              {REQUEST_WORKSPACE_AVAILABLE ? (
                <p>
                  Tell us about your organization through the <Link to="/request-workspace">workspace request form</Link>.
                </p>
              ) : (
                <p>Use the contact details above to tell us about your organization.</p>
              )}
            </ContactRoute>
            <ContactRoute title="Help with an assigned course">
              <p>Your organization&apos;s admin manages your courses and invitations; contact them first.</p>
            </ContactRoute>
            {LEGAL_PAGES_AVAILABLE ? (
              <ContactRoute title="Privacy questions">
                <p>
                  See how AQS handles personal data in the <Link to="/privacy">Privacy Policy</Link>.
                </p>
              </ContactRoute>
            ) : null}
          </ul>
        </div>
      </section>
    </PublicLayout>
  )
}
