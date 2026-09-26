/**
 * Vibe tests (E4 in docs/design-system/quality-plan.md): do agents build
 * better UI with the Atom63 tools than without them?
 *
 * For each brief in scripts/design-system/vibe/briefs, a fresh `claude -p`
 * agent builds the page twice, each time in a new temporary project:
 * - `ds`: an `@atom63/create` site installed against freshly packed tarballs,
 *   with its AGENTS.md and the `atom63` MCP server;
 * - `plain`: Vite, React, TypeScript and Tailwind v4 at the same versions,
 *   with no design system, no AGENTS.md and no MCP server.
 * Then it measures what each agent wrote (craft rules, type errors, the build,
 * axe, the system-component share, literal colors), has a blinded `claude -p`
 * judge score both against the craft rubric from screenshots and source, and
 * writes docs/design-system/audits/vibe-<date>.md with the raw JSON and
 * thumbnails in docs/design-system/audits/vibe/.
 *
 * Needs the design system packages built (dist is packed), the network for
 * third-party dependencies, Playwright's Chromium, and a logged-in `claude`.
 *
 * Usage: node scripts/design-system/vibe.mjs [--brief <id>] [--arms ds,plain]
 *   [--model <id>] [--dry-run] [--keep] [--yes]
 */
import { execFileSync, spawn } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import axe from 'axe-core'
import { chromium } from 'playwright'

import { planProject, resolveVersions, writeProject } from '../../packages/create/src/generate.mjs'
import { syncAgentsBlock } from '../../packages/cli/src/agents-md.mjs'
import {
  changedFiles,
  countTypeErrors,
  isMeasuredFile,
  measureSources,
} from './lib/vibe-measure.mjs'
import {
  builderArgs,
  builderPrompt,
  formatCommand,
  judgeArgs,
  pagePath,
  parseBrief,
  planPlainProject,
  summarizeClaudeResult,
} from './lib/vibe-projects.mjs'
import { blindArms, judgePrompt, parseJudgeOutput, renderReport } from './lib/vibe-report.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const briefsDir = path.join(root, 'scripts/design-system/vibe/briefs')
const auditsDir = path.join(root, 'docs/design-system/audits')
const cliBin = path.join(root, 'packages/cli/src/bin.mjs')
const packages = {
  '@atom63/styles': 'packages/styles',
  '@atom63/ui-foundation': 'packages/ui-foundation',
  '@atom63/ui-react': 'packages/ui-react',
  '@atom63/mdx': 'packages/mdx',
}
const allArms = ['ds', 'plain']
const limits = { builderTurns: 80, builderBudgetUsd: 5, judgeTurns: 30, judgeBudgetUsd: 2 }
const agentTimeoutMs = 45 * 60 * 1000

// Arguments ------------------------------------------------------------------

const argv = process.argv.slice(2)
const flag = name => argv.includes(name)
const option = name => {
  const index = argv.indexOf(name)
  if (index === -1) return undefined
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} needs a value`)
  return value
}
const dryRun = flag('--dry-run')
const keep = flag('--keep')
const model = option('--model')
const arms = (option('--arms') ?? allArms.join(',')).split(',').map(arm => arm.trim())
for (const arm of arms) if (!allArms.includes(arm)) throw new Error(`Unknown arm "${arm}"`)
const briefFlag = option('--brief')

const briefs = readdirSync(briefsDir)
  .filter(file => file.endsWith('.md'))
  .sort()
  .map(file =>
    parseBrief(file.replace(/\.md$/, ''), readFileSync(path.join(briefsDir, file), 'utf8'))
  )
  .filter(brief => !briefFlag || brief.id === briefFlag)
if (briefs.length === 0) {
  throw new Error(`No brief "${briefFlag}". Briefs: ${readdirSync(briefsDir).join(', ')}`)
}

const ceiling = briefs.length * (arms.length * limits.builderBudgetUsd + limits.judgeBudgetUsd)
process.stdout.write(
  `Vibe run: ${briefs.length} brief(s) (${briefs.map(({ id }) => id).join(', ')}) × ${arms.join(', ')}, model ${model ?? 'the CLI default'}.\n` +
    `Cost ceiling: $${ceiling.toFixed(2)} (each builder is capped at $${limits.builderBudgetUsd} and ${limits.builderTurns} turns, each judge at $${limits.judgeBudgetUsd}); a typical run spends well under it.\n`
)
if (!dryRun && briefs.length > 1 && !flag('--yes')) {
  process.stderr.write(
    'More than one brief spends real money. Pass --yes to go ahead, or --brief <id> for one.\n'
  )
  process.exit(1)
}

// Helpers --------------------------------------------------------------------

const run = (command, args, cwd, { quiet = false } = {}) => {
  if (!quiet) process.stdout.write(`\n$ ${command} ${args.join(' ')}   (in ${cwd})\n`)
  execFileSync(command, args, {
    cwd,
    stdio: quiet ? 'pipe' : 'inherit',
    env: { ...process.env, CI: 'true' },
  })
}

/** Run and capture; never throws. */
const capture = (command, args, cwd) => {
  try {
    const output = execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, CI: 'true' },
      maxBuffer: 64 * 1024 * 1024,
    })
    return { ok: true, output }
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ''}${error.stderr ?? ''}` }
  }
}

