import { expect, test, type Page } from '@playwright/test'

// Breakpoints match PublicLayout.module.css (mobile: max-width 1023px) and PublicLayout.tsx
// (desktop: min-width 1024px).
const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1100, height: 900 }

// The toggle's accessible name comes from its icon label: "Open menu" or "Close menu".
const toggle = (page: Page, options: { includeHidden?: boolean } = {}) =>
  page.getByRole('button', { name: /^(Open|Close) menu$/, ...options })

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' })

test.describe('public navigation at mobile width', () => {
  test.use({ viewport: MOBILE })

  test('opens and closes the menu with the keyboard', async ({ page }) => {
    await page.goto('/')
    await expect(toggle(page)).toBeVisible()
    await expect(mainNav(page)).toBeHidden()

    // Reach the toggle by Tab alone: skip link, then wordmark, then the menu toggle
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
    // The wordmark also appears in the footer, so scope to the header banner
    await page.keyboard.press('Tab')
    await expect(page.getByRole('banner').getByRole('link', { name: 'AQS E-Learning home' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(toggle(page)).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle(page)).toHaveAccessibleName('Close menu')
    await expect(mainNav(page)).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle(page)).toHaveAccessibleName('Open menu')
    await expect(mainNav(page)).toBeHidden()
    await expect(toggle(page)).toBeFocused()
  })

  test('Escape closes the open menu and restores focus to the toggle', async ({ page }) => {
    await page.goto('/')
    await toggle(page).focus()
    await page.keyboard.press('Enter')
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true')

    // Move focus into the menu first, so Escape is pressed from inside it
    await mainNav(page).getByRole('link', { name: 'Courses', exact: true }).focus()
    await page.keyboard.press('Escape')

    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(mainNav(page)).toBeHidden()
    await expect(toggle(page)).toBeFocused()
  })

  test('choosing Courses closes the menu and focuses the courses section', async ({ page }) => {
    await page.goto('/')
    await toggle(page).focus()
    await page.keyboard.press('Enter')
    await mainNav(page).getByRole('link', { name: 'Courses', exact: true }).focus()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/#courses$/)
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(mainNav(page)).toBeHidden()
    await expect(page.locator('#courses')).toBeFocused()
  })
})

test.describe('unavailable public navigation items', () => {
  test.use({ viewport: DESKTOP })

  test('are not links, not focusable, and say they are not available yet', async ({ page }) => {
    await page.goto('/')
    const nav = mainNav(page)
    const about = nav.getByRole('listitem').filter({ hasText: 'About' })
    const contact = nav.getByRole('listitem').filter({ hasText: 'Contact' })

    // The item text includes the visually hidden "(not available yet)" label
    await expect(about).toHaveText('About (not available yet)')
    await expect(contact).toHaveText('Contact (not available yet)')

    // Not a link or a button
    await expect(nav.getByRole('link', { name: /About|Contact/ })).toHaveCount(0)
    await expect(about.getByRole('button')).toHaveCount(0)

    // Not focusable: focusing it leaves focus elsewhere
    await about.locator('span').first().focus()
    await expect(about).not.toBeFocused()
    await expect(nav.locator(':focus')).toHaveCount(0)

    // Tab from Courses goes to For Organizations, then out of the nav, never to About or Contact
    await nav.getByRole('link', { name: 'Courses', exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(nav.getByRole('link', { name: 'For Organizations', exact: true })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(nav.locator(':focus')).toHaveCount(0)
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('public navigation across the 1024px breakpoint', () => {
  test('mobile to desktop: menu closes and focus moves to the main content', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    await toggle(page).focus()
    await page.keyboard.press('Enter')
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true')

    await page.setViewportSize(DESKTOP)

    await expect(toggle(page, { includeHidden: true })).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#main-content')).toBeFocused()
    await expect(mainNav(page)).toBeVisible()
  })

  test('mobile to desktop: focus on a link that stays visible is not moved', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    await toggle(page).focus()
    await page.keyboard.press('Enter')
    const courses = mainNav(page).getByRole('link', { name: 'Courses', exact: true })
    await courses.focus()

    await page.setViewportSize(DESKTOP)

    await expect(toggle(page, { includeHidden: true })).toHaveAttribute('aria-expanded', 'false')
    await expect(courses).toBeFocused()
  })

  test('desktop to mobile: focus moves from a hidden nav link to the toggle, and the menu stays closed', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')
    const courses = mainNav(page).getByRole('link', { name: 'Courses', exact: true })
    await courses.focus()
    await expect(courses).toBeFocused()

    await page.setViewportSize(MOBILE)

    await expect(mainNav(page)).toBeHidden()
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle(page)).toBeFocused()
  })
})
