#!/usr/bin/env node
/**
 * Create a new project on the Atom63 design system.
 *
 *   pnpm create @atom63 <directory> [--kind site] [--title "My site"]
 *
 * In the design system repo: pnpm create:app <directory>
 */
import { realpathSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { kinds, packageName, planProject, writeProject } from './generate.mjs'

export function main(argv) {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      kind: { type: 'string', default: 'site' },
      title: { type: 'string' },
    },
  })
  if (values.help || positionals.length !== 1) {
    return {
      exitCode: values.help ? 0 : 2,
      output: `Usage: create-atom63 <directory> [--kind ${kinds.join('|')}] [--title "My site"]`,
    }
  }

  const directory = path.resolve(positionals[0])
  try {
    const files = planProject({
      name: packageName(directory),
      kind: values.kind,
      title: values.title,
    })
    writeProject(directory, files)
    const relative = path.relative(process.cwd(), directory) || '.'
    return {
      exitCode: 0,
      output: [
        `Created ${relative} (${values.kind}, ${files.size} files).`,
        '',
        'Next:',
        `  cd ${relative}`,
        '  pnpm install',
        '  pnpm dev',
      ].join('\n'),
    }
  } catch (error) {
    return { exitCode: 1, output: error.message }
  }
}

const invoked = process.argv[1] ? realpathSync(process.argv[1]) : ''
if (invoked === fileURLToPath(import.meta.url)) {
  const { exitCode, output } = main(process.argv.slice(2))
  ;(exitCode === 0 ? process.stdout : process.stderr).write(`${output}\n`)
  process.exitCode = exitCode
}
