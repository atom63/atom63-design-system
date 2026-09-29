import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { CssFile } from './css-model'

/** A token directory's CSS files, in the order its index.css imports them; later files win. */
export function readTokenDirectory(directory: string): CssFile[] {
  const names = readdirSync(directory).filter(name => name.endsWith('.css'))
  const index = names.includes('index.css')
    ? readFileSync(join(directory, 'index.css'), 'utf8')
    : ''
  const imports = [...index.matchAll(/@import\s+["'](?:\.\/)?([^"']+)["']/g)].map(match => match[1])
  const rank = (name: string) => (imports.includes(name) ? imports.indexOf(name) : imports.length)
  return names
    .filter(name => name !== 'index.css')
    .sort((left, right) => rank(left) - rank(right) || left.localeCompare(right))
    .map(name => ({ name, text: readFileSync(join(directory, name), 'utf8') }))
}
