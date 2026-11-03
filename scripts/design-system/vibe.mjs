/**
 * Vibe tests (E4 in docs/design-system/quality-plan.md): do agents build
 * better UI with the Atom63 tools than without them?
 *
 * For each brief in scripts/design-system/vibe/briefs, a fresh `codex exec`
 * agent builds the page in three arms, each time in a new temporary project:
 * - `ds-core`: an `@atom63/create` site with components, tokens and contracts but no templates;
 * - `ds-guided`: the same site with Atom63 templates, build kits and examples;
 * - `plain`: Vite, React, TypeScript and Tailwind v4 at the same versions,
 *   with no design system, no AGENTS.md and no MCP server.
 * Then it measures what each agent wrote (craft rules, type errors, the build,
 * axe, the system-component share, literal colors), has a blinded `codex exec`
 * visual judge score the anonymous screenshots against the reference target, and
 * writes docs/design-system/audits/vibe-<date>.md with the raw JSON and
 * thumbnails in docs/design-system/audits/vibe/.
 *
 * Needs the design system packages built (dist is packed), the network for
 * third-party dependencies, Playwright's Chromium, and a logged-in `codex`.
 *
 * Usage: node scripts/design-system/vibe.mjs [--brief <id>]
 *   [--arms plain,ds-core,ds-guided] [--track generalization|reference]
 *   [--artifacts <dir>] [--run-id <id>] [--model <id>] [--dry-run] [--keep] [--yes]
 */
import { spawn } from 'node:child_process'
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
import { fileURLToPath, pathToFileURL } from 'node:url'

import axe from 'axe-core'
import { chromium } from 'playwright'

import { planProject, resolveVersions, writeProject } from '../../packages/create/src/generate.mjs'
import { syncAgentsBlock } from '../../packages/cli/src/agents-md.mjs'
import { execCommandSync, spawnCommand, stopCommand } from './lib/command.mjs'
import {
  changedFiles,
  countTypeErrors,
  measureSources,
  requireMeasuredSourceChanges,
} from './lib/vibe-measure.mjs'
import {
  builderPrompt,
  captureFiles,
  captureViewports,
  codexBuilderArgs,
  codexJudgeArgs,
  coreAgentGuide,
  formatCommand,
  pagePath,
  parseBrief,
  parseReferenceStates,
  planPlainProject,
  summarizeCodexEvents,
} from './lib/vibe-projects.mjs'
import { blindArms, judgePrompt, parseJudgeOutput, renderReport } from './lib/vibe-report.mjs'
import { pnpmOverridesYaml } from './lib/pnpm-overrides.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
// The design system's token names, so the craft measure flags `--a63-*` reads that do not exist.
const knownTokens = JSON.parse(
  readFileSync(path.join(root, 'packages/styles/generated/atom63.tokens.json'), 'utf8')
).entries.map(entry => entry.cssVar)
const briefsDir = path.join(root, 'scripts/design-system/vibe/briefs')
const referencesDir = path.join(root, 'scripts/design-system/vibe/references')
const auditsDir = path.join(root, 'docs/design-system/audits')
const cliBin = path.join(root, 'packages/cli/src/bin.mjs')
const packages = {
  '@atom63/styles': 'packages/styles',
  '@atom63/ui-foundation': 'packages/ui-foundation',
  '@atom63/ui-react': 'packages/ui-react',
  '@atom63/mdx': 'packages/mdx',
}
const defaultArms = ['plain', 'ds-core', 'ds-guided']
const supportedArms = [...defaultArms, 'ds']
const agentTimeoutMs = 45 * 60 * 1000
const limits = { agentTimeoutMs }

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
const track = option('--track') ?? 'generalization'
if (!['generalization', 'reference'].includes(track))
  throw new Error('--track must be generalization or reference')
const artifactsOption = option('--artifacts')
const artifactsDir = artifactsOption ? path.resolve(root, artifactsOption) : null
if (artifactsDir && existsSync(artifactsDir))
  throw new Error(`Artifacts directory already exists: ${artifactsDir}`)
