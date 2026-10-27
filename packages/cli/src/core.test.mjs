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
import { formatEnvelope } from './format.mjs'
import { grounds, synonyms, topics } from './synonyms.mjs'
import { build, template } from './templates.mjs'

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
  // The empty-state template ranks first; the component follows it.
  ['empty state', 'empty', 3],
  ['toggle', 'switch', 3],
  ['dense table', 'table', 1],
  ['selectable tile', 'radio', 2],
  ['choice card', 'radio', 3],
  ['star rating', 'rating', 1],
  ['stars', 'rating', 1],
  ['collapsible sidebar group', 'sidebar-nav-tree', 3],
  ['folding nav groups', 'sidebar-nav-tree', 1],
  ['nav tree', 'sidebar-nav-tree', 1],
  ['bottom sheet', 'drawer', 2],
  ['persistent sheet', 'drawer', 2],
  ['unread badge', 'button', 3],
  ['carousel dots', 'carousel', 1],
  // Synonyms can name tokens, which then join a plain search.
  ['gradient', '--a63-gradient-brand-fade', 3],
  ['hero', '--a63-gradient-brand-fade', 1],
  ['hero gradient', '--a63-gradient-brand-fade', 1],
  ['chat message', 'chat-message', 2],
  ['message bubble', 'chat-message', 1],
  ['chat composer', 'chat-composer', 2],
  ['typing indicator', 'chat-typing-indicator', 1],
  ['typing dots', 'chat-typing-indicator', 1],
  ['thinking steps', 'chat-steps', 1],
]

/**
 * How agents ask for a page or block. `search` and `build` must both put the
 * expected template within the given position.
 */
const templateGolden = [
  ['settings page', 'settings-page', 1],
  ['login', 'sign-in-page', 2],
  ['sign in form', 'sign-in-page', 1],
  ['dashboard', 'dashboard-page', 1],
  ['invoice list', 'list-page', 1],
  ['table with filters', 'data-table-section', 2],
  ['empty state', 'empty-state', 1],
  ['onboarding', 'onboarding-page', 1],
  ['sidebar navigation', 'app-shell', 1],
  ['kpi', 'stat-row', 1],
  ['activity feed', 'activity-list', 1],
  ['getting started checklist', 'getting-started-checklist', 1],
  ['setup steps', 'getting-started-checklist', 2],
  ['music player', 'app-view', 1],
  ['full window app', 'app-view', 1],
  ['tab bar', 'tab-bar', 1],
  ['bottom navigation', 'tab-bar', 1],
  ['phone app with tab bar', 'app-view', 2],
  ['mobile app screen', 'app-view', 1],
  ['AI assistant chat panel', 'chat-panel', 1],
  ['chat', 'chat-panel', 1],
  ['ai assistant', 'chat-page', 2],
  ['chat history sidebar', 'chat-page', 1],
]

/**
 * Queries for tokens, docs pages, examples and templates that no component
 * name carries, through `topics`. Each must rank its expected entry within
 * the given position of the unfiltered search.
 */
