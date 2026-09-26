// Runtime craft checks: after each story renders, hover its disabled controls,
// measure its pointer targets and tab through it (craft/rules.ts). Violations
// are compared with docs/design-system/audits/runtime-craft-baseline.json; see
// apps/storybook/README.md.
import { afterEach, expect } from 'vitest'
import { commands, userEvent } from 'vitest/browser'

import { compareToBaseline, countViolations } from '../craft/baseline'
import {
  CRAFT_RULES,
  type CraftDriver,
  type CraftRule,
  pointerRest,
  runCraftChecks,
} from '../craft/rules'
import { freezeMotion, pinRemoteImages, settleMedia } from './stable-media'

// Axe runs in the `storybook` project; this project only runs the craft rules.
;(globalThis as { __A63_A11Y_TEST__?: string }).__A63_A11Y_TEST__ = 'off'

// Freeze motion and pin remote images, as the visual project does, so a hover
// or focus style is read at its end state and layout does not shift under the
// measurements.
freezeMotion()
pinRemoteImages()

// Force past Playwright's actionability checks: a disabled control may not
// take pointer events, and the hover must land wherever the pointer lands.
const POINTER = { force: true, timeout: 2_000 } as const

// After each input, let React commit what it scheduled (a roving tabindex, a
// data attribute set on focus) before the next measurement.
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
const driver: CraftDriver = {
  hover: element => userEvent.hover(element, POINTER).then(nextFrame),
  resetPointer: () => userEvent.hover(pointerRest(document), POINTER).then(nextFrame),
  tab: () => userEvent.tab().then(nextFrame),
  click: element => userEvent.click(element, POINTER).then(nextFrame),
}

/**
 * Waits until the DOM has not changed for `quiet` ms, or `max` ms at most, so
 * a story that loads part of itself lazily (a code-split slider, a diagram
 * rendered in an effect) is checked in its final state.
 */
function settle(quiet = 100, max = 1_000) {
  return new Promise<void>(resolve => {
    let timer = setTimeout(done, quiet)
    const cap = setTimeout(done, max)
    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(done, quiet)
    })
    observer.observe(document.body, { subtree: true, childList: true, attributes: true })
    function done() {
      observer.disconnect()
      clearTimeout(timer)
      clearTimeout(cap)
      resolve()
    }
  })
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    craftBaseline(
      storyId: string
    ): Promise<{ write: boolean; entry: Record<string, Record<string, number>> }>
    craftReport(storyId: string, entry: Record<string, Record<string, number>>): Promise<void>
  }
}

interface CraftParameters {
  /** Rules this story opts out of, each with a reason in a comment. */
  disable?: CraftRule[]
}

afterEach(async context => {
  const { task } = context
  const storyId = task.meta.storyId
  if (!storyId || task.result?.state === 'fail') return
  const story = (context as { story?: { parameters?: { craft?: CraftParameters } } }).story
  const disable = story?.parameters?.craft?.disable ?? []
  const unknown = disable.filter(rule => !CRAFT_RULES.includes(rule))
  if (unknown.length > 0)
    throw new Error(`Unknown craft rule(s) in parameters.craft.disable: ${unknown.join(', ')}`)

  await settleMedia()
  await settle()
  const violations = await runCraftChecks(document, driver, { disable })
  const entry = countViolations(violations)
  await commands.craftReport(storyId, entry)
  const baseline = await commands.craftBaseline(storyId)
  if (baseline.write) return

  const { added, resolved } = compareToBaseline(entry, baseline.entry)
  const lines: string[] = []
  for (const { key } of added) {
    const [rule, element] = key.split(' | ')
    const details = violations
      .filter(v => v.rule === rule && v.element === element)
      .map(v => `      ${v.detail}`)
    lines.push(`  new       ${key}`, ...new Set(details))
  }
  for (const { key } of resolved) lines.push(`  resolved  ${key} (remove it from the baseline)`)
  expect(
    lines,
    `Runtime craft check for ${storyId}. Fix the violation, opt the story out with ` +
      '`parameters.craft.disable`, or rewrite the baseline with CRAFT_WRITE_BASELINE=1 ' +
      '(see apps/storybook/README.md)'
  ).toEqual([])
})
