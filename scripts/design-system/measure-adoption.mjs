/**
 * Adoption metrics: how much of each adopter app's UI comes from the design
 * system. Reads an adopter monorepo (atom63-vite) and never writes into it.
 *
 * - Static (lib/adoption.mjs): per app under `apps/*` that depends on a
 *   design-system package from npm, the .tsx files importing it, the system
 *   components used, hand-written interactive elements, other UI libraries and
 *   literal colours.
 * - Runtime (REI Cedar's method): the app's existing `dist/` build is served
 *   from this process, and for each key route at 1440 and 390 wide, every
 *   visible interactive and landmark element is classed as system (it or an
 *   ancestor has `data-slot` or an `a63-*` class) or hand-written. The build
 *   is not refreshed here, since building would write into the adopter repo;
 *   its date is recorded with the numbers.
 *
 * Writes docs/design-system/audits/adoption.json and adoption.md. Not part of
 * CI: it needs the adopter checkout.
 *
 * Usage: node scripts/design-system/measure-adoption.mjs <adopter-repo> [--no-runtime]
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { extractSlotNames, isAnalysedFile, summariseApp } from './lib/adoption.mjs'
import { publishedPackageDirs } from './published-packages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const auditDir = path.join(root, 'docs/design-system/audits')

/**
 * Key routes per app for the runtime pass, and a step to run after each load
 * (os63 opens on a lock screen). Apps not listed are static only.
 */
const RUNTIME = {
  'atom63.io': { routes: ['/', '/writing', '/projects'] },
  os63: {
    routes: ['/', '/finder', '/notes'],
    async afterLoad(page) {
      const guest = page.getByText('Guest', { exact: true })
      if (await guest.count()) {
        await guest.first().click()
        await page.waitForTimeout(1500)
      }
    },
  },
  learn: { routes: ['/', '/resources', '/skills'] },
}
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'storybook-static',
  'coverage',
  '.turbo',
])

const args = process.argv.slice(2)
const adopter = args.find(arg => !arg.startsWith('--'))
if (!adopter) {
  console.error(
    'Usage: node scripts/design-system/measure-adoption.mjs <adopter-repo> [--no-runtime]'
  )
  process.exit(1)
}
const adopterRoot = path.resolve(adopter.replace(/^~(?=\/)/, process.env.HOME ?? '~'))
const withRuntime = !args.includes('--no-runtime')
const screenshotDir = args
  .find(arg => arg.startsWith('--screenshots='))
  ?.slice('--screenshots='.length)

const systemPackages = publishedPackageDirs.map(
  dir => JSON.parse(readFileSync(path.join(root, dir, 'package.json'), 'utf8')).name
)

/** Every `data-slot` value the design system renders: literals in its sources plus the contracts' slot lists. */
function systemSlotNames() {
  const names = new Set()
  for (const pkg of readdirSync(path.join(root, 'packages'))) {
    const src = path.join(root, 'packages', pkg, 'src')
    if (!existsSync(src)) continue
    for (const relative of walk(src)) {
      if (!/\.tsx?$/.test(relative) || /\.(test|stories)\.tsx?$/.test(relative)) continue
      for (const name of extractSlotNames(readFileSync(path.join(src, relative), 'utf8')))
        names.add(name)
    }
  }
  const contracts = path.join(root, 'packages/ui-foundation/contracts/components')
  for (const file of readdirSync(contracts)) {
    const contract = JSON.parse(readFileSync(path.join(contracts, file), 'utf8'))
    const slots = contract.lists?.slots ?? []
    for (const name of Array.isArray(slots) ? slots : (slots.values ?? [])) names.add(name)
  }
  return [...names].sort()
}

/** `data-slot` literals an app and its workspace packages write in their own source (tests left out). */
function adopterSlotNames(app) {
  const names = new Set()
  for (const dir of [app.dir, ...app.workspaceDirs]) {
    for (const relative of walk(dir)) {
      if (!/\.tsx?$/.test(relative) || !isAnalysedFile(relative)) continue
      for (const name of extractSlotNames(readFileSync(path.join(dir, relative), 'utf8')))
        names.add(name)
    }
  }
  return names
}

function walk(dir, base = dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(entryPath, base, acc)
    else acc.push(path.relative(base, entryPath).split(path.sep).join('/'))
  }
  return acc
}

