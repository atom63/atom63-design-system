import { alertDialogPattern } from './alert-dialog'
import { dialogModalPattern } from './dialog'
import { menuButtonPattern } from './menu'
import { tabsPattern } from './tabs'
import type { A11yPatternContract, A11yPatternId } from './types'

export { alertDialogPattern } from './alert-dialog'
export { dialogModalPattern } from './dialog'
export { menuButtonPattern } from './menu'
export { tabsPattern } from './tabs'
export type {
  A11yAttributeCheck,
  A11yFocus,
  A11yKeyboardInteraction,
  A11yKeyboardState,
  A11yKnownGap,
  A11yPart,
  A11yPatternBinding,
  A11yPatternContract,
  A11yPatternId,
  A11yPosition,
  A11yRole,
  A11yStructureCheck,
  A11yTarget,
  A11yTreeNode,
  A11yTreeState,
} from './types'

/** Every APG pattern contract, by id. */
export const a11yPatterns: Readonly<Record<A11yPatternId, A11yPatternContract>> = {
  alertdialog: alertDialogPattern,
  'dialog-modal': dialogModalPattern,
  'menu-button': menuButtonPattern,
  tabs: tabsPattern,
}

/** The APG pattern contract with the given id. */
export function getA11yPattern(id: A11yPatternId): A11yPatternContract {
  return a11yPatterns[id]
}