const topicGolden = [
  ['gradient', '--a63-gradient-brand-fade', 1],
  ['gradient', '--a63-gradient-brand', 2],
  ['gradient', '--a63-gradient-scrim', 4],
  ['gradient', 'foundation-colors', 5],
  ['hero gradient', '--a63-gradient-brand', 2],
  ['hero', '--a63-type-display-large-font-size', 3],
  ['fade', '--a63-gradient-brand-fade', 1],
  ['fade', '--a63-gradient-scrim', 2],
  ['scrim over photo', '--a63-gradient-scrim', 1],
  ['display', 'amount', 1],
  ['display', 'foundation-typography', 2],
  ['display', '--a63-type-display-font-size', 3],
  ['large number', 'foundation-typography', 2],
  ['balance', 'amount', 1],
  ['balance', 'foundation-typography', 2],
  ['amount fraction', 'amount', 1],
  ['amount fraction', 'foundation-typography', 2],
  ['price cents', 'foundation-typography', 2],
  ['currency', 'foundation-typography', 2],
  ['send money', 'amount', 1],
  ['order total', 'amount', 1],
  ['persistent sheet', 'drawer/PersistentSheet', 1],
  ['bottom sheet', 'drawer/PersistentSheet', 1],
  ['non-modal sheet', 'drawer/PersistentSheet', 1],
  ['drawer over map', 'drawer/PersistentSheet', 1],
  ['tab bar', 'tab-bar', 1],
  ['bottom navigation', 'tab-bar', 1],
  ['bottom nav', 'tab-bar', 1],
  ['tab bar', 'tabs', 3],
  ['tabview', 'tabs', 1],
  ['ios tab bar', 'tabs', 2],
  ['swiftui tab bar', 'tabs', 2],
  ['ios tabs underline', 'tabs', 1],
  ['swiftui tabs', 'tabs', 1],
  ['AtomTabRow', 'tabs', 1],
  ['phone app', 'app-view', 1],
  ['mobile app with tab bar', 'app-view', 2],
  ['edge to edge phone screen', 'app-view', 1],
  ['notion-like docs', 'foundation-colors', 1],
  ['notes app', 'foundation-colors', 1],
  ['writing editor', 'foundation-colors', 1],
  ['track list', 'table', 1],
  ['album track list', 'table/Plain', 2],
  ['playlist', 'table', 1],
  ['podcast episodes', 'table', 1],
  ['floating button', 'button/FloatingOverMap', 1],
  ['map buttons', 'button', 2],
  ['buttons over map', 'button/FloatingOverMap', 4],
  ['grouped list ios', 'item', 1],
  ['grouped list ios', 'item/InsetGroup', 2],
  ['inset list section', 'item', 1],
  ['value row with chevron', 'item', 1],
  ['page dots', 'carousel', 1],
  ['page indicator', 'carousel/WithDots', 2],
  ['avatar badge', 'avatar', 1],
  ['avatar badge', 'avatar/WithBadge', 2],
  ['online status dot', 'avatar', 1],
  ['instagram feed mobile web', 'app-view', 1],
  ['iphone home screen', 'app-view', 1],
  ['bank home on a phone', 'app-view', 1],
  ['headspace mobile screen', 'app-view', 1],
  ['chat', 'chat-panel', 1],
  ['copilot', 'chat-panel', 1],
  ['chatbot', 'chat-composer', 4],
  ['agent', 'pattern-agent', 1],
  ['agent chat ui', 'chat-panel', 2],
  ['prompt input', 'chat-composer', 1],
  ['send and stop button', 'chat-composer', 1],
  ['tool calls', 'chat-steps', 1],
  ['ai disclaimer', 'chat-composer/Playground', 1],
]

/**
 * Ideas that name a warm paper or document product get the warm n6 neutral and
 * a near-white page in their build kit; other ideas get no ground.
 */
const groundGolden = [
  ['Notion-like docs page', 'n6'],
  ['notes app with a sidebar', 'n6'],
  ['markdown editor', 'n6'],
  ['writing app', 'n6'],
  ['team wiki', 'n6'],
  ['knowledge base article', 'n6'],
  ['billing settings page', undefined],
  ['analytics dashboard', undefined],
  ['music player', undefined],
]

describe('build ground', () => {
  for (const [idea, surface] of groundGolden) {
    it(`suggests ${surface ?? 'no ground'} for "${idea}"`, () => {
      const kit = build(index, idea).data
      assert.equal(kit.ground?.surface, surface)
      if (surface) {
        assert.equal(kit.ground.page, '--a63-surface-panel')
        assert.match(
          formatEnvelope(build(index, idea)),
          /## Ground\n- Neutral n6, page --a63-surface-panel/
        )
      }
    })
  }

  it('only points grounds at tokens that exist', () => {
    const tokens = new Set(index.tokens.map(entry => entry.cssVar))
    for (const { key, page } of grounds) assert.ok(tokens.has(page), `${key} → ${page}`)
  })
})