const runId = option('--run-id')
if (runId && !/^[a-z0-9][a-z0-9-]*$/.test(runId))
  throw new Error('--run-id must contain only lowercase letters, numbers and hyphens')
const arms = (option('--arms') ?? defaultArms.join(',')).split(',').map(arm => arm.trim())
for (const arm of arms) if (!supportedArms.includes(arm)) throw new Error(`Unknown arm "${arm}"`)
const briefFlag = option('--brief')

const briefs = readdirSync(briefsDir)
  .filter(file => file.endsWith('.md'))
  .sort()
  .map(file =>
    parseBrief(file.replace(/\.md$/, ''), readFileSync(path.join(briefsDir, file), 'utf8'))
  )
  .filter(brief => !briefFlag || brief.id === briefFlag)
  .filter(brief => track !== 'reference' || existsSync(path.join(referencesDir, brief.id)))
if (briefs.length === 0) {
  throw new Error(`No brief "${briefFlag}". Briefs: ${readdirSync(briefsDir).join(', ')}`)
}

process.stdout.write(
  `Vibe run: ${briefs.length} brief(s) (${briefs.map(({ id }) => id).join(', ')}) × ${arms.join(', ')}, track ${track}, model ${model ?? 'the CLI default'}.\n` +
    `Runtime: Codex CLI only, 45-minute timeout per agent, token usage recorded; no Claude calls.\n`
)
if (!dryRun && briefs.length > 1 && !flag('--yes')) {
  process.stderr.write(
    'More than one brief uses substantial model quota. Pass --yes to go ahead, or --brief <id> for one.\n'
  )
  process.exit(1)
}

// Helpers --------------------------------------------------------------------

const run = (command, args, cwd, { quiet = false } = {}) => {
  if (!quiet) process.stdout.write(`\n$ ${command} ${args.join(' ')}   (in ${cwd})\n`)
  execCommandSync(command, args, {
    cwd,
    stdio: quiet ? 'pipe' : 'inherit',
    env: { ...process.env, CI: 'true' },
  })
}

