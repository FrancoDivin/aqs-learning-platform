import type { NavItem } from '../components/layout/types'
import {
  ABOUT_AND_CONTACT_APPROVED,
  GET_STARTED_PAGE_AVAILABLE,
  LEGAL_PAGES_AVAILABLE,
  REQUEST_WORKSPACE_AVAILABLE,
  SHOW_INFO_PAGE_PREVIEWS,
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

/**
 * Where "Get started" leads: the Get Started page once it exists (2-1), the sign-up page until then
 * (D42, 12 November 2026: sign-up with Google, Apple, Facebook or email).
 */
export const GET_STARTED_PATH = GET_STARTED_PAGE_AVAILABLE ? '/get-started' : '/sign-up'

/** The landing page. The header's Home link always opens it at the top (see PublicLayout). */
export const HOME_PATH = '/'

/**
 * Header navigation, in the client's order (11 November 2026): Home, Courses, About, Contact;
 * Sign in and Get started follow in the header's actions. For organizations stays in the footer
 * and in the landing page's own buttons.
 *
 * About and Contact open the About AQS and Contact pages. Both appear wherever those pages exist:
 * in development builds (marked placeholders, for review) and, once the owner approves the
 * content, in production. Production builds before that approval have neither page, so they show
 * no link to them.
 */
export function publicHeaderNav(options: { courses?: string } = {}): NavItem[] {
  const items: NavItem[] = [
    { label: 'Home', to: HOME_PATH },
    { label: 'Courses', to: options.courses ?? '/catalog' },
  ]
  if (ABOUT_AND_CONTACT_APPROVED || SHOW_INFO_PAGE_PREVIEWS) {
    items.push({ label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' })
  }
  return items
}

export type FooterColumn = { heading: string; links: NavItem[] }

/** Footer columns. `signInAvailable` is false in the design previews, which have no sign-in. */
export function publicFooterColumns(options: { signInAvailable: boolean }): FooterColumn[] {
  const learn: NavItem[] = [{ label: 'Courses', to: '/catalog' }]
  if (options.signInAvailable) {
    learn.push({ label: 'Get started', to: GET_STARTED_PATH }, { label: 'Sign in', to: '/sign-in' })
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
