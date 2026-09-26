/**
 * Plays an APG pattern contract from @atom63/ui-foundation against a rendered
 * story, with real keyboard events in the browser.
 *
 * The contract names parts (`trigger`, `item`); this file finds them by ARIA
 * role, optionally narrowed by the accessible name a story binding gives.
 */
import type {
  A11yAttributeCheck,
  A11yFocus,
  A11yKeyboardInteraction,
  A11yKeyboardState,
  A11yPatternBinding,
  A11yPatternContract,
  A11yPosition,
  A11yStructureCheck,
  A11yTarget,
  A11yTreeNode,
} from '@atom63/ui-foundation'
import { type ComponentType, createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { expect } from 'vitest'
import { page, userEvent } from 'vitest/browser'

/** One story that exercises a pattern. */
export interface ContractCase {
  /** Accessible names that pick a part when the story has several candidates. */
  names?: Readonly<Record<string, string>>
  story: ComponentType
  storyName: string
}

const TIMEOUT = 2_000

/** Renders a composed story into the page. The returned function removes it, portals included. */
export async function renderStory(Story: ComponentType): Promise<() => void> {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  flushSync(() => root.render(createElement(Story)))
  await new Promise(requestAnimationFrame)
  return () => {
    root.unmount()
    document.body.replaceChildren()
  }
}

/**
 * Compares the whole accessibility tree under `element` with the reviewed
 * snapshot in `a11y/__snapshots__/`, so an unexpected extra or missing node
 * fails too. The one place that uses Vitest's experimental ARIA snapshot
 * matcher, so it can be swapped for role queries alone.
 *
 * The contract's own tree is checked with role queries (`checkTree`), not with
 * `toMatchAriaInlineSnapshot`: Vitest keys inline snapshots by call site and
 * rejects one call site that sees different trees, which a shared helper does.
 */
export async function assertAriaSnapshot(element: Element): Promise<void> {
  await expect.element(element as HTMLElement).toMatchAriaSnapshot()
}

// --- Finding parts ---------------------------------------------------------

type Harness = {
  label: string
  names: Readonly<Record<string, string>>
  pattern: A11yPatternContract
}

function partSpec(harness: Harness, part: string) {
  const spec = harness.pattern.parts[part]
  if (!spec) {
    throw new Error(`${harness.label}: the pattern has no part "${part}"`)
  }
  return spec
}

/** Every instance of a part, in document order. */
function instances(harness: Harness, part: string): Element[] {
  const spec = partSpec(harness, part)
  const name = harness.names[part]
  let scope = page.elementLocator(document.body)
  if (spec.within) {
    const [container] = instances(harness, spec.within)
    if (!container) {
      return []
    }
    scope = page.elementLocator(container)
  }
  // Include hidden elements: a modal marks the rest of the page aria-hidden,
  // and the trigger behind it is still the element focus must return to.
  return scope
    .getByRole(spec.role, { exact: true, includeHidden: true, ...(name ? { name } : {}) })
    .elements()
}

function pick(list: Element[], at: A11yPosition | undefined): Element | string {
  if (at === 'selected') {
    const selected = list.filter(element => element.getAttribute('aria-selected') === 'true')
    return selected.length === 1 ? selected[0]! : `${selected.length} selected instances`
  }
  const index = at === 'last' ? list.length - 1 : at === 'first' || at === undefined ? 0 : at
  return list[index] ?? `no instance at ${String(at ?? 'first')} (found ${list.length})`
}

function isVisible(element: Element): boolean {
  return element.checkVisibility() && element.closest('[aria-hidden="true"]') === null
}

function tabbables(container: Element): HTMLElement[] {
  const selector =
    'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"], summary'
  return [container, ...container.querySelectorAll(selector)].filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      element.checkVisibility()
  )
}