/** The checked-out branch and commit, read from `.git` without running git. */
function gitHead(repo) {
  try {
    const head = readFileSync(path.join(repo, '.git/HEAD'), 'utf8').trim()
    if (!head.startsWith('ref: ')) return { branch: null, commit: head }
    const ref = head.slice(5)
    const loose = path.join(repo, '.git', ref)
    let commit = existsSync(loose) ? readFileSync(loose, 'utf8').trim() : null
    if (!commit) {
      const packed = readFileSync(path.join(repo, '.git/packed-refs'), 'utf8')
      commit =
        packed
          .split('\n')
          .find(line => line.endsWith(` ${ref}`))
          ?.split(' ')[0] ?? null
    }
    return { branch: ref.replace(/^refs\/heads\//, ''), commit }
  } catch {
    return { branch: null, commit: null }
  }
}

/** Apps under `apps/*` that depend on a design-system package from npm. */
function adopterApps() {
  const workspacePackages = new Map()
  for (const top of ['packages', 'internal']) {
    const dir = path.join(adopterRoot, top)
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      const manifestPath = path.join(dir, name, 'package.json')
      if (existsSync(manifestPath)) {
        workspacePackages.set(
          JSON.parse(readFileSync(manifestPath, 'utf8')).name,
          path.join(dir, name)
        )
      }
    }
  }
  const apps = []
  for (const name of readdirSync(path.join(adopterRoot, 'apps')).sort()) {
    const manifestPath = path.join(adopterRoot, 'apps', name, 'package.json')
    if (!existsSync(manifestPath)) continue
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const deps = { ...manifest.dependencies, ...manifest.devDependencies }
    const listed = systemPackages.filter(
      pkg => deps[pkg] && !String(deps[pkg]).startsWith('workspace:')
    )
    const workspaceDirs = Object.entries(deps)
      .filter(([pkg, spec]) => String(spec).startsWith('workspace:') && workspacePackages.has(pkg))
      .map(([pkg]) => workspacePackages.get(pkg))
    if (listed.length) {
      apps.push({ name, dir: path.join(adopterRoot, 'apps', name), listed, workspaceDirs })
    }
  }
  return apps
}

function measureStatic(app) {
  const files = walk(app.dir)
    .filter(isAnalysedFile)
    .map(relative => ({ relative, text: readFileSync(path.join(app.dir, relative), 'utf8') }))
  return summariseApp(files, { systemPackages })
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
}

/** A read-only static server for a `dist/` folder, falling back to index.html like the Vercel rewrites. */
function serve(dist) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)
    let file = path.join(dist, url)
    if (!file.startsWith(dist)) file = path.join(dist, 'index.html')
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')
    if (!existsSync(file)) {
      if (url.startsWith('/api/') || path.extname(url)) {
        res.writeHead(404).end()
        return
      }
      file = path.join(dist, 'index.html')
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

/* Runs in the page. Interactive: links, buttons, form controls, summary,
   dialog and their ARIA roles. Landmarks: main, nav, aside, form, labelled
   section, header and footer outside sectioning content, and landmark roles.
   System: the element or an ancestor has an `a63-*` class or a `data-slot`
   the design system renders. */
function classifyInPage(systemSlots) {
  const INTERACTIVE = [
    'a[href]',
    'button',
    'input:not([type=hidden])',
    'select',
    'textarea',
    'summary',
    'dialog',
    ...[
      'button',
      'link',
      'checkbox',
      'radio',
      'switch',
      'tab',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'option',
      'slider',
      'combobox',
      'textbox',
      'searchbox',
      'spinbutton',
      'dialog',
      'alertdialog',
    ].map(role => `[role=${role}]`),
  ].join(',')
  const LANDMARK = [
    'main',
    'nav',
    'aside',
    'form',
    'section[aria-label]',
    'section[aria-labelledby]',
    'header',
    'footer',
    ...[
      'banner',
      'navigation',
      'main',
      'complementary',
      'contentinfo',
      'region',
      'search',
      'form',
    ].map(role => `[role=${role}]`),
  ].join(',')
  const slots = new Set(systemSlots)
  const marked = el =>
    slots.has(el.getAttribute('data-slot') ?? '') ||
    [...el.classList].some(name => name.startsWith('a63-'))
  const inSystem = el => {
    for (let node = el; node; node = node.parentElement) if (marked(node)) return true
    return false
  }
  const visible = el => {
    if (!el.getClientRects().length) return false
    const style = getComputedStyle(el)
    return style.visibility !== 'hidden' && style.display !== 'none'
  }
  const isLandmark = el => {
    const tag = el.localName
    if ((tag === 'header' || tag === 'footer') && !el.hasAttribute('role')) {
      return !el.parentElement?.closest('article, aside, main, nav, section')
    }
    return true
  }
  const count = (selector, filter = () => true) => {
    const result = { total: 0, system: 0, systemSelf: 0, handwrittenSamples: [] }
    for (const el of document.querySelectorAll(selector)) {
      if (!visible(el) || !filter(el)) continue
      result.total++
      const system = inSystem(el)
      if (system) result.system++
      if (marked(el)) result.systemSelf++
      else if (!system && result.handwrittenSamples.length < 8) {
        const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)
        result.handwrittenSamples.push(
          `${el.localName}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''} "${label}"`
        )
      }
    }
    return result
  }
  return { interactive: count(INTERACTIVE), landmarks: count(LANDMARK, isLandmark) }
}

