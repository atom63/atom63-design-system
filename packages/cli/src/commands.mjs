/**
 * The command table. The CLI, the MCP server and `manifest` are all built
 * from it, so the three can never describe different commands.
 *
 * Each command names its positional arguments and flags with types, and the
 * envelope `type`s it can return. `run` receives the index and the parsed
 * input and returns an envelope, or throws an AtomError.
 */
import { component, docsPage, example, rules, search, searchKinds, token } from './core.mjs'

export const commands = [
  {
    name: 'search',
    summary: 'Search components, docs pages, story examples and tokens in one ranked list.',
    args: [{ name: 'query', description: 'What you are looking for, in words or by name.' }],
    flags: [
      { name: 'kind', type: 'string', choices: searchKinds, description: 'Only this kind.' },
      { name: 'limit', type: 'number', default: 10, description: 'At most this many results.' },
    ],
    returns: ['search.results'],
    run: (index, { query, kind, limit }) => search(index, query, { kind, limit }),
  },
  {
    name: 'component',
    summary:
      'How to use a component: import line, contract (axes, defaults, slots, states, web + iOS), related components and examples.',
    args: [{ name: 'slug', description: 'Component slug, e.g. dialog or segmented-control.' }],
    flags: [],
    returns: ['component.detail'],
    run: (index, { slug }) => component(index, slug),
  },
  {
    name: 'example',
    summary: "A story's code, as a known-good usage sample, with the file's imports.",
    args: [
      { name: 'slug', description: 'Component slug.' },
      { name: 'story', optional: true, description: 'Story export name; defaults to the first.' },
    ],
    flags: [],
    returns: ['example.source'],
    run: (index, { slug, story }) => example(index, slug, story),
  },
  {
    name: 'token',
    summary:
      'A token by CSS variable, or matching tokens by words: values per scope, Figma path and Swift name.',
    args: [{ name: 'query', description: 'e.g. --a63-surface-page, surface-page or "on media".' }],
    flags: [],
    returns: ['token.detail', 'token.results'],
    run: (index, { query }) => token(index, query),
  },
  {
    name: 'docs',
    summary: 'A docs page as Markdown.',
    args: [{ name: 'slug', description: 'Page slug, e.g. theme-system.' }],
    flags: [],
    returns: ['docs.page'],
    run: (index, { slug }) => docsPage(index, slug),
  },
  {
    name: 'rules',
    summary: 'The rules to follow when building UI with Atom63, each with its reason.',
    args: [],
    flags: [],
    returns: ['rules'],
    run: () => rules(),
  },
  {
    name: 'manifest',
    summary: 'Every command with its arguments, flags and response types.',
    args: [],
    flags: [],
    returns: ['manifest'],
    run: () => manifest(),
  },
]

/** Error codes a caller can branch on. Append only: a shipped code keeps its meaning. */
export const errorCodes = [
  'usage.unknown_command',
  'usage.missing_argument',
  'usage.invalid_flag',
  'search.empty_query',
  'search.unknown_kind',
  'component.not_found',
  'example.none',
  'example.not_found',
  'token.empty_query',
  'token.not_found',
  'docs.not_found',
]

/** The self-describing manifest an agent reads once to learn the interface. */
export function manifest() {
  return {
    type: 'manifest',
    data: {
      name: 'atom63',
      envelope:
        '{ type, data }; errors are { type: "error", data: { code, message, suggestions } }',
      commands: commands.map(({ name, summary, args, flags, returns }) => ({
        name,
        summary,
        args,
        flags,
        returns,
      })),
      errorCodes,
    },
  }
}
