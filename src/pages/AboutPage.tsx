import { PublicLayout } from '../components/layout/PublicLayout'
import { ButtonLink } from '../components/ui'
import { cx } from '../lib/cx'
import { publicHeaderNav } from '../lib/public-navigation'
import { ABOUT_CONTENT } from '../content/public-site'
import { PlaceholderNote } from './info/PlaceholderNote'
import styles from './PublicInfoPages.module.css'

/*
 * About AQS at /about (landing page Concept C amendment, approved by the owner on 10 November 2026).
 *
 * Owner decisions: the page is implemented, but its navigation links stay hidden and production
 * builds do not register the route until the owner approves the content (content/public-site.ts).
 * Nothing about AQS is invented: the introduction, mission, purpose and the ownership wording are
 * marked placeholders until approved text is set in ABOUT_CONTENT. "What the platform offers"
 * repeats the landing page's approved description of the product.
 */
export default function AboutPage() {
  return (
    <PublicLayout navItems={publicHeaderNav()}>
      <section className={styles.intro} aria-labelledby="about-title">
        <div className={styles.container}>
          <p className="eyebrow">About AQS</p>
          <h1 className={cx('text-h1', styles.title)} id="about-title">
            About AQS
          </h1>
          <div className={styles.introBody}>
            {ABOUT_CONTENT.ownershipLine ? <p className={styles.lead}>{ABOUT_CONTENT.ownershipLine}</p> : null}
            {ABOUT_CONTENT.introduction ? (
              <p className={styles.lead}>{ABOUT_CONTENT.introduction}</p>
            ) : (
              <PlaceholderNote label="Introduction">
                [Who AQS is, in two or three sentences, approved by AQS, with the official name and the approved ownership
                wording.]
              </PlaceholderNote>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-label="Mission and purpose">
        <div className={cx(styles.container, styles.twoColumns)}>
          <div className={styles.block}>
            <h2 className={styles.heading}>Our mission</h2>
            {ABOUT_CONTENT.mission ? (
              <p>{ABOUT_CONTENT.mission}</p>
            ) : (
              <PlaceholderNote label="Mission">[AQS mission statement, as approved by AQS.]</PlaceholderNote>
            )}
          </div>
          <div className={styles.block}>
            <h2 className={styles.heading}>Why we built AQS E-Learning</h2>
            {ABOUT_CONTENT.purpose ? (
              <p>{ABOUT_CONTENT.purpose}</p>
            ) : (
              <PlaceholderNote label="Purpose">[The platform&apos;s purpose in AQS&apos;s own words, as approved by AQS.]</PlaceholderNote>
            )}
          </div>
        </div>
      </section>

      <section className={cx(styles.section, styles.muted)} aria-labelledby="about-offers">
        <div className={styles.container}>
          <p className="eyebrow">What the platform offers</p>
          <h2 className={cx('text-h2', styles.sectionTitle)} id="about-offers">
            Training for your organization. Courses for everyone.
          </h2>
          <p className={styles.sectionLead}>
            AQS E-Learning gives each organization its own workspace to train its staff, and gives anyone open courses to
            learn from, with one account.
          </p>
        </div>
      </section>

      <section className={cx(styles.section, styles.closing)} aria-labelledby="about-questions">
        <div className={styles.container}>
          <h2 className={cx('text-h2', styles.sectionTitle)} id="about-questions">
            Questions about AQS?
          </h2>
          <div className={styles.actions}>
            <ButtonLink to="/contact">Contact AQS</ButtonLink>
            <ButtonLink to="/catalog" variant="secondary">
              Find a course
            </ButtonLink>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
