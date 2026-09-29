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
    }
    expect(readdirSync(out).sort()).toEqual([...summary.checks, ...summary.scripts].sort())
    const { run: execute } = createFakeFigma()
    for (const file of summary.scripts)
      expect(await execute(readFileSync(join(out, file), 'utf8'))).toMatchObject({
        verification: { create: 0, update: 0 },
      })
    for (const file of summary.checks)
      expect(await execute(readFileSync(join(out, file), 'utf8'))).toMatchObject({
        planned: { create: 0, update: 0 },
      })
  })

  it('reports a relative color it cannot compute, and syncs the rest', () => {
    const dir = temp('tokens-')
    writeFileSync(
      join(dir, 'tokens.css'),
      ':root { --blue: #2563eb; --on-blue: oklch(from var(--blue) 0.98 0.01 h); }'
    )
    const summary = JSON.parse(run('sync', '--tokens', dir, '--out', temp('figma-'))) as {
      variables: number
      skipped: { token: string; reason: string }[]
    }
    expect(summary.variables).toBe(1)
    expect(summary.skipped).toEqual([expect.objectContaining({ token: '--on-blue' })])
  })

  it('diffs a read result against the code', async () => {
    const out = temp('figma-')
    run('read', '--out', join(out, 'read.js'))
    const { run: execute } = createFakeFigma()
    const figma = await execute(readFileSync(join(out, 'read.js'), 'utf8'))
    writeFileSync(join(out, 'figma.json'), JSON.stringify(figma))
    expect(run('diff', '--tokens', tokens, '--figma', join(out, 'figma.json'))).toContain(
      'Not in Figma yet'
    )
  })

  it('explains a missing input', () => {
    expect(() => run('sync', '--out', temp('figma-'))).toThrow(/--tokens <dir> or --model <json>/)
  })
})