/** Every text file of a project, without installed or built output. */
function snapshot(directory, prefix = '') {
  const files = new Map()
  for (const entry of readdirSync(path.join(directory, prefix), { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '.claude'].includes(entry.name)) continue
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      for (const [key, value] of snapshot(directory, relative)) files.set(key, value)
    } else if (entry.isFile()) {
      files.set(relative, readFileSync(path.join(directory, relative), 'utf8'))
    }
  }
  return files
}

/** `claude -p` with JSON output; resolves with the parsed result. */
function claude(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => (stdout += chunk))
    child.stderr.on('data', chunk => (stderr += chunk))
    const timer = setTimeout(() => child.kill('SIGTERM'), agentTimeoutMs)
    child.on('close', code => {
      clearTimeout(timer)
      try {
        resolve(JSON.parse(stdout))
      } catch {
        reject(new Error(`claude exited ${code}: ${(stderr || stdout).slice(0, 500)}`))
      }
    })
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

/** Serve a built project with `vite preview` until `stop()` is called. */
async function preview(directory) {
  const port = await freePort()
  const child = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: directory, stdio: 'ignore' }
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

/**
 * Open the brief's page at desktop and phone widths in light mode: run axe on
 * the desktop render and take full-page PNGs for the judge plus small JPEG
 * thumbnails of the first screen for the report.
 */
async function inspectPage(browser, url, outDir) {
  mkdirSync(outDir, { recursive: true })
  const result = { consoleErrors: [], textLength: 0 }
  const widths = { desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } }
  for (const [name, viewport] of Object.entries(widths)) {
    const context = await browser.newContext({ viewport, colorScheme: 'light' })
    const page = await context.newPage()
    if (name === 'desktop') {
      page.on('console', message => {
        if (message.type() === 'error') result.consoleErrors.push(message.text().slice(0, 300))
      })
      page.on('pageerror', error => result.consoleErrors.push(String(error).slice(0, 300)))
    }
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true })
    await page.screenshot({ path: path.join(outDir, `${name}.jpg`), type: 'jpeg', quality: 55 })
    if (name === 'desktop') {
      result.textLength = (await page.evaluate(() => document.body.innerText)).trim().length
      await page.addScriptTag({ content: axe.source })
      const axeResult = await page.evaluate(() =>
        window.axe.run(document, { resultTypes: ['violations'] })
      )
      result.axe = {
        violations: axeResult.violations.map(violation => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
          help: violation.help,
        })),
        nodes: axeResult.violations.reduce((sum, violation) => sum + violation.nodes.length, 0),
      }
    }
    await context.close()
  }
  return result
}

// Setup ----------------------------------------------------------------------

const work = mkdtempSync(path.join(tmpdir(), 'atom63-vibe-'))
const tarballs = path.join(work, 'tarballs')
const versions = resolveVersions()

function packTarballs() {
  for (const [name, directory] of Object.entries(packages)) {
    const manifest = JSON.parse(readFileSync(path.join(root, directory, 'package.json'), 'utf8'))
    if (manifest.files?.includes('dist') && !existsSync(path.join(root, directory, 'dist'))) {
      throw new Error(
        `${name} has no dist; build the packages first: pnpm --filter "@atom63/mdx..." --filter "@atom63/ui-react..." build`
      )
    }
    run('pnpm', ['pack', '--pack-destination', tarballs], path.join(root, directory), {
      quiet: true,
    })
  }
}

