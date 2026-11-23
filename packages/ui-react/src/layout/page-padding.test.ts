import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/*
 * Page guard. `cn` is tailwind-merge, so a `px-*`, `ps-*` or `pe-*` class on
 * Page replaces its inline safe-area inset. The templates, examples and docs a
 * product copies must put content padding inside Page (a Container) instead.
 */

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const roots = ['packages/templates/src', 'examples', 'apps/docs/src']

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === 'node_modules' || entry.name === 'dist') return []
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sources(path)
    return /\.(tsx|mdx)$/.test(entry.name) ? [path] : []
  })

/* The opening `<Page …>` tag's className, when it sets inline padding. */
const inlinePadding = /<Page\b[^>]*?className=["'{`][^"'}`]*?(?<=[\s"'{`:])(p[xse]-[^\s"'}`]+)/g

describe('Page inline padding', () => {
  it('is never set through className in the templates, examples or docs', () => {
    const found = roots
      .map(root => join(repoRoot, root))
      .filter(existsSync)
      .flatMap(sources)
      .flatMap(file =>
        [...readFileSync(file, 'utf8').matchAll(inlinePadding)].map(
          match => `${relative(repoRoot, file)}: ${match[1]}`
        )
      )
    expect(found).toEqual([])
  })

  it('catches a px class on Page', () => {
    expect([...'<Page className="px-4 sm:px-6">'.matchAll(inlinePadding)].map(m => m[1])).toEqual([
      'px-4',
    ])
    expect('<Page className="flex sm:ps-6">'.match(inlinePadding)).not.toBeNull()
    expect('<Page className="flex items-center">'.match(inlinePadding)).toBeNull()
    expect('<Page className="py-4">'.match(inlinePadding)).toBeNull()
  })
})
