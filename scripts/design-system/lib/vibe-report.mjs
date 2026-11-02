/**
 * The judged half of the vibe runner (E4) and its report: blinding the arms,
 * the judge prompt, parsing and validating the judge's scores against the
 * visual rubric, and rendering `docs/design-system/audits/vibe-<date>.md`.
 */
import { captureFiles, captureViewports } from './vibe-projects.mjs'

export const visualCriteria = [
  {
    id: 'reference-fidelity',
    name: 'Reference fidelity',
    max: 35,
    guidance:
      'Region proportions, geometry, control placement, relative scale and overall resemblance to the desktop target.',
  },
  {
    id: 'hierarchy-composition',
    name: 'Hierarchy and composition',
    max: 20,
    guidance: 'Reading order, emphasis, grouping, balance and clarity of the primary task.',
  },
  {
    id: 'density-spacing-alignment',
    name: 'Density, spacing and alignment',
    max: 15,
    guidance:
      'Information density, repeated rhythm, shared edges, table alignment and absence of near misses.',
  },
  {
    id: 'type-color-surfaces',
    name: 'Typography, color and surfaces',
    max: 15,
    guidance:
      'Type roles, contrast, color restraint, borders, fills, shadows and surface coherence.',
  },
  {
    id: 'responsive-adaptation',
    name: 'Responsive visual adaptation',
    max: 10,
    guidance:
      'Priority and composition at 1024, 768 and 390 pixels without looking like a scaled desktop.',
  },
  {
    id: 'product-specificity',
    name: 'Product specificity',
    max: 5,
    guidance:
      'The result reads as a credible CRM workspace rather than a component gallery or generic dashboard.',
  },
]

export const armNames = {
  ds: 'ds (Atom63, legacy guided arm)',
  'ds-core': 'ds-core (Atom63 components and tokens)',
  'ds-guided': 'ds-guided (Atom63 templates and build kits)',
  plain: 'plain (React + Tailwind)',
}

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
 * The visual rubric as the judge reads it: a point budget and visible evidence
 * for each criterion.
 */
export function judgeRubricMarkdown() {
  return visualCriteria
    .map(
      criterion =>
        `## ${criterion.name} (\`${criterion.id}\`, 0–${criterion.max} points)\n\n${criterion.guidance}`
    )
    .join('\n\n')
}

/**
 * The judge prompt. The judge runs in a directory with one folder per label,
 * each holding one PNG per capture viewport. The target is at
 * `reference/target-desktop.png`; no source is present.
 * @param {{ brief: { title: string, body: string }, labels: string[], states?: string[], hasReference?: boolean }} options
 */
export function judgePrompt({ brief, labels, states = [], hasReference = false }) {
  const ids = visualCriteria.map(({ id }) => `\`${id}\``).join(', ')
  const example = Object.fromEntries(
    labels.map(label => [label, [{ criterion: visualCriteria[0].id, score: 28, evidence: '…' }]])
  )
  return [
    `You are a visual design judge reviewing anonymous user interfaces. There ${labels.length === 1 ? 'is one result, labelled' : `are ${labels.length} results, labelled`} ${labels.join(' and ')}. Score only what is visible in the images.`,
    '',
    ...(hasReference
      ? ['Use `reference/target-desktop.png` as the desktop fidelity target.']
      : ['There is no fidelity target; judge the visible product response to the brief.']),
    'Each result has a folder in the current directory:',
    '',
    ...labels.flatMap(label => [
      `- Full-page light-mode screenshots: ${captureFiles(states)
        .map(relative => {
          const viewport = relative.split('/').at(-1).replace('.png', '')
          return `\`${label}/${relative}\` (${captureViewports[viewport].width} px wide)`
        })
        .join(', ')}.`,
    ]),
    '',
    'Read the target and every screenshot before scoring. Do not infer implementation quality or technology.',
    '',
    '# Brief',
    '',
    `## ${brief.title}`,
    '',
    brief.body,
    '',
    '# Visual rubric',
    '',
    judgeRubricMarkdown(),
    '',
    '# Output',
    '',
    `Return only a JSON object, with no prose before or after it and no code fence. It has one key per label (${labels.join(', ')}). Each value is an array with exactly one entry per criterion id (${ids}): \`{ "criterion": "<id>", "score": <integer from 0 through that criterion's maximum>, "evidence": "<one or two sentences naming visible evidence>" }\`. The six scores total at most 100 points.`,
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
      const scores = parsed[label]
      if (!Array.isArray(scores))
        throw new TypeError(`The judge returned invalid scores for ${label}.`)
      const byId = new Map(scores.map(score => [score.criterion, score]))
      const normalized = visualCriteria.map(criterion => {
        const score = byId.get(criterion.id)
        if (!score) throw new TypeError(`Missing visual criterion ${criterion.id} for ${label}.`)
        if (!Number.isInteger(score.score) || score.score < 0 || score.score > criterion.max)
          throw new TypeError(
            `Visual score for ${criterion.id} must be an integer from 0 to ${criterion.max}.`
          )
        if (typeof score.evidence !== 'string' || !score.evidence.trim())
          throw new TypeError(`Visual evidence for ${criterion.id} is required.`)
        return { criterion: criterion.id, score: score.score, evidence: score.evidence.trim() }
      })
      if (scores.length !== visualCriteria.length)
        throw new TypeError(`The judge returned extra visual criteria for ${label}.`)
      return [
        label,
        {
          total: normalized.reduce((sum, score) => sum + score.score, 0),
          max: 100,
          scores: normalized,
        },
      ]
    })
  )
}