describe('topics', () => {
  for (const [query, expected, within] of topicGolden) {
    it(`ranks ${expected} within the top ${within} for "${query}"`, () => {
      const ids = top(query).slice(0, within)
      assert.ok(ids.includes(expected), `"${query}" → ${top(query).slice(0, 5).join(', ')}`)
    })
  }

  it('points a media list at Table variant="plain" in the build kit', () => {
    const kit = build(index, 'album page with a track list').data
    const table = kit.components.find(entry => entry.slug === 'table')
    assert.ok(table, kit.components.map(entry => entry.slug).join(', '))
    assert.match(table.summary, /variant="plain"/)
  })

  it('says what to use from a topic entry', () => {
    const [first, second] = search(index, 'price').data.results
    assert.match(first.summary, /<Amount /)
    assert.match(first.summary, /amount-fraction/)
    assert.equal(first.next, 'atom63 component amount')
    assert.equal(second.next, 'atom63 docs foundation-typography')
  })

  it('names the iOS renderer for the list, dots and avatar badge topics', () => {
    assert.match(search(index, 'grouped list ios').data.results[0].summary, /AtomListSection/)
    assert.match(search(index, 'page dots').data.results[0].summary, /AtomPageDots/)
    assert.match(search(index, 'page dots').data.results[0].summary, /shape="pill"/)
    assert.match(search(index, 'avatar badge').data.results[0].summary, /AtomAvatar\(name:badge:/)
  })

  it('names the Swift display amount API', () => {
    for (const query of ['display amount ios', 'balance']) {
      const [first] = search(index, query).data.results
      assert.match(first.summary, /AtomAmountText/, query)
    }
    const token = index.tokens.find(entry => entry.cssVar === '--a63-type-display-font-size')
    assert.equal(token.swift, 'AtomDisplayRole.display')
  })

  it('respects a kind filter', () => {
    assert.ok(search(index, 'gradient', { kind: 'doc' }).data.results.every(r => r.kind === 'doc'))
    assert.equal(top('gradient', { kind: 'token' })[0], '--a63-gradient-brand-fade')
  })

  it('only points topics at entries that exist', () => {
    const ids = new Set([
      ...index.components.map(entry => `component:${entry.slug}`),
      ...index.templates.map(entry => `template:${entry.id}`),
      ...index.docs.map(entry => `doc:${entry.slug}`),
      ...index.tokens.map(entry => `token:${entry.cssVar}`),
      ...index.components.flatMap(entry =>
        (entry.stories?.names ?? []).map(story => `example:${entry.slug}/${story}`)
      ),
    ])
    for (const [key, entries] of Object.entries(topics)) {
      assert.match(key, /^[a-z0-9]+( [a-z0-9]+)*$/, `"${key}" is not normalized`)
      for (const { id } of entries) assert.ok(ids.has(id), `${key} → ${id}`)
    }
  })
})

describe('templates', () => {
  for (const [query, expected, within] of templateGolden) {
    it(`finds ${expected} within the top ${within} for "${query}"`, () => {
      const ids = search(index, query, { kind: 'template' })
        .data.results.map(result => result.id)
        .slice(0, within)
      assert.ok(ids.includes(expected), `"${query}" → ${ids.join(', ')}`)
      const kit = build(index, query).data
      const kitIds = [...kit.pages, ...kit.blocks].map(entry => entry.id)
      assert.ok(kitIds.includes(expected), `build "${query}" → ${kitIds.join(', ')}`)
    })
  }

  it('derives what each template uses from its imports', () => {
    const listPage = template(index, 'list-page').data
    assert.ok(listPage.componentsUsed.includes('dropdown-menu'))
    assert.ok(listPage.blocksUsed.includes('data-table-section'))
    assert.ok(listPage.files.every(file => !file.path.includes('.stories.')))
  })

  it('carries the files of the blocks a template uses, so it can be pasted without copy', () => {
    const appView = template(index, 'app-view').data
    assert.ok(appView.blockFiles.some(file => file.path === 'blocks/tab-bar/tab-bar.tsx'))
    assert.ok(appView.packages.includes('@atom63/ui-react'))
    assert.match(appView.files[0].source, /layout\?: 'phone' \| 'window'/)
    const text = formatEnvelope(template(index, 'app-view'))
    assert.match(text, /^\/\/ blocks\/tab-bar\/tab-bar\.tsx$/m)
    assert.match(text, /copy-only/)
    assert.match(text, /shadcn@latest add https:\/\/system\.atom63\.io\/r\/app-view\.json/)
  })

  /* How builders describe a phone screen; the kit must lead with AppView layout="phone". */
  const phoneIdeas = [
    'Revolut home screen on a phone: balance, accounts, recent transactions, bottom tab bar',
    'Instagram feed mobile web',
    'Headspace mobile home',
    'home screen of a consumer banking phone app',
    'mobile web page for a 390 px wide viewport: photo feed with stories',
    'iPhone chat thread screen',
    'food delivery store menu on a phone',
    'Duolingo lesson path, 390px',
    'ride hailing choose a ride screen, mobile',
    'Spotify mobile home with tab bar',
  ]
  for (const idea of phoneIdeas) {
    it(`leads the kit for "${idea}" with AppView layout="phone"`, () => {
      const kit = build(index, idea).data
      assert.equal(kit.pages[0].id, 'app-view')
      assert.equal(kit.blocks[0].id, 'tab-bar')
      assert.match(kit.phone.use, /AppView layout="phone"/)
      assert.match(kit.phone.snippet, /layout="phone"/)
      assert.match(formatEnvelope(build(index, idea)), /^## Phone screen$/m)
    })
  }

  it('keeps the phone section out of desktop and SwiftUI ideas', () => {
    for (const idea of ['billing settings page', 'music player', 'SwiftUI iPhone settings']) {
      assert.equal(build(index, idea).data.phone, undefined, idea)
    }
  })

  it('points the phone section at props and a sample the app-view template has', () => {
    const { phone } = build(index, 'phone app').data
    const source = template(index, 'app-view').data.files[0].source
    assert.match(source, /export function AppViewPhonePage/)
    assert.match(source, /<AppView[\s\S]*?layout="phone"/)
    for (const prop of ['layout', 'tabBar', 'bottomBar', 'topBar']) {
      assert.match(source, new RegExp(`${prop}\\?:`), prop)
    }
    const { files, blockFiles } = template(index, 'app-view').data
    const paths = [...files, ...blockFiles].map(entry => entry.path)
    for (const [, file] of phone.imports.join('\n').matchAll(/'\.\/(.+)'/g)) {
      assert.ok(paths.includes(`${file}.tsx`), file)
    }
  })

  /* Ideas whose hero is a money amount; the kit must give Amount and the display role. */
  const amountIdeas = [
    'bank home on a phone',
    'send money amount',
    'balance',
    'Revolut home screen on a phone: balance, accounts, recent transactions, bottom tab bar',
    'product page with a price and a buy button',
    'checkout with the order total',
  ]
  for (const idea of amountIdeas) {
    it(`gives "${idea}" the display amount`, () => {
      const kit = build(index, idea).data
      assert.equal(kit.amount?.component, 'amount')
      assert.match(kit.amount.use, /text-display/)
      assert.match(kit.amount.snippet, /<Amount /)
      assert.match(kit.amount.snippet, /className="text-display tabular-nums"/)
      assert.match(kit.amount.snippet, /className="amount-fraction"/)
      assert.match(formatEnvelope(build(index, idea)), /^## Display amount$/m)
    })
  }

  it('tells a Revolut balance how to keep the cents on the baseline', () => {
    const kit = build(index, 'Revolut balance on a phone').data
    assert.equal(kit.amount?.component, 'amount')
    assert.match(kit.amount.use, /fraction="baseline"/)
    assert.match(kit.amount.use, /amount-fraction-baseline/)
  })

  it('keeps the display amount out of ideas with no amount', () => {
    for (const idea of ['music player', 'billing settings page', 'iPhone chat thread screen']) {
      assert.equal(build(index, idea).data.amount, undefined, idea)
    }
  })

  it('points the display amount at a component, props and utilities that exist', () => {
    const { amount } = build(index, 'balance').data
    const entry = component(index, amount.component).data
    assert.match(entry.importLine ?? JSON.stringify(entry), /Amount/)
    for (const prop of ['currency', 'size', 'strong', 'value']) {
      assert.match(amount.snippet, new RegExp(`${prop}[=\\s]`), prop)
    }
    const sizes = JSON.stringify(entry)
    assert.match(sizes, /"lg"/)
  })

  it('tells a phone screen that AppView sets phone-sized type', () => {
    assert.match(build(index, 'phone app').data.phone.use, /data-a63-form-factor="phone"/)
  })

  it('returns the playbook for build with no idea', () => {
    assert.equal(build(index).type, 'build.playbook')
  })
})

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

  it('only maps synonyms to components and tokens that exist', () => {
    const slugs = new Set([
      ...index.components.map(item => item.slug),
      ...index.tokens.map(item => item.cssVar),
    ])
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

  it('carries one guidance line per variant, size and state where the catalog has them', () => {
    const { data } = component(index, 'button')
    assert.match(data.axisGuidance.variant.primary, /^The one primary action per view/)
    assert.deepEqual(Object.keys(data.axisGuidance), ['variant', 'size', 'state'])
    assert.match(data.docsMarkdown, /## Variants, sizes and states/)
    assert.match(
      formatEnvelope(component(index, 'button')),
      /\| State \| `loading` \| Label keeps its width; the spinner overlays it\. \|/
    )
    assert.equal(component(index, 'kbd').data.axisGuidance, null)
  })

  it('records each component docs route, as the docs site builds it', () => {
    const button = index.components.find(entry => entry.slug === 'button')
    assert.equal(button.route, '/components/component-button')
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
    // Helpers come first; the story itself ends the sample.
    assert.match(data.code, /^export const Sizes: Story = \{[\s\S]*\}$/m)
    assert.ok(data.code.trimEnd().endsWith('}'))
    assert.doesNotMatch(data.code, /export const (?!Sizes)/)
    assert.match(data.imports, /from '@atom63\/ui-react'/)
    // Multi-line imports come back whole, not cut after `import {`.
    assert.match(data.imports, /^import \{\n[\s\S]*?^\} from '@atom63\/ui-foundation'$/m)
    assert.match(data.imports, /^import '@atom63\/ui-react\/styles.css'$/m)
  })

  it('includes the local helpers a story uses, and nothing else', () => {
    const { code } = example(index, 'segmented-control', 'Playground').data
    assert.match(code, /function Demo\(/)
    assert.equal(code.match(/^export const /gm).length, 1)

    const tree = example(index, 'sidebar-nav-tree', 'Playground').data.code
    assert.match(tree, /function Tree\(/)
    assert.doesNotMatch(tree, /SectionOnlyTree/)
  })

  it('includes meta when the story type refers to it', () => {
    const { code } = example(index, 'badge', 'Sizes').data
    assert.match(code, /type Story = StoryObj<typeof meta>/)
    assert.match(code, /^const meta = \{/m)
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

  it('finds the gradient tokens, with the Swift that draws them', () => {
    const ids = token(index, 'gradient').data.results.map(result => result.id)
    for (const cssVar of [
      '--a63-gradient-brand',
      '--a63-gradient-brand-subtle',
      '--a63-gradient-brand-fade',
      '--a63-gradient-brand-fade-dark-zone',
      '--a63-gradient-scrim',
    ]) {
      assert.ok(ids.includes(cssVar), `token gradient → ${ids.join(', ')}`)
    }
    assert.equal(token(index, 'hero').data.results[0].id, '--a63-gradient-brand-fade')
    assert.equal(
      token(index, '--a63-gradient-brand-fade').data.swift,
      'AtomThemeColors.brandFadeGradient(for:)'
    )
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
