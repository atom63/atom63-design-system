/**
 * Runtime craft rules, checked on a rendered story in Chromium
 * (see ../.storybook/craft.setup.ts and apps/storybook/README.md):
 *
 * - `disabled-hover`: a disabled control does not react to a real pointer hover.
 * - `target-size`: a pointer target is at least 24 × 24 CSS px (WCAG 2.5.8).
 * - `focus-visible`: an element reached with Tab shows a focus indicator, and a
 *   pointer press on a button does not.
 *
 * The rules take the pointer and keyboard as a `CraftDriver`, so the unit tests
 * and the story hook drive them through the same real input (Vitest browser
 * `userEvent`).
 */

export const CRAFT_RULES = ['disabled-hover', 'target-size', 'focus-visible'] as const
export type CraftRule = (typeof CRAFT_RULES)[number]

export interface CraftViolation {
  rule: CraftRule
  /** A stable description of the element, used as the baseline key. */
  element: string
  /** What was measured, for the failure message only. */
  detail: string
}

export interface CraftDriver {
  hover(element: Element): Promise<void>
  /** Moves the pointer off every element in the story. */
  resetPointer(): Promise<void>
  tab(): Promise<void>
  click(element: Element): Promise<void>
}

/**
 * A 2px spot in the bottom corner of the viewport, above everything else,
 * where the pointer rests between checks so that it hovers nothing in the story.
 */
export function pointerRest(document: Document): HTMLElement {
  let rest = document.querySelector<HTMLElement>('[data-craft-pointer-rest]')
  if (!rest) {
    rest = document.createElement('div')
    rest.setAttribute('data-craft-pointer-rest', '')
    rest.setAttribute('aria-hidden', 'true')
    rest.style.cssText =
      'position: fixed; inset-inline-end: 0; inset-block-end: 0; width: 2px; height: 2px; z-index: 2147483647'
    document.body.append(rest)
  }
  return rest
}

export interface CraftOptions {
  /** Rules to skip for this story (`parameters.craft.disable`). */
  disable?: readonly CraftRule[]
}

/** Upper bounds that keep the check fast on large stories. */
export const LIMITS = {
  disabledHover: 8,
  tabStops: 16,
  targets: 400,
} as const

/** The minimum target size of WCAG 2.5.8, in CSS px. */
export const MIN_TARGET = 24

const ROLES = [
  'button',
  'link',
  'tab',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'switch',
  'checkbox',
  'radio',
  'slider',
  'spinbutton',
  'combobox',
  'treeitem',
]
const roleSelector = (roles: readonly string[]) => roles.map(role => `[role="${role}"]`).join(', ')

/** Pointer targets: native controls, interactive roles and anything tabbable. */
export const INTERACTIVE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  roleSelector(ROLES),
  '[tabindex]:not([tabindex^="-"])',
].join(', ')

/** The controls `disabled-hover` hovers: buttons, links, inputs, options, menu items and tabs. */
const HOVERABLE_SELECTOR = [
  'button',
  'a',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  roleSelector([
    'button',
    'link',
    'tab',
    'option',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'checkbox',
    'radio',
    'switch',
  ]),
].join(', ')

export function isDisabled(element: Element): boolean {
  if (element.matches(':disabled')) return true
  if (element.getAttribute('aria-disabled') === 'true') return true
  const data = element.getAttribute('data-disabled')
  return data !== null && data !== 'false'
}

/** Rendered, not hidden, and larger than the 1px box of a visually hidden element. */
export function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  if (rect.width <= 1 || rect.height <= 1) return false
  const style = getComputedStyle(element)
  if (style.visibility !== 'visible' || style.display === 'contents') return false
  // A transparent native input under a custom-drawn control is not the target;
  // its label or the drawn control is.
  if (Number(style.opacity) === 0) return false
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  }
  return true
}

function collapse(text: string | null | undefined) {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

function accessibleName(element: Element): string {
  const label = element.getAttribute('aria-label')
  if (collapse(label)) return collapse(label)
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map(id => element.ownerDocument.getElementById(id)?.textContent)
      .join(' ')
    if (collapse(text)) return collapse(text)
  }
  const labels = (element as HTMLInputElement).labels
  if (labels && labels.length > 0) {
    const text = [...labels].map(item => item.textContent).join(' ')
    if (collapse(text)) return collapse(text)
  }
  const text = collapse(element.textContent)
  if (text) return text
  for (const attribute of ['title', 'placeholder', 'alt', 'value']) {
    const value = collapse(element.getAttribute(attribute))
    if (value) return value
  }
  const image = element.querySelector('img[alt], svg[aria-label]')
  const imageName = collapse(image?.getAttribute('alt') ?? image?.getAttribute('aria-label'))
  return imageName
}