// Rendering ------------------------------------------------------------------

const percent = value =>
  value === null || value === undefined ? '–' : `${Math.round(value * 100)}%`
const tokens = value => value.toLocaleString('en-US')
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
    // Runs recorded before warnings existed have none.
    warnings: String(measures.warnings?.length ?? 0),
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
  { key: 'warnings', label: 'Warnings (`<Button>` without `variant`, more than one primary)' },
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
    visual: scored.reduce((total, summary) => total + summary.total, 0),
    visualMax: scored.reduce((total, summary) => total + summary.max, 0),
    judged: scored.length,
    inputTokens: sum(result => result.agent.usage.inputTokens),
    cachedInputTokens: sum(result => result.agent.usage.cachedInputTokens),
    outputTokens: sum(result => result.agent.usage.outputTokens),
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
    `- **Model:** ${run.models.length ? run.models.map(model => `\`${model}\``).join(', ') : 'the Codex CLI default'}${run.modelFlag ? ` (\`--model ${run.modelFlag}\`)` : ''}`,
    `- **Runtime:** ${run.codexVersion}, headless (\`codex exec\`), ${Math.round(run.limits.agentTimeoutMs / 60_000)}-minute timeout per agent`,
    `- **Track:** \`${run.track ?? 'generalization'}\``,
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
          'Visual score (judged)',
          ...arms.map(arm => {
            const total = totals(run, arm)
            return total.judged ? `${total.visual} of ${total.visualMax}` : '–'
          }),
        ],
        ['Builder input tokens', ...arms.map(arm => tokens(totals(run, arm).inputTokens))],
        [
          'Builder cached input tokens',
          ...arms.map(arm => tokens(totals(run, arm).cachedInputTokens)),
        ],
        ['Builder output tokens', ...arms.map(arm => tokens(totals(run, arm).outputTokens))],
        ['Builder time', ...arms.map(arm => duration(totals(run, arm).durationMs))],
      ]
    ),
    '',
    'The visual score is judged from the anonymous screenshots and reference target only. The remaining rows report implementation gates and design-system leverage separately.',
  ]

  for (const entry of run.briefs) {
    const { brief, judge } = entry
    out.push('', `## ${brief.title} (\`${brief.id}\`)`, '')
    out.push('### Implementation gates and DS leverage', '')
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

    out.push('', '### Visual score', '')
    if (!judge || judge.error) {
      out.push(`Not judged${judge?.error ? `: ${judge.error}` : ''}.`)
    } else {
      const byLabel = Object.fromEntries(
        Object.entries(judge.mapping).map(([label, arm]) => [arm, label])
      )
      out.push(
        `The visual judge saw ${Object.entries(judge.mapping)
          .map(([label, arm]) => `${armNames[arm] ?? arm} as ${label}`)
          .join(' and ')}. Scores total 100 points and use visible evidence only.`,
        '',
        table(
          ['Criterion', ...heading],
          [
            ...visualCriteria.map(criterion => [
              `${criterion.name} (${criterion.max})`,
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
                return summary ? `**${summary.total} of ${summary.max}** (as ${byLabel[arm]})` : '–'
              }),
            ],
          ]
        )
      )
    }

    out.push('', '### Usage and time', '')
    out.push(
      table(
        [
          'Run',
          'Input tokens',
          'Cached input',
          'Output tokens',
          'Time',
          'Turns',
          'Stop',
          'Failed tools',
        ],
        [
          ...arms.map(arm => {
            const agent = entry.arms[arm]?.agent
            return agent
              ? [
                  `Builder, ${armNames[arm] ?? arm}`,
                  tokens(agent.usage.inputTokens),
                  tokens(agent.usage.cachedInputTokens),
                  tokens(agent.usage.outputTokens),
                  duration(agent.durationMs),
                  String(agent.turns),
                  agent.stopReason,
                  String(agent.failedTools),
                ]
              : [`Builder, ${armNames[arm] ?? arm}`, '–', '–', '–', '–', '–', '–', '–']
          }),
          judge?.agent
            ? [
                'Visual judge',
                tokens(judge.agent.usage.inputTokens),
                tokens(judge.agent.usage.cachedInputTokens),
                tokens(judge.agent.usage.outputTokens),
                duration(judge.agent.durationMs),
                String(judge.agent.turns),
                judge.agent.stopReason,
                String(judge.agent.failedTools),
              ]
            : ['Visual judge', '–', '–', '–', '–', '–', '–', '–'],
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
    'Each builder got the brief inside this prompt, identical for every arm:',
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
