/**
 * check:product-shell — step 3 of docs/design-system/template-library-plan.md.
 * Builds examples/product-shell (the app composed from @atom63/templates),
 * serves it with `vite preview`, and opens every route at a desktop and a
 * phone width in light and dark mode. Fails on axe violations, console
 * errors, a page that renders no heading, or a page wider than the viewport.
 *
 * Needs the design system packages it imports built, and Playwright's
 * Chromium. Usage: node scripts/design-system/check-product-shell.mjs [--no-build]
 */
import { execFileSync, spawn } from 'node:child_process'
import { createServer } from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import axe from 'axe-core'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const appDir = path.join(root, 'examples/product-shell')

/* Keep in step with the routes in examples/product-shell/src/App.tsx. */
const ROUTES = ['overview', 'invoices', 'settings', 'welcome', 'sign-in']
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 390, height: 844 },
}
const MODES = ['light', 'dark']

if (!process.argv.includes('--no-build')) {
  execFileSync('pnpm', ['exec', 'vite', 'build', '--logLevel', 'warn'], {
    cwd: appDir,
    stdio: 'inherit',
  })
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })

async function preview() {
  const port = await freePort()
  const child = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: appDir, stdio: 'ignore' }
  )
  const url = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => child.kill('SIGTERM') }
    } catch {
      // not up yet
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  child.kill('SIGTERM')
  throw new Error('vite preview did not start')
}

const server = await preview()
const browser = await chromium.launch()
const problems = []
let checked = 0

try {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const mode of MODES) {
      // The app follows prefers-color-scheme.
      const context = await browser.newContext({
        colorScheme: mode,
        reducedMotion: 'reduce',
        viewport,
      })
      const page = await context.newPage()
      const errors = []
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text().slice(0, 300))
      })
      page.on('pageerror', error => errors.push(String(error).slice(0, 300)))

      for (const route of ROUTES) {
        const label = `#${route} (${viewportName}, ${mode})`
        errors.length = 0
        await page.goto(`${server.url}/#${route}`, { waitUntil: 'networkidle' })
        await page.waitForTimeout(300)

        const { headings, overflow } = await page.evaluate(() => ({
          headings: document.querySelectorAll('h1').length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        }))
        if (headings !== 1) problems.push(`${label}: renders ${headings} h1 elements, expected 1`)
        if (overflow > 0) problems.push(`${label}: is ${overflow}px wider than the viewport`)

        await page.addScriptTag({ content: axe.source })
        const result = await page.evaluate(() =>
          window.axe.run(document, { resultTypes: ['violations'] })
        )
        for (const violation of result.violations) {
          problems.push(
            `${label}: axe ${violation.id} (${violation.nodes.length} node(s)): ${violation.help}`
          )
        }
        for (const error of errors) problems.push(`${label}: console error: ${error}`)
        checked++
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
  server.stop()
}

if (problems.length > 0) {
  console.error(`check:product-shell found ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
console.log(
  `Product shell check passed (${ROUTES.length} routes × ${Object.keys(VIEWPORTS).length} widths × ${MODES.length} modes = ${checked} pages).`
)