/**
 * A stable, readable description: tag, role or input type, and accessible
 * name, such as `button[role=tab] "Overview"`. Generated ids are left out so
 * the baseline survives unrelated changes.
 */
export function describeElement(element: Element): string {
  const tag = element.tagName.toLowerCase()
  const role = element.getAttribute('role')
  const type = tag === 'input' ? (element.getAttribute('type') ?? 'text') : null
  const qualifier = role ? `[role=${role}]` : type ? `[type=${type}]` : ''
  const name = accessibleName(element)
  const shortName = name.length > 40 ? `${name.slice(0, 39)}…` : name
  return `${tag}${qualifier} ${shortName ? JSON.stringify(shortName) : '(unnamed)'}`
}

type StyleSnapshot = Record<string, string>

function readStyle(
  element: Element,
  properties: readonly string[],
  pseudo: string | null = null
): StyleSnapshot {
  const style = getComputedStyle(element, pseudo)
  const snapshot: StyleSnapshot = {}
  for (const property of properties) snapshot[property] = style.getPropertyValue(property)
  return snapshot
}

/** Properties that differ between two snapshots, as `property: before → after`. */
export function diffStyles(before: StyleSnapshot, after: StyleSnapshot): string[] {
  const changes: string[] = []
  for (const [property, value] of Object.entries(before)) {
    if (after[property] !== value) changes.push(`${property}: ${value} → ${after[property]}`)
  }
  return changes
}

// ---------------------------------------------------------------------------
// disabled-hover

export const HOVER_PROPERTIES = [
  'background-color',
  'background-image',
  'color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'box-shadow',
  'opacity',
  'text-decoration-line',
  'text-decoration-color',
  'text-decoration-style',
] as const

export function findDisabledControls(root: ParentNode): Element[] {
  return [...root.querySelectorAll(HOVERABLE_SELECTOR)].filter(
    element => isDisabled(element) && isVisible(element)
  )
}

export async function checkDisabledHover(
  root: ParentNode,
  driver: CraftDriver
): Promise<CraftViolation[]> {
  const violations: CraftViolation[] = []
  const controls = findDisabledControls(root).slice(0, LIMITS.disabledHover)
  for (const control of controls) {
    await driver.resetPointer()
    const before = readStyle(control, HOVER_PROPERTIES)
    await driver.hover(control)
    // Enabled in the meantime (a story still loading), so the hover is allowed.
    if (!control.isConnected || !isDisabled(control)) continue
    const changes = diffStyles(before, readStyle(control, HOVER_PROPERTIES))
    if (changes.length > 0) {
      violations.push({
        rule: 'disabled-hover',
        element: describeElement(control),
        detail: `hover changes ${changes.join('; ')}`,
      })
    }
  }
  if (controls.length > 0) await driver.resetPointer()
  return violations
}

// ---------------------------------------------------------------------------
// target-size

