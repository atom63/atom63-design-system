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

const renderers = {
  'search.results': searchResults,
  'token.results': searchResults,
  'component.detail': componentDetail,
  'example.source': exampleSource,
  'token.detail': tokenDetail,
  'docs.page': data => data.markdown.trim(),
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