/** The element a target points at, or why there is none. */
function resolveTarget(harness: Harness, target: A11yTarget): Element | string {
  const list = instances(harness, target.part)
  if ('tabbable' in target) {
    const container = list[0]
    if (!container) {
      return `no ${target.part}`
    }
    const found = tabbables(container)
    const element = target.tabbable === 'first' ? found[0] : found.at(-1)
    return element ?? `no tabbable element in ${target.part}`
  }
  return pick(list, target.at)
}

function targetLabel(target: A11yFocus): string {
  if (target === 'page-start') return 'the start of the page'
  if ('inside' in target) return `inside ${target.inside}`
  if ('tabbable' in target) return `the ${target.tabbable} tabbable element in ${target.part}`
  return target.at === undefined ? target.part : `${target.part} (${String(target.at)})`
}

const NAMED_BY_CONTENT = new Set(['a', 'button', 'link', 'menuitem', 'tab'])

/** `button "Open menu"`: the role (or tag) and a rough label, for messages. */
export function describeElement(element: Element | null): string {
  if (!element || element === document.body) return 'the page body'
  const role = element.getAttribute('role') ?? element.tagName.toLowerCase()
  const labelledBy = element
    .getAttribute('aria-labelledby')
    ?.split(/\s+/)
    .map(id => document.getElementById(id)?.textContent ?? '')
    .join(' ')
  const content = NAMED_BY_CONTENT.has(role) ? element.textContent : ''
  const label = (element.getAttribute('aria-label') ?? labelledBy ?? content ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)
  return label ? `${role} "${label}"` : role
}

// --- Checks ----------------------------------------------------------------

/** Retries `check` until it returns null, then throws its last message. */
async function waitFor(check: () => string | null, timeout = TIMEOUT): Promise<void> {
  const deadline = performance.now() + timeout
  let message = check()
  while (message !== null) {
    if (performance.now() > deadline) {
      throw new Error(message)
    }
    await new Promise(resolve => setTimeout(resolve, 25))
    message = check()
  }
}

function checkOpen(harness: Harness, open: boolean): string | null {
  const popup = harness.pattern.popup
  if (!popup) return null
  const isOpen = instances(harness, popup).some(isVisible)
  return isOpen === open ? null : `${popup} should be ${open ? 'open' : 'closed'}, but it is not`
}

function checkFocus(harness: Harness, focus: A11yFocus): string | null {
  const active = document.activeElement
  const actual = describeElement(active)
  if (focus === 'page-start') {
    return active === document.body || active === null ? null : `focus is on ${actual}`
  }
  if ('inside' in focus) {
    const [container] = instances(harness, focus.inside)
    return container?.contains(active)
      ? null
      : `focus should be inside ${focus.inside}, but it is on ${actual}`
  }
  const expected = resolveTarget(harness, focus)
  if (typeof expected === 'string') {
    return `focus should be on ${targetLabel(focus)}, but there is ${expected}; focus is on ${actual}`
  }
  return expected === active
    ? null
    : `focus should be on ${targetLabel(focus)} (${describeElement(expected)}), but it is on ${actual}`
}

function checkAttribute(harness: Harness, check: A11yAttributeCheck): string | null {
  const list = instances(harness, check.target.part)
  const picked = check.target.at === undefined ? list : [pick(list, check.target.at)]
  if (picked.length === 0) {
    return `found no ${check.target.part} to check ${check.attribute} on`
  }
  for (const element of picked) {
    if (typeof element === 'string') {
      return `${targetLabel(check.target)}: ${element}`
    }
    const where = `${check.attribute} on ${describeElement(element)}`
    const value = element.getAttribute(check.attribute)
    if (value === null) {
      return `${where} is missing`
    }
    if (check.equals !== undefined) {
      const allowed: readonly string[] =
        typeof check.equals === 'string' ? [check.equals] : check.equals
      if (!allowed.includes(value)) {
        return `${where} is "${value}", expected ${allowed.map(item => `"${item}"`).join(' or ')}`
      }
    }
    const ids = value.split(/\s+/).filter(Boolean)
    if (check.references !== undefined) {
      const targets = instances(harness, check.references)
      const ok = ids.some(id => targets.some(target => target.id === id))
      if (!ok) {
        return `${where} is "${value}", which is not the id of a ${check.references}`
      }
    }
    if (check.resolves) {
      const missing = ids.filter(id => !document.getElementById(id)?.textContent?.trim())
      if (ids.length === 0 || missing.length > 0) {
        return `${where} is "${value}", but ${missing.join(', ') || 'it'} is not an element with text`
      }
    }
  }
  return null
}

