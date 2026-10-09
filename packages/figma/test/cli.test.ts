import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { createFakeFigma } from './fake-figma'
import { createFakeNodes } from './fake-nodes'

const cli = resolve(__dirname, '../dist/cli.js')
const tokens = resolve(__dirname, 'fixtures/project-tokens')
const components = resolve(__dirname, '../generated/atom63.figma-components.json')
const atom63Sync = resolve(__dirname, '../../styles/generated/atom63.figma-sync.json')
const run = (...args: string[]) =>
  execFileSync('node', [cli, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const temp = (prefix: string) => mkdtempSync(join(tmpdir(), prefix))

describe('atom63-figma', () => {
  it('writes sync and check scripts, and the sync scripts bring Figma in line', async () => {
    const out = temp('figma-')
    const summary = JSON.parse(run('sync', '--tokens', tokens, '--out', out)) as {
      scripts: string[]
      checks: string[]
      styles: { text: number; effects: number }
    }
    expect(readdirSync(out).sort()).toEqual([...summary.checks, ...summary.scripts].sort())
    expect(summary.styles.text).toBeGreaterThan(0)
    expect(summary.styles.effects).toBeGreaterThan(0)
    const { run: execute, textStyles, effectStyles } = createFakeFigma()
    for (const file of summary.scripts)
      expect(await execute(readFileSync(join(out, file), 'utf8'))).toMatchObject({
        verification: { create: 0, update: 0 },
      })
    expect(textStyles).toHaveLength(summary.styles.text)
    expect(effectStyles).toHaveLength(summary.styles.effects)
    for (const file of summary.checks)
      expect(await execute(readFileSync(join(out, file), 'utf8'))).toMatchObject({
        planned: { create: 0, update: 0 },
      })
  })

  it('removes scripts an earlier, larger run left behind', () => {
    const out = temp('figma-')
    writeFileSync(join(out, 'sync-9.js'), 'stale')
    writeFileSync(join(out, 'check-9.js'), 'stale')
    writeFileSync(join(out, 'notes.txt'), 'kept')
    run('sync', '--tokens', tokens, '--out', out)
    expect(readdirSync(out)).not.toContain('sync-9.js')
    expect(readdirSync(out)).not.toContain('check-9.js')
    expect(readdirSync(out)).toContain('notes.txt')
  })

  it('reports a relative color it cannot compute, and syncs the rest', () => {
    const dir = temp('tokens-')
    writeFileSync(
      join(dir, 'tokens.css'),
      ':root { --blue: #2563eb; --on-blue: lab(from var(--blue) 90 a b); }'
    )
    const summary = JSON.parse(run('sync', '--tokens', dir, '--out', temp('figma-'))) as {
      variables: number
      skipped: { token: string; reason: string }[]
    }
    expect(summary.variables).toBe(1)
    expect(summary.skipped).toEqual([expect.objectContaining({ token: '--on-blue' })])
  })

  it('reads a file page by page and diffs the pages against the code', async () => {
    const out = temp('figma-')
    const { run: execute } = createFakeFigma()
    const files: string[] = []
    for (let page = 1; ; page++) {
      run('read', '--page', String(page), '--out', join(out, `read-${page}.js`))
      const result = (await execute(readFileSync(join(out, `read-${page}.js`), 'utf8'))) as {
        pages: number
      }
      writeFileSync(join(out, `figma-${page}.json`), JSON.stringify(result))
      files.push('--figma', join(out, `figma-${page}.json`))
      if (page >= result.pages) break
    }
    expect(run('diff', '--tokens', tokens, ...files)).toContain('Not in Figma yet')
  })

  it('writes component scripts that build the Button set on synced tokens', async () => {
    const out = temp('figma-')
    writeFileSync(join(out, 'components-9.js'), 'stale')
    writeFileSync(join(out, 'components-check-9.js'), 'stale')
    writeFileSync(join(out, 'sync-1.js'), 'kept')
    const summary = JSON.parse(run('components', '--model', components, '--out', out)) as {
      scripts: string[]
      checks: string[]
      variants: number
      tokens: number
      literals: number
      skipped: { what: string; reason: string }[]
    }
    expect(readdirSync(out).sort()).toEqual(
      [...summary.checks, ...summary.scripts, 'sync-1.js'].sort()
    )
    expect(summary.scripts[0]).toBe('components-1.js')
    expect(summary.checks[0]).toBe('components-check-1.js')
    expect(summary.variants).toBe(300)
    expect(summary.tokens).toBeGreaterThan(0)
    expect(summary.literals).toBeGreaterThan(0)
    expect(summary.skipped.length).toBeGreaterThan(0)

    const tokenOut = temp('figma-')
    const tokenSummary = JSON.parse(run('sync', '--model', atom63Sync, '--out', tokenOut)) as {
      scripts: string[]
    }
    const fake = createFakeNodes()
    for (const file of tokenSummary.scripts)
      await fake.run(readFileSync(join(tokenOut, file), 'utf8'))
    for (const file of summary.scripts) {
      const script = readFileSync(join(out, file), 'utf8')
      expect(script.length).toBeLessThan(49_000)
      expect(await fake.run(script)).toMatchObject({
        verification: { missingVariables: [], create: 0, update: 0 },
      })
    }
    let unchanged = 0
    for (const file of summary.checks)
      unchanged += (
        (await fake.run(readFileSync(join(out, file), 'utf8'))) as {
          planned: { unchanged: number }
        }
      ).planned.unchanged
    expect(unchanged).toBe(summary.variants)
  }, 60_000)

  it('explains a missing component model', () => {
    expect(() => run('components', '--out', temp('figma-'))).toThrow(/--model <json>/)
  })

  it('refuses a file that is not a component model', () => {
    const out = resolve(__dirname, '../.never-written')
    for (const model of [atom63Sync, resolve(__dirname, '../package.json')])
      expect(() => run('components', '--model', model, '--out', out)).toThrow(
        /is not a component model \(schemaVersion 2 with a variants array\)/
      )
  })

  it('lists the commands', () => {
    expect(() => run('nope')).toThrow(/sync, components, read, diff/)
  })

  it('explains a missing input', () => {
    expect(() => run('sync', '--out', temp('figma-'))).toThrow(/--tokens <dir> or --model <json>/)
  })
})