async function measureRuntime(app, allSystemSlots) {
  const config = RUNTIME[app.name]
  if (!config) return { skipped: 'no key routes chosen for this app' }
  if (config.skip) return { skipped: config.skip }
  // A system slot name the app (or a workspace package it uses) also writes
  // itself proves nothing; such elements count only through an `a63-*` class.
  const own = adopterSlotNames(app)
  const systemSlots = allSystemSlots.filter(name => !own.has(name))
  const ambiguousSlots = allSystemSlots.filter(name => own.has(name))
  const { routes } = config
  const dist = path.join(app.dir, 'dist')
  if (!existsSync(path.join(dist, 'index.html'))) return { skipped: 'no dist/ build to serve' }
  const { chromium } = await import('playwright')
  const server = await serve(dist)
  const origin = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (server.address()).port}`
  const browser = await chromium.launch()
  const pages = []
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
      })
      // Only the served build: API calls and third-party hosts are cut off.
      await context.route(/.*/, routeRequest =>
        routeRequest.request().url().startsWith(origin)
          ? routeRequest.continue()
          : routeRequest.abort()
      )
      for (const route of routes) {
        const page = await context.newPage()
        await page.goto(`${origin}${route}`, { waitUntil: 'load' })
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {})
        await page.waitForTimeout(1500)
        await config.afterLoad?.(page)
        if (screenshotDir) {
          const slug = route.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'
          await page.screenshot({
            path: path.join(screenshotDir, `${app.name}-${slug}-${viewport.name}.png`),
          })
        }
        const counts = await page.evaluate(classifyInPage, systemSlots)
        pages.push({ route, viewport: viewport.name, width: viewport.width, ...counts })
        await page.close()
      }
      await context.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
  const sum = key =>
    pages.reduce(
      (acc, page) => ({
        total: acc.total + page[key].total,
        system: acc.system + page[key].system,
        systemSelf: acc.systemSelf + page[key].systemSelf,
      }),
      { total: 0, system: 0, systemSelf: 0 }
    )
  return {
    ambiguousSlots,
    build: {
      dir: 'dist',
      builtAt: statSync(path.join(dist, 'index.html')).mtime.toISOString(),
    },
    interactive: sum('interactive'),
    landmarks: sum('landmarks'),
    pages,
  }
}

const pct = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0)

function renderMarkdown(report) {
  const lines = [
    '# Adoption metrics',
    '',
    `Generated by \`pnpm measure:adoption <path-to-atom63-vite>\` (scripts/design-system/measure-adoption.mjs) on ${report.generatedAt.slice(0, 10)}, from atom63-vite at \`${report.adopter.branch ?? 'detached'}\` ${report.adopter.commit?.slice(0, 12) ?? 'unknown'}. Do not edit by hand; the numbers are in adoption.json.`,
    '',
    'Not run in CI: it needs a checkout of the adopter repo (atom63-vite). Run it by hand, or on schedule, and commit both files.',
    '',
    `System packages: ${report.systemPackages.map(name => `\`${name}\``).join(', ')}. Apps measured: every app under \`apps/*\` that depends on one of them from npm.`,
    '',
    '## Static',
    '',
    '| App | Lists | .tsx importing the system | .tsx importing any `@atom63/*` | System component uses (distinct) | Hand-written interactive | Other UI imports | Literal colours outside tokens |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ]
  for (const [name, app] of Object.entries(report.apps)) {
    const s = app.static
    const other = Object.values(s.otherUiLibraries).reduce((a, b) => a + b, 0)
    const literals = s.literalColors.paletteUtilities + s.literalColors.literalColors
    lines.push(
      `| ${name} | ${app.listed.join(', ')} | ${s.tsxFilesImportingSystem} / ${s.tsxFiles} (${pct(s.tsxFilesImportingSystem, s.tsxFiles)}%) | ${s.tsxFilesImportingAtom63} | ${s.systemComponentUses} (${s.distinctSystemComponents}) | ${s.handwrittenTotal} | ${other} | ${literals} |`
    )
  }
  lines.push(
    '',
    'Test files, declaration files and generated route trees are left out. Hand-written interactive: intrinsic `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<a onClick>` and `role="button"`. Literal colours: Tailwind palette or arbitrary colour utilities plus hex, `rgb()`, `hsl()` and `oklch()` values; CSS custom-property definitions (local tokens) are counted apart in adoption.json.',
    ''
  )
  for (const [name, app] of Object.entries(report.apps)) {
    const s = app.static
    lines.push(`### ${name}`, '')
    lines.push(
      `- .tsx files per system package: ${
        Object.entries(s.tsxFilesByPackage)
          .map(([pkg, count]) => `${pkg} ${count}`)
          .join(', ') || 'none'
      }.`
    )
    lines.push(
      `- Top system components: ${
        s.topSystemComponents
          .slice(0, 10)
          .map(({ name: c, count }) => `${c} ${count}`)
          .join(', ') || 'none'
      }.`
    )
    lines.push(
      `- Hand-written: ${Object.entries(s.handwritten)
        .map(([kind, count]) => `${kind} ${count}`)
        .join(', ')}.`
    )
    const other = Object.entries(s.otherUiLibraries)
    lines.push(
      `- Other UI imports: ${other.map(([lib, count]) => `${lib} ${count}`).join(', ') || 'none'}.`
    )
    if (s.shadcnCopyFiles.length)
      lines.push(`- shadcn-style copies: ${s.shadcnCopyFiles.join(', ')}.`)
    lines.push(
      `- Literal colours: ${s.literalColors.paletteUtilities} palette utilities, ${s.literalColors.literalColors} values, ${s.literalColors.localTokenDefinitions} local token definitions. Most in: ${
        s.topLiteralColorFiles
          .slice(0, 3)
          .map(({ file, count }) => `${file} (${count})`)
          .join(', ') || 'none'
      }.`,
      ''
    )
  }
  lines.push('## Runtime coverage', '')
  if (!report.runtime) {
    lines.push(`Not measured in this run: ${report.runtimeSkipped}.`, '')
    return `${lines.join('\n')}\n`
  }
  lines.push(
    `REI Cedar's method: each visible interactive and landmark element on a route counts as system when it or an ancestor carries an \`a63-*\` class or one of the ${report.systemSlotCount} \`data-slot\` values the system renders. atom63-vite sets \`data-slot\` on its own components too, so any \`data-slot\` would overcount; a system slot name that the app or one of its workspace packages also writes itself counts only with an \`a63-*\` class (the "Ambiguous slots" column; the names are in adoption.json).` +
      ' "Self" counts only elements that carry the marker themselves, which is stricter: a hand-written button inside a system Card counts as system under the first measure, not the second.',
    '',
    `Routes are served from each app's existing \`dist/\` build (building would write into atom63-vite), at ${VIEWPORTS.map(v => `${v.width}`).join(' and ')} px wide, with API and third-party requests cut off.`,
    '',
    '| App | Build date | Routes | Interactive from system (self) | Landmarks from system (self) | Ambiguous slots |',
    '| --- | --- | --- | --- | --- | --- |'
  )
  for (const [name, app] of Object.entries(report.apps)) {
    const r = app.runtime
    if (!r || r.skipped) {
      lines.push(`| ${name} | | ${r?.skipped ?? 'not measured'} | | | |`)
      continue
    }
    const routes = [...new Set(r.pages.map(page => page.route))].join(', ')
    lines.push(
      `| ${name} | ${r.build.builtAt.slice(0, 10)} | ${routes} | ${r.interactive.system} / ${r.interactive.total} = ${pct(r.interactive.system, r.interactive.total)}% (${pct(r.interactive.systemSelf, r.interactive.total)}%) | ${r.landmarks.system} / ${r.landmarks.total} = ${pct(r.landmarks.system, r.landmarks.total)}% (${pct(r.landmarks.systemSelf, r.landmarks.total)}%) | ${r.ambiguousSlots.length} |`
    )
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

const apps = adopterApps()
const report = {
  generatedAt: new Date().toISOString(),
  adopter: { name: path.basename(adopterRoot), ...gitHead(adopterRoot) },
  systemPackages,
  runtime: withRuntime,
  runtimeSkipped: withRuntime ? undefined : '--no-runtime was passed',
  apps: /** @type {Record<string, any>} */ ({}),
}
for (const app of apps) {
  console.log(`static: ${app.name}`)
  report.apps[app.name] = { listed: app.listed, static: measureStatic(app) }
}
if (withRuntime) {
  const systemSlots = systemSlotNames()
  report.systemSlotCount = systemSlots.length
  for (const app of apps) {
    console.log(`runtime: ${app.name}`)
    report.apps[app.name].runtime = await measureRuntime(app, systemSlots)
  }
}

writeFileSync(path.join(auditDir, 'adoption.json'), `${JSON.stringify(report, null, 2)}\n`)
writeFileSync(path.join(auditDir, 'adoption.md'), renderMarkdown(report))
console.log('wrote docs/design-system/audits/adoption.json and adoption.md')
