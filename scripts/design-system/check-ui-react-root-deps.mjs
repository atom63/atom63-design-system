#!/usr/bin/env node
/**
 * Fails if the built `@atom63/ui-react` root entry reaches a dependency that
 * belongs on its own subpath. Node does not tree-shake, so every module the
 * root imports is evaluated by every consumer test and SSR process that
 * imports anything from the root. `react-day-picker` alone took about 0.8 s
 * there; `Calendar` lives on `@atom63/ui-react/calendar` to keep it out.
 *
 *   node scripts/design-system/check-ui-react-root-deps.mjs
 *
 * Build the package first (`pnpm --filter @atom63/ui-react build`).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const distDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../packages/ui-react/dist'
)

/** Dependency -> the subpath entry that is allowed to load it. */
const subpathOnlyDependencies = { 'react-day-picker': 'calendar/index.js' }

const importPattern = /(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"]+)\1/g

/** The entry file and every file it reaches through relative imports. */
function moduleGraph(entry) {
  const seen = new Set()
  const pending = [path.join(distDirectory, entry)]
  while (pending.length > 0) {
    const file = pending.pop()
    if (seen.has(file)) continue
    seen.add(file)
    for (const [, , specifier] of readFileSync(file, 'utf8').matchAll(importPattern)) {
      if (specifier.startsWith('.')) pending.push(path.resolve(path.dirname(file), specifier))
    }
  }
  return seen
}

/** Files in the graph that import the dependency. */
function importersOf(graph, dependency) {
  return [...graph].filter(file =>
    [...readFileSync(file, 'utf8').matchAll(importPattern)].some(
      ([, , specifier]) => specifier === dependency || specifier.startsWith(`${dependency}/`)
    )
  )
}

if (!existsSync(path.join(distDirectory, 'index.js'))) {
  console.error('UI React root dependency check failed: build output is missing')
  process.exit(1)
}

const rootGraph = moduleGraph('index.js')
const failures = []
for (const [dependency, subpathEntry] of Object.entries(subpathOnlyDependencies)) {
  for (const file of importersOf(rootGraph, dependency)) {
    failures.push(`${path.relative(distDirectory, file)} imports ${dependency}`)
  }
  // Guard the guard: the subpath must still reach the dependency, or this check proves nothing.
  if (importersOf(moduleGraph(subpathEntry), dependency).length === 0) {
    failures.push(`${subpathEntry} no longer imports ${dependency}; update this check`)
  }
}

if (failures.length > 0) {
  console.error('UI React root dependency check failed: the root entry must not load')
  console.error(`${Object.keys(subpathOnlyDependencies).join(', ')}.`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  `UI React root dependency check passed: ${rootGraph.size} root modules, none load ${Object.keys(subpathOnlyDependencies).join(', ')}`
)
