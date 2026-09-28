import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  checkTemplates,
  importSpecifiers,
  isAllowedImport,
  parseTemplateMetadata,
} from './templates-check.mjs'

const metadata = (fields = {}) =>
  `export const template = ${JSON.stringify(
    {
      id: 'page-header',
      kind: 'block',
      title: 'Page header',
      description: 'A title with actions.',
      category: 'layout',
      tags: ['title'],
      readiness: 'draft',
      ...fields,
    },
    null,
    2
  )} as const\n`

const stories = 'export const Desktop = {}\nexport const Phone = {}\nexport const Themes = {}\n'

const block = (source, extra = {}) => ({
  dir: 'blocks',
  files: [{ path: 'blocks/page-header/page-header.tsx', source }],
  id: 'page-header',
  storySource: stories,
  ...extra,
})

const page = (source = "import { PageHeader } from '../../blocks/page-header/page-header'\n") => ({
  dir: 'pages',
  files: [
    {
      path: 'pages/list-page/list-page.tsx',
      source: source + metadata({ id: 'list-page', kind: 'page' }),
    },
  ],
  id: 'list-page',
  storySource: stories,
})

test('parses the metadata literal', () => {
  assert.equal(parseTemplateMetadata(metadata()).id, 'page-header')
  assert.equal(parseTemplateMetadata('export const x = 1'), null)
})

test('lists imports and re-exports', () => {
  const source =
    "import { A } from '@atom63/ui-react'\nimport type { B } from './b'\nexport { C } from '../c'\nimport './side.css'\n"
  assert.deepEqual(
    importSpecifiers(source).sort(),
    ['../c', './b', './side.css', '@atom63/ui-react'].sort()
  )
})

test('allows the design system, react, lucide and files inside src only', () => {
  const from = 'blocks/page-header/page-header.tsx'
  assert.ok(isAllowedImport('@atom63/ui-react', from))
  assert.ok(isAllowedImport('react', from))
  assert.ok(isAllowedImport('lucide-react', from))
  assert.ok(isAllowedImport('../../story-matrix', from))
  assert.ok(!isAllowedImport('../../../../apps/docs/src/app', from))
  assert.ok(!isAllowedImport('@/components/button', from))
  assert.ok(!isAllowedImport('clsx', from))
})

test('passes a complete block used by a page', () => {
  assert.deepEqual(checkTemplates([block(metadata()), page()]), [])
})

test('fails a template that imports an app module', () => {
  const problems = checkTemplates([block("import { x } from '@/lib/app'\n" + metadata()), page()])
  assert.match(problems.join('\n'), /imports "@\/lib\/app"/)
})

test('fails incomplete or mismatched metadata', () => {
  const problems = checkTemplates([
    block(metadata({ id: 'other', kind: 'page', tags: [], readiness: 'done' })),
    page(),
  ])
  const text = problems.join('\n')
  assert.match(text, /does not match its folder/)
  assert.match(text, /kind "page" should be "block"/)
  assert.match(text, /`tags` is missing or empty/)
  assert.match(text, /readiness "done"/)
})

test('fails a block that no page uses', () => {
  assert.match(checkTemplates([block(metadata()), page('')]).join('\n'), /not used by any page/)
})

test('fails missing stories', () => {
  const problems = checkTemplates([
    block(metadata(), { storySource: 'export const Desktop = {}' }),
    page(),
  ])
  assert.match(problems.join('\n'), /no `Phone` story/)
  assert.match(
    checkTemplates([block(metadata(), { storySource: null }), page()]).join('\n'),
    /no stories file/
  )
})

test('fails a template missing from the catalog', () => {
  const catalog = "import { template as listPage } from './pages/list-page/list-page'\n"
  const problems = checkTemplates([block(metadata()), page()], catalog).join('\n')
  assert.match(problems, /blocks\/page-header: is missing from src\/catalog\.ts/)
  assert.doesNotMatch(problems, /list-page: is missing/)
})

test('fails a ready template without its visual baselines', () => {
  const ready = block(metadata({ readiness: 'ready' }))
  const all = new Set(
    ['desktop', 'phone', 'themes'].map(story => `templates-blocks-page-header-${story}`)
  )
  const missing = checkTemplates([ready, page()], undefined, new Set([...all].slice(0, 2)))
  assert.match(
    missing.join('\n'),
    /is ready but has no visual baseline templates-blocks-page-header-themes/
  )
  assert.deepEqual(checkTemplates([ready, page()], undefined, all), [])
  // A draft needs none.
  assert.deepEqual(checkTemplates([block(metadata()), page()], undefined, new Set()), [])
})
