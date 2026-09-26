import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { scanCss, scanSource } from './craft-rules.mjs'
import {
  builderArgs,
  builderPrompt,
  formatCommand,
  judgeArgs,
  parseBrief,
  planPlainProject,
  plainDependencies,
  plainDevDependencies,
  summarizeClaudeResult,
} from './vibe-projects.mjs'

const briefsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../vibe/briefs')
const value = (args, name) => args[args.indexOf(name) + 1]

describe('briefs', () => {
  const files = readdirSync(briefsDir).filter(file => file.endsWith('.md'))

  it('has 3 to 5 briefs in product language only', () => {
    assert.ok(files.length >= 3 && files.length <= 5)
    for (const file of files) {
      const brief = parseBrief(
        file.replace(/\.md$/, ''),
        readFileSync(path.join(briefsDir, file), 'utf8')
      )
      assert.ok(brief.title && brief.body, file)
    }
  })

  it('rejects a brief that mentions the design system', () => {
    assert.throws(() => parseBrief('x', '# X\n\nUse the Atom63 button.'), /design system/)
    assert.throws(() => parseBrief('x', 'No title'), /Title/)
  })
})

describe('builderPrompt', () => {
  it('asks for a page at the brief path and repeats the brief', () => {
    const prompt = builderPrompt({ id: 'sign-in', title: 'Sign in', body: 'A card.' })
    assert.match(prompt, /URL path `\/sign-in`/)
    assert.match(prompt, /## Sign in\n\nA card\./)
    assert.match(prompt, /`pnpm typecheck` and `pnpm build`/)
  })
})

describe('planPlainProject', () => {
  const versions = Object.fromEntries(
    [...plainDependencies, ...plainDevDependencies].map(name => [name, '^1.0.0'])
  )
  const files = planPlainProject({ name: 'vibe-plain', versions })

  it('is Vite, React, TypeScript and Tailwind with no design system or agent guidance', () => {
    const manifest = JSON.parse(files.get('package.json'))
    const all = { ...manifest.dependencies, ...manifest.devDependencies }
    assert.ok(all.react && all.vite && all.tailwindcss && all.typescript)
    assert.ok(!Object.keys(all).some(name => name.startsWith('@atom63/')))
    assert.ok(!files.has('AGENTS.md') && !files.has('CLAUDE.md') && !files.has('.mcp.json'))
    assert.equal(manifest.scripts.typecheck, 'tsc --noEmit')
  })

  it('starts clean under the craft rules', () => {
    for (const [relative, text] of files) {
      if (relative.endsWith('.css')) assert.deepEqual(scanCss(text), [], relative)
      if (relative.endsWith('.tsx')) assert.deepEqual(scanSource(text), [], relative)
    }
  })

  it('needs every version', () => {
    assert.throws(() => planPlainProject({ name: 'x', versions: {} }), /No version/)
  })
})

describe('builderArgs', () => {
  const options = { prompt: 'Build it', cliBin: '/repo/cli.mjs', maxTurns: 80, maxBudgetUsd: 5 }

  it('runs headless with an allowlist, never bypassing permissions', () => {
    const args = builderArgs({ ...options, arm: 'plain' })
    assert.equal(value(args, '-p'), 'Build it')
    assert.equal(value(args, '--output-format'), 'json')
    assert.equal(value(args, '--permission-mode'), 'dontAsk')
    assert.equal(value(args, '--setting-sources'), 'project,local')
    assert.equal(value(args, '--max-turns'), '80')
    assert.ok(args.includes('--strict-mcp-config'))
    assert.ok(args.includes('Bash(pnpm typecheck)'))
    assert.ok(!args.some(arg => /bypass|dangerously/i.test(arg)))
    assert.ok(!args.includes('--model'))
  })

  it('gives only the ds arm the atom63 MCP server', () => {
    const ds = builderArgs({ ...options, arm: 'ds', model: 'sonnet' })
    assert.deepEqual(JSON.parse(value(ds, '--mcp-config')), {
      mcpServers: { atom63: { command: 'node', args: ['/repo/cli.mjs', 'mcp'] } },
    })
    assert.ok(ds.includes('mcp__atom63'))
    assert.equal(value(ds, '--model'), 'sonnet')
    const plain = builderArgs({ ...options, arm: 'plain' })
    assert.deepEqual(JSON.parse(value(plain, '--mcp-config')), { mcpServers: {} })
    assert.ok(!plain.includes('mcp__atom63'))
  })
})

describe('judgeArgs', () => {
  it('can only read files', () => {
    const args = judgeArgs({ prompt: 'Score', maxTurns: 30, maxBudgetUsd: 2 })
    assert.equal(value(args, '--tools'), 'Read,Glob')
    assert.ok(!args.some(arg => /^(Edit|Write|Bash)/.test(arg)))
  })
})

describe('formatCommand', () => {
  it('quotes arguments and shortens long ones', () => {
    const line = formatCommand('claude', ['-p', 'it’s long '.repeat(20), 'Bash(pnpm build)'])
    assert.match(line, /^claude -p '/)
    assert.match(line, /\.\.\.'/)
    assert.match(line, /'Bash\(pnpm build\)'$/)
  })
})

describe('summarizeClaudeResult', () => {
  it('keeps cost, time, turns, models and denied tool calls', () => {
    const summary = summarizeClaudeResult({
      total_cost_usd: 1.5,
      duration_ms: 90_000,
      num_turns: 12,
      subtype: 'success',
      is_error: false,
      modelUsage: { 'claude-test': {} },
      permission_denials: [{ tool_name: 'Bash', tool_input: { command: 'ls /' } }],
    })
    assert.deepEqual(summary, {
      costUsd: 1.5,
      durationMs: 90_000,
      isError: false,
      models: ['claude-test'],
      permissionDenials: [{ tool: 'Bash', input: 'ls /' }],
      stopReason: 'success',
      turns: 12,
    })
  })
})
