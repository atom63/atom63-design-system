/**
 * The query core behind the `atom63` CLI and MCP server. Pure functions over
 * the generated agent index; each returns a typed envelope `{ type, data }`
 * or throws an AtomError with a stable, append-only `code`.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { rules as ruleTable } from './rules.mjs'
import { synonyms } from './synonyms.mjs'

const defaultIndexPath = fileURLToPath(new URL('../generated/agent-index.json', import.meta.url))

let cached
/** The agent index, read once per process. */
export function loadIndex(path = defaultIndexPath) {
  if (path !== defaultIndexPath) return JSON.parse(readFileSync(path, 'utf8'))
  cached ??= JSON.parse(readFileSync(path, 'utf8'))
  return cached
}

/** A failure an agent can branch on: `code` never changes meaning once shipped. */
export class AtomError extends Error {
  constructor(code, message, suggestions = []) {
    super(message)
    this.name = 'AtomError'
    this.code = code
    this.suggestions = suggestions
  }

  toEnvelope() {
    return {
      type: 'error',
      data: { code: this.code, message: this.message, suggestions: this.suggestions },
    }
  }
}

/* ── Text matching ───────────────────────────────────────────────────────── */

const normalize = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const words = text => normalize(text).split(' ').filter(Boolean)

/** Levenshtein distance, stopping early past `max`. */
export function editDistance(left, right, max = 3) {
  if (Math.abs(left.length - right.length) > max) return max + 1
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    const current = [i]
    let rowMin = i
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
      rowMin = Math.min(rowMin, current[j])
    }
    if (rowMin > max) return max + 1
    previous = current
  }
  return previous[right.length]
}

/** Closest names to `wanted`, for "did you mean" suggestions. */
function closest(wanted, names, limit = 3) {
  const target = normalize(wanted)
  return names
    .map(name => ({ name, distance: editDistance(target, normalize(name), 4) }))
    .filter(({ name, distance }) => distance <= 3 || normalize(name).includes(target))
    .sort((left, right) => left.distance - right.distance || left.name.localeCompare(right.name))
    .slice(0, limit)
    .map(({ name }) => name)
}

/**
 * Score a candidate: exact name 100, name prefix 70, name containing the query
 * 50, then per query term 20 for a name word, 8 for a keyword and 2 for prose.
 * Terms that came from a synonym count half. A name within two edits of the
 * query scores 40 when nothing better matched. `aliases` (export names) only
 * count as an exact match: most components export a `…Popup` or `…Trigger`,
 * so partial matches on them are noise.
 */
function score(query, terms, { names, aliases = [], keywords = [], prose = '' }) {
  const q = normalize(query)
  const nameTexts = names.map(normalize)
  let total = 0
  if (nameTexts.includes(q)) total += 100
  else if (aliases.some(alias => normalize(alias) === q)) total += 90
  else if (nameTexts.some(name => name.startsWith(q))) total += 70
  else if (q.length >= 3 && nameTexts.some(name => name.includes(q))) total += 50

  const nameWords = new Set(nameTexts.flatMap(words))
  const keywordWords = new Set(keywords.flatMap(words))
  const proseText = normalize(prose)
  for (const { term, weight } of terms) {
    if (nameWords.has(term) || nameTexts.includes(term)) total += 20 * weight
    else if (keywordWords.has(term)) total += 8 * weight
    else if (term.length >= 4 && proseText.includes(term)) total += 2 * weight
  }

  if (total === 0 && q.length >= 4) {
    const distance = Math.min(...nameTexts.map(name => editDistance(q, name, 2)))
    if (distance <= 2) total += 40 - distance * 10
  }
  return total
}

function queryTerms(query) {
  const terms = new Map(words(query).map(term => [term, 1]))
  for (const term of [...terms.keys()]) {
    for (const slug of synonyms[term] ?? []) {
      for (const word of words(slug)) if (!terms.has(word)) terms.set(word, 0.5)
    }
  }
  return [...terms].map(([term, weight]) => ({ term, weight }))
}

/** Boost for components a query term names through a synonym: 30 for the first, then less. */
function synonymBoost(query, slug) {
  let best = 0
  for (const term of words(query)) {
    const rank = (synonyms[term] ?? []).indexOf(slug)
    if (rank !== -1) best = Math.max(best, 30 - rank * 8)
  }
  return best
}

/* ── Commands ────────────────────────────────────────────────────────────── */

export const searchKinds = ['component', 'token', 'doc', 'example']

/**
 * One ranked list across components, tokens, docs pages and story examples.
 * Tokens only join when the query looks like one (`--…`) or kind is `token`,
 * so a thousand variables cannot bury the components.
 */
