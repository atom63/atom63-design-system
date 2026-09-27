/**
 * Templates in the agent index: `template`, `copy` and `build`. Pure over the
 * index except `copy`, which writes the template's files into a directory.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { AtomError, closest, queryTerms, score, search } from './core.mjs'
import { rules } from './rules.mjs'

export const templateKinds = ['page', 'block']

function findTemplate(index, id) {
  const found = index.templates.find(template => template.id === id)
  if (!found) {
    throw new AtomError(
      'template.not_found',
      `No template "${id}".`,
      closest(
        id,
        index.templates.map(template => template.id)
      )
    )
  }
  return found
}

const summaryOf = template => ({
  id: template.id,
  kind: template.kind,
  title: template.title,
  description: template.description,
  category: template.category,
  readiness: template.readiness,
})

/** Score a template against a query; `search` scores the `template` kind the same way. */
function templateScore(query, terms, template) {
  return score(query, terms, {
    names: [template.id, template.title],
    keywords: [...template.tags, template.category, ...template.componentsUsed],
    prose: template.description,
  })
}

/** With no id, every template (pages first); with one, its source and what it uses. */
export function template(index, id, { kind } = {}) {
  if (kind && !templateKinds.includes(kind)) {
    throw new AtomError('usage.invalid_flag', `--kind must be one of: ${templateKinds.join(', ')}`)
  }
  if (!id) {
    const templates = index.templates.filter(entry => !kind || entry.kind === kind)
    return { type: 'template.list', data: { templates: templates.map(summaryOf) } }
  }
  const found = findTemplate(index, id)
  return {
    type: 'template.detail',
    data: {
      ...summaryOf(found),
      tags: found.tags,
      componentsUsed: found.componentsUsed,
      blocksUsed: found.blocksUsed,
      files: found.files,
      next: `atom63 copy ${found.id} <dir>`,
    },
  }
}

/** The template and every block it uses, transitively, each once. */
function withBlocks(index, root) {
  const seen = new Map()
  const visit = entry => {
    if (seen.has(entry.id)) return
    seen.set(entry.id, entry)
    for (const blockId of entry.blocksUsed) visit(findTemplate(index, blockId))
  }
  visit(root)
  return [...seen.values()]
}

/**
 * Write a template and the blocks it uses into `dir`, keeping the
 * `pages/<id>/` and `blocks/<id>/` layout so their relative imports still
 * resolve. Existing files are left alone unless `force` is set.
 */
export function copy(index, id, dir, { force = false, cwd = process.cwd() } = {}) {
  const root = findTemplate(index, id)
  const target = path.resolve(cwd, dir)
  const written = []
  const skipped = []
  for (const entry of withBlocks(index, root)) {
    for (const file of entry.files) {
      const destination = path.join(target, file.path)
      const relative = path.relative(cwd, destination)
      if (existsSync(destination) && !force) {
        skipped.push(relative)
        continue
      }
      mkdirSync(path.dirname(destination), { recursive: true })
      writeFileSync(destination, file.source)
      written.push(relative)
    }
  }
  const packages = [...new Set(withBlocks(index, root).flatMap(entry => entry.packages))].sort()
  const main = root.files.find(file => file.path.endsWith(`/${root.id}.tsx`))
  return {
    type: 'template.copied',
    data: {
      id: root.id,
      directory: path.relative(cwd, target) || '.',
      written,
      skipped,
      packages,
      next: [
        `Install what the files import: ${packages.join(', ')}.`,
        `Import it from ./${path.relative(cwd, path.join(target, main.path)).replace(/\.tsx$/, '')}, then replace the sample data and copy with your product's.`,
        ...(skipped.length > 0
          ? ['Some files already existed and were left alone; pass --force to overwrite them.']
          : []),
      ],
    },
  }
}

/* The frame and foundation every page starts from. */
const foundation = [
  { name: 'Atom63Theme', from: '@atom63/ui-react', use: 'The theme boundary at the app root.' },
  {
    name: 'Page',
    from: '@atom63/ui-react/layout',
    use: 'The main landmark, when no app shell owns it.',
  },
  { name: 'Container', from: '@atom63/ui-react/layout', use: 'The content width and inset.' },
  { name: 'Section', from: '@atom63/ui-react/layout', use: 'Rhythm between page regions.' },
  {
    name: 'SectionHeader',
    from: '@atom63/ui-react/layout',
    use: 'Headings with their descriptions.',
  },
]

const playbook = [
  'Search for the closest page: `atom63 build <idea>` or `atom63 template --kind page`.',
  'Copy it into your project with `atom63 copy <template> <dir>` and read what it uses.',
  'Adapt it with components from the kit: `atom63 component <slug>` for each one you add.',
  'Keep every color, space and radius on tokens, and follow `atom63 rules`.',
  'Check the result at a phone and a desktop width, in light and dark mode.',
]

/**
 * A composition kit for an idea: the closest pages and blocks, the components
 * the idea names, the always-on foundation and the rules. With no idea, the
 * playbook for building with the kit.
 */
export function build(index, idea) {
  if (!idea?.trim()) {
    return { type: 'build.playbook', data: { steps: playbook, foundation } }
  }
  const terms = queryTerms(idea)
  const ranked = index.templates
    .map(entry => ({ entry, value: templateScore(idea, terms, entry) }))
    // A name, tag or component match (8 or more); a word in the description alone is noise.
    .filter(({ value }) => value >= 8)
    .sort((left, right) => right.value - left.value || left.entry.id.localeCompare(right.entry.id))
  const pick = (kind, limit) =>
    ranked
      .filter(({ entry }) => entry.kind === kind)
      .slice(0, limit)
      .map(({ entry }) => ({ ...summaryOf(entry), next: `atom63 copy ${entry.id} <dir>` }))
  const pages = pick('page', 3)
  const blocks = pick('block', 5)
  // What the closest templates are built from comes first, then what the idea names.
  const bySlug = new Map(index.components.map(entry => [entry.slug, entry]))
  const used = [pages[0], ...blocks]
    .filter(Boolean)
    .flatMap(entry => findTemplate(index, entry.id).componentsUsed)
    .filter(slug => bySlug.has(slug))
  const named = search(index, idea, { kind: 'component', limit: 6 }).data.results.map(
    result => result.id
  )
  const components = [...new Set([...used, ...named])].slice(0, 8).map(slug => ({
    slug,
    summary: bySlug.get(slug).summary,
    next: `atom63 component ${slug}`,
  }))
  return {
    type: 'build.kit',
    data: {
      idea,
      pages,
      blocks,
      components,
      foundation,
      rules: rules.map(rule => rule.rule),
    },
  }
}
