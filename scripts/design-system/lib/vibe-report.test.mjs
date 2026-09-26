import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { craftCriteria } from './craft-rubric.mjs'
import {
  blindArms,
  duration,
  judgePrompt,
  parseJudgeOutput,
  renderReport,
  totals,
} from './vibe-report.mjs'

const scores = score =>
  craftCriteria.map(({ id }) => ({ criterion: id, score, evidence: `Evidence for ${id}.` }))

describe('blindArms', () => {
  it('labels every arm once, in an order set by the random source', () => {
    assert.deepEqual(
      blindArms(['ds', 'plain'], () => 0.9),
      { A: 'ds', B: 'plain' }
    )
    assert.deepEqual(
      blindArms(['ds', 'plain'], () => 0),
      { A: 'plain', B: 'ds' }
    )
    assert.deepEqual(blindArms(['plain']), { A: 'plain' })
  })
})

describe('judgePrompt', () => {
  it('names the labels, the files, the brief and every criterion, but not the arms', () => {
    const prompt = judgePrompt({
      brief: { title: 'Sign in', body: 'A sign-in card.' },
      labels: ['A', 'B'],
      sources: { A: ['src/pages/sign-in.tsx'], B: ['src/App.tsx'] },
    })
    assert.match(prompt, /A\/desktop\.png/)
    assert.match(prompt, /B\/mobile\.png/)
    assert.match(prompt, /`src\/pages\/sign-in\.tsx`/)
    assert.match(prompt, /A sign-in card\./)
    for (const { id } of craftCriteria) assert.ok(prompt.includes(`\`${id}\``), id)
    assert.doesNotMatch(prompt, /\bds\b|\bplain\b|atom63|design system/i)
  })
})

describe('parseJudgeOutput', () => {
  const reply = JSON.stringify({ A: scores(3), B: scores(2) })

  it('validates each label against the rubric', () => {
    const parsed = parseJudgeOutput(reply, ['A', 'B'])
    assert.equal(parsed.A.total, craftCriteria.length * 3)
    assert.equal(parsed.B.passed, true)
  })

  it('accepts a code fence or prose around the object', () => {
    const parsed = parseJudgeOutput(`Here you go:\n\`\`\`json\n${reply}\n\`\`\`\n`, ['A', 'B'])
    assert.equal(parsed.B.total, craftCriteria.length * 2)
  })

  it('rejects missing labels, missing criteria and bad scores', () => {
    assert.throws(() => parseJudgeOutput(JSON.stringify({ A: scores(3) }), ['A', 'B']), /for B/)
    assert.throws(
      () => parseJudgeOutput(JSON.stringify({ A: scores(3).slice(1) }), ['A']),
      /Missing craft criteria/
    )
    assert.throws(() => parseJudgeOutput(JSON.stringify({ A: scores(4) }), ['A']), /1, 2 or 3/)
    assert.throws(() => parseJudgeOutput('I cannot score these.', ['A']), /no JSON/)
  })
})

describe('duration', () => {
  it('formats seconds and minutes', () => {
    assert.equal(duration(42_400), '42s')
    assert.equal(duration(185_000), '3m 5s')
  })
})

const armResult = ({ system, html, craft = 0, palette = [], build = true }) => ({
  status: 'ok',
  agent: {
    costUsd: 1.25,
    durationMs: 120_000,
    turns: 20,
    stopReason: 'success',
    permissionDenials: [],
    models: ['claude-test'],
  },
  files: { added: ['src/pages/sign-in.tsx'], changed: ['src/router.tsx'], removed: [] },
  measures: {
    craft: Array.from({ length: craft }, () => ({ rule: 'raw-color' })),
    jsx: { system, thirdParty: 0, icons: 1, local: 0, interactiveHtml: html, otherHtml: 4 },
    lines: 120,
    literals: { paletteUtilities: palette, literalColors: [] },
    share: system + html ? system / (system + html) : null,
  },
  typecheck: { ok: true, errors: 0 },
  build: { ok: build },
  axe: { violations: [{ id: 'region', impact: 'moderate', nodes: 2 }], nodes: 2 },
})

const run = {
  date: '2026-09-26',
  commit: 'abc123',
  dirty: false,
  claudeVersion: '2.1.0 (Claude Code)',
  modelFlag: null,
  models: ['claude-test'],
  arms: ['ds', 'plain'],
  limits: { builderTurns: 80, builderBudgetUsd: 5, judgeTurns: 30, judgeBudgetUsd: 2 },
  promptTemplate: 'Build <brief>',
  briefs: [
    {
      brief: { id: 'sign-in', title: 'Sign in', markdown: '# Sign in\n\nA card.' },
      arms: {
        ds: armResult({ system: 6, html: 2 }),
        plain: armResult({
          system: 0,
          html: 5,
          craft: 2,
          palette: ['bg-blue-500', 'text-gray-600'],
        }),
      },
      judge: {
        mapping: { A: 'plain', B: 'ds' },
        agent: {
          costUsd: 0.4,
          durationMs: 60_000,
          turns: 5,
          stopReason: 'success',
          permissionDenials: [],
          models: ['claude-test'],
        },
        scores: {
          ds: { total: 21, max: 21, passed: true, scores: scores(3) },
          plain: { total: 14, max: 21, passed: true, scores: scores(2) },
        },
      },
      thumbnails: ['vibe/2026-09-26/sign-in-ds-desktop.jpg'],
    },
  ],
}

describe('totals', () => {
  it('adds the measures of every brief per arm', () => {
    const ds = totals(run, 'ds')
    assert.equal(ds.share, 0.75)
    assert.equal(ds.rubric, 21)
    const plain = totals(run, 'plain')
    assert.equal(plain.share, 0)
    assert.equal(plain.palette, 2)
    assert.equal(plain.craft, 2)
  })
})

describe('renderReport', () => {
  const markdown = renderReport(run)

  it('has totals, a section per brief, the blinding, costs and the briefs', () => {
    assert.match(markdown, /^# Vibe report, 2026-09-26/)
    assert.match(markdown, /## Totals/)
    assert.match(markdown, /\| System-component share \| 75% \| 0% \|/)
    assert.match(markdown, /## Sign in \(`sign-in`\)/)
    assert.match(markdown, /plain \(React \+ Tailwind\) as A and ds \(Atom63\) as B/)
    assert.match(markdown, /\*\*21 of 21\*\*, pass \(as B\)/)
    assert.match(markdown, /\| Builder, ds \(Atom63\) \| \$1\.25 \| 2m 0s \| 20 \|/)
    assert.match(markdown, /`abc123`/)
    assert.match(markdown, /```markdown\n# Sign in\n\nA card\.\n```/)
    assert.match(markdown, /sign-in-ds-desktop\.jpg/)
  })

  it('reports an arm that failed and a judge that did not run', () => {
    const failed = renderReport({
      ...run,
      briefs: [
        {
          ...run.briefs[0],
          arms: { ds: run.briefs[0].arms.ds, plain: { status: 'error', error: 'claude exited 1' } },
          judge: { mapping: { A: 'ds' }, error: 'The judge returned no JSON object.' },
          thumbnails: [],
        },
      ],
    })
    assert.match(failed, /failed: claude exited 1/)
    assert.match(failed, /Not judged: The judge returned no JSON object\./)
  })
})
