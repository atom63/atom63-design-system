/**
 * Accessibility pattern contracts.
 *
 * Each WAI-ARIA Authoring Practices (APG) pattern the system implements is
 * written down once, as plain data: the parts of the pattern and their roles,
 * the states and relationships between them, and the keyboard map. Component
 * contracts bind to a pattern (`accessibility` in `<name>-contract.ts`), and
 * the renderers verify the binding: the web in Storybook's `a11y` Vitest
 * project, iOS later.
 *
 * The data is renderer-neutral. It names parts (`trigger`, `menu`, `item`),
 * never DOM selectors; a renderer's harness finds each part by its role.
 */

/** The ARIA roles the pattern contracts use. */
export type A11yRole =
  | 'alertdialog'
  | 'button'
  | 'checkbox'
  | 'combobox'
  | 'dialog'
  | 'heading'
  | 'listbox'
  | 'menu'
  | 'menuitem'
  | 'option'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'tabpanel'

/** The APG patterns with a contract. The id is the APG page slug. */
export type A11yPatternId =
  | 'accordion'
  | 'alertdialog'
  | 'checkbox'
  | 'combobox-select-only'
  | 'dialog-modal'
  | 'menu-button'
  | 'radio'
  | 'switch'
  | 'tabs'

/** ARIA states an accessibility tree node can require, as the tree prints them. */
export type A11yTreeState = 'checked' | 'disabled' | 'expanded' | 'pressed' | 'selected'

/** One element (or set of like elements) of a pattern. */
export interface A11yPart {
  /** What the part is, in the APG's words. */
  description: string
  /** Several instances of the part exist (tabs, menu items). */
  multiple?: boolean
  /** `required`: the part must have an accessible name. */
  name: 'required' | 'none'
  /** The ARIA role a harness finds the part by. */
  role: A11yRole
  /** The part renders only while the pattern's popup is open. */
  whileOpen?: boolean
  /** The part is looked up inside this part, rather than on the whole page. */
  within?: string
}

/**
 * Which instance of a part: by position among its siblings, the selected one
 * (`aria-selected="true"`) or the checked one (`aria-checked="true"`).
 */
export type A11yPosition = 'checked' | 'first' | 'last' | 'selected' | number

/** An instance of a part, or the first or last tabbable element inside it. */
export type A11yTarget =
  { at?: A11yPosition; part: string } | { part: string; tabbable: 'first' | 'last' }

/** Where focus is expected: an instance of a part, anywhere inside a part, or the page start. */
export type A11yFocus = A11yTarget | { inside: string } | 'page-start'

/** An attribute a part must carry, or an ID reference it must hold. */
export interface A11yAttributeCheck {
  /** `aria-*` attribute (or `tabindex`) to read. */
  attribute: string
  /** Allowed values. A list means any one of them. */
  equals?: string | readonly string[]
  /** The attribute holds the ID of an instance of this part. */
  references?: string
  /** The attribute holds IDs of elements that exist and have text. */
  resolves?: boolean
  /** The instance to check. Omitted: every instance. */
  target: { at?: A11yPosition; part: string }
}

/** A structural requirement from the pattern's "Roles, States, and Properties" section. */
export interface A11yStructureCheck extends A11yAttributeCheck {
  /** Stable id, used by `knownGaps`. */
  id: string
  /** `optional` checks are ones the APG allows but does not require. */
  requirement: 'optional' | 'required'
  /** The rule, paraphrasing the APG. */
  rule: string
}

/** One node of the expected accessibility tree. */
export interface A11yTreeNode {
  /** Nodes that must appear under this one, in order. */
  children?: readonly A11yTreeNode[]
  /** The part this node is. */
  part: string
  /** States the node must have. */
  states?: readonly A11yTreeState[]
}

/** The state before or after a key press. */
export interface A11yKeyboardState {
  /** Attribute values that hold in this state. */
  attributes?: readonly A11yAttributeCheck[]
  /** Where focus is. */
  focus?: A11yFocus
  /** Whether the pattern's popup is open. */
  open?: boolean
}

/** One row of the pattern's keyboard map. */
export interface A11yKeyboardInteraction {
  /** The precondition. `focus` is required: every key acts on the focused element. */
  given: A11yKeyboardState & { focus: A11yFocus }
  /** Stable id, used by `knownGaps`. */
  id: string
  /** The key as the APG names it ("Down Arrow"). */
  key: string
  /** The key in Testing Library `keyboard` syntax (`{ArrowDown}`, `{Shift>}{Tab}{/Shift}`). */
  keys: string
  /** `optional` rows are ones the APG marks optional. */
  requirement: 'optional' | 'required'
  /** The expected result, paraphrasing the APG. */
  result: string
  /** The resulting state. */
  then: A11yKeyboardState
  /** The row applies only when the binding picks these option values. */
  when?: Readonly<Record<string, string>>
}

/** A WAI-ARIA APG pattern, as data. */
export interface A11yPatternContract {
  /** The APG page slug. */
  id: A11yPatternId
  /** The keyboard map, one row per key and starting state. */
  keyboard: readonly A11yKeyboardInteraction[]
  /** The pattern's name on the APG. */
  name: string
  /** How a harness opens the popup: press `keys` with focus on `part`. */
  opener?: { keys: string; part: string }
  /** Choices the APG leaves to the implementation, with the allowed values. */
  options?: Readonly<Record<string, readonly string[]>>
  /** The elements of the pattern, by the id the checks use. */
  parts: Readonly<Record<string, A11yPart>>
  /** The part that opens and closes. */
  popup?: string
  /** The APG pattern page. */
  source: string
  /** The required states, properties and ID references. */
  structure: readonly A11yStructureCheck[]
  /** The expected accessibility tree, one entry per root that a harness snapshots. */
  tree: readonly A11yTreeNode[]
}

/** A check the component fails today, kept visible instead of silently skipped. */
export interface A11yKnownGap {
  /** A `structure` or `keyboard` id of the pattern, or `tree`. */
  check: string
  /** Why the component fails the check, and what a fix needs. */
  reason: string
}

/** How a component contract declares the pattern it implements. */
export interface A11yPatternBinding {
  /** Checks the component fails today; they run as expected failures. */
  knownGaps?: readonly A11yKnownGap[]
  /** The option values the component picks, for each of the pattern's `options`. */
  options?: Readonly<Record<string, string>>
  /** The pattern the component implements. */
  pattern: A11yPatternId
}