const tarballFor = name => {
  const prefix = name.replace('@', '').replace('/', '-')
  const file = readdirSync(tarballs).find(entry => entry.startsWith(`${prefix}-`))
  if (!file) throw new Error(`No tarball for ${name}`)
  return `file:${path.join(tarballs, file)}`
}

/** Generate and install one arm's project; returns the files before the agent. */
function setupProject(arm, brief, directory) {
  const name = `vibe-${brief.id}-${arm}`
  let files
  if (arm === 'ds') {
    files = planProject({ name, kind: 'site', title: 'Vibe', versions })
    // The agent has the atom63 MCP server, so its AGENTS.md points at the CLI
    // commands instead of the published docs.
    files.set('AGENTS.md', syncAgentsBlock(files.get('AGENTS.md')))
    const manifest = JSON.parse(files.get('package.json'))
    const overrides = Object.fromEntries(Object.keys(packages).map(pkg => [pkg, tarballFor(pkg)]))
    for (const pkg of Object.keys(packages)) manifest.dependencies[pkg] = overrides[pkg]
    manifest.pnpm = { overrides }
    files.set('package.json', `${JSON.stringify(manifest, null, 2)}\n`)
  } else {
    files = planPlainProject({ name, versions })
  }
  writeProject(directory, files)
  run('pnpm', ['install', '--ignore-workspace', '--no-frozen-lockfile', '--silent'], directory)
  return snapshot(directory)
}

// Main -----------------------------------------------------------------------

const date = new Date().toISOString().slice(0, 10)
const report = {
  date,
  commit: capture('git', ['rev-parse', 'HEAD'], root).output.trim(),
  dirty: capture('git', ['status', '--porcelain'], root).output.trim().length > 0,
  claudeVersion: capture('claude', ['--version'], root).output.trim(),
  modelFlag: model ?? null,
  models: [],
  arms,
  limits,
  promptTemplate: builderPrompt({
    id: '<brief id>',
    title: '<brief title>',
    body: '<brief body>',
  }),
  briefs: [],
}

