import type { Page } from '@playwright/test'

/**
 * Waits until every running CSS animation on the page has finished (task 8-3 adds a short
 * fade-in to messages and dialogs). Accessibility checks call this first: axe measures colour
 * contrast on what is painted, and a half-faded message would read as low contrast. Endless
 * animations (loading spinners) never finish, so they are skipped.
 */
export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  )
}
