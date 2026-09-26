/**
 * The Node side of the runtime craft check: browser commands that hand each
 * story its baseline entry and collect its result, and a reporter that checks
 * the whole baseline at the end of the run and rewrites it when
 * `CRAFT_WRITE_BASELINE=1` is set.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BrowserCommand } from 'vitest/node'
import type { Reporter, TestModule, Vitest } from 'vitest/node'

import { type CraftBaseline, mergeBaseline, type StoryEntry, totals } from './baseline'

export const CRAFT_PROJECT = 'craft'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const baselinePath = path.join(root, 'docs/design-system/audits/runtime-craft-baseline.json')
const write = process.env.CRAFT_WRITE_BASELINE === '1'

let baseline: CraftBaseline | undefined
function readBaseline(): CraftBaseline {
  baseline ??= JSON.parse(readFileSync(baselinePath, 'utf8')) as CraftBaseline
  return baseline
}

/** Each story's result, by story id. */
const results = new Map<string, StoryEntry>()

const craftBaseline: BrowserCommand<[storyId: string]> = (_context, storyId) => ({
  write,
  entry: readBaseline()[storyId] ?? {},
})

const craftReport: BrowserCommand<[storyId: string, entry: StoryEntry]> = (
  _context,
  storyId,
  entry
) => {
  results.set(storyId, entry)
}

export const craftCommands = { craftBaseline, craftReport }

function storyIds(modules: readonly TestModule[]) {
  const ids = new Set<string>()
  for (const module of modules) {
    for (const test of module.children.allTests()) {
      const storyId = (test.meta() as { storyId?: string }).storyId
      if (storyId) ids.add(storyId)
    }
  }
  return ids
}

export class CraftBaselineReporter implements Reporter {
  private vitest!: Vitest

  onInit(vitest: Vitest) {
    this.vitest = vitest
  }

  async onTestRunEnd(testModules: readonly TestModule[]) {
    // A browser project is named after its instance: `craft (chromium)`.
    const modules = testModules.filter(module =>
      module.project.name.startsWith(`${CRAFT_PROJECT} (`)
    )
    if (modules.length === 0) return
    const project = modules[0].project
    const { testFiles } = await project.globTestFiles()
    // Only a run of every story can tell that a story no longer exists.
    const complete = modules.length === testFiles.length && !this.vitest.config.testNamePattern
    const log = (text: string) => process.stdout.write(`${text}\n`)

    if (write) {
      const merged = mergeBaseline(readBaseline(), results, { complete })
      writeFileSync(baselinePath, `${JSON.stringify(merged, null, 2)}\n`)
      const counts = Object.entries(totals(merged)).map(([rule, n]) => `${rule} ${n}`)
      log(
        `Runtime craft: wrote ${path.relative(root, baselinePath)} ` +
          `(${counts.join(', ') || 'no violations'})${complete ? '' : ', partial run merged'}`
      )
      return
    }

    if (!complete) return
    const existing = storyIds(modules)
    const gone = Object.keys(readBaseline()).filter(storyId => !existing.has(storyId))
    if (gone.length > 0) {
      log(
        'Runtime craft: the baseline lists stories that no longer exist. ' +
          'Rewrite it with CRAFT_WRITE_BASELINE=1:\n' +
          gone.map(storyId => `  ${storyId}`).join('\n')
      )
      process.exitCode = 1
    }
  }
}
