/**
 * The query core behind the `atom63` CLI and MCP server. Pure functions over
 * the generated agent index; each returns a typed envelope `{ type, data }`
 * or throws an AtomError with a stable, append-only `code`.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { rules as ruleTable } from './rules.mjs'
import { grounds, synonyms, topics } from './synonyms.mjs'

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
export function closest(wanted, names, limit = 3) {
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
export function score(query, terms, { names, aliases = [], keywords = [], prose = '' }) {
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

export function queryTerms(query) {
  const terms = new Map(words(query).map(term => [term, 1]))
  for (const term of [...terms.keys()]) {
    for (const slug of synonyms[term] ?? []) {
      if (slug.startsWith('--')) continue
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
    if (rank !== -1) best = Math.max(best, 40 - rank * 8)
  }
  return best
}

/**
 * The entries a query's topics point at (see `topics`), by `kind:id`, each
 * with its score and the note that replaces its summary. They rank above
 * every scored match, in the order the topic lists them: 200 for the first,
 * then 10 less each.
 */
export function topicHits(query) {
  const text = ` ${normalize(query)} `
  const hits = new Map()
  for (const [key, entries] of Object.entries(topics)) {
    if (!text.includes(` ${key} `)) continue
    entries.forEach(({ id, note }, rank) => {
      const score = 200 - rank * 10
      if ((hits.get(id)?.score ?? 0) < score) hits.set(id, { score, note })
    })
  }
  return hits
}

/** The ground (neutral family and page color) an idea names (see `grounds`), or undefined. */
export function groundFor(idea) {
  const text = ` ${normalize(idea)} `
  const match = grounds.find(({ key }) => text.includes(` ${key} `))
  if (!match) return undefined
  const { surface, page, note } = match
  return { surface, page, note }
}

/** Tokens a query term names through a synonym, with the same boost as components. */
function synonymTokens(query) {
  const named = new Map()
  for (const term of words(query)) {
    for (const [rank, id] of (synonyms[term] ?? []).entries()) {
      if (id.startsWith('--')) named.set(id, Math.max(named.get(id) ?? 0, 30 - rank * 8))
    }
  }
  return named
}

/* ── Commands ────────────────────────────────────────────────────────────── */

export const searchKinds = ['component', 'template', 'token', 'doc', 'example', 'api']

const firstSentence = text => /^.*?\.(?=\s|$)/.exec(text)?.[0] ?? text

/** The last segment of an entry point: `@atom63/ui-react/media/lightbox` → `lightbox`. */
const entryTail = module => module.split('/').at(-1)

/**
 * Every public API name an agent can look up: the Swift types of Atom63UI and
 * the values each published JavaScript entry point exports.
 */
function apiSymbols(index) {
  const covered = new Set(index.components.flatMap(component => component.exports.values))
  return [
    ...index.api.ios.types.map(type => ({
      name: type.name,
      summary: firstSentence(type.summary) || `${type.declaration} (${index.api.ios.module})`,
      // Swift types do not compete with the web component of the same name.
      inSearch: true,
    })),
    ...index.api.web.flatMap(entry =>
      entry.values.map(name => ({
        name,
        summary: `import { ${name} } from '${entry.module}'`,
        // A catalog component's own exports are found through the component.
        inSearch: !covered.has(name),
      }))
    ),
  ]
}

/**
 * One ranked list across components, templates, tokens, docs pages, story
 * examples and public API names (Swift types and entry point exports).
 * An API name joins on a name match only, and below components and docs
 * unless it matches exactly or kind is `api`.
 * Tokens only join when the query looks like one (`--…`), kind is `token`, a
 * topic names them, or a query term names them through a synonym ("gradient"),
 * so a thousand variables cannot bury the components.
 */
