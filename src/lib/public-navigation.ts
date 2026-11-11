import type { NavItem } from '../components/layout/types'
import {
  ABOUT_AND_CONTACT_APPROVED,
  GET_STARTED_PAGE_AVAILABLE,
  LEGAL_PAGES_AVAILABLE,
  REQUEST_WORKSPACE_AVAILABLE,
} from '../content/public-site'

/*
 * Public header and footer destinations (landing page Concept C, approved 10 November 2026).
 *
 * Only destinations that work are shown: an unbuilt or unapproved destination is left out, not
 * greyed out. The gates live in content/public-site.ts:
 * - About AQS and Contact appear only after the owner approves their content (owner decision,
 *   10 November 2026). Until then they are reachable in development builds only, by URL.
 * - Request a workspace appears with task 3-3, the legal pages with task 5-5.
 */

/** Where "Get started" leads: the Get Started page once it exists (2-1), sign-in until then. */
export const GET_STARTED_PATH = GET_STARTED_PAGE_AVAILABLE ? '/get-started' : '/sign-in'

/** Header navigation. Every page points For organizations at the landing page's section. */
export function publicHeaderNav(options: { courses?: string } = {}): NavItem[] {
  const items: NavItem[] = [
    { label: 'Courses', to: options.courses ?? '/catalog' },
    { label: 'For organizations', to: '/#organizations' },
  ]
  if (ABOUT_AND_CONTACT_APPROVED) {
    items.push({ label: 'About AQS', to: '/about' }, { label: 'Contact', to: '/contact' })
  }
  return items
}

export type FooterColumn = { heading: string; links: NavItem[] }

/** Footer columns. `signInAvailable` is false in the design previews, which have no sign-in. */
export function publicFooterColumns(options: { signInAvailable: boolean }): FooterColumn[] {
  const learn: NavItem[] = [{ label: 'Courses', to: '/catalog' }]
  if (options.signInAvailable) {
    learn.push({ label: 'Get started', to: GET_STARTED_PATH })
    // Until /get-started exists both lead to sign-in; listing the same page twice helps nobody.
    if (GET_STARTED_PAGE_AVAILABLE) learn.push({ label: 'Sign in', to: '/sign-in' })
  }

  const organizations: NavItem[] = [{ label: 'For organizations', to: '/#organizations' }]
  if (REQUEST_WORKSPACE_AVAILABLE) organizations.push({ label: 'Request a workspace', to: '/request-workspace' })

  const columns: FooterColumn[] = [
    { heading: 'Learn', links: learn },
    { heading: 'Organizations', links: organizations },
  ]
  if (ABOUT_AND_CONTACT_APPROVED) {
    columns.push({ heading: 'AQS', links: [{ label: 'About AQS', to: '/about' }, { label: 'Contact', to: '/contact' }] })
  }
  if (LEGAL_PAGES_AVAILABLE) {
    columns.push({
      heading: 'Legal',
      links: [
        { label: 'Terms of Use', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Cookie Policy', to: '/cookies' },
      ],
    })
  }
  return columns
}