let failed = false
let browser
try {
  if (arms.includes('ds')) packTarballs()

  for (const brief of briefs) {
    process.stdout.write(`\n=== ${brief.id} ===\n`)
    const entry = { brief, arms: {}, judge: null, thumbnails: [] }
    report.briefs.push(entry)
    const prompt = builderPrompt(brief)
    const projects = Object.fromEntries(arms.map(arm => [arm, path.join(work, brief.id, arm)]))
    const before = {}
    for (const arm of arms) before[arm] = setupProject(arm, brief, projects[arm])

    const commands = Object.fromEntries(
      arms.map(arm => [
        arm,
        builderArgs({
          arm,
          prompt,
          cliBin,
          model,
          maxTurns: limits.builderTurns,
          maxBudgetUsd: limits.builderBudgetUsd,
        }),
      ])
    )
    if (dryRun) {
      for (const arm of arms) {
        process.stdout.write(
          `\n[${arm}] in ${projects[arm]}\n${formatCommand('claude', commands[arm])}\n`
        )
      }
      const judgeDir = path.join(work, brief.id, 'judge')
      const labels = Object.keys(blindArms(arms))
      process.stdout.write(
        `\n[judge] in ${judgeDir}\n${formatCommand(
          'claude',
          judgeArgs({
            prompt: judgePrompt({
              brief,
              labels,
              sources: Object.fromEntries(labels.map(label => [label, []])),
            }),
            model,
            maxTurns: limits.judgeTurns,
            maxBudgetUsd: limits.judgeBudgetUsd,
          })
        )}\n`
      )
      continue
    }

    process.stdout.write(`\nBuilding ${brief.id} with ${arms.join(' and ')} in parallel…\n`)
    const outcomes = await Promise.allSettled(arms.map(arm => claude(commands[arm], projects[arm])))

    browser ??= await chromium.launch()
    const shots = {}
    const sources = {}
    for (const [index, arm] of arms.entries()) {
      const outcome = outcomes[index]
      if (outcome.status === 'rejected') {
        entry.arms[arm] = { status: 'error', error: outcome.reason.message }
        continue
      }
      const agent = summarizeClaudeResult(outcome.value)
      report.models.push(...agent.models)
      const directory = projects[arm]
      try {
        const after = snapshot(directory)
        const files = changedFiles(before[arm], after)
        const measured = new Map(
          [...files.added, ...files.changed]
            .filter(isMeasuredFile)
            .map(relative => [relative, after.get(relative)])
        )
        sources[arm] = measured
        const typecheck = capture('pnpm', ['exec', 'tsc', '--noEmit'], directory)
        const build = capture('pnpm', ['exec', 'vite', 'build'], directory)
        const result = {
          status: 'ok',
          agent,
          agentResult: excerptText(outcome.value.result),
          files,
          measures: measureSources(measured),
          typecheck: { ok: typecheck.ok, errors: countTypeErrors(typecheck.output) },
          build: { ok: build.ok, output: build.ok ? '' : build.output.slice(-2000) },
          axe: { violations: [], nodes: 0, error: 'not built' },
          page: null,
        }
        if (build.ok) {
          const server = await preview(directory)
          try {
            shots[arm] = path.join(work, brief.id, 'shots', arm)
            const page = await inspectPage(browser, `${server.url}${pagePath(brief)}`, shots[arm])
            result.axe = page.axe
            result.page = { textLength: page.textLength, consoleErrors: page.consoleErrors }
          } finally {
            server.stop()
          }
        }
        entry.arms[arm] = result
      } catch (error) {
        entry.arms[arm] = { status: 'error', agent, error: error.message }
      }
    }

    // The judge sees every arm that rendered, under random labels.
    const judged = arms.filter(arm => shots[arm])
    if (judged.length) {
      const mapping = blindArms(judged)
      const judgeDir = path.join(work, brief.id, 'judge')
      const labelSources = {}
      for (const [label, arm] of Object.entries(mapping)) {
        const target = path.join(judgeDir, label)
        mkdirSync(path.join(target, 'source'), { recursive: true })
        cpSync(path.join(shots[arm], 'desktop.png'), path.join(target, 'desktop.png'))
        cpSync(path.join(shots[arm], 'mobile.png'), path.join(target, 'mobile.png'))
        labelSources[label] = [...sources[arm].keys()]
        for (const [relative, text] of sources[arm]) {
          const file = path.join(target, 'source', relative)
          mkdirSync(path.dirname(file), { recursive: true })
          writeFileSync(file, text)
        }
      }
      const labels = Object.keys(mapping)
      process.stdout.write(`\nJudging ${brief.id} (${labels.join(', ')})…\n`)
      entry.judge = { mapping }
      try {
        const reply = await claude(
          judgeArgs({
            prompt: judgePrompt({ brief, labels, sources: labelSources }),
            model,
            maxTurns: limits.judgeTurns,
            maxBudgetUsd: limits.judgeBudgetUsd,
          }),
          judgeDir
        )
        entry.judge.agent = summarizeClaudeResult(reply)
        report.models.push(...entry.judge.agent.models)
        entry.judge.raw = reply.result
        const byLabel = parseJudgeOutput(reply.result ?? '', labels)
        entry.judge.scores = Object.fromEntries(
          Object.entries(byLabel).map(([label, summary]) => [mapping[label], summary])
        )
      } catch (error) {
        entry.judge.error = error.message
      }
    }

    // Thumbnails for the report.
    const thumbDir = path.join(auditsDir, 'vibe', date)
    for (const arm of judged) {
      mkdirSync(thumbDir, { recursive: true })
      for (const width of ['desktop', 'mobile']) {
        const name = `${brief.id}-${arm}-${width}.jpg`
        cpSync(path.join(shots[arm], `${width}.jpg`), path.join(thumbDir, name))
        entry.thumbnails.push(`vibe/${date}/${name}`)
      }
    }
  }

  if (!dryRun) {
    report.models = [...new Set(report.models)].sort()
    mkdirSync(path.join(auditsDir, 'vibe'), { recursive: true })
    const jsonPath = path.join(auditsDir, 'vibe', `vibe-${date}.json`)
    writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
    const reportPath = path.join(auditsDir, `vibe-${date}.md`)
    writeFileSync(reportPath, renderReport(report))
    process.stdout.write(
      `\nWrote ${path.relative(root, reportPath)} and ${path.relative(root, jsonPath)}\n`
    )
  } else {
    process.stdout.write('\nDry run: projects are set up; no agent was called.\n')
  }
} catch (error) {
  failed = true
  process.stderr.write(`\nVibe run failed: ${error.stack ?? error.message}\n`)
} finally {
  await browser?.close()
  if (keep) process.stdout.write(`Kept ${work}\n`)
  else rmSync(work, { recursive: true, force: true })
}
process.exitCode = failed ? 1 : 0

function excerptText(text) {
  return typeof text === 'string' ? text.slice(0, 2000) : ''
}