interface Box {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

function toBox(rect: DOMRect): Box {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

/** Measured to a tenth of a pixel, so sub-pixel layout does not flag a 24px box. */
export function isUndersized(box: Pick<Box, 'width' | 'height'>): boolean {
  const round = (value: number) => Math.round(value * 10) / 10
  return round(box.width) < MIN_TARGET || round(box.height) < MIN_TARGET
}

function center(box: Box) {
  return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 }
}

function distanceToBox(point: { x: number; y: number }, box: Box) {
  const dx = Math.max(box.left - point.x, 0, point.x - box.right)
  const dy = Math.max(box.top - point.y, 0, point.y - box.bottom)
  return Math.hypot(dx, dy)
}

/**
 * The spacing exception of WCAG 2.5.8: an undersized target passes when a
 * 24px-diameter circle on the center of its box intersects neither another
 * target nor the circle of another undersized target.
 */
export function passesSpacing(
  target: Box,
  others: readonly { box: Box; undersized: boolean }[]
): boolean {
  const origin = center(target)
  const radius = MIN_TARGET / 2
  for (const other of others) {
    if (other.undersized) {
      const otherCenter = center(other.box)
      if (Math.hypot(origin.x - otherCenter.x, origin.y - otherCenter.y) < MIN_TARGET - 0.05) {
        return false
      }
    } else if (distanceToBox(origin, other.box) < radius - 0.05) {
      return false
    }
  }
  return true
}

/**
 * The inline exception of WCAG 2.5.8: a target inside a sentence or block of
 * text, sized by its line height.
 */
export function isInlineInText(element: Element): boolean {
  if (getComputedStyle(element).display !== 'inline') return false
  let block = element.parentElement
  while (block && ['inline', 'contents'].includes(getComputedStyle(block).display)) {
    block = block.parentElement
  }
  if (!block) return false
  const own = collapse(element.textContent)
  const all = collapse(block.textContent)
  return all.replace(own, '').trim().length > 0
}

/**
 * The box that takes the pointer: the element's own, or the label that wraps
 * it (a click on the label activates the control).
 */
function targetBox(element: Element): Box {
  const own = toBox(element.getBoundingClientRect())
  const labels = (element as HTMLInputElement).labels
  if (!labels) return own
  for (const label of labels) {
    if (label.contains(element) && isVisible(label)) {
      const box = toBox(label.getBoundingClientRect())
      if (box.width * box.height > own.width * own.height) return box
    }
  }
  return own
}

/**
 * Covered by another element at its center (a card behind another in a
 * stack), so the pointer cannot reach it. A point outside the viewport cannot
 * be tested and counts as reachable.
 */
function isCovered(element: Element): boolean {
  const { x, y } = center(toBox(element.getBoundingClientRect()))
  const hit = element.ownerDocument.elementFromPoint(x, y)
  if (!hit || hit.hasAttribute('data-craft-pointer-rest')) return false
  return (
    !element.contains(hit) &&
    !hit.contains(element) &&
    !labelsOf(element).some(l => l.contains(hit))
  )
}

function labelsOf(element: Element): HTMLLabelElement[] {
  return [...((element as HTMLInputElement).labels ?? [])]
}

export function checkTargetSize(root: ParentNode): CraftViolation[] {
  const targets = [...root.querySelectorAll(INTERACTIVE_SELECTOR)]
    .filter(element => !isDisabled(element) && isVisible(element) && !isCovered(element))
    .slice(0, LIMITS.targets)
    .map(element => {
      const box = targetBox(element)
      return { element, box, undersized: isUndersized(box) }
    })
  const violations: CraftViolation[] = []
  for (const target of targets) {
    if (!target.undersized || isInlineInText(target.element)) continue
    const others = targets.filter(
      other =>
        other !== target &&
        !other.element.contains(target.element) &&
        !target.element.contains(other.element)
    )
    if (passesSpacing(target.box, others)) continue
    violations.push({
      rule: 'target-size',
      element: describeElement(target.element),
      detail: `${Math.round(target.box.width * 10) / 10} × ${Math.round(target.box.height * 10) / 10} px, too close to another target`,
    })
  }
  return violations
}

// ---------------------------------------------------------------------------
// focus-visible

const RING_PROPERTIES = [
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
  'box-shadow',
] as const
const PSEUDO_RING_PROPERTIES = [...RING_PROPERTIES, 'opacity', 'border-top-color'] as const
/** How far up a `:focus-within` ring may sit: a field wrapper, or the group around it. */
const RING_ANCESTORS = 3

function readRing(element: Element, properties: readonly string[], pseudo: string | null = null) {
  const ring = readStyle(element, properties, pseudo)
  // An outline only paints with a style and a width.
  if (ring['outline-style'] === 'none' || parseFloat(ring['outline-width']) === 0) {
    ring['outline-style'] = 'none'
    ring['outline-width'] = ring['outline-color'] = ring['outline-offset'] = ''
  }
  return ring
}

/**
 * Everything that can draw a focus ring: the element's outline and shadow,
 * those of its nearest ancestors (a field wrapper or input group ringed on
 * `:focus-within`), and its `::before` and `::after` pseudo-elements.
 */
export function readFocusIndicator(element: Element, { ancestors = true } = {}): StyleSnapshot {
  const snapshot: StyleSnapshot = {}
  const add = (prefix: string, values: StyleSnapshot) => {
    for (const [property, value] of Object.entries(values)) snapshot[`${prefix}${property}`] = value
  }
  add('', readRing(element, RING_PROPERTIES))
  let ancestor = element.parentElement
  for (let level = 1; ancestors && ancestor && level <= RING_ANCESTORS; level++) {
    add(`ancestor ${level} `, readRing(ancestor, RING_PROPERTIES))
    ancestor = ancestor.parentElement
  }
  for (const pseudo of ['::before', '::after']) {
    if (getComputedStyle(element, pseudo).content === 'none') continue
    add(`${pseudo} `, readRing(element, PSEUDO_RING_PROPERTIES, pseudo))
  }
  return snapshot
}

const OWN_RING = { ancestors: false }

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[tabindex]',
  '[contenteditable]',
].join(', ')

