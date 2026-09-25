import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  AtomError,
  component,
  docsPage,
  editDistance,
  example,
  loadIndex,
  rules,
  search,
  token,
} from './core.mjs'
import { synonyms } from './synonyms.mjs'

const index = loadIndex()
const top = (query, options) => search(index, query, options).data.results.map(result => result.id)

/**
 * How agents actually ask. Each query must rank its expected component within
 * the given position; a change to scoring or synonyms that breaks one of these
 * is a regression, not a tuning.
 */
const golden = [
  ['button', 'button', 1],
  ['buton', 'button', 1],
  ['DialogTrigger', 'dialog', 1],
  ['modal', 'dialog', 1],
  ['toast', 'toaster', 1],
  ['notification', 'toaster', 1],
  ['dropdown', 'dropdown-menu', 1],
  ['date picker', 'calendar', 1],
  ['progress bar', 'progress', 1],
  ['tag', 'badge', 1],
  ['divider', 'separator', 1],
  ['keyboard shortcut', 'kbd', 1],
  ['combobox', 'autocomplete', 1],
  ['copy to clipboard', 'copy-button', 1],
  ['loading', 'spinner', 3],
  ['loading', 'skeleton', 3],
  ['popup', 'popover', 2],
  ['empty state', 'empty', 2],
  ['toggle', 'switch', 3],
]

describe('search', () => {
  for (const [query, expected, within] of golden) {
    it(`ranks ${expected} within the top ${within} for "${query}"`, () => {
      const ids = top(query).filter((_, position) => position < within)
      assert.ok(ids.includes(expected), `"${query}" → ${top(query).slice(0, 5).join(', ')}`)
    })
  }

  it('puts a follow-up command on every result', () => {
    for (const result of search(index, 'dialog').data.results) {
      assert.match(result.next, /^atom63 (component|docs|example|token) /)
    }
  })

  it('keeps tokens out unless the query looks like one or asks for them', () => {
    assert.ok(!top('surface').some(id => id.startsWith('--')))
    assert.ok(top('--a63-surface').every(id => id.startsWith('--')))
    assert.equal(top('surface page', { kind: 'token' })[0], '--a63-surface-page')
  })

  it('filters by kind and rejects unknown kinds', () => {
    assert.ok(
      search(index, 'sizes', { kind: 'example' }).data.results.every(r => r.kind === 'example')
    )
    assert.throws(() => search(index, 'x', { kind: 'widget' }), { code: 'search.unknown_kind' })
    assert.throws(() => search(index, '  '), { code: 'search.empty_query' })
  })

  it('only maps synonyms to components that exist', () => {
    const slugs = new Set(index.components.map(item => item.slug))
    for (const [word, targets] of Object.entries(synonyms)) {
      for (const target of targets) assert.ok(slugs.has(target), `${word} → ${target}`)
    }
  })
})

describe('component', () => {
  it('returns usage, import line, contract and examples', () => {
    const { type, data } = component(index, 'badge')
    assert.equal(type, 'component.detail')
    assert.equal(data.import, "import { Badge } from '@atom63/ui-react'")
    assert.ok(data.contract.axes.some(axis => axis.name === 'variants'))
    assert.equal(data.contract.crossRenderer.swiftUIRenderer, 'AtomBadge')
    assert.ok(data.examples.includes('Playground'))
    assert.match(data.docsMarkdown, /## Contract/)
  })

  it('prefers the hand-written docs page when there is one', () => {
    assert.match(component(index, 'button').data.docsMarkdown, /^# Button/)
  })

  it('suggests the closest slug when one is missing', () => {
    assert.throws(
      () => component(index, 'buton'),
      error => {
        assert.ok(error instanceof AtomError)
        assert.equal(error.code, 'component.not_found')
        assert.deepEqual(error.suggestions, ['button'])
        assert.equal(error.toEnvelope().type, 'error')
        return true
      }
    )
  })
})

describe('example', () => {
  it("returns one story's code with the file's imports", () => {
    const { data } = example(index, 'badge', 'Sizes')
    assert.match(data.code, /^export const Sizes: Story = \{/)
    assert.doesNotMatch(data.code, /export const (?!Sizes)/)
    assert.match(data.imports, /from '@atom63\/ui-react'/)
    // Multi-line imports come back whole, not cut after `import {`.
    assert.match(data.imports, /^import \{\n[\s\S]*?^\} from '@atom63\/ui-foundation'$/m)
    assert.match(data.imports, /^import '@atom63\/ui-react\/styles.css'$/m)
  })

  it('defaults to the first story and suggests close names', () => {
    assert.equal(example(index, 'badge').data.story, component(index, 'badge').data.examples[0])
    assert.throws(() => example(index, 'badge', 'Size'), { code: 'example.not_found' })
  })
})

describe('token', () => {
  it('finds a token with or without the leading dashes and prefix', () => {
    for (const query of ['--a63-action-primary', 'a63-action-primary', 'action-primary']) {
      const { type, data } = token(index, query)
      assert.equal(type, 'token.detail')
      assert.equal(data.cssVar, '--a63-action-primary')
      assert.equal(data.swift, 'AtomTokens.Color.actionPrimary')
      assert.equal(data.figma.path, 'action/primary')
    }
  })

  it('ranks tokens for words that are not a variable name', () => {
    const { type, data } = token(index, 'on media surface')
    assert.equal(type, 'token.results')
    assert.equal(data.results[0].id, '--a63-on-media-surface')
  })
})

describe('docs and rules', () => {
  it('returns a docs page and suggests close slugs', () => {
    assert.match(docsPage(index, 'theme-system').data.markdown, /\S/)
    assert.throws(
      () => docsPage(index, 'theme-sytem'),
      error => {
        assert.deepEqual(error.suggestions.slice(0, 1), ['theme-system'])
        return true
      }
    )
  })

  it('lists the rules, each with a reason', () => {
    for (const rule of rules().data.rules) {
      assert.ok(rule.id && rule.rule && rule.why, rule.id)
    }
  })
})

describe('index', () => {
  it('covers every catalog component, docs page and token', () => {
    assert.ok(index.components.length >= 60)
    assert.ok(index.docs.length >= 20)
    assert.ok(index.tokens.length >= 1000)
    assert.ok(!index.docs.some(doc => doc.slug === 'architecture-changelog'))
  })

  it('measures edit distance', () => {
    assert.equal(editDistance('buton', 'button'), 1)
    assert.equal(editDistance('abc', 'xyzuvw', 2), 3)
  })
})
