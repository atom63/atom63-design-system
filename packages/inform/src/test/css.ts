import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * jsdom has no layout engine and does not apply `1lh`, `:has()` or cascade
 * layers, so the surface tests pin the mechanism in the shipped stylesheet
 * instead: the class a component renders, and the declarations that class gets.
 */
const here = path.dirname(fileURLToPath(import.meta.url))

export const STYLESHEETS = [
  'inform-parts',
  'inform-banner',
  'inform-corner-flyout',
  'inform-dialog',
  'inform-spotlight',
] as const

const sheet = STYLESHEETS.map(name =>
  readFileSync(path.join(here, '../surfaces', `${name}.css`), 'utf8')
)
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '')

/** Declarations of every rule whose selector list contains `selector` exactly. */
export function declarations(selector: string): Record<string, string> {
  const found: Record<string, string> = {}
  for (const [, selectors = '', body = ''] of sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.split(',').some(candidate => candidate.trim() === selector)) continue
    for (const declaration of body.split(';')) {
      const colon = declaration.indexOf(':')
      if (colon === -1) continue
      found[declaration.slice(0, colon).trim()] = declaration
        .slice(colon + 1)
        .trim()
        .replace(/\s+/g, ' ')
    }
  }
  return found
}

export function readStylesheet(relative: string): string {
  return readFileSync(path.join(here, '..', relative), 'utf8')
}
