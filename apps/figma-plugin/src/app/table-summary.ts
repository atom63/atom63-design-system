import type { TokenTable } from '@atom63/figma'

const count = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`

/** One line that says what token table the file holds. */
export function summarizeTable(table: TokenTable): { empty: boolean; line: string } {
  if (table.variables === 0) return { empty: true, line: 'This file has no token table yet.' }
  return {
    empty: false,
    line:
      `${count(table.variables, 'variable', 'variables')} in ` +
      `${count(table.collections.length, 'collection', 'collections')}, ` +
      `${count(table.textStyles, 'text style', 'text styles')} and ` +
      `${count(table.effectStyles, 'effect style', 'effect styles')}.`,
  }
}