/** Run and capture; never throws. */
const capture = (command, args, cwd) => {
  try {
    const output = execCommandSync(command, args, {
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
    if (['node_modules', 'dist', '.git', '.claude', '.codex'].includes(entry.name)) continue
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      for (const [key, value] of snapshot(directory, relative)) files.set(key, value)
    } else if (entry.isFile()) {
      files.set(relative, readFileSync(path.join(directory, relative), 'utf8'))
    }
  }
  return files
}

/**
 * `codex exec --json`; resolves with its JSONL events and final message.
 */
function codex(args, cwd, { outputPath, eventsPath }) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    mkdirSync(path.dirname(outputPath), { recursive: true })
    const child = spawn('codex', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => (stdout += chunk))
    child.stderr.on('data', chunk => (stderr += chunk))
    const timer = setTimeout(() => child.kill('SIGTERM'), agentTimeoutMs)
    child.on('close', code => {
      clearTimeout(timer)
      try {
        mkdirSync(path.dirname(eventsPath), { recursive: true })
        writeFileSync(eventsPath, stdout)
        const events = stdout
          .split('\n')
          .filter(line => line.trim().startsWith('{'))
          .map(line => JSON.parse(line))
        if (code !== 0) throw new Error(`codex exited ${code}: ${(stderr || stdout).slice(-1000)}`)
        resolve({
          events,
          finalMessage: existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '',
          durationMs: Date.now() - started,
        })
      } catch (error) {
        reject(error)
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
  const child = spawnCommand(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: directory, stdio: 'ignore' }
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
 * Open the brief's page at every benchmark viewport in light mode: run axe and
 * take full-page PNGs for the judge plus small JPEG thumbnails for the report.
 */
async function inspectPage(browser, url, outDir, states = []) {
  mkdirSync(outDir, { recursive: true })
  const result = { consoleErrors: [], textLength: 0, axe: { violations: [], nodes: 0 } }
  const scenarios = states.length ? states : [null]
  for (const state of scenarios) {
    for (const [name, viewport] of Object.entries(captureViewports)) {
      const relative = state ? path.join(state, `${name}.png`) : `${name}.png`
      const jpegRelative = relative.replace(/\.png$/, '.jpg')
      mkdirSync(path.dirname(path.join(outDir, relative)), { recursive: true })
      const context = await browser.newContext({ viewport, colorScheme: 'light' })
      const page = await context.newPage()
      page.on('console', message => {
        if (message.type() === 'error')
          result.consoleErrors.push(
            `${state ?? 'default'}/${name}: ${message.text().slice(0, 300)}`
          )
      })
      page.on('pageerror', error =>
        result.consoleErrors.push(`${state ?? 'default'}/${name}: ${String(error).slice(0, 300)}`)
      )
      const captureUrl = state ? `${url}?state=${encodeURIComponent(state)}` : url
      await page.goto(captureUrl, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(outDir, relative), fullPage: true })
      await page.screenshot({ path: path.join(outDir, jpegRelative), type: 'jpeg', quality: 55 })
      if (name === 'desktop' && (!states.length || state === 'complete'))
        result.textLength = (await page.evaluate(() => document.body.innerText)).trim().length
      await page.addScriptTag({ content: axe.source })
      const axeResult = await page.evaluate(() =>
        window.axe.run(document, { resultTypes: ['violations'] })
      )
      result.axe.violations.push(
        ...axeResult.violations.map(violation => ({
          viewport: name,
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
          help: violation.help,
        }))
      )
      result.axe.nodes += axeResult.violations.reduce(
        (sum, violation) => sum + violation.nodes.length,
        0
      )
      await context.close()
    }
  }
  return result
}

async function renderReferenceTarget(browser, source, destination) {
  mkdirSync(path.dirname(destination), { recursive: true })
  const context = await browser.newContext({ viewport: captureViewports.desktop })
  try {
    const page = await context.newPage()
    await page.goto(pathToFileURL(source).href, { waitUntil: 'load' })
    await page.screenshot({ path: destination })
  } finally {
    await context.close()
  }
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
  if (arm !== 'plain') {
    files = planProject({ name, kind: 'site', title: 'Vibe', versions })
    // The agent has the atom63 MCP server, so its AGENTS.md points at the CLI
    // commands instead of the published docs.
    files.set(
      'AGENTS.md',
      arm === 'ds-core'
        ? coreAgentGuide(files.get('AGENTS.md'))
        : syncAgentsBlock(files.get('AGENTS.md'))
    )
    const manifest = JSON.parse(files.get('package.json'))
    const overrides = Object.fromEntries(Object.keys(packages).map(pkg => [pkg, tarballFor(pkg)]))
    for (const pkg of Object.keys(packages)) manifest.dependencies[pkg] = overrides[pkg]
    files.set('package.json', `${JSON.stringify(manifest, null, 2)}\n`)
    files.set('pnpm-workspace.yaml', pnpmOverridesYaml(overrides))
  } else {
    files = planPlainProject({ name, versions })
  }
  writeProject(directory, files)
  if (track === 'reference') {
    cpSync(path.join(referencesDir, brief.id), path.join(directory, '.vibe/reference'), {
      recursive: true,
    })
  }
  process.stdout.write(`Setting up ${brief.id}/${arm}: installing dependencies…\n`)
  run('pnpm', ['install', '--no-frozen-lockfile', '--silent'], directory)
  process.stdout.write(`Set up ${brief.id}/${arm}.\n`)
  return snapshot(directory)
}

// Main -----------------------------------------------------------------------

const date = new Date().toISOString().slice(0, 10)
const outputKey = runId ? `${date}-${runId}` : date
const report = {
  date,
  outputKey,
  commit: capture('git', ['rev-parse', 'HEAD'], root).output.trim(),
  dirty: capture('git', ['status', '--porcelain'], root).output.trim().length > 0,
  codexVersion: capture('codex', ['--version'], root).output.trim(),
  modelFlag: model ?? null,
  track,
  models: [],
  arms,
  limits,
  promptTemplate: builderPrompt(
    {
      id: '<brief id>',
      title: '<brief title>',
      body: '<brief body>',
    },
    { track }
  ),
  briefs: [],
}

let failed = false
let browser
try {
  if (arms.some(arm => arm !== 'plain')) packTarballs()

  for (const brief of briefs) {
    process.stdout.write(`\n=== ${brief.id} ===\n`)
    const entry = { brief, arms: {}, judge: null, thumbnails: [] }
    const captureStates =
      track === 'reference'
        ? parseReferenceStates(
            readFileSync(path.join(referencesDir, brief.id, 'states.md'), 'utf8')
          )
        : []
    entry.captureStates = captureStates
    report.briefs.push(entry)
    const prompt = builderPrompt(brief, { track })
    const projects = Object.fromEntries(arms.map(arm => [arm, path.join(work, brief.id, arm)]))
    const before = {}
    for (const arm of arms) before[arm] = setupProject(arm, brief, projects[arm])

    const commands = Object.fromEntries(
      arms.map(arm => [
        arm,
        codexBuilderArgs({
          arm,
          prompt,
          cliBin,
          model,
          outputPath: path.join(projects[arm], '.vibe', 'codex-last-message.txt'),
        }),
      ])
    )
    if (dryRun) {
      for (const arm of arms) {
        process.stdout.write(
          `\n[${arm}] in ${projects[arm]}\n${formatCommand('codex', commands[arm])}\n`
        )
      }
      const judgeDir = path.join(work, brief.id, 'judge')
      const labels = Object.keys(blindArms(arms))
      process.stdout.write(
        `\n[judge] in ${judgeDir}\n${formatCommand(
          'codex',
          codexJudgeArgs({
            prompt: judgePrompt({
              brief,
              labels,
              states: captureStates,
              hasReference: track === 'reference',
            }),
            model,
            outputPath: path.join(judgeDir, 'codex-last-message.json'),
          })
        )}\n`
      )
      continue
    }

    process.stdout.write(`\nBuilding ${brief.id} with ${arms.join(' and ')} in parallel…\n`)
    const outcomes = await Promise.allSettled(
      arms.map(arm =>
        codex(commands[arm], projects[arm], {
          outputPath: path.join(projects[arm], '.vibe', 'codex-last-message.txt'),
          eventsPath: path.join(projects[arm], '.vibe', 'codex-events.jsonl'),
        })
      )
    )

    browser ??= await chromium.launch()
    const shots = {}
    for (const [index, arm] of arms.entries()) {
      const outcome = outcomes[index]
      if (outcome.status === 'rejected') {
        entry.arms[arm] = { status: 'error', error: outcome.reason.message }
        continue
      }
      const agent = summarizeCodexEvents(outcome.value.events, {
        durationMs: outcome.value.durationMs,
        model,
      })
      report.models.push(...agent.models)
      const directory = projects[arm]
      try {
        const after = snapshot(directory)
        const files = changedFiles(before[arm], after)
        const measured = new Map(
          requireMeasuredSourceChanges(files).map(relative => [relative, after.get(relative)])
        )
        const typecheck = capture('pnpm', ['exec', 'tsc', '--noEmit'], directory)
        const build = capture('pnpm', ['exec', 'vite', 'build'], directory)
        const result = {
          status: 'ok',
          agent,
          agentResult: excerptText(outcome.value.finalMessage),
          files,
          measures: measureSources(measured, { knownTokens }),
          typecheck: { ok: typecheck.ok, errors: countTypeErrors(typecheck.output) },
          build: { ok: build.ok, output: build.ok ? '' : build.output.slice(-2000) },
          axe: { violations: [], nodes: 0, error: 'not built' },
          page: null,
        }
        if (build.ok) {
          const server = await preview(directory)
          try {
            shots[arm] = path.join(work, brief.id, 'shots', arm)
            const page = await inspectPage(
              browser,
              `${server.url}${pagePath(brief)}`,
              shots[arm],
              captureStates
            )
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
      if (track === 'reference') {
        await renderReferenceTarget(
          browser,
          path.join(referencesDir, brief.id, 'target-desktop.svg'),
          path.join(judgeDir, 'reference', 'target-desktop.png')
        )
      }
      for (const [label, arm] of Object.entries(mapping)) {
        const target = path.join(judgeDir, label)
        mkdirSync(target, { recursive: true })
        for (const relative of captureFiles(captureStates)) {
          const destination = path.join(target, relative)
          mkdirSync(path.dirname(destination), { recursive: true })
          cpSync(path.join(shots[arm], relative), destination)
        }
      }
      const labels = Object.keys(mapping)
      process.stdout.write(`\nJudging ${brief.id} (${labels.join(', ')})…\n`)
      entry.judge = { mapping }
      try {
        const judgeOutput = path.join(judgeDir, 'codex-last-message.json')
        const reply = await codex(
          codexJudgeArgs({
            prompt: judgePrompt({
              brief,
              labels,
              states: captureStates,
              hasReference: track === 'reference',
            }),
            model,
            outputPath: judgeOutput,
          }),
          judgeDir,
          { outputPath: judgeOutput, eventsPath: path.join(judgeDir, 'codex-events.jsonl') }
        )
        entry.judge.agent = summarizeCodexEvents(reply.events, {
          durationMs: reply.durationMs,
          model,
        })
        report.models.push(...entry.judge.agent.models)
        entry.judge.raw = reply.finalMessage
        const byLabel = parseJudgeOutput(reply.finalMessage, labels)
        entry.judge.scores = Object.fromEntries(
          Object.entries(byLabel).map(([label, summary]) => [mapping[label], summary])
        )
      } catch (error) {
        entry.judge.error = error.message
      }
    }

    // Thumbnails for the report.
    const thumbDir = path.join(auditsDir, 'vibe', outputKey)
    for (const arm of judged) {
      mkdirSync(thumbDir, { recursive: true })
      const thumbnailState = captureStates.includes('complete') ? 'complete' : null
      for (const width of Object.keys(captureViewports)) {
        const name = `${brief.id}-${arm}-${width}.jpg`
        cpSync(
          path.join(shots[arm], thumbnailState ? thumbnailState : '', `${width}.jpg`),
          path.join(thumbDir, name)
        )
        entry.thumbnails.push(`vibe/${outputKey}/${name}`)
      }
    }
  }

  if (!dryRun) {
    report.models = [...new Set(report.models)].sort()
    mkdirSync(path.join(auditsDir, 'vibe'), { recursive: true })
    const jsonPath = path.join(auditsDir, 'vibe', `vibe-${outputKey}.json`)
    writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
    const reportPath = path.join(auditsDir, `vibe-${outputKey}.md`)
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
  if (artifactsDir) {
    mkdirSync(path.dirname(artifactsDir), { recursive: true })
    cpSync(work, artifactsDir, {
      recursive: true,
      filter: source => {
        const parts = path.relative(work, source).split(path.sep)
        return !parts.some(part => ['node_modules', 'dist', 'tarballs'].includes(part))
      },
    })
    process.stdout.write(`Preserved artifacts in ${artifactsDir}\n`)
  }
  if (keep) process.stdout.write(`Kept ${work}\n`)
  else rmSync(work, { recursive: true, force: true })
}
process.exitCode = failed ? 1 : 0

function excerptText(text) {
  return typeof text === 'string' ? text.slice(0, 2000) : ''
}
