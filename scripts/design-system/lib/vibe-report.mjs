/**
 * The judged half of the vibe runner (E4) and its report: blinding the arms,
 * the judge prompt, parsing and validating the judge's scores against the
 * craft rubric, and rendering `docs/design-system/audits/vibe-<date>.md`.
 */
import { craftCriteria, summarizeCraftScores } from './craft-rubric.mjs'

export const armNames = { ds: 'ds (Atom63)', plain: 'plain (React + Tailwind)' }

/**
 * Random labels for the arms, so the judge cannot tell which is which from the
 * order or the name. Returns label → arm.
 * @param {string[]} arms
 * @param {() => number} random a number in [0, 1)
 */
export function blindArms(arms, random = Math.random) {
  const shuffled = [...arms]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return Object.fromEntries(shuffled.map((arm, index) => [String.fromCharCode(65 + index), arm]))
}

/**
 * The rubric as the judge reads it: each criterion's definition, levels and
 * what is left to judgment. The "checked automatically" notes describe this
 * repo's CI and are left out.
 */
export function judgeRubricMarkdown() {
  return craftCriteria
    .map(criterion =>
      [
        `## ${criterion.name} (\`${criterion.id}\`)`,
        '',
        criterion.definition,
        '',
        ...[3, 2, 1].map(score => `- **${score}:** ${criterion.levels[score]}`),
        '',
        `Judge especially: ${criterion.judged}`,
      ].join('\n')
    )
    .join('\n\n')
}

/**
 * The judge prompt. The judge runs in a directory with one folder per label,
 * each holding `desktop.png`, `mobile.png` and `source/`.
 * @param {{ brief: { title: string, body: string }, labels: string[], sources: Record<string, string[]> }} options
 */
export function judgePrompt({ brief, labels, sources }) {
  const ids = craftCriteria.map(({ id }) => `\`${id}\``).join(', ')
  const example = Object.fromEntries(
    labels.map(label => [label, [{ criterion: craftCriteria[0].id, score: 2, evidence: '…' }]])
  )
  return [
    `You are reviewing user interfaces built from one product brief. There ${labels.length === 1 ? 'is one result, labelled' : `are ${labels.length} results, labelled`} ${labels.join(' and ')}. Score each result against the craft rubric below, on its own merits.`,
    '',
    'Each result has a folder in the current directory:',
    '',
    ...labels.flatMap(label => [
      `- \`${label}/desktop.png\` (1280 px wide) and \`${label}/mobile.png\` (375 px wide): full-page screenshots in light mode.`,
      `- \`${label}/source/\`: the files the author added or changed: ${sources[label].map(file => `\`${file}\``).join(', ') || '(none)'}.`,
    ]),
    '',
    'Read both screenshots and every source file of each result before you score it. Judge what the page shows and what the code does.',
    '',
    '# Brief',
    '',
    `## ${brief.title}`,
    '',
    brief.body,
    '',
    '# Craft rubric',
    '',
    judgeRubricMarkdown(),
    '',
    '# Output',
    '',
    `Return only a JSON object, with no prose before or after it and no code fence. It has one key per label (${labels.join(', ')}). Each value is an array with exactly one entry per criterion id (${ids}): \`{ "criterion": "<id>", "score": 1 | 2 | 3, "evidence": "<one or two sentences>" }\`. The evidence names what in the result earned the score (an element, a class, a state), not an opinion.`,
    '',
    `Shape: ${JSON.stringify(example)}`,
  ].join('\n')
}

/**
 * Parses the judge's reply and validates each label's scores with the rubric.
 * Accepts a bare object or one wrapped in a code fence or stray prose.
 * @param {string} text
 * @param {string[]} labels
 */
export function parseJudgeOutput(text, labels) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end <= start) throw new TypeError('The judge returned no JSON object.')
  const parsed = JSON.parse(candidate.slice(start, end + 1))
  return Object.fromEntries(
    labels.map(label => {
      if (!(label in parsed)) throw new TypeError(`The judge returned no scores for ${label}.`)
      return [label, summarizeCraftScores(parsed[label])]
    })
  )
}

// Rendering ------------------------------------------------------------------

const percent = value =>
  value === null || value === undefined ? '–' : `${Math.round(value * 100)}%`
