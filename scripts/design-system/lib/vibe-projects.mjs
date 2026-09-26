/**
 * Projects, prompts and `claude -p` arguments for the vibe runner (E4). Pure
 * functions, so the dry run and the tests see exactly what a real run sends.
 */

/** @typedef {{ id: string, title: string, body: string, markdown: string }} Brief */

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

/** The builder prompt. Both arms get exactly this text. */
export function builderPrompt(brief) {
  return [
    `Build the following as a new page of this app, reachable at the URL path \`${pagePath(brief)}\`. Keep the pages that already exist working.`,
    '',
    `## ${brief.title}`,
    '',
    brief.body,
    '',
    '## Constraints',
    '',
    '- Work only inside this project directory.',
    '- Use only the dependencies that are already installed; do not add packages.',
    '- Use realistic mock data where the page needs data; there is no backend.',
    '- When you are done, `pnpm typecheck` and `pnpm build` must both pass.',
  ].join('\n')
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

/** Tools a builder may use. Bash is limited to the project's own scripts. */
export const builderTools = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash']
export const builderAllowed = [
  'Read',
  'Glob',
  'Grep',
  'Edit(./**)',
  'Write(./**)',
  'Bash(pnpm typecheck)',
  'Bash(pnpm build)',
  'Bash(pnpm run typecheck)',
  'Bash(pnpm run build)',
]

/**
 * Arguments shared by every run: headless JSON output, no user settings,
 * skills or memory, only the MCP servers passed here, and permission mode
 * `dontAsk`, which denies anything the allowlist does not name.
 */
function baseArgs({ prompt, model, maxTurns, maxBudgetUsd, mcpConfig }) {
  return [
    '-p',
    prompt,
    '--output-format',
    'json',
    '--permission-mode',
    'dontAsk',
    '--setting-sources',
    'project,local',
    '--disable-slash-commands',
    '--no-session-persistence',
    '--strict-mcp-config',
    '--mcp-config',
    JSON.stringify(mcpConfig ?? { mcpServers: {} }),
    '--max-turns',
    String(maxTurns),
    '--max-budget-usd',
    String(maxBudgetUsd),
    ...(model ? ['--model', model] : []),
  ]
}

/**
 * `claude` arguments for a builder. The `ds` arm also gets the `atom63` MCP
 * server from this repo's CLI.
 * @param {{ arm: 'ds' | 'plain', prompt: string, cliBin: string, model?: string, maxTurns: number, maxBudgetUsd: number }} options
 */
export function builderArgs({ arm, prompt, cliBin, model, maxTurns, maxBudgetUsd }) {
  const mcpConfig =
    arm === 'ds'
      ? { mcpServers: { atom63: { command: 'node', args: [cliBin, 'mcp'] } } }
      : { mcpServers: {} }
  return [
    ...baseArgs({ prompt, model, maxTurns, maxBudgetUsd, mcpConfig }),
    '--tools',
    builderTools.join(','),
    '--allowedTools',
    ...builderAllowed,
    ...(arm === 'ds' ? ['mcp__atom63'] : []),
  ]
}

/** `claude` arguments for the judge: it can only read files in its directory. */
export function judgeArgs({ prompt, model, maxTurns, maxBudgetUsd }) {
  return [
    ...baseArgs({ prompt, model, maxTurns, maxBudgetUsd }),
    '--tools',
    'Read,Glob',
    '--allowedTools',
    'Read',
    'Glob',
  ]
}

/** A shell-quoted command line, for the dry run. */
export function formatCommand(command, args) {
  const quote = value =>
    /^[\w@%+=:,./-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`
  const shown = args.map(value => (value.length > 120 ? `${value.slice(0, 117)}...` : value))
  return [command, ...shown].map(quote).join(' ')
}

/**
 * The fields of a `claude -p --output-format json` result the report keeps.
 * @param {any} result
 */
export function summarizeClaudeResult(result) {
  return {
    costUsd: result.total_cost_usd ?? 0,
    durationMs: result.duration_ms ?? 0,
    isError: Boolean(result.is_error),
    models: Object.keys(result.modelUsage ?? {}),
    permissionDenials: (result.permission_denials ?? []).map(({ tool_name, tool_input }) => ({
      tool: tool_name,
      input: tool_input?.command ?? tool_input?.file_path ?? '',
    })),
    stopReason: result.subtype ?? result.terminal_reason ?? '',
    turns: result.num_turns ?? 0,
  }
}
