#!/usr/bin/env node
/**
 * atom63-figma: what an agent runs from a project to keep a Figma file in step
 * with its token CSS. `sync` writes use_figma scripts, `read` writes a script
 * that returns the file's variables, `diff` compares that result with the code.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { readTokenDirectory } from './css-files'
import { buildProjectModel, type ProjectModel } from './css-model'
import { diffTokens, formatDiff } from './diff'
import { mergeSnapshots, type PackedSnapshot, unpackSnapshot } from './pack'
import type { SyncModel } from './plan'
import { buildReadScript, buildScripts } from './scripts'

function fail(message: string): never {
  process.stderr.write(`atom63-figma: ${message}\n`)
  process.exit(1)
}

function project(values: { tokens?: string; model?: string }): ProjectModel {
  if (values.tokens) return buildProjectModel(readTokenDirectory(values.tokens))
  if (values.model)
    return {
      model: JSON.parse(readFileSync(values.model, 'utf8')) as SyncModel,
      sources: {},
      raw: {},
      notes: [],
    }
  return fail('pass --tokens <dir> or --model <json>')
}

function writeAll(directory: string, prefix: string, scripts: string[]): string[] {
  return scripts.map((script, index) => {
    const file = `${prefix}-${index + 1}.js`
    writeFileSync(join(directory, file), script)
    return file
  })
}

const [command, ...rest] = process.argv.slice(2)
const { values } = parseArgs({
  args: rest,
  options: {
    tokens: { type: 'string' },
    model: { type: 'string' },
    out: { type: 'string' },
    figma: { type: 'string', multiple: true },
    page: { type: 'string' },
  },
})

try {
  if (command === 'sync') {
    const { model } = project(values)
    const out = values.out ?? fail('pass --out <dir>')
    mkdirSync(out, { recursive: true })
    // Scripts from an earlier run with more parts would write stale values.
    for (const file of readdirSync(out))
      if (/^(sync|check)-\d+\.js$/.test(file)) rmSync(join(out, file))
    const summary = {
      scripts: writeAll(out, 'sync', buildScripts(model, 'sync')),
      checks: writeAll(out, 'check', buildScripts(model, 'check')),
      variables: model.collections.reduce((total, item) => total + item.variables.length, 0),
      skipped: model.skipped,
    }
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  } else if (command === 'read') {
    writeFileSync(
      values.out ?? fail('pass --out <file>'),
      buildReadScript(Number(values.page ?? 1))
    )
  } else if (command === 'diff') {
    const figmaFiles = values.figma ?? fail('pass --figma <read-result.json> for every page')
    const pages = figmaFiles.map(file => JSON.parse(readFileSync(file, 'utf8')) as PackedSnapshot)
    const figma = unpackSnapshot(mergeSnapshots(pages))
    process.stdout.write(formatDiff(diffTokens(project(values), figma)))
  } else {
    fail('commands: sync, read, diff')
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
