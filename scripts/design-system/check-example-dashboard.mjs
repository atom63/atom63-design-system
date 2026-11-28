/**
 * Opens every route and data state of the built dashboard example
 * (examples/dashboard) with the starter's route check: axe with zero
 * violations, exactly one h1, no console errors and no horizontal overflow, at
 * a desktop and a 390px phone width in light and dark mode.
 *
 * Needs `pnpm --filter atom63-dashboard-example build` first, and Playwright's
 * Chromium.
 *
 * Usage: node scripts/design-system/check-example-dashboard.mjs
 */
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { checkRoutes } from './lib/route-check.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/* Keep in step with examples/dashboard/src/router.tsx. */
const routes = [
  '/',
  '/?state=loading',
  '/?state=empty',
  '/?state=error',
  '/accounts',
  '/accounts?page=2',
  '/accounts?account=acc-101',
  '/accounts?state=loading',
  '/accounts?state=empty',
  '/accounts?state=error',
  '/settings',
  '/no-such-page',
]

const { problems, summary } = await checkRoutes({
  appDir: path.join(root, 'examples/dashboard'),
  routes,
})
const failed = problems.length > 0
const message = failed
  ? `The dashboard example fails its route check:\n  ${problems.join('\n  ')}\n`
  : `The dashboard example passes its route check (${summary}).\n`
;(failed ? process.stderr : process.stdout).write(message)
process.exitCode = failed ? 1 : 0
