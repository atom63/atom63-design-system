/**
 * Projects, prompts and `codex exec` arguments for the vibe runner (E4). Pure
 * functions, so the dry run and the tests see exactly what a real run sends.
 */

/** @typedef {{ id: string, title: string, body: string, markdown: string }} Brief */

export const captureViewports = {
  desktop: { width: 1440, height: 960 },
  compact: { width: 1024, height: 768 },
  tablet: { width: 768, height: 1024 },
  phone: { width: 390, height: 844 },
}

/** State ids from the first column of a reference pack's Markdown table. */
export function parseReferenceStates(markdown) {
  return [...markdown.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)].map(match => match[1])
}

/** Screenshot paths relative to one rendered arm. */
export function captureFiles(states = []) {
  return (states.length ? states : [null]).flatMap(state =>
    Object.keys(captureViewports).map(viewport =>
      state ? `${state}/${viewport}.png` : `${viewport}.png`
    )
  )
}

/**
 * A brief file: a `# Title` line, then product language only.
 * @returns {Brief}
 */
export function parseBrief(id, markdown) {
  const heading = /^#\s+(.+)$/m.exec(markdown)
  if (!heading) throw new Error(`Brief ${id} needs a "# Title" line`)
  const body = markdown.slice(heading.index + heading[0].length).trim()
  if (!body) throw new Error(`Brief ${id} has no body`)
  if (/atom63|design system/i.test(body))
    throw new Error(`Brief ${id} must not mention the design system`)
  return { id, title: heading[1].trim(), body, markdown: markdown.trim() }
}

/** The URL path each arm must serve the brief's page at. */
export const pagePath = brief => `/${brief.id}`

/** The builder prompt. Every arm in one track gets exactly this text. */
export function builderPrompt(brief, { track = 'generalization' } = {}) {
  const reference =
    track === 'reference'
      ? [
          '',
          '## Reference reconstruction',
          '',
          'Read `.vibe/reference/target-desktop.svg`, `.vibe/reference/layout.md`, and `.vibe/reference/states.md` before writing UI.',
          'Reconstruct the target structure with the neutral product copy and data in the brief. Preserve the target’s information density, region proportions, alignment, and control hierarchy.',
          'Do not embed the target image in the page. Implement the interface as real HTML and controls.',
          'The desktop target is the fidelity reference. Adapt the same information priorities at narrower viewports without scaling the desktop canvas.',
        ]
      : []
  return [
    `Build the following as a new page of this app, reachable at the URL path \`${pagePath(brief)}\`. Keep the pages that already exist working.`,
    '',
    `## ${brief.title}`,
    '',
    brief.body,
    ...reference,
    '',
    '## Constraints',
    '',
    '- Work only inside this project directory.',
    '- Use only the dependencies that are already installed; do not add packages.',
    '- On this benchmark route, replace the starter site chrome with the product interface from the brief. Starter navigation and appearance controls must not appear in screenshots.',
    '- Use realistic mock data where the page needs data; there is no backend.',
    '- When you are done, `pnpm typecheck` and `pnpm build` must both pass.',
  ].join('\n')
}

/** Replace the starter's template-led instructions for the component-only DS arm. */
export function coreAgentGuide(markdown) {
  const core = `<!-- atom63:core:start -->

## Building UI with Atom63 core

Use the Atom63 MCP tools available in this session before writing UI:

- \`atom63 component <slug>\` for a component contract and import.
- \`atom63 example <slug> [story]\` for a known-good component usage.
- \`atom63 token <name or words>\` for tokens and theme values.
- \`atom63 rules\` for the system rules.

This benchmark arm measures the component and token system without page templates, blocks, build
kits, or copied recipes. Compose the public components directly. Keep every color, space, radius,
shadow, and duration on the Atom63 token scale, preserve native semantics, and use only contract
axis values.

<!-- atom63:core:end -->`
  const generated = /<!-- atom63:agents:start[\s\S]*?<!-- atom63:agents:end -->/
  return `${markdown.replace(generated, '').trim()}\n\n${core}\n`
}

/** The package versions the plain arm takes from the starter's resolved versions. */
export const plainDependencies = ['lucide-react', 'react', 'react-dom']
export const plainDevDependencies = [
  '@tailwindcss/vite',
  '@types/react',
  '@types/react-dom',
  '@vitejs/plugin-react',
  'tailwindcss',
  'typescript',
  'vite',
]

