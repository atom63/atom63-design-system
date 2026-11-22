/**
 * Keep `'use client'` through the build. esbuild bundles each package's source
 * modules into entry files and shared chunks and drops module directives on
 * the way, so a React Server Components bundler sees no client boundary.
 *
 * From esbuild's metafile, an output file gets the directive when it holds a
 * source module that starts with `'use client'` (or is the entry of one) and
 * every other source module in it is a client module too or a re-export
 * barrel. An output that also holds a server-safe module (one that is neither)
 * stays unmarked, because marking it would turn that module's exports into
 * client references on the server. Such modules must be declared in
 * `serverSafe`; any other mix is a failure, so a new client module cannot lose
 * its directive silently.
 */

const DIRECTIVE = /^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*['"]use client['"]/
const COMMENT = /\/\*[\s\S]*?\*\/|(^|[^:\\])\/\/[^\n]*/g
const REEXPORT =
  /export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+['"][^'"]+['"]\s*;?/g
const TYPE_IMPORT = /import\s+type\s+(?:\{[^}]*\}|\w+)\s+from\s+['"][^'"]+['"]\s*;?/g

/** Whether a source text starts with the `'use client'` directive. */
export const hasUseClient = text => DIRECTIVE.test(text)

/** Whether a source text only re-exports (a barrel) and runs no code of its own. */
export const isBarrel = text =>
  text.replace(COMMENT, '$1').replace(REEXPORT, '').replace(TYPE_IMPORT, '').trim() === ''

/**
 * @param {{ outputs: Record<string, { inputs: Record<string, unknown>, entryPoint?: string }> }} metafile
 * @param {(file: string) => string} readSource source text by metafile input path
 * @param {{ serverSafe?: string[] }} [options]
 * @returns {{ mark: string[], unmarked: { output: string, client: string[], serverSafe: string[] }[], failures: string[] }}
 */
export function planUseClient(metafile, readSource, { serverSafe = [] } = {}) {
  const declared = new Set(serverSafe)
  const kinds = new Map()
  const kind = file => {
    if (!kinds.has(file)) {
      const text = readSource(file)
      kinds.set(file, hasUseClient(text) ? 'client' : isBarrel(text) ? 'barrel' : 'server')
    }
    return kinds.get(file)
  }
  const mark = []
  const unmarked = []
  const failures = []
  for (const [output, { inputs, entryPoint }] of Object.entries(metafile.outputs)) {
    if (!output.endsWith('.js')) continue
    const sources = Object.keys(inputs).filter(file => !file.includes('node_modules'))
    const client = sources.filter(file => kind(file) === 'client')
    const server = sources.filter(file => kind(file) === 'server')
    const clientEntry = entryPoint && kind(entryPoint) === 'client'
    if (client.length === 0 && !clientEntry) continue
    if (server.length === 0) {
      mark.push(output)
      continue
    }
    unmarked.push({ output, client, serverSafe: server })
    const undeclared = server.filter(file => !declared.has(file))
    if (undeclared.length > 0) {
      failures.push(
        `${output} holds 'use client' modules (${client.join(', ')}) next to modules that are neither client nor declared server-safe: ${undeclared.join(', ')}`
      )
    }
  }
  for (const file of declared) {
    if (!kinds.has(file)) failures.push(`${file} is declared server-safe but is not in any output`)
    else if (kinds.get(file) !== 'server')
      failures.push(`${file} is declared server-safe but is ${kinds.get(file)}`)
  }
  return { mark, unmarked, failures }
}

/**
 * Prepend the directive to a built file and shift its source map by one line.
 * @param {string} code
 * @param {string | undefined} map the `.js.map` JSON, if any
 */
export function addDirective(code, map) {
  if (hasUseClient(code)) return { code, map }
  const shifted = map ? JSON.parse(map) : undefined
  if (shifted) shifted.mappings = `;${shifted.mappings}`
  return {
    code: `'use client';\n${code}`,
    map: shifted ? JSON.stringify(shifted) : undefined,
  }
}
