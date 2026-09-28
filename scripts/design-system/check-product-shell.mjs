/**
 * check:product-shell — step 3 of docs/design-system/template-library-plan.md.
 * Builds examples/product-shell (the app composed from @atom63/templates),
 * serves it with `vite preview`, and opens every route at a desktop and a
 * phone width in light and dark mode (lib/route-check.mjs). Fails on axe
 * violations, console errors, a page without exactly one `h1`, or a page
 * wider than the viewport.
 *
 * Needs the design system packages it imports built, and Playwright's
 * Chromium. Usage: node scripts/design-system/check-product-shell.mjs [--no-build]
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { checkRoutes } from './lib/route-check.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const appDir = path.join(root, 'examples/product-shell')

/* Keep in step with the routes in examples/product-shell/src/App.tsx. */
const ROUTES = ['overview', 'invoices', 'settings', 'welcome', 'sign-in']

if (!process.argv.includes('--no-build')) {
  execFileSync('pnpm', ['exec', 'vite', 'build', '--logLevel', 'warn'], {
    cwd: appDir,
    stdio: 'inherit',
  })
}

const { problems, summary } = await checkRoutes({
  appDir,
  routes: ROUTES.map(route => `/#${route}`),
})

if (problems.length > 0) {
  console.error(`check:product-shell found ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
console.log(`Product shell check passed (${summary}).`)
