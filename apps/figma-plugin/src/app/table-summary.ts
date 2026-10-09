import type { TokenTable } from '@atom63/figma'

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
