#!/usr/bin/env node
/**
 * Post-build step: put `'use client'` back at the top of every built file that
 * holds a `'use client'` source module (see lib/use-client.mjs), then delete
 * the metafile so it is not published. Fails when a client module lands next
 * to a module that is neither client nor declared server-safe (`serverSafeByPackage`
 * in lib/use-client.mjs).
 *
 * Run from a package directory after `tsup` with `metafile: true`:
 *   node ../../scripts/design-system/preserve-use-client.mjs
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { addDirective, planUseClient, serverSafeByPackage } from './lib/use-client.mjs'

const cwd = process.cwd()
const { name } = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'))
const metafilePath = path.join(cwd, 'dist/metafile-esm.json')
if (!existsSync(metafilePath)) {
  console.error(`${name}: dist/metafile-esm.json is missing; build with tsup \`metafile: true\`.`)
  process.exit(1)
}
const metafile = JSON.parse(readFileSync(metafilePath, 'utf8'))
rmSync(metafilePath)

const { mark, unmarked, failures } = planUseClient(
  metafile,
  file => readFileSync(path.join(cwd, file), 'utf8'),
  { serverSafe: serverSafeByPackage[name] ?? [] }
)

for (const output of mark) {
  const file = path.join(cwd, output)
  const mapFile = `${file}.map`
  const map = existsSync(mapFile) ? readFileSync(mapFile, 'utf8') : undefined
  const result = addDirective(readFileSync(file, 'utf8'), map)
  writeFileSync(file, result.code)
  if (result.map) writeFileSync(mapFile, result.map)
}

if (failures.length > 0) {
  console.error(`${name}: 'use client' cannot be kept:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
const note = unmarked.length > 0 ? `, ${unmarked.length} shared with server-safe modules` : ''
console.log(`${name}: kept 'use client' in ${mark.length} built file(s)${note}.`)
