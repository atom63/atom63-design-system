/**
 * Shared test vectors for the inform arbiter. Runs the web arbiter
 * (`resolveInform` in @atom63/inform) over the cases below and writes each
 * case with the resolution the web computes into a Swift fixture, which
 * AtomInformArbiterTests replays against the Swift port. A change to the rules
 * on either side fails one of them.
 *
 * Usage: node scripts/generate-inform-vectors.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { createServer, defaultServerConditions } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(
  root,
  'packages/ui-ios/Tests/Atom63UITests/AtomInformVectors.generated.swift'
)

const conditions = ['@atom63/source', ...defaultServerConditions]
const server = await createServer({
  appType: 'custom',
  configFile: false,
  logLevel: 'silent',
  optimizeDeps: { include: [], noDiscovery: true },
  root,
  server: { hmr: false, middlewareMode: true, watch: null },
  ssr: { noExternal: [/^@atom63\//], resolve: { conditions, externalConditions: conditions } },
})
let core
try {
  core = await server.ssrLoadModule(path.join(root, 'packages/inform/src/core/index.ts'))
} finally {
  await server.close()
}

const NOW = '2026-09-28T12:00:00.000Z'

/*
 * A message spec: `eligible: false` stands for a `when` predicate that
 * returns false. Everything else is the web message's own field.
 */
const m = (id, surface, fields = {}) => ({
  id,
  surface,
  priority: 0,
  dismiss: 'persistent',
  ...fields,
})

const cases = [
  {
    name: 'ranks by priority, declaration order breaking ties',
    messages: [
      m('low', 'banner', { priority: 1 }),
      m('high-first', 'banner', { priority: 5 }),
      m('high-second', 'banner', { priority: 5 }),
    ],
  },
  {
    name: 'skips dismissed messages by id and version',
    messages: [
      m('seen', 'banner', { priority: 9 }),
      m('bumped', 'banner', { priority: 5, version: 2 }),
      m('fallback', 'banner', { priority: 1 }),
    ],
    dismissals: ['seen:1', 'bumped:1'],
  },
  {
    name: 'respects start and end times',
    messages: [
      m('not-yet', 'banner', { priority: 9, startsAt: '2026-09-28T12:00:01.000Z' }),
      m('over', 'banner', { priority: 8, endsAt: '2026-09-28T11:59:59.000Z' }),
      m('live', 'banner', {
        priority: 1,
        startsAt: '2026-09-28T12:00:00.000Z',
        endsAt: '2026-09-28T12:00:00.000Z',
      }),
    ],
  },
  {
    name: 'skips messages whose predicate is false',
    messages: [m('hidden', 'dialog', { priority: 9, eligible: false }), m('shown', 'dialog')],
  },
  {
    name: 'skips a spotlight whose anchor is missing',
    messages: [
      m('lost', 'spotlight', { priority: 9, anchor: 'gone' }),
      m('found', 'spotlight', { anchor: 'here' }),
    ],
    anchors: ['here'],
  },
  {
    name: 'a dialog blocks the spotlight and the flyouts, not the banner',
    messages: [
      m('dialog', 'dialog'),
      m('spot', 'spotlight', { priority: 9, anchor: 'here' }),
      m('flyout', 'corner-flyout'),
      m('banner', 'banner'),
    ],
    anchors: ['here'],
  },
  {
    name: 'a spotlight blocks the flyouts when no dialog is eligible',
    messages: [m('spot', 'spotlight', { anchor: 'here' }), m('flyout', 'corner-flyout')],
    anchors: ['here'],
  },
  {
    name: 'stacks at most three flyouts',
    messages: [
      m('f1', 'corner-flyout', { priority: 1 }),
      m('f2', 'corner-flyout', { priority: 4 }),
      m('f3', 'corner-flyout', { priority: 3 }),
      m('f4', 'corner-flyout', { priority: 2 }),
    ],
  },
  {
    name: 'resolves nothing from an empty registry',
    messages: [],
  },
]

const vectors = cases.map(testCase => {
  const messages = testCase.messages.map(({ eligible, ...spec }) => ({
    ...spec,
    content: { body: spec.id },
    ...(eligible === false ? { when: () => false } : {}),
  }))
  const anchors = new Set(testCase.anchors ?? [])
  const resolution = core.resolveInform({
    registry: { messages },
    ctx: { pathname: '/', locale: 'en', now: new Date(NOW) },
    dismissals: Object.fromEntries((testCase.dismissals ?? []).map(key => [key, 1])),
    isAnchorAvailable: anchor => anchors.has(anchor),
  })
  return {
    ...testCase,
    expected: {
      banner: resolution.banner?.id ?? null,
      dialog: resolution.dialog?.id ?? null,
      spotlight: resolution.spotlight?.id ?? null,
      flyouts: resolution['corner-flyout'].map(message => message.id),
    },
  }
})

const str = value => JSON.stringify(value)
const opt = value => (value === undefined || value === null ? 'nil' : str(value))
const surfaces = {
  banner: '.banner',
  dialog: '.dialog',
  'corner-flyout': '.cornerFlyout',
  spotlight: '.spotlight',
}
const date = value => (value === undefined ? 'nil' : `vectorDate(${str(value)})`)

const swiftMessage = spec =>
  `.init(id: ${str(spec.id)}, surface: ${surfaces[spec.surface]}, priority: ${spec.priority}, dismiss: .${spec.dismiss}, version: ${spec.version ?? 1}, startsAt: ${date(spec.startsAt)}, endsAt: ${date(spec.endsAt)}, anchor: ${opt(spec.anchor)}, eligible: ${spec.eligible !== false})`

const output = `// Generated by scripts/generate-inform-vectors.mjs from the web arbiter in
// @atom63/inform. Do not edit; change the cases there and run
// \`node scripts/generate-inform-vectors.mjs\`.

import Foundation

let informVectorNow = vectorDate(${str(NOW)})

let informVectors: [InformVector] = [
${vectors
  .map(
    vector => `  InformVector(
    name: ${str(vector.name)},
    messages: [${vector.messages.map(spec => `\n      ${swiftMessage(spec)},`).join('')}${vector.messages.length ? '\n    ' : ''}],
    dismissals: ${str(vector.dismissals ?? [])},
    anchors: ${str(vector.anchors ?? [])},
    banner: ${opt(vector.expected.banner)},
    dialog: ${opt(vector.expected.dialog)},
    spotlight: ${opt(vector.expected.spotlight)},
    flyouts: ${str(vector.expected.flyouts)}
  ),`
  )
  .join('\n')}
]
`

if (process.argv.includes('--check')) {
  if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== output) {
    process.stderr.write(
      'AtomInformVectors.generated.swift is stale. Run `node scripts/generate-inform-vectors.mjs` and commit it.\n'
    )
    process.exit(1)
  }
  process.stdout.write(`Inform arbiter vectors are current (${vectors.length} cases).\n`)
} else {
  writeFileSync(outputPath, output)
  process.stdout.write(`Wrote ${path.relative(root, outputPath)} (${vectors.length} cases).\n`)
}
