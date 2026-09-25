#!/usr/bin/env node
/**
 * atom63 — query the Atom63 design system.
 *
 *   atom63 <command> [args] [--json]
 *   atom63 manifest        every command, argument, flag and response type
 *   atom63 mcp             serve the same commands as MCP tools over stdio
 *
 * Exit codes: 0 answered, 1 the query failed (unknown component, no match),
 * 2 the command line was wrong. With --json every result, failures included,
 * is one envelope on stdout, so a caller parses one stream and branches on
 * `type` and, for errors, `code`.
 */
import { realpathSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { commands } from './commands.mjs'
import { AtomError, loadIndex } from './core.mjs'
import { formatEnvelope } from './format.mjs'

export function runCli(argv) {
  const [name, ...rest] = argv
  const json = rest.includes('--json') || name === '--json'

  const fail = (error, exitCode) => ({
    exitCode,
    json,
    output: json ? JSON.stringify(error.toEnvelope(), null, 2) : formatEnvelope(error.toEnvelope()),
  })

  if (!name || name === '--help' || name === '-h' || name === 'help' || name === '--json') {
    return run(
      commands.find(command => command.name === 'manifest'),
      [],
      json
    )
  }

  const command = commands.find(candidate => candidate.name === name)
  if (!command) {
    return fail(
      new AtomError(
        'usage.unknown_command',
        `Unknown command "${name}".`,
        commands.map(candidate => candidate.name)
      ),
      2
    )
  }
  return run(command, rest, json)

  function run(chosen, rawArgs, asJson) {
    // A CSS variable (`--a63-surface-page`) is an argument, not a flag. Flags
    // are single words, so a dashed name that is not one of them is a value.
    const flagNames = new Set(['json', ...chosen.flags.map(flag => flag.name)])
    const variables = rawArgs.filter(
      arg => /^--[a-z0-9]+-[a-z0-9-]+$/.test(arg) && !flagNames.has(arg.slice(2))
    )
    const args = [...rawArgs.filter(arg => !variables.includes(arg)), '--', ...variables]
    let parsed
    try {
      parsed = parseArgs({
        args,
        allowPositionals: true,
        options: {
          json: { type: 'boolean', default: false },
          ...Object.fromEntries(chosen.flags.map(flag => [flag.name, { type: 'string' }])),
        },
      })
    } catch (error) {
      return fail(new AtomError('usage.invalid_flag', error.message), 2)
    }

    const input = {}
    const required = chosen.args.filter(arg => !arg.optional)
    if (parsed.positionals.length < required.length) {
      const missing = required[parsed.positionals.length]
      return fail(
        new AtomError(
          'usage.missing_argument',
          `atom63 ${chosen.name} needs <${missing.name}>: ${missing.description}`
        ),
        2
      )
    }
    // The last argument takes the rest, so `atom63 search date picker` works unquoted.
    chosen.args.forEach((arg, position) => {
      const isLast = position === chosen.args.length - 1
      const value = isLast
        ? parsed.positionals.slice(position).join(' ')
        : parsed.positionals[position]
      if (value) input[arg.name] = value
    })
    for (const flag of chosen.flags) {
      const raw = parsed.values[flag.name]
      if (raw === undefined) continue
      if (flag.type === 'number') {
        const value = Number(raw)
        if (!Number.isInteger(value) || value < 1) {
          return fail(
            new AtomError('usage.invalid_flag', `--${flag.name} takes a positive whole number.`),
            2
          )
        }
        input[flag.name] = value
      } else {
        if (flag.choices && !flag.choices.includes(raw)) {
          return fail(
            new AtomError(
              'usage.invalid_flag',
              `--${flag.name} must be one of: ${flag.choices.join(', ')}`
            ),
            2
          )
        }
        input[flag.name] = raw
      }
    }

    try {
      const envelope = chosen.run(loadIndex(), input)
      return {
        exitCode: 0,
        json: asJson,
        output: asJson ? JSON.stringify(envelope, null, 2) : formatEnvelope(envelope),
      }
    } catch (error) {
      if (error instanceof AtomError) return fail(error, 1)
      throw error
    }
  }
}

// Run when executed directly, including through the node_modules/.bin symlink.
const invoked = process.argv[1] ? realpathSync(process.argv[1]) : ''
if (invoked === fileURLToPath(import.meta.url) && process.argv[2] === 'mcp') {
  // Loaded only here, so plain queries never pay for the MCP SDK.
  const { serve } = await import('./mcp.mjs')
  serve()
} else if (invoked === fileURLToPath(import.meta.url)) {
  const { exitCode, json, output } = runCli(process.argv.slice(2))
  ;(exitCode === 0 || json ? process.stdout : process.stderr).write(`${output}\n`)
  process.exitCode = exitCode
}
