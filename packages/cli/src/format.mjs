/**
 * Human-readable text for each envelope type. `--json` bypasses all of this;
 * the text form is for people and for agents that read terminal output.
 */

const list = values => (values.length > 0 ? values.join(', ') : '—')

function searchResults({ query, results }) {
  if (results.length === 0) return `No results for "${query}".`
  return results
    .map(
      result =>
        `${result.kind.padEnd(9)} ${result.id} — ${result.summary}\n          → ${result.next}`
    )
    .join('\n')
}

function componentDetail(data) {
  const lines = [
    data.docsMarkdown.trim(),
    '',
    '## Examples',
    '',
    `${list(data.examples)}`,
    '',
    `Read one with: atom63 example ${data.slug} <story>`,
  ]
  return lines.join('\n')
}

function exampleSource(data) {
  return [
    `// ${data.file} — ${data.story} (also: ${list(data.stories.filter(story => story !== data.story))})`,
    data.imports,
    '',
    data.code,
  ].join('\n')
}

function tokenDetail(data) {
  const lines = [`${data.cssVar}  (${data.type}, ${data.layer} layer)`]
  if (data.figma) lines.push(`Figma: ${data.figma.collection} / ${data.figma.path}`)
  if (data.swift) lines.push(`Swift: ${data.swift}`)
  lines.push('Values:')
  for (const { scope, value } of data.values) lines.push(`  ${scope}: ${value}`)
  return lines.join('\n')
}

function rulesText({ rules }) {
  return rules
    .map(
      (rule, position) =>
        `${position + 1}. ${rule.rule}\n   Why: ${rule.why}${rule.check ? `\n   Checked by: check:craft (${rule.check})` : ''}`
    )
    .join('\n\n')
}

function manifestText({ commands, errorCodes }) {
  const usage = command =>
    [
      `atom63 ${command.name}`,
      ...command.args.map(arg => (arg.optional ? `[${arg.name}]` : `<${arg.name}>`)),
      ...command.flags.map(
        flag => `[--${flag.name}${flag.type === 'boolean' ? '' : ` <${flag.type}>`}]`
      ),
    ].join(' ')
  return [
    ...commands.map(command => `${usage(command)}\n    ${command.summary}`),
    '',
    'Every command takes --json for a typed { type, data } envelope.',
    `Error codes: ${errorCodes.join(', ')}`,
  ].join('\n')
}

function templateList({ templates }) {
  if (templates.length === 0) return 'No templates.'
  return templates
    .map(
      entry =>
        `${entry.kind.padEnd(6)} ${entry.id} (${entry.readiness}) — ${entry.description}\n       → atom63 template ${entry.id}`
    )
    .join('\n')
}

function templateDetail(data) {
  return [
    `# ${data.title} (${data.kind}, ${data.readiness})`,
    '',
    data.description,
    '',
    `Components: ${list(data.componentsUsed)}`,
    `Blocks: ${list(data.blocksUsed)}`,
    '',
    ...data.files.flatMap(file => [`// ${file.path}`, file.source.trimEnd(), '']),
    `Copy it with: ${data.next}`,
  ].join('\n')
}

function templateCopied(data) {
  return [
    `Copied ${data.id} into ${data.directory}:`,
    ...data.written.map(file => `  wrote ${file}`),
    ...data.skipped.map(file => `  kept  ${file} (exists)`),
    '',
    ...data.next,
  ].join('\n')
}

function buildKit(data) {
  const section = (title, items, line) =>
    items.length > 0 ? [`## ${title}`, ...items.map(line), ''] : []
  return [
    `# Kit for "${data.idea}"`,
    '',
    ...section(
      'Pages',
      data.pages,
      entry => `- ${entry.id}: ${entry.description}\n  → ${entry.next}`
    ),
    ...section(
      'Blocks',
      data.blocks,
      entry => `- ${entry.id}: ${entry.description}\n  → ${entry.next}`
    ),
    ...section(
      'Components',
      data.components,
      entry => `- ${entry.slug}: ${entry.summary}\n  → ${entry.next}`
    ),
    ...section(
      'Foundation',
      data.foundation,
      entry => `- ${entry.name} (${entry.from}): ${entry.use}`
    ),
    ...section('Rules', data.rules, rule => `- ${rule}`),
  ]
    .join('\n')
    .trimEnd()
}

function buildPlaybook(data) {
  return [
    ...data.steps.map((step, position) => `${position + 1}. ${step}`),
    '',
    'Foundation:',
    ...data.foundation.map(entry => `- ${entry.name} (${entry.from}): ${entry.use}`),
  ].join('\n')
}

const renderers = {
  'search.results': searchResults,
  'token.results': searchResults,
  'component.detail': componentDetail,
  'example.source': exampleSource,
  'token.detail': tokenDetail,
  'docs.page': data => data.markdown.trim(),
  'template.list': templateList,
  'template.detail': templateDetail,
  'template.copied': templateCopied,
  'build.kit': buildKit,
  'build.playbook': buildPlaybook,
  'agents.md': data => data.markdown,
  rules: rulesText,
  manifest: manifestText,
  error: ({ code, message, suggestions }) =>
    [
      `${message} (${code})`,
      ...(suggestions.length > 0 ? [`Did you mean: ${suggestions.join(', ')}?`] : []),
    ].join('\n'),
}

export function formatEnvelope({ type, data }) {
  const render = renderers[type]
  if (!render) throw new Error(`No text renderer for ${type}`)
  return render(data)
}