const dollars = value => `$${value.toFixed(2)}`
export const duration = ms => {
  const seconds = Math.round(ms / 1000)
  return seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`
}
const escapeCell = text => String(text).replaceAll('|', '\\|').replaceAll('\n', ' ')
const excerpt = (text, length = 180) =>
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text

/** One row of the measures table for one arm result, or `–` when it did not run. */
function measureCells(arm) {
  if (!arm || arm.status !== 'ok') {
    const reason = arm?.error ? `failed: ${excerpt(arm.error, 60)}` : 'not run'
    return Object.fromEntries(measureRows.map(({ key }) => [key, key === 'files' ? reason : '–']))
  }
  const { measures, typecheck, build, axe, files } = arm
  const jsx = measures.jsx
  return {
    files: `${files.added.length} added, ${files.changed.length} changed (${measures.lines} lines)`,
    craft: String(measures.craft.length),
    typecheck: String(typecheck.errors),
    build: build.ok ? 'pass' : 'fail',
    axe: axe.error
      ? `error: ${excerpt(axe.error, 60)}`
      : `${axe.violations.length} rules, ${axe.nodes} nodes`,
    share: `${percent(measures.share)} (${jsx.system} of ${jsx.system + jsx.thirdParty + jsx.interactiveHtml})`,
    elements: `${jsx.system} system, ${jsx.thirdParty} third-party, ${jsx.interactiveHtml} interactive HTML, ${jsx.otherHtml} other HTML, ${jsx.local} local, ${jsx.icons} icons`,
    palette: String(measures.literals.paletteUtilities.length),
    literal: String(measures.literals.literalColors.length),
  }
}

const measureRows = [
  { key: 'files', label: 'Files' },
  { key: 'craft', label: 'Craft violations (`check:craft` rules)' },
  { key: 'typecheck', label: 'Type errors (`tsc --noEmit`)' },
  { key: 'build', label: '`vite build`' },
  { key: 'axe', label: 'axe violations' },
  { key: 'share', label: 'System-component share' },
  { key: 'elements', label: 'JSX elements' },
  { key: 'palette', label: 'Palette or arbitrary color utilities' },
  { key: 'literal', label: 'Literal colors (hex, `rgb()`, `oklch()`)' },
]

function table(header, rows) {
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n')
}

/** Totals over every brief for one arm. */
export function totals(run, arm) {
  const results = run.briefs.map(entry => entry.arms[arm]).filter(result => result?.status === 'ok')
  const scored = run.briefs.map(entry => entry.judge?.scores?.[arm]).filter(Boolean)
  const sum = pick => results.reduce((total, result) => total + pick(result), 0)
  const system = sum(result => result.measures.jsx.system)
  const denominator = sum(
    ({ measures: { jsx } }) => jsx.system + jsx.thirdParty + jsx.interactiveHtml
  )
  return {
    runs: results.length,
    craft: sum(result => result.measures.craft.length),
    typeErrors: sum(result => result.typecheck.errors),
    builds: sum(result => (result.build.ok ? 1 : 0)),
    axe: sum(result => (result.axe.error ? 0 : result.axe.violations.length)),
    share: denominator === 0 ? null : system / denominator,
    palette: sum(result => result.measures.literals.paletteUtilities.length),
    literal: sum(result => result.measures.literals.literalColors.length),
    rubric: scored.reduce((total, summary) => total + summary.total, 0),
    rubricMax: scored.reduce((total, summary) => total + summary.max, 0),
    rubricPasses: scored.filter(summary => summary.passed).length,
    judged: scored.length,
    costUsd: sum(result => result.agent.costUsd),
    durationMs: sum(result => result.agent.durationMs),
  }
}

/**
 * The Markdown report.
 * @param {any} run
 */
export function renderReport(run) {
  const arms = run.arms
  const heading = arms.map(arm => armNames[arm] ?? arm)
  const out = [
    `# Vibe report, ${run.date}`,
    '',
    'Generated by `pnpm vibe` (`scripts/design-system/vibe.mjs`); see `scripts/design-system/vibe/README.md` for how the runs are set up and how to read this report. The raw results are in ' +
      `\`docs/design-system/audits/vibe/vibe-${run.date}.json\`.`,
    '',
    `- **Commit:** \`${run.commit}\`${run.dirty ? ' (with uncommitted changes)' : ''}`,
    `- **Model:** ${run.models.length ? run.models.map(model => `\`${model}\``).join(', ') : 'the CLI default'}${run.modelFlag ? ` (\`--model ${run.modelFlag}\`)` : ' (the `claude` CLI default)'}`,
    `- **Runtime:** \`claude\` ${run.claudeVersion}, headless (\`claude -p\`), at most ${run.limits.builderTurns} turns and ${dollars(run.limits.builderBudgetUsd)} per builder, ${run.limits.judgeTurns} turns and ${dollars(run.limits.judgeBudgetUsd)} for the judge`,
    `- **Briefs:** ${run.briefs.map(({ brief }) => `\`${brief.id}\``).join(', ')}`,
    `- **Arms:** ${heading.join(', ')}`,
    '',
    '## Totals',
    '',
    table(
      ['Measure', ...heading],
      [
        ['Briefs built', ...arms.map(arm => String(totals(run, arm).runs))],
        ['Craft violations', ...arms.map(arm => String(totals(run, arm).craft))],
        ['Type errors', ...arms.map(arm => String(totals(run, arm).typeErrors))],
        [
          'Builds passing',
          ...arms.map(arm => `${totals(run, arm).builds} of ${totals(run, arm).runs}`),
        ],
        ['axe violations (rules)', ...arms.map(arm => String(totals(run, arm).axe))],
        ['System-component share', ...arms.map(arm => percent(totals(run, arm).share))],
        [
          'Palette or arbitrary color utilities',
          ...arms.map(arm => String(totals(run, arm).palette)),
        ],
        ['Literal colors', ...arms.map(arm => String(totals(run, arm).literal))],
        [
          'Craft rubric (judged)',
          ...arms.map(arm => {
            const total = totals(run, arm)
            return total.judged
              ? `${total.rubric} of ${total.rubricMax}; ${total.rubricPasses} of ${total.judged} pass`
              : '–'
          }),
        ],
        ['Builder cost', ...arms.map(arm => dollars(totals(run, arm).costUsd))],
        ['Builder time', ...arms.map(arm => duration(totals(run, arm).durationMs))],
      ]
    ),
    '',
    'A result passes the rubric when no criterion scores 1.',
  ]

  for (const entry of run.briefs) {
    const { brief, judge } = entry
    out.push('', `## ${brief.title} (\`${brief.id}\`)`, '')
    const cells = Object.fromEntries(arms.map(arm => [arm, measureCells(entry.arms[arm])]))
    out.push(
      table(
        ['Measure', ...heading],
        measureRows.map(({ key, label }) => [label, ...arms.map(arm => cells[arm][key])])
      )
    )

    const axeRules = arms.flatMap(arm =>
      (entry.arms[arm]?.axe?.violations ?? []).map(
        violation =>
          `${armNames[arm] ?? arm}: \`${violation.id}\` (${violation.impact}, ${violation.nodes} nodes)`
      )
    )
    if (axeRules.length) out.push('', `axe rules: ${axeRules.join('; ')}.`)

    out.push('', '### Craft rubric', '')
    if (!judge || judge.error) {
      out.push(`Not judged${judge?.error ? `: ${judge.error}` : ''}.`)
    } else {
      const byLabel = Object.fromEntries(
        Object.entries(judge.mapping).map(([label, arm]) => [arm, label])
      )
      out.push(
        `The judge saw ${Object.entries(judge.mapping)
          .map(([label, arm]) => `${armNames[arm] ?? arm} as ${label}`)
          .join(' and ')}. Scores are 1–3, with the judge's evidence.`,
        '',
        table(
          ['Criterion', ...heading],
          [
            ...craftCriteria.map(criterion => [
              criterion.name,
              ...arms.map(arm => {
                const score = judge.scores[arm]?.scores.find(
                  item => item.criterion === criterion.id
                )
                return score ? `**${score.score}**: ${excerpt(score.evidence)}` : '–'
              }),
            ]),
            [
              '**Total**',
              ...arms.map(arm => {
                const summary = judge.scores[arm]
                return summary
                  ? `**${summary.total} of ${summary.max}**, ${summary.passed ? 'pass' : 'fail'} (as ${byLabel[arm]})`
                  : '–'
              }),
            ],
          ]
        )
      )
    }

    out.push('', '### Cost and time', '')
    out.push(
      table(
        ['Run', 'Cost', 'Time', 'Turns', 'Stop', 'Denied tool calls'],
        [
          ...arms.map(arm => {
            const agent = entry.arms[arm]?.agent
            return agent
              ? [
                  `Builder, ${armNames[arm] ?? arm}`,
                  dollars(agent.costUsd),
                  duration(agent.durationMs),
                  String(agent.turns),
                  agent.stopReason,
                  String(agent.permissionDenials.length),
                ]
              : [`Builder, ${armNames[arm] ?? arm}`, '–', '–', '–', '–', '–']
          }),
          judge?.agent
            ? [
                'Judge',
                dollars(judge.agent.costUsd),
                duration(judge.agent.durationMs),
                String(judge.agent.turns),
                judge.agent.stopReason,
                String(judge.agent.permissionDenials.length),
              ]
            : ['Judge', '–', '–', '–', '–', '–'],
        ]
      )
    )
    if (entry.thumbnails?.length) {
      out.push(
        '',
        `Screenshots (JPEG thumbnails of the first screen): ${entry.thumbnails
          .map(file => `[${file.split('/').pop()}](${file})`)
          .join(', ')}.`
      )
    }
  }

  out.push(
    '',
    '## Briefs',
    '',
    'Each builder got the brief inside this prompt, identical for both arms:',
    '',
    '```text',
    run.promptTemplate,
    '```',
    ''
  )
  for (const { brief } of run.briefs) {
    out.push(`### \`${brief.id}\``, '', '```markdown', brief.markdown, '```', '')
  }
  return `${out.join('\n').trimEnd()}\n`
}