function checkState(harness: Harness, state: A11yKeyboardState): string | null {
  if (state.open !== undefined) {
    const message = checkOpen(harness, state.open)
    if (message) return message
  }
  if (state.focus !== undefined) {
    const message = checkFocus(harness, state.focus)
    if (message) return message
  }
  for (const check of state.attributes ?? []) {
    const message = checkAttribute(harness, check)
    if (message) return message
  }
  return null
}

/**
 * The contract tree in ARIA snapshot syntax (`- tablist /.+/:`), for messages.
 * `/.+/` stands for a required accessible name.
 */
export function treeTemplate(pattern: A11yPatternContract, node: A11yTreeNode, depth = 0): string {
  const spec = pattern.parts[node.part]
  if (!spec) throw new Error(`${pattern.id}: tree names unknown part "${node.part}"`)
  const name = spec.name === 'required' ? ' /.+/' : ''
  const states = (node.states ?? []).map(state => ` [${state}]`).join('')
  const children = node.children ?? []
  const line = `${'  '.repeat(depth)}- ${spec.role}${name}${states}${children.length > 0 ? ':' : ''}`
  return [line, ...children.map(child => treeTemplate(pattern, child, depth + 1))].join('\n')
}

/** Elements under `scope` with the node's role, required name and states, by ARIA role query. */
function queryNode(
  harness: Harness,
  scope: Element,
  node: A11yTreeNode,
  { name = true, states = true } = {}
): Element[] {
  const spec = partSpec(harness, node.part)
  const options: Record<string, unknown> = { exact: true, includeHidden: true }
  if (name && spec.name === 'required') options.name = /\S/
  if (states) for (const state of node.states ?? []) options[state] = true
  return page.elementLocator(scope).getByRole(spec.role, options).elements()
}

/** Whether `element` has the node's children, each with its role, name and states. */
function hasChildren(harness: Harness, element: Element, node: A11yTreeNode): boolean {
  return (node.children ?? []).every(child =>
    queryNode(harness, element, child).some(match => hasChildren(harness, match, child))
  )
}

/** Why the tree under a part does not match the contract, or null when it does. */
function checkTree(harness: Harness, node: A11yTreeNode): string | null {
  const spec = partSpec(harness, node.part)
  const candidates = instances(harness, node.part)
  if (candidates.length === 0) return `there is no ${spec.role}`
  const scope = candidates[0]!.parentElement ?? document.body
  const matches = queryNode(harness, scope, node).filter(match => candidates.includes(match))
  if (matches.some(match => hasChildren(harness, match, node))) return null

  const root = candidates[0]!
  if (!queryNode(harness, scope, node, { states: false }).includes(root)) {
    return `${describeElement(root)} has no accessible name`
  }
  if (!matches.includes(root)) {
    return `${describeElement(root)} is not ${(node.states ?? []).join(', ')}`
  }
  for (const child of node.children ?? []) {
    const childSpec = partSpec(harness, child.part)
    const all = page
      .elementLocator(root)
      .getByRole(childSpec.role, { includeHidden: true })
      .elements()
    if (all.length === 0) return `${describeElement(root)} contains no ${childSpec.role}`
    const named = queryNode(harness, root, child, { states: false })
    if (named.length === 0) return `no ${childSpec.role} in ${describeElement(root)} has a name`
    return `no ${childSpec.role} in ${describeElement(root)} is ${(child.states ?? []).join(', ')}`
  }
  return `${describeElement(root)} does not match`
}

// --- Driving a case --------------------------------------------------------