export function search(index, query, { kind, limit = 10 } = {}) {
  if (!query?.trim()) throw new AtomError('search.empty_query', 'Pass something to search for.')
  if (kind && !searchKinds.includes(kind)) {
    throw new AtomError('search.unknown_kind', `Unknown kind "${kind}".`, searchKinds)
  }
  const terms = queryTerms(query)
  const wants = candidateKind => !kind || kind === candidateKind
  const results = []

  if (wants('component')) {
    for (const component of index.components) {
      const value = score(query, terms, {
        names: [component.slug, component.label],
        aliases: [...component.exports.values, ...component.exports.types],
        keywords: [
          component.summary,
          component.group?.title ?? '',
          ...component.exports.values,
          ...(component.contract?.axes.flatMap(axis => axis.values) ?? []),
        ],
        prose: `${component.usage} ${component.guidance.join(' ')}`,
      })
      const total = value + synonymBoost(query, component.slug)
      if (total > 0) {
        results.push({
          kind: 'component',
          id: component.slug,
          label: component.label,
          summary: component.summary,
          score: total,
          next: `atom63 component ${component.slug}`,
        })
      }
    }
  }

  if (wants('doc')) {
    for (const doc of index.docs) {
      const total = score(query, terms, { names: [doc.slug, doc.label], prose: doc.markdown })
      if (total > 0) {
        results.push({
          kind: 'doc',
          id: doc.slug,
          label: doc.label,
          summary: doc.route,
          score: total * 0.8,
          next: `atom63 docs ${doc.slug}`,
        })
      }
    }
  }

  if (wants('example')) {
    for (const component of index.components) {
      for (const story of component.stories?.names ?? []) {
        const total = score(query, terms, { names: [`${component.slug} ${story}`, story] })
        if (total >= 50) {
          results.push({
            kind: 'example',
            id: `${component.slug}/${story}`,
            label: `${component.label} — ${story}`,
            summary: component.stories.file,
            // Below components unless examples are what was asked for.
            score: total * (kind === 'example' ? 1 : 0.4),
            next: `atom63 example ${component.slug} ${story}`,
          })
        }
      }
    }
  }

  if (kind === 'token' || (!kind && query.trim().startsWith('--'))) {
    for (const token of index.tokens) {
      const bare = token.cssVar.replace(/^--(a63-)?/, '')
      const total = score(query.replace(/^--(a63-)?/, ''), terms, {
        names: [token.cssVar, bare, token.figma?.path ?? ''],
        keywords: [token.layer, token.type],
      })
      if (total > 0) {
        results.push({
          kind: 'token',
          id: token.cssVar,
          label: token.cssVar,
          summary: `${token.type}, ${token.layer} layer`,
          score: total,
          next: `atom63 token ${token.cssVar}`,
        })
      }
    }
  }

  results.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
  return { type: 'search.results', data: { query, results: results.slice(0, limit) } }
}

function findComponent(index, slug) {
  const component = index.components.find(candidate => candidate.slug === slug)
  if (!component) {
    throw new AtomError(
      'component.not_found',
      `No component "${slug}".`,
      closest(
        slug,
        index.components.map(candidate => candidate.slug)
      )
    )
  }
  return component
}

/**
 * Everything an agent needs to use a component: what it is for, how to import
 * it, its contract (and the shared web + iOS contract), related components and
 * the names of its story examples. A hand-written docs page, when there is
 * one, comes back as `docsMarkdown`.
 */
export function component(index, slug) {
  const found = findComponent(index, slug)
  const page = index.docs.find(doc => doc.slug === `component-${slug}`)
  return {
    type: 'component.detail',
    data: {
      slug: found.slug,
      label: found.label,
      status: found.status,
      group: found.group,
      summary: found.summary,
      usage: found.usage,
      guidance: found.guidance,
      import: `import { ${found.usageExports.join(', ')} } from '${found.importPath}'`,
      exports: found.exports,
      contract: found.contract,
      related: found.related,
      examples: found.stories?.names ?? [],
      docsMarkdown: page?.markdown ?? found.markdown,
    },
  }
}

/** A story's code as a known-good usage sample, with the file's imports. */
export function example(index, slug, story) {
  const found = findComponent(index, slug)
  if (!found.stories) {
    throw new AtomError('example.none', `${found.label} has no story examples.`)
  }
  const name = story ?? found.stories.names[0]
  if (!found.stories.names.includes(name)) {
    throw new AtomError(
      'example.not_found',
      `${found.label} has no story "${name}".`,
      closest(name, found.stories.names)
    )
  }
  const source = found.stories.source
  const start = source.search(new RegExp(`^export const ${name}\\s*:\\s*Story\\b`, 'm'))
  const rest = source.slice(start + 1)
  const next = rest.search(/^(?:\/\*|\/\/|export )/m)
  const code = source.slice(start, next === -1 ? undefined : start + 1 + next).trimEnd()
  // Whole statements, including ones that span lines (`import {\n  a,\n} from 'x'`).
  const imports = [...source.matchAll(/^import\b[^;'"]*?(?:from\s*)?['"][^'"]+['"];?$/gms)]
    .map(match => match[0])
    .join('\n')
  return {
    type: 'example.source',
    data: {
      slug: found.slug,
      story: name,
      stories: found.stories.names,
      file: found.stories.file,
      imports,
      code,
    },
  }
}

/**
 * A token by CSS variable (with or without the leading `--`), or a ranked
 * list when the query is not an exact variable name.
 */
export function token(index, query) {
  if (!query?.trim()) throw new AtomError('token.empty_query', 'Pass a token name or words.')
  const wanted = query.startsWith('--') ? query : `--${query}`
  const exact =
    index.tokens.find(candidate => candidate.cssVar === wanted) ??
    index.tokens.find(candidate => candidate.cssVar === `--a63-${query.replace(/^--/, '')}`)
  if (exact) return { type: 'token.detail', data: exact }

  const { data } = search(index, query, { kind: 'token', limit: 15 })
  if (data.results.length === 0) {
    throw new AtomError('token.not_found', `No token matches "${query}".`)
  }
  return { type: 'token.results', data }
}

/** A docs page's Markdown by slug. */
export function docsPage(index, slug) {
  const page = index.docs.find(doc => doc.slug === slug)
  if (!page) {
    throw new AtomError(
      'docs.not_found',
      `No docs page "${slug}".`,
      closest(
        slug,
        index.docs.map(doc => doc.slug)
      )
    )
  }
  return { type: 'docs.page', data: page }
}

/** The rules an agent follows when it builds UI with Atom63. */
export function rules() {
  return { type: 'rules', data: { rules: ruleTable } }
}
