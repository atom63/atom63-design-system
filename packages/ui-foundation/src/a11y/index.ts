import { accordionPattern } from './accordion'
import { alertDialogPattern } from './alert-dialog'
import { checkboxPattern } from './checkbox'
import { comboboxSelectOnlyPattern } from './combobox-select-only'
import { dialogModalPattern } from './dialog'
import { menuButtonPattern } from './menu'
import { radioPattern } from './radio'
import { switchPattern } from './switch'
import { tabsPattern } from './tabs'
import type { A11yPatternContract, A11yPatternId } from './types'

export { accordionPattern } from './accordion'
export { alertDialogPattern } from './alert-dialog'
export { checkboxPattern } from './checkbox'
export { comboboxSelectOnlyPattern } from './combobox-select-only'
export { dialogModalPattern } from './dialog'
export { menuButtonPattern } from './menu'
export { radioPattern } from './radio'
export { switchPattern } from './switch'
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
  accordion: accordionPattern,
  alertdialog: alertDialogPattern,
  checkbox: checkboxPattern,
  'combobox-select-only': comboboxSelectOnlyPattern,
  'dialog-modal': dialogModalPattern,
  'menu-button': menuButtonPattern,
  radio: radioPattern,
  switch: switchPattern,
  tabs: tabsPattern,
}

/** The APG pattern contract with the given id. */
export function getA11yPattern(id: A11yPatternId): A11yPatternContract {
  return a11yPatterns[id]
}
