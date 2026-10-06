import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { createFakeFigma } from './fake-figma'

const cli = resolve(__dirname, '../dist/cli.js')
const tokens = resolve(__dirname, 'fixtures/project-tokens')
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

  it('explains a missing input', () => {
    expect(() => run('sync', '--out', temp('figma-'))).toThrow(/--tokens <dir> or --model <json>/)
  })
})