async function open(harness: Harness) {
  const { opener } = harness.pattern
  if (!opener) return
  const trigger = resolveTarget(harness, { part: opener.part })
  if (typeof trigger === 'string') {
    throw new Error(`${harness.label}: cannot open the popup: ${trigger}`)
  }
  ;(trigger as HTMLElement).focus()
  await userEvent.keyboard(opener.keys)
  await waitFor(() => {
    const message = checkOpen(harness, true)
    return message && `${harness.label}: opening with ${opener.keys} failed: ${message}`
  })
}

async function place(harness: Harness, focus: A11yFocus) {
  if (focus === 'page-start') {
    ;(document.activeElement as HTMLElement | null)?.blur()
    return
  }
  if ('inside' in focus) return
  // Wait for the target: popup items can mount a frame after the popup.
  let element: Element | string = ''
  await waitFor(() => {
    element = resolveTarget(harness, focus)
    return typeof element === 'string'
      ? `${harness.label}: cannot focus ${targetLabel(focus)}: ${element}`
      : null
  })
  ;(element as unknown as HTMLElement).focus()
}

function harnessFor(pattern: A11yPatternContract, testCase: ContractCase, check: string): Harness {
  return {
    label: `[${pattern.id} › ${check}] ${testCase.storyName}`,
    names: testCase.names ?? {},
    pattern,
  }
}

/** Renders the story with its popup open, for the structure checks. */
async function renderOpen(harness: Harness, testCase: ContractCase) {
  const cleanup = await renderStory(testCase.story)
  await open(harness)
  return cleanup
}

export async function runTreeCheck(
  pattern: A11yPatternContract,
  testCase: ContractCase,
  node: A11yTreeNode
) {
  const harness = harnessFor(pattern, testCase, 'tree')
  const cleanup = await renderOpen(harness, testCase)
  try {
    await waitFor(() => {
      const message = checkTree(harness, node)
      return (
        message &&
        `${harness.label}: expected the accessibility tree\n${treeTemplate(pattern, node)}\nbut ${message}.`
      )
    })
    const root = resolveTarget(harness, { part: node.part })
    if (typeof root === 'string') throw new Error(`${harness.label}: ${root}`)
    await assertAriaSnapshot(root)
  } finally {
    cleanup()
  }
}

export async function runStructureCheck(
  pattern: A11yPatternContract,
  testCase: ContractCase,
  check: A11yStructureCheck
) {
  const harness = harnessFor(pattern, testCase, check.id)
  const cleanup = await renderOpen(harness, testCase)
  try {
    await waitFor(() => {
      const message = checkAttribute(harness, check)
      return message && `${harness.label}: ${check.rule} But ${message}.`
    })
  } finally {
    cleanup()
  }
}

export async function runKeyboardInteraction(
  pattern: A11yPatternContract,
  testCase: ContractCase,
  interaction: A11yKeyboardInteraction
) {
  const harness = harnessFor(pattern, testCase, interaction.id)
  const cleanup = await renderStory(testCase.story)
  try {
    if (interaction.given.open) await open(harness)
    await place(harness, interaction.given.focus)
    await waitFor(() => {
      const message = checkState(harness, interaction.given)
      return (
        message && `${harness.label}: precondition not met before ${interaction.key}: ${message}`
      )
    })
    await userEvent.keyboard(interaction.keys)
    await waitFor(() => {
      const message = checkState(harness, interaction.then)
      return (
        message &&
        `${harness.label}: ${interaction.key} — ${interaction.result} But after the key press, ${message}.`
      )
    })
  } finally {
    cleanup()
  }
}

/** The interactions that apply to a binding: every row whose `when` matches its options. */
export function interactionsFor(
  pattern: A11yPatternContract,
  binding: A11yPatternBinding
): A11yKeyboardInteraction[] {
  return pattern.keyboard.filter(interaction =>
    Object.entries(interaction.when ?? {}).every(
      ([option, value]) => binding.options?.[option] === value
    )
  )
}
