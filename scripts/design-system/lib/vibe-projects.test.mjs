import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { scanCss, scanSource } from './craft-rules.mjs'
import {
  builderPrompt,
  captureFiles,
  captureViewports,
  codexBuilderArgs,
  codexJudgeArgs,
  coreAgentGuide,
  formatCommand,
  parseBrief,
  parseReferenceStates,
  planPlainProject,
  plainDependencies,
  plainDevDependencies,
  summarizeCodexEvents,
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

  it('points a reference reconstruction at the copied reference pack', () => {
    const prompt = builderPrompt(
      { id: 'crm-contacts', title: 'Contacts', body: 'A contact workspace.' },
      { track: 'reference' }
    )
    assert.match(prompt, /reference reconstruction/i)
    assert.match(prompt, /\.vibe\/reference\/target-desktop\.svg/)
    assert.match(prompt, /\.vibe\/reference\/layout\.md/)
    assert.match(prompt, /Do not embed the target image/)
  })
})

describe('captureViewports', () => {
  it('covers primary desktop, constrained desktop, tablet and phone', () => {
    assert.deepEqual(Object.keys(captureViewports), ['desktop', 'compact', 'tablet', 'phone'])
    assert.deepEqual(captureViewports.desktop, { width: 1440, height: 960 })
    assert.deepEqual(captureViewports.phone, { width: 390, height: 844 })
  })
})

describe('reference captures', () => {
  it('parses table state ids and expands every state across every viewport', () => {
    const states = parseReferenceStates(
      '| State | Result |\n| --- | --- |\n| `empty` | Empty |\n| `complete` | Done |'
    )
    assert.deepEqual(states, ['empty', 'complete'])
    assert.deepEqual(captureFiles(states), [
      'empty/desktop.png',
      'empty/compact.png',
      'empty/tablet.png',
      'empty/phone.png',
      'complete/desktop.png',
      'complete/compact.png',
      'complete/tablet.png',
      'complete/phone.png',
    ])
  })
})

describe('coreAgentGuide', () => {
  it('keeps component guidance while removing templates and build kits', () => {
    const guide = coreAgentGuide(
      '# App\n\n<!-- atom63:agents:start -->\nold\n<!-- atom63:agents:end -->'
    )
    assert.match(guide, /atom63 component/)
    assert.match(guide, /atom63 token/)
    assert.doesNotMatch(guide, /atom63 (?:build|template|copy)/)
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

describe('codexBuilderArgs', () => {
  const options = { prompt: 'Build it', cliBin: '/repo/cli.mjs' }

  it('runs ephemeral and sandboxed without user config or Claude flags', () => {
    const args = codexBuilderArgs({ ...options, arm: 'plain' })
    assert.equal(args[0], 'exec')
    assert.ok(args.includes('--ignore-user-config'))
    assert.ok(args.includes('--ephemeral'))
    assert.equal(value(args, '--sandbox'), 'workspace-write')
    assert.ok(args.includes('--json'))
    assert.ok(args.includes('--skip-git-repo-check'))
    assert.equal(args.at(-1), 'Build it')
    assert.ok(!args.some(arg => /max-budget|permission-mode|allowedTools/.test(arg)))
    assert.ok(!args.includes('--model'))
  })

  it('gives guided and core DS arms different server-side Atom63 access', () => {
    const guided = codexBuilderArgs({ ...options, arm: 'ds-guided', model: 'gpt-test' })
    assert.ok(guided.some(arg => arg.includes('mcp_servers.atom63.command')))
    assert.ok(!guided.some(arg => arg.includes('ATOM63_MCP_TOOLS')))
    assert.equal(value(guided, '--model'), 'gpt-test')

    const core = codexBuilderArgs({ ...options, arm: 'ds-core' })
    const filter = core.find(arg => arg.includes('ATOM63_MCP_TOOLS'))
    assert.match(filter, /component,example,token,rules,manifest/)
    assert.doesNotMatch(filter, /build|template|search/)

    const plain = codexBuilderArgs({ ...options, arm: 'plain' })
    assert.ok(!plain.some(arg => arg.includes('mcp_servers.atom63')))
  })
})

describe('codexJudgeArgs', () => {
  it('can only read files', () => {
    const args = codexJudgeArgs({ prompt: 'Score', outputPath: '/judge/result.json' })
    assert.equal(value(args, '--sandbox'), 'read-only')
    assert.equal(value(args, '--output-last-message'), '/judge/result.json')
    assert.equal(args.at(-1), 'Score')
    assert.ok(!args.some(arg => arg.includes('mcp_servers.')))
  })
})

describe('formatCommand', () => {
  it('quotes arguments and shortens long ones', () => {
    const line = formatCommand('codex', ['exec', 'it’s long '.repeat(20), '--json'])
    assert.match(line, /^codex exec '/)
    assert.match(line, /\.\.\.'/)
    assert.match(line, /--json$/)
  })
})

describe('summarizeCodexEvents', () => {
  it('keeps token usage, duration, model and tool failures', () => {
    const summary = summarizeCodexEvents(
      [
        { type: 'item.completed', item: { type: 'command_execution', status: 'failed' } },
        {
          type: 'turn.completed',
          usage: { input_tokens: 1200, cached_input_tokens: 800, output_tokens: 300 },
        },
      ],
      { durationMs: 90_000, model: 'gpt-test' }
    )
    assert.deepEqual(summary, {
      durationMs: 90_000,
      models: ['gpt-test'],
      failedTools: 1,
      stopReason: 'completed',
      turns: 1,
      usage: { inputTokens: 1200, cachedInputTokens: 800, outputTokens: 300 },
    })
  })
})
