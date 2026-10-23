import { expect, test } from '@playwright/test'

// Public landing page: one page built from frame 1 (learner hero, decision D3 Option A).
// Header navigation for Courses and the mobile menu are covered in public-nav.spec.ts.
// The hero photo is still a placeholder (decision D3), so the test checks for the placeholder.

const HERO_HEADING = 'Build the skills that move your career forward.'
const HERO_LEAD = 'Practical courses, expert instruction, and flexible pathways help you build capability that lasts.'
const COURSES_HEADING = 'Start with the courses learners are taking right now.'

test.describe('landing page single-page content', () => {
  test('renders the learner hero and the sections in order, with no organizations view', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING)
    await expect(page.getByText(HERO_LEAD, { exact: true })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Hero image placeholder' })).toBeVisible()

    // One page-level heading, then the three content sections in document order
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    // Limited to <main>: the footer has its own h2 column headings
    const sectionHeadings = await page.getByRole('main').getByRole('heading', { level: 2 }).allTextContents()
    expect(sectionHeadings).toEqual([COURSES_HEADING, 'From sign-in to certificate.', 'Support at every step.'])

    // Frame 2 copy must not appear on this page
    await expect(page.getByText('Build stronger teams through learning.', { exact: true })).toHaveCount(0)
  })

  test('does not show hero actions that are not built yet', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Continue with Google' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Request a demo' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Request a demo' })).toHaveCount(0)
  })
})

test.describe('landing page audience pills', () => {
  test('are static labels, not buttons or links', async ({ page }) => {
    await page.goto('/')

    const pills = page.getByRole('list', { name: 'Audiences' })
    await expect(pills.getByRole('listitem')).toHaveText(['For learners', 'For organizations'])
    await expect(pills.locator('button, a, [role="button"], [aria-pressed]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /For (learners|organizations)/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /For (learners|organizations)/ })).toHaveCount(0)
  })

  test('clicking a pill changes nothing on the page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('list', { name: 'Audiences' }).getByText('For organizations', { exact: true }).click()

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING)
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('landing page header and hero navigation', () => {
  test('For Organizations stays visible in the header and scrolls back to the top of this page', async ({ page }) => {
    await page.goto('/')

    const forOrganizations = page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'For Organizations', exact: true })
    await expect(forOrganizations).toBeVisible()

    // Move down the page first, so the scroll back to the top is visible
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await forOrganizations.click()

    await expect(page).toHaveURL(/\/#for-organizations$/)
    // Back at the top of the page. The hero lands within 2px of y=0 (sub-pixel layout), not exactly 0.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(2)
    await expect(page.locator('#for-organizations')).toBeFocused()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING)
  })

  test('Browse courses scrolls to the featured courses and focuses them', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Browse courses' }).click()

    await expect(page).toHaveURL(/\/#courses$/)
    await expect(page.locator('#courses')).toBeFocused()
    await expect(page.getByRole('heading', { level: 2, name: COURSES_HEADING })).toBeVisible()
    const courses = page.getByRole('region', { name: 'Featured courses' }).locator('article')
    await expect(courses).toHaveCount(6)
    await expect(courses.first().getByRole('heading', { level: 4 })).toHaveText('Strategic leadership')
  })

  test('Sign in and Get started are unavailable, not links or working buttons', async ({ page }) => {
    await page.goto('/')

    const header = page.getByRole('banner')
    await expect(header.getByRole('link', { name: 'Sign in' })).toHaveCount(0)
    await expect(header.locator('[aria-disabled="true"]', { hasText: 'Sign in' })).toBeVisible()
    await expect(header.getByRole('button', { name: 'Get started (not available yet)' })).toBeDisabled()
    await expect(header.getByRole('link', { name: 'Get started' })).toHaveCount(0)
  })
})

test.describe('landing page at mobile width', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('has no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING)

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflows).toBe(false)
  })
})
