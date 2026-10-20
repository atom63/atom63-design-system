/**
 * Opens every route of a built app with `vite preview`, at a desktop and a
 * phone width in light and dark mode, and reports axe violations, console
 * errors, a page without exactly one `h1`, and a page wider than the viewport.
 * check:starter runs it on the app kind.
 *
 * Needs Playwright's Chromium, and `vite` resolvable from `appDir`.
 */
import { createServer } from 'node:net'

import axe from 'axe-core'
import { chromium } from 'playwright'

import { spawnCommand, stopCommand } from './command.mjs'

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 390, height: 844 },
}
const MODES = ['light', 'dark']

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })

async function preview(appDir) {
  const port = await freePort()
  const child = spawnCommand(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: appDir, stdio: 'ignore' }
  )
  const url = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => stopCommand(child) }
    } catch {
      // not up yet
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  stopCommand(child)
  throw new Error('vite preview did not start')
}

/**
 * @param {{ appDir: string, routes: string[] }} options `routes` are paths to
 *   open, appended to the preview URL (`/invoices`, `/#invoices`).
 * @returns {Promise<{ checked: number, problems: string[], summary: string }>}
 */
export async function checkRoutes({ appDir, routes }) {
  const server = await preview(appDir)
  const browser = await chromium.launch()
  const problems = []
  let checked = 0

  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const mode of MODES) {
        // The apps follow prefers-color-scheme until someone picks a mode.
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

        for (const route of routes) {
          const label = `${route} (${viewportName}, ${mode})`
          errors.length = 0
          await page.goto(`${server.url}${route}`, { waitUntil: 'networkidle' })
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

  return {
    checked,
    problems,
    summary: `${routes.length} routes × ${Object.keys(VIEWPORTS).length} widths × ${MODES.length} modes = ${checked} pages`,
  }
}