/**
 * The plain arm: Vite, React, TypeScript and Tailwind v4 at the versions the
 * starter uses, with no design system, no AGENTS.md and no router. Icons come
 * from lucide-react, as in the starter.
 * @param {{ name: string, versions: Record<string, string> }} options
 * @returns {Map<string, string>}
 */
export function planPlainProject({ name, versions }) {
  const pick = names =>
    Object.fromEntries(
      names.map(dependency => {
        if (!versions[dependency]) throw new Error(`No version for ${dependency}`)
        return [dependency, versions[dependency]]
      })
    )
  const manifest = {
    name,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc --noEmit && vite build',
      typecheck: 'tsc --noEmit',
      preview: 'vite preview',
    },
    dependencies: pick(plainDependencies),
    devDependencies: pick(plainDevDependencies),
  }
  const files = new Map([
    ['package.json', `${JSON.stringify(manifest, null, 2)}\n`],
    [
      'index.html',
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    ],
    [
      'vite.config.ts',
      `import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`,
    ],
    [
      'tsconfig.json',
      `${JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            types: ['vite/client'],
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            isolatedModules: true,
            verbatimModuleSyntax: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
          },
          include: ['src', 'vite.config.ts'],
        },
        null,
        2
      )}\n`,
    ],
    ['src/index.css', "@import 'tailwindcss';\n"],
    [
      'src/main.tsx',
      `import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Missing #root element')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
`,
    ],
    [
      'src/App.tsx',
      `export function App() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">App</h1>
      <p className="mt-2">Welcome.</p>
    </main>
  )
}
`,
    ],
  ])
  return new Map([...files].sort(([left], [right]) => left.localeCompare(right)))
}

const coreMcpTools = 'component,example,token,rules,manifest'

function codexBaseArgs({ prompt, model, sandbox, outputPath, mcp = [] }) {
  return [
    'exec',
    '--ignore-user-config',
    '--disable',
    'plugins',
    '--disable',
    'apps',
    '--disable',
    'browser_use',
    '--disable',
    'computer_use',
    '--disable',
    'multi_agent',
    '--ephemeral',
    '--skip-git-repo-check',
    '--sandbox',
    sandbox,
    '--json',
    ...(outputPath ? ['--output-last-message', outputPath] : []),
    ...(model ? ['--model', model] : []),
    ...mcp,
    prompt,
  ]
}

/** Codex arguments for one builder arm. */
export function codexBuilderArgs({ arm, prompt, cliBin, model, outputPath }) {
  const usesDesignSystem = arm !== 'plain'
  const mcp = usesDesignSystem
    ? [
        '--config',
        'mcp_servers.atom63.command="node"',
        '--config',
        `mcp_servers.atom63.args=${JSON.stringify([cliBin, 'mcp'])}`,
        ...(arm === 'ds-core'
          ? ['--config', `mcp_servers.atom63.env={ ATOM63_MCP_TOOLS="${coreMcpTools}" }`]
          : []),
      ]
    : []
  return codexBaseArgs({ prompt, model, sandbox: 'workspace-write', outputPath, mcp })
}

/** Codex arguments for the visual judge: its sandbox is read-only. */
export function codexJudgeArgs({ prompt, model, outputPath }) {
  return codexBaseArgs({ prompt, model, sandbox: 'read-only', outputPath })
}

/** A shell-quoted command line, for the dry run. */
export function formatCommand(command, args) {
  const quote = value =>
    /^[\w@%+=:,./-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`
  const shown = args.map(value => (value.length > 120 ? `${value.slice(0, 117)}...` : value))
  return [command, ...shown].map(quote).join(' ')
}

/**
 * Summarize `codex exec --json` events for the report.
 */
export function summarizeCodexEvents(events, { durationMs, model }) {
  const turns = events.filter(event => event.type === 'turn.completed')
  const usage = turns.reduce(
    (total, event) => ({
      inputTokens: total.inputTokens + (event.usage?.input_tokens ?? 0),
      cachedInputTokens: total.cachedInputTokens + (event.usage?.cached_input_tokens ?? 0),
      outputTokens: total.outputTokens + (event.usage?.output_tokens ?? 0),
    }),
    { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }
  )
  return {
    durationMs,
    models: [model ?? 'Codex CLI default'],
    failedTools: events.filter(
      event => event.type === 'item.completed' && event.item?.status === 'failed'
    ).length,
    stopReason: turns.length ? 'completed' : 'error',
    turns: turns.length,
    usage,
  }
}