export function search(index, query, { kind, limit = 10 } = {}) {
  if (!query?.trim()) throw new AtomError('search.empty_query', 'Pass something to search for.')
  if (kind && !searchKinds.includes(kind)) {
    throw new AtomError('search.unknown_kind', `Unknown kind "${kind}".`, searchKinds)
  }
  const terms = queryTerms(query)
  const wants = candidateKind => !kind || kind === candidateKind
  const hits = topicHits(query)
  const topic = (candidateKind, id) => hits.get(`${candidateKind}:${id}`)
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
      const hit = topic('component', component.slug)
      const total = hit?.score ?? value + synonymBoost(query, component.slug)
      if (total > 0) {
        results.push({
          kind: 'component',
          id: component.slug,
          label: component.label,
          summary: hit?.note ?? component.summary,
          score: total,
          next: `atom63 component ${component.slug}`,
        })
      }
    }
  }

  if (wants('template')) {
    for (const template of index.templates) {
      const hit = topic('template', template.id)
      const total =
        hit?.score ??
        score(query, terms, {
          names: [template.id, template.title],
          keywords: [...template.tags, template.category, ...template.componentsUsed],
          prose: template.description,
        })
      if (total > 0) {
        results.push({
          kind: 'template',
          id: template.id,
          label: template.title,
          summary: hit?.note ?? template.description,
          score: total,
          next: `atom63 template ${template.id}`,
        })
      }
    }
  }

  if (wants('doc')) {
    for (const doc of index.docs) {
      const hit = topic('doc', doc.slug)
      const total = score(query, terms, { names: [doc.slug, doc.label], prose: doc.markdown })
      if (total > 0 || hit) {
        results.push({
          kind: 'doc',
          id: doc.slug,
          label: doc.label,
          summary: hit?.note ?? doc.route,
          score: hit?.score ?? total * 0.8,
          next: `atom63 docs ${doc.slug}`,
        })
      }
    }
  }

  if (wants('example')) {
    for (const component of index.components) {
      for (const story of component.stories?.names ?? []) {
        const hit = topic('example', `${component.slug}/${story}`)
        const total = score(query, terms, { names: [`${component.slug} ${story}`, story] })
        if (total >= 50 || hit) {
          results.push({
            kind: 'example',
            id: `${component.slug}/${story}`,
            label: `${component.label} — ${story}`,
            summary: hit?.note ?? component.stories.file,
            // Below components unless examples are what was asked for.
            score: hit?.score ?? total * (kind === 'example' ? 1 : 0.4),
            next: `atom63 example ${component.slug} ${story}`,
          })
        }
      }
    }
  }

  if (wants('api')) {
    const entries = [
      {
        module: index.api.ios.module,
        names: [index.api.ios.module, 'ios', 'swiftui', 'swift'],
        summary: `the SwiftUI package: ${index.api.ios.types.length} public types`,
      },
      ...index.api.web.map(entry => ({
        module: entry.module,
        names: [entry.module, entryTail(entry.module)],
        summary: `entry point: ${entry.values.length} exports, docs ${entry.docs}`,
      })),
    ]
    for (const entry of entries) {
      const total = score(query, terms, { names: entry.names })
      if (total >= 50) {
        results.push({
          kind: 'api',
          id: entry.module,
          label: entry.module,
          summary: entry.summary,
          score: total * 0.9,
          next: `atom63 api ${entry.module}`,
        })
      }
    }
    const listed = new Set()
    for (const symbol of apiSymbols(index)) {
      if (!symbol.inSearch || listed.has(symbol.name)) continue
      const value = score(query, terms, { names: [symbol.name] })
      // Outside `--kind api`, a name must start with the query: hundreds of
      // contract constants contain short words such as "ios" or "tab".
      if (value < (kind === 'api' ? 50 : 70)) continue
      listed.add(symbol.name)
      results.push({
        kind: 'api',
        id: symbol.name,
        label: symbol.name,
        summary: symbol.summary,
        score: value >= 100 || kind === 'api' ? value : value * 0.4,
        next: `atom63 api ${symbol.name}`,
      })
    }
  }

  const allTokens = kind === 'token' || (!kind && query.trim().startsWith('--'))
  if (wants('token')) {
    for (const token of index.tokens) {
      const hit = topic('token', token.cssVar)
      // Other tokens join only when every token is in play.
      if (!allTokens && !hit) continue
      const bare = token.cssVar.replace(/^--(a63-)?/, '')
      const total =
        hit?.score ??
        score(query.replace(/^--(a63-)?/, ''), terms, {
          names: [token.cssVar, bare, token.figma?.path ?? ''],
          keywords: [token.layer, token.type],
        })
      if (total > 0) {
        results.push({
          kind: 'token',
          id: token.cssVar,
          label: token.cssVar,
          summary: hit?.note ?? `${token.type}, ${token.layer} layer`,
          score: total,
          next: `atom63 token ${token.cssVar}`,
        })
      }
    }
  }

  if (wants('token')) {
    for (const [cssVar, boost] of synonymTokens(query)) {
      const listed = results.find(result => result.kind === 'token' && result.id === cssVar)
      const token = index.tokens.find(candidate => candidate.cssVar === cssVar)
      if (listed) listed.score += boost
      else if (token) {
        results.push({
          kind: 'token',
          id: token.cssVar,
          label: token.cssVar,
          summary: `${token.type}, ${token.layer} layer`,
          score: boost,
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
    // Layout primitives (`page`, `section-header`) are exports, not catalog components.
    const exportName = slug.replace(/(^|-)([a-z])/g, (_match, _dash, letter) =>
      letter.toUpperCase()
    )
    const exported = index.api.web.find(entry => entry.values.includes(exportName))
    if (exported) {
      throw new AtomError(
        'component.not_found',
        `No component "${slug}": ${exportName} is an export of ${exported.module}, not a catalog component. Read it with: atom63 api ${exportName}`,
        [`atom63 api ${exportName}`]
      )
    }
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
      axisGuidance: found.axisGuidance ?? null,
      import: `import { ${found.usageExports.join(', ')} } from '${found.importPath}'`,
      exports: found.exports,
      contract: found.contract,
      related: found.related,
      examples: found.stories?.names ?? [],
      docsMarkdown: page?.markdown ?? found.markdown,
    },
  }
}

const DECLARATION =
  /^(?:export\s+)?(?:const|let|function|type|interface|class)\s+([A-Za-z_$][\w$]*)/

/**
 * Split a module into its top-level declarations, keyed by name, in source
 * order. A comment directly above a declaration belongs to it. Imports and the
 * default export are left out.
 */
function topLevelBlocks(source) {
  const blocks = new Map()
  let current = null
  let pendingComment = []
  let inComment = false
  for (const line of source.split('\n')) {
    const declaration = DECLARATION.exec(line)
    const startsComment = /^\/\*|^\/\//.test(line)
    if (declaration) {
      current = { name: declaration[1], lines: [...pendingComment, line] }
      blocks.set(current.name, current)
      pendingComment = []
    } else if (inComment || (startsComment && !line.startsWith(' '))) {
      pendingComment.push(line)
      inComment = inComment ? !line.includes('*/') : line.startsWith('/*') && !line.includes('*/')
      current = null
    } else if (/^(?:import\b|export default\b)/.test(line)) {
      current = null
      pendingComment = []
    } else if (current) {
      current.lines.push(line)
    }
  }
  return new Map(
    [...blocks].map(([blockName, block]) => [blockName, block.lines.join('\n').trimEnd()])
  )
}

/** The local declarations `name` uses, transitively, in source order. */
function localDependencies(blocks, name) {
  const needed = new Set()
  const visit = blockName => {
    for (const [candidate] of blocks) {
      if (candidate === name || needed.has(candidate)) continue
      if (new RegExp(`\\b${candidate.replace(/\$/g, '\\$')}\\b`).test(blocks.get(blockName))) {
        needed.add(candidate)
        visit(candidate)
      }
    }
  }
  visit(name)
  return [...blocks.keys()]
    .filter(blockName => needed.has(blockName))
    .map(blockName => blocks.get(blockName))
}

/**
 * A story's code as a known-good usage sample, with the file's imports and the
 * local helpers (components, data, types) the story uses.
 */
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
  const blocks = topLevelBlocks(source)
  const code = [...localDependencies(blocks, name), blocks.get(name)].join('\n\n')
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

/**
 * A public API name or an entry point. A Swift type comes back with its
 * declaration, doc comment, members and the component it renders; a
 * JavaScript export with the entry points that export it, their import lines
 * and docs pages. An entry point (`@atom63/ui-react/media`, `Atom63UI`) comes
 * back with everything it exports.
 */
export function api(index, name) {
  if (!name?.trim()) throw new AtomError('api.not_found', 'Pass an API name or an entry point.')
  const wanted = name.trim()
  const { ios, web } = index.api
  if (wanted === ios.module || /^(ios|swiftui)$/i.test(wanted)) {
    return {
      type: 'api.entry',
      data: {
        module: ios.module,
        platform: 'ios',
        docs: ios.docs,
        import: `import ${ios.module}`,
        symbols: ios.types.map(type => ({
          name: type.name,
          kind: type.kind,
          summary: type.summary,
        })),
      },
    }
  }
  const entry = web.find(candidate => candidate.module === wanted)
  if (entry) {
    return {
      type: 'api.entry',
      data: {
        module: entry.module,
        platform: 'web',
        docs: entry.docs,
        import: `import { … } from '${entry.module}'`,
        symbols: entry.values.map(value => ({ name: value, kind: 'value', summary: '' })),
      },
    }
  }

  const same = candidate => candidate.toLowerCase() === wanted.toLowerCase()
  const exact = candidate => candidate === wanted
  const pick = list => (list.some(exact) ? list.filter(exact) : list.filter(same))
  const swiftName = pick(ios.types.map(type => type.name))[0]
  const webName = pick([...new Set(web.flatMap(candidate => candidate.values))])[0]
  if (!swiftName && !webName) {
    throw new AtomError(
      'api.not_found',
      `No public API "${wanted}".`,
      closest(wanted, [ios.module, ...apiSymbols(index).map(symbol => symbol.name)])
    )
  }
  const componentOf = new Map(
    index.components.flatMap(component =>
      component.exports.values.map(value => [value, component.slug])
    )
  )
  const swift = ios.types.find(type => type.name === swiftName)
  return {
    type: 'api.detail',
    data: {
      name: swiftName ?? webName,
      ios: swift ? { ...swift, module: ios.module, docs: ios.docs } : null,
      web: webName
        ? web
            .filter(candidate => candidate.values.includes(webName))
            .map(candidate => ({
              module: candidate.module,
              import: `import { ${webName} } from '${candidate.module}'`,
              docs: candidate.docs,
              // What the docs page says about this export: purpose, example and props.
              reference: candidate.sections?.[webName] ?? null,
              // Only ui-react's catalog components; @atom63/mdx has its own `Tabs`.
              component: candidate.module.startsWith('@atom63/ui-react')
                ? (componentOf.get(webName) ?? null)
                : null,
            }))
        : [],
    },
  }
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
