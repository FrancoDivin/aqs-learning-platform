import { expect, test, type Locator, type Page } from '@playwright/test'

// The learner dashboard exists only in the development build (src/App.tsx), so these tests
// run against the Vite dev server. The drawer is AppShell's sidebar, opened from the header.
const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1100, height: 900 }

const menuToggle = (page: Page) => page.getByRole('button', { name: 'Open menu' })
const drawer = (page: Page) => page.getByRole('dialog', { name: 'Sidebar' })

// True when keyboard focus is inside the given element.
const focusInside = (locator: Locator) =>
  locator.evaluate((element) => element.contains(document.activeElement))

test.describe('learner sidebar drawer at mobile width', () => {
  test.use({ viewport: MOBILE })

  test('opens as a modal dialog from the menu toggle', async ({ page }) => {
    await page.goto('/dev/learner-dashboard')
    await expect(menuToggle(page)).toBeVisible()
    await expect(drawer(page)).toHaveCount(0)

    await menuToggle(page).focus()
    await page.keyboard.press('Enter')

    await expect(drawer(page)).toBeVisible()
    await expect(drawer(page)).toHaveAttribute('aria-modal', 'true')
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused()
  })

  // The focusable elements in the open drawer, in DOM order, are: the wordmark link, the
  // "Close menu" button and the "Dashboard" link. The other sidebar items are unavailable
  // (not focusable). Opening the drawer focuses "Close menu".
  test('Tab and Shift+Tab wrap between the first and last drawer controls', async ({ page }) => {
    await page.goto('/dev/learner-dashboard')
    await menuToggle(page).focus()
    await page.keyboard.press('Enter')
    await expect(drawer(page)).toBeVisible()

    const wordmark = drawer(page).getByRole('link', { name: 'AQS E-Learning home' })
    const closeButton = drawer(page).getByRole('button', { name: 'Close menu' })
    const dashboard = drawer(page).getByRole('link', { name: 'Dashboard' })

    await expect(closeButton).toBeFocused()

    // Forward: close -> Dashboard (last) -> wraps to the wordmark (first)
    await page.keyboard.press('Tab')
    await expect(dashboard).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(wordmark).toBeFocused()

    // Backward: wordmark (first) -> wraps to Dashboard (last)
    await page.keyboard.press('Shift+Tab')
    await expect(dashboard).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(closeButton).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(wordmark).toBeFocused()

    // Focus never leaves the drawer
    await expect.poll(() => focusInside(drawer(page))).toBe(true)
  })

  test('Escape closes the drawer and restores focus to the toggle', async ({ page }) => {
    await page.goto('/dev/learner-dashboard')
    await menuToggle(page).focus()
    await page.keyboard.press('Enter')
    await expect(drawer(page)).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(drawer(page)).toHaveCount(0)
    await expect(menuToggle(page)).toBeFocused()
  })

  // At desktop width the menu toggle is hidden, so closing the drawer must not drop focus on
  // the body. Focus moves to the page content instead.
  test('growing to desktop width closes the drawer and moves focus to the page content', async ({ page }) => {
    await page.goto('/dev/learner-dashboard')
    await menuToggle(page).focus()
    await page.keyboard.press('Enter')
    await expect(drawer(page)).toBeVisible()

    await page.setViewportSize(DESKTOP)

    await expect(drawer(page)).toHaveCount(0)
    await expect(page.locator('#main-content')).toBeFocused()
  })
})