/**
 * A button that a click only activates: it neither toggles, opens a popup,
 * submits a form nor navigates, so its focus state is all that changes.
 */
function isPlainButton(element: Element): boolean {
  const role = element.getAttribute('role')
  const isButton =
    (element.tagName === 'BUTTON' && (!role || role === 'button')) ||
    (role === 'button' && element.tagName !== 'A')
  if (!isButton) return false
  if (
    ['aria-pressed', 'aria-expanded', 'aria-haspopup', 'aria-checked'].some(a =>
      element.hasAttribute(a)
    )
  ) {
    return false
  }
  if (element instanceof HTMLButtonElement && element.form && element.type !== 'button') {
    return false
  }
  return true
}

function activeElement(document: Document): Element | null {
  const active = document.activeElement
  return active && active !== document.body && active !== document.documentElement ? active : null
}

export async function checkFocusVisible(
  document: Document,
  driver: CraftDriver
): Promise<CraftViolation[]> {
  const violations: CraftViolation[] = []
  await driver.resetPointer()
  // Tab from the top of the document. Blurring alone is not enough: the
  // browser resumes sequential navigation from the last focused element.
  const start = document.createElement('span')
  start.tabIndex = -1
  document.body.prepend(start)
  start.focus()

  // The unfocused state of everything that can take focus, before any of it has.
  const unfocused = new Map<Element, StyleSnapshot>()
  for (const element of document.body.querySelectorAll(FOCUSABLE_SELECTOR)) {
    unfocused.set(element, readFocusIndicator(element))
  }

  const visited: Element[] = []
  // Elements without a snapshot from before the tabbing (they appeared on
  // focus) are compared with themselves once focus has moved on.
  const pending: { element: Element; focused: StyleSnapshot }[] = []
  const settle = ({ element, focused }: { element: Element; focused: StyleSnapshot }) => {
    if (!element.isConnected) return
    const before = unfocused.get(element) ?? readFocusIndicator(element)
    if (diffStyles(before, focused).length === 0) {
      violations.push({
        rule: 'focus-visible',
        element: describeElement(element),
        detail: 'keyboard focus changes no outline, box-shadow or ring pseudo-element',
      })
    }
  }

  for (let stop = 0; stop < LIMITS.tabStops; stop++) {
    await driver.tab()
    pending.splice(0).forEach(settle)
    const element = activeElement(document)
    // Focus left the story: Tab moved out of the frame, or it wrapped around.
    if (!element || element === start || visited.includes(element) || !document.hasFocus()) break
    visited.push(element)
    const entry = { element, focused: readFocusIndicator(element) }
    if (unfocused.has(element)) settle(entry)
    else pending.push(entry)
  }
  start.remove()
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  pending.splice(0).forEach(settle)

  // A pointer press must not leave a keyboard ring behind. Only the button's
  // own ring counts: a group ringed on `:focus-within` shows focus either way.
  const button = visited.find(element => element.isConnected && isPlainButton(element))
  if (button) {
    await driver.hover(button)
    const hovered = readFocusIndicator(button, OWN_RING)
    await driver.click(button)
    if (document.activeElement === button) {
      const changes = diffStyles(hovered, readFocusIndicator(button, OWN_RING))
      if (changes.length > 0) {
        violations.push({
          rule: 'focus-visible',
          element: `${describeElement(button)} (pointer press)`,
          detail: `a pointer press draws a ring: ${changes.join('; ')}`,
        })
      }
    }
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    await driver.resetPointer()
  }
  return violations
}

// ---------------------------------------------------------------------------

/** Runs every rule the story has not opted out of, in a fixed order. */
export async function runCraftChecks(
  document: Document,
  driver: CraftDriver,
  options: CraftOptions = {}
): Promise<CraftViolation[]> {
  const enabled = (rule: CraftRule) => !options.disable?.includes(rule)
  const violations: CraftViolation[] = []
  // Start every story with the pointer off it, whatever the last one left.
  await driver.resetPointer()
  if (enabled('disabled-hover')) {
    violations.push(...(await checkDisabledHover(document.body, driver)))
  }
  if (enabled('target-size')) violations.push(...checkTargetSize(document.body))
  if (enabled('focus-visible')) violations.push(...(await checkFocusVisible(document, driver)))
  return violations
}
