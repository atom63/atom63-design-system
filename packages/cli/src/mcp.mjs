/**
 * The MCP server: every query command in the command table becomes a tool
 * with the same name, input and response types, so an MCP host and the CLI
 * give the same answers. Served over stdio by `atom63 mcp`.
 *
 * A tool result carries the CLI's readable text as `content` and the typed
 * `{ type, data }` envelope as `structuredContent`. A failed query is an
 * `isError` result whose envelope holds the stable error `code`.
 */
import { McpServer } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import * as z from 'zod/v4'

import { commands } from './commands.mjs'
import { AtomError, loadIndex } from './core.mjs'
import { formatEnvelope } from './format.mjs'

const packageVersion = '0.0.0'

/** A zod object schema for a command's positional arguments and flags. */
export function inputSchema(command) {
  const shape = {}
  for (const arg of command.args) {
    const field = z.string().min(1).describe(arg.description)
    shape[arg.name] = arg.optional ? field.optional() : field
  }
  for (const flag of command.flags) {
    let field
    if (flag.type === 'number') field = z.number().int().positive()
    else if (flag.choices) field = z.enum(flag.choices)
    else field = z.string()
    shape[flag.name] = field.describe(flag.description).optional()
  }
  return z.object(shape)
}

const result = (envelope, isError = false) => ({
  content: [{ type: 'text', text: formatEnvelope(envelope) }],
  structuredContent: envelope,
  ...(isError ? { isError: true } : {}),
})

/** A new server instance with one read-only tool per query command. */
export function createAtomServer(index = loadIndex()) {
  const server = new McpServer({ name: 'atom63', version: packageVersion })
  for (const command of commands) {
    server.registerTool(
      command.name,
      {
        title: `atom63 ${command.name}`,
        description: `${command.summary} Returns ${command.returns.join(' or ')}.`,
        inputSchema: inputSchema(command),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async input => {
        try {
          return result(command.run(index, input ?? {}))
        } catch (error) {
          if (error instanceof AtomError) return result(error.toEnvelope(), true)
          throw error
        }
      }
    )
  }
  return server
}

/** Serve over stdio until the host closes the connection. */
export function serve() {
  return serveStdio(() => createAtomServer())
}
