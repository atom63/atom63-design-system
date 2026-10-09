import type { TokenTable } from '@atom63/figma'

import type { DesignSystemTable } from '../messages'
import { summarizeTable } from './table-summary'

/** Where the site template's model puts its axis-free tokens (`BASE_COLLECTION` in @atom63/figma). */
const BASE_COLLECTION = 'Base'

/** One of Home's ways in. */
export type HomeEntry = 'create' | 'import' | 'atom63'

export interface FileStatus {
  /**
   * What the file holds: nothing, the site template's table (written by
   * Cipher, the CLI or an agent; they write the same table), the Atom63
   * design system, or another token set.
   */
  kind: 'empty' | 'template' | 'atom63' | 'other'
  /** The one status line Home leads with. */
  line: string
  /** The entry that gets the primary button; null when all are equal. */
  recommended: HomeEntry | null
  /** The entries Home shows, in order; the rest do not apply and are hidden. */
  entries: HomeEntry[]
}

/**
 * What the open file holds and what to do next (R2).
 *
 * The table counts only variables with a token's code syntax, so the signals
 * are which collections hold them. The site template's model always writes its
 * axis-free tokens (the palette) to `Base`, whoever wrote the table; a token
 * set without a `Base` collection is one that model did not write — another
 * tool's, or an older Atom63 version this one can't update — so Import again
 * is not recommended for it. Atom63 needs the engine's proof (`atom63`) and no
 * other set beside it (`template`); a scan that could not run (`atom63` null)
 * decides from the table alone.
 */
export function fileStatus(table: TokenTable, atom63: DesignSystemTable | null): FileStatus {
  const summary = summarizeTable(table)
  if (summary.empty)
    return {
      kind: 'empty',
      line: 'This file has no tokens yet.',
      recommended: null,
      entries: ['create', 'import', 'atom63'],
    }
  if (atom63?.atom63 && !atom63.template)
    return {
      kind: 'atom63',
      line: `This file holds the Atom63 design system: ${summary.line}`,
      recommended: 'atom63',
      entries: ['atom63'],
    }
  if (!table.collections.some(collection => collection.name === BASE_COLLECTION))
    return {
      kind: 'other',
      line: `This file holds a token set the site template didn't write: ${summary.line}`,
      recommended: null,
      entries: ['import', 'atom63'],
    }
  return {
    kind: 'template',
    line: summary.line,
    recommended: 'import',
    entries: ['import', 'atom63'],
  }
}
