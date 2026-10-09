import type { TokenTable } from '@atom63/figma'

import type { DesignSystemTable } from '../messages'
import { plural } from './format'

/** One line that says what token table the file holds. */
export function summarizeTable(table: TokenTable): { empty: boolean; line: string } {
  if (table.variables === 0) return { empty: true, line: 'This file has no token table yet.' }
  return {
    empty: false,
    line:
      `${plural(table.variables, 'variable')} in ` +
      `${plural(table.collections.length, 'collection')}, ` +
      `${plural(table.textStyles, 'text style')} and ` +
      `${plural(table.effectStyles, 'effect style')}.`,
  }
}

/**
 * Why Home's Atom63 entry is unavailable, or null when it is available. A file
 * whose scan says a build would be refused needs a new file; a scan that could
 * not run leaves the entry open, and the Atom63 view scans again.
 */
export function atom63Unavailable(atom63: DesignSystemTable | null): string | null {
  return atom63?.blocked ? 'Needs a new file — this file holds another token set.' : null
}
