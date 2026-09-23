import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')

const sourcePath = 'docs/design-system/benchmark-parity-source.json'
const jsonOutputPath = 'docs/design-system/audits/benchmark-parity.json'
const markdownOutputPath = 'docs/design-system/benchmark-parity.md'
const gateValues = ['blocker', 'warning', 'done']
const requiredDimensionFields = [
  'id',
  'label',
  'benchmarkSignals',
  'atom63Status',
  'currentEvidence',
  'gaps',
  'stableGate',
  'nextAction',
  'ownerLane',
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateStringArray(value, path, { allowEmpty = false } = {}) {
  assert(Array.isArray(value), `${path} must be an array`)
  if (!allowEmpty) assert(value.length > 0, `${path} must not be empty`)
  value.forEach((entry, index) => {
    assert(isNonEmptyString(entry), `${path}[${index}] must be a non-empty string`)
  })
}

function validateSource(source) {
  assert(source && typeof source === 'object', 'source must be an object')
  assert(source.schemaVersion === 1, 'schemaVersion must be 1')
  assert(isNonEmptyString(source.status), 'status must be a non-empty string')
  assert(isNonEmptyString(source.releasePosition), 'releasePosition must be a non-empty string')
  assert(
    /beta/i.test(source.releasePosition) && /not.+stable\/latest/i.test(source.releasePosition),
    'releasePosition must state that beta is not stable/latest'
  )
  assert(
    Array.isArray(source.benchmarkSystems) && source.benchmarkSystems.length > 0,
    'benchmarkSystems must be a non-empty array'
  )

  const systemIds = new Set()
  source.benchmarkSystems.forEach((system, index) => {
    const path = `benchmarkSystems[${index}]`
    assert(isNonEmptyString(system.id), `${path}.id must be a non-empty string`)
    assert(!systemIds.has(system.id), `${path}.id must be unique: ${system.id}`)
    systemIds.add(system.id)
    assert(isNonEmptyString(system.label), `${path}.label must be a non-empty string`)
    assert(
      isNonEmptyString(system.url) && URL.canParse(system.url),
      `${path}.url must be a valid URL`
    )
  })

  assert(
    Array.isArray(source.dimensions) && source.dimensions.length > 0,
    'dimensions must be a non-empty array'
  )
  const dimensionIds = new Set()
  source.dimensions.forEach((dimension, index) => {
    const path = `dimensions[${index}]`
    for (const field of requiredDimensionFields) {
      assert(Object.hasOwn(dimension, field), `${path}.${field} is required`)
    }
    assert(isNonEmptyString(dimension.id), `${path}.id must be a non-empty string`)
    assert(!dimensionIds.has(dimension.id), `${path}.id must be unique: ${dimension.id}`)
    dimensionIds.add(dimension.id)
    for (const field of ['label', 'atom63Status', 'nextAction', 'ownerLane']) {
      assert(isNonEmptyString(dimension[field]), `${path}.${field} must be a non-empty string`)
    }
    assert(
      gateValues.includes(dimension.stableGate),
      `${path}.stableGate must be one of: ${gateValues.join(', ')}`
    )
    assert(
      Array.isArray(dimension.benchmarkSignals) && dimension.benchmarkSignals.length > 0,
      `${path}.benchmarkSignals must be a non-empty array`
    )
    dimension.benchmarkSignals.forEach((signal, signalIndex) => {
      const signalPath = `${path}.benchmarkSignals[${signalIndex}]`
      assert(systemIds.has(signal.system), `${signalPath}.system must reference benchmarkSystems`)
      assert(isNonEmptyString(signal.signal), `${signalPath}.signal must be a non-empty string`)
      assert(
        isNonEmptyString(signal.reference) && URL.canParse(signal.reference),
        `${signalPath}.reference must be a valid URL`
      )
    })
    assert(
      dimension.currentEvidence && typeof dimension.currentEvidence === 'object',
      `${path}.currentEvidence must be an object`
    )
    validateStringArray(dimension.currentEvidence.docs, `${path}.currentEvidence.docs`, {
      allowEmpty: true,
    })
    validateStringArray(dimension.currentEvidence.commands, `${path}.currentEvidence.commands`, {
      allowEmpty: true,
    })
    assert(
      dimension.currentEvidence.docs.length + dimension.currentEvidence.commands.length > 0,
      `${path}.currentEvidence must include a doc or command`
    )
    validateStringArray(dimension.gaps, `${path}.gaps`, {
      allowEmpty: dimension.stableGate === 'done',
    })
    if (dimension.stableGate === 'done') {
      assert(dimension.gaps.length === 0, `${path}.gaps must be empty when stableGate is done`)
    }
  })
}

function summarize(dimensions) {
  const byGate = Object.fromEntries(gateValues.map(gate => [gate, 0]))
  const dimensionIdsByGate = Object.fromEntries(gateValues.map(gate => [gate, []]))
  for (const dimension of dimensions) {
    byGate[dimension.stableGate] += 1
    dimensionIdsByGate[dimension.stableGate].push(dimension.id)
  }
  return {
    totalDimensions: dimensions.length,
    byGate,
    dimensionIdsByGate,
    stableReady: byGate.blocker === 0,
  }
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function codeList(values) {
  return values.length === 0 ? 'None' : values.map(value => `\`${value}\``).join('<br>')
}

function evidenceCell(evidence) {
  return [
    ...evidence.docs.map(doc => `\`${doc}\``),
    ...evidence.commands.map(command => `\`${command}\``),
  ].join('<br>')
}

function signalCell(signals, systemsById) {
  return signals
    .map(
      signal =>
        `[${systemsById.get(signal.system).label}](${signal.reference}): ${escapeCell(signal.signal)}`
    )
    .join('<br><br>')
}

function renderMarkdown(report) {
  const systemsById = new Map(report.benchmarkSystems.map(system => [system.id, system]))
  const lines = [
    '# Atom63 benchmark-parity stable-readiness board',
    '',
    '**Status:** generated docs/guardrail artifact; no release, version, publish, or root-export change.',
    '',
    `**Release position:** ${report.releasePosition}`,
    '',
    `**Source of truth:** \`${report.source}\``,
    '',
    '## Summary',
    '',
    `- Dimensions: **${report.summary.totalDimensions}**.`,
    `- Stable blockers: **${report.summary.byGate.blocker}**.`,
    `- Warnings: **${report.summary.byGate.warning}**.`,
    `- Done: **${report.summary.byGate.done}**.`,
    `- Stable ready: **${report.summary.stableReady ? 'yes' : 'no'}**.`,
    '',
    'A `done` row has complete evidence for this dimension today. A `warning` needs an explicit decision or follow-up but does not independently block stable. A `blocker` must be resolved before stable/latest promotion.',
    '',
    '## Board',
    '',
    '| Dimension | Gate | Atom63 status | Current evidence | Gaps | Owner lane |',
    '| --- | --- | --- | --- | --- | --- |',
  ]

  for (const dimension of report.dimensions) {
    lines.push(
      `| ${escapeCell(dimension.label)} | \`${dimension.stableGate}\` | ${escapeCell(dimension.atom63Status)} | ${evidenceCell(dimension.currentEvidence)} | ${codeList(dimension.gaps)} | \`${dimension.ownerLane}\` |`
    )
  }

  lines.push('', '## Benchmark signals', '')
  for (const dimension of report.dimensions) {
    lines.push(`### ${dimension.label}`, '')
    lines.push(signalCell(dimension.benchmarkSignals, systemsById), '')
  }

  lines.push('## Next actions', '')
  for (const gate of gateValues) {
    const matching = report.dimensions.filter(dimension => dimension.stableGate === gate)
    lines.push(`### ${gate[0].toUpperCase()}${gate.slice(1)}`, '')
    if (matching.length === 0) {
      lines.push('None.', '')
      continue
    }
    for (const dimension of matching) {
      lines.push(
        `- **${dimension.label}** — ${dimension.nextAction} Owner: \`${dimension.ownerLane}\`.`
      )
    }
    lines.push('')
  }

  lines.push(
    '## How to update',
    '',
    'Edit the human-authored source, then regenerate:',
    '',
    '```bash',
    'pnpm check:benchmark-parity --write',
    '```',
    '',
    'CI and the beta release dry-run run the same command without `--write` and fail when either generated artifact drifts. This check does not publish, version packages, or change package exports.',
    ''
  )

  return `${lines.join('\n')}\n`
}

async function formatted(relativePath, value) {
  const outputPath = resolve(repositoryRoot, relativePath)
  const config = (await prettier.resolveConfig(outputPath)) ?? {}
  return prettier.format(value, { ...config, filepath: outputPath })
}

async function checkOrWrite(relativePath, expected, write) {
  const outputPath = resolve(repositoryRoot, relativePath)
  if (write) {
    await writeFile(outputPath, expected)
    return false
  }
  const actual = await readFile(outputPath, 'utf8').catch(() => null)
  return actual !== expected
}

async function main() {
  const write = process.argv.includes('--write')
  const source = JSON.parse(await readFile(resolve(repositoryRoot, sourcePath), 'utf8'))
  validateSource(source)

  const report = {
    schemaVersion: 1,
    status: 'generated-stable-readiness-benchmark-parity',
    source: sourcePath,
    releasePosition: source.releasePosition,
    benchmarkSystems: source.benchmarkSystems,
    summary: summarize(source.dimensions),
    dimensions: source.dimensions,
  }
  const [json, markdown] = await Promise.all([
    formatted(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`),
    formatted(markdownOutputPath, renderMarkdown(report)),
  ])
  const drift = await Promise.all([
    checkOrWrite(jsonOutputPath, json, write),
    checkOrWrite(markdownOutputPath, markdown, write),
  ])

  if (write) {
    console.log(`Wrote benchmark parity board -> ${jsonOutputPath}, ${markdownOutputPath}`)
    return
  }
  if (drift.some(Boolean)) {
    console.error('Benchmark parity board is stale. Run: pnpm check:benchmark-parity --write')
    process.exitCode = 1
    return
  }
  console.log(`Benchmark parity board is current (${jsonOutputPath}, ${markdownOutputPath})`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
