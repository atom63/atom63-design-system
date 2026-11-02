import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  blindArms,
  duration,
  judgePrompt,
  parseJudgeOutput,
  renderReport,
  totals,
  visualCriteria,
} from './vibe-report.mjs'

const scores = ratio =>
  visualCriteria.map(({ id, max }) => ({
    criterion: id,
    score: Math.round(max * ratio),
    evidence: `Visible evidence for ${id}.`,
  }))

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

  it('supports the three benchmark arms', () => {
    assert.deepEqual(
      blindArms(['plain', 'ds-core', 'ds-guided'], () => 0.9),
      {
        A: 'plain',
        B: 'ds-core',
        C: 'ds-guided',
      }
    )
  })
})

describe('judgePrompt', () => {
  it('names the labels, screenshots, brief and every visual criterion, but not the arms', () => {
    const prompt = judgePrompt({
      brief: { title: 'Sign in', body: 'A sign-in card.' },
      labels: ['A', 'B'],
      states: ['empty', 'complete'],
      hasReference: true,
    })
    assert.match(prompt, /A\/empty\/desktop\.png/)
    assert.match(prompt, /B\/complete\/phone\.png/)
    assert.match(prompt, /A sign-in card\./)
    for (const { id } of visualCriteria) assert.ok(prompt.includes(`\`${id}\``), id)
    assert.doesNotMatch(prompt, /source\/|\.tsx|token|\bds\b|\bplain\b|atom63|design system/i)
  })
})

describe('visual-only rubric', () => {
  it('allocates exactly 100 points to visual criteria', () => {
    assert.deepEqual(
      visualCriteria.map(({ id, max }) => [id, max]),
      [
        ['reference-fidelity', 35],
        ['hierarchy-composition', 20],
        ['density-spacing-alignment', 15],
        ['type-color-surfaces', 15],
        ['responsive-adaptation', 10],
        ['product-specificity', 5],
      ]
    )
    assert.equal(
      visualCriteria.reduce((sum, criterion) => sum + criterion.max, 0),
      100
    )
  })

  it('shows only the target, brief and anonymous screenshots to the judge', () => {
    const prompt = judgePrompt({
      brief: { title: 'Contacts', body: 'A CRM workspace.' },
      labels: ['A', 'B'],
      states: ['complete'],
      hasReference: true,
    })
    assert.match(prompt, /target-desktop\.png/)
    assert.match(prompt, /A\/complete\/desktop\.png/)
    assert.match(prompt, /reference-fidelity/)
    assert.doesNotMatch(prompt, /source\/|\.tsx|token|atom63|design system|\bds\b|\bplain\b/i)
  })
})

describe('parseJudgeOutput', () => {
  const reply = JSON.stringify({ A: scores(1), B: scores(0.7) })

  it('validates each label against the rubric', () => {
    const parsed = parseJudgeOutput(reply, ['A', 'B'])
    assert.equal(parsed.A.total, 100)
    assert.equal(parsed.B.total, 72)
  })

  it('accepts a code fence or prose around the object', () => {
    const parsed = parseJudgeOutput(`Here you go:\n\`\`\`json\n${reply}\n\`\`\`\n`, ['A', 'B'])
    assert.equal(parsed.B.total, 72)
  })

  it('rejects missing labels, missing criteria and bad scores', () => {
    assert.throws(() => parseJudgeOutput(JSON.stringify({ A: scores(1) }), ['A', 'B']), /for B/)
    assert.throws(
      () => parseJudgeOutput(JSON.stringify({ A: scores(1).slice(1) }), ['A']),
      /Missing visual criterion/
    )
    const tooHigh = scores(1)
    tooHigh[0].score = 36
    assert.throws(() => parseJudgeOutput(JSON.stringify({ A: tooHigh }), ['A']), /0 to 35/)
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
    durationMs: 120_000,
    turns: 1,
    stopReason: 'completed',
    failedTools: 0,
    models: ['gpt-test'],
    usage: { inputTokens: 1200, cachedInputTokens: 800, outputTokens: 300 },
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
  codexVersion: 'codex-cli 0.149.0',
  modelFlag: null,
  models: ['gpt-test'],
  arms: ['ds', 'plain'],
  limits: { agentTimeoutMs: 2_700_000 },
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
          durationMs: 60_000,
          turns: 1,
          stopReason: 'completed',
          failedTools: 0,
          models: ['gpt-test'],
          usage: { inputTokens: 2000, cachedInputTokens: 1400, outputTokens: 400 },
        },
        scores: {
          ds: { total: 100, max: 100, scores: scores(1) },
          plain: { total: 72, max: 100, scores: scores(0.7) },
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
    assert.equal(ds.visual, 100)
    const plain = totals(run, 'plain')
    assert.equal(plain.share, 0)
    assert.equal(plain.palette, 2)
    assert.equal(plain.craft, 2)
  })
})

describe('renderReport', () => {
  const markdown = renderReport(run)

  it('has totals, a section per brief, the blinding, usage and the briefs', () => {
    assert.match(markdown, /^# Vibe report, 2026-09-26/)
    assert.match(markdown, /## Totals/)
    assert.match(markdown, /\| System-component share \| 75% \| 0% \|/)
    assert.match(markdown, /## Sign in \(`sign-in`\)/)
    assert.match(
      markdown,
      /plain \(React \+ Tailwind\) as A and ds \(Atom63, legacy guided arm\) as B/
    )
    assert.match(markdown, /\*\*100 of 100\*\* \(as B\)/)
    assert.match(markdown, /Visual score \(judged\)/)
    assert.match(markdown, /design-system leverage separately/)
    assert.match(markdown, /Implementation gates and DS leverage/)
    assert.match(
      markdown,
      /\| Builder, ds \(Atom63, legacy guided arm\) \| 1,200 \| 800 \| 300 \| 2m 0s \| 1 \|/
    )
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
          arms: { ds: run.briefs[0].arms.ds, plain: { status: 'error', error: 'codex exited 1' } },
          judge: { mapping: { A: 'ds' }, error: 'The judge returned no JSON object.' },
          thumbnails: [],
        },
      ],
    })
    assert.match(failed, /failed: codex exited 1/)
    assert.match(failed, /Not judged: The judge returned no JSON object\./)
  })
})
