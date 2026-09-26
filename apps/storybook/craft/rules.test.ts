// The runtime craft rules on hand-written fixtures, in Chromium with real
// pointer and keyboard input. Each rule has a probe that breaks it and must be
// caught, and a fixture that follows it and must pass.
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import {
  checkDisabledHover,
  checkFocusVisible,
  checkTargetSize,
  type CraftDriver,
  describeElement,
  passesSpacing,
  pointerRest,
  runCraftChecks,
} from './rules'

const POINTER = { force: true, timeout: 2_000 } as const
const driver: CraftDriver = {
  hover: element => userEvent.hover(element, POINTER),
  resetPointer: () => userEvent.hover(pointerRest(document), POINTER),
  tab: () => userEvent.tab(),
  click: element => userEvent.click(element, POINTER),
}

function mount(html: string, css = '') {
  const style = document.createElement('style')
  style.textContent = css
  const root = document.createElement('div')
  root.innerHTML = html
  document.body.append(style, root)
  return root
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('disabled-hover', () => {
  it('catches a disabled button with a hover style', async () => {
    const root = mount(
      '<button disabled class="probe">Save</button>',
      '.probe { background: rgb(255, 255, 255); } .probe:hover { background: rgb(0, 0, 0); }'
    )
    const violations = await checkDisabledHover(root, driver)
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'disabled-hover', element: 'button "Save"' }),
    ])
    expect(violations[0].detail).toContain('background-color')
  })

  it('catches aria-disabled and data-disabled controls', async () => {
    const root = mount(
      '<a href="#x" aria-disabled="true" class="probe">Docs</a>' +
        '<div role="menuitem" data-disabled="" class="probe">Delete</div>',
      '.probe { display: block; padding: 8px; } .probe:hover { text-decoration: underline; color: rgb(255, 0, 0); }'
    )
    const violations = await checkDisabledHover(root, driver)
    expect(violations.map(v => v.element)).toEqual(['a "Docs"', 'div[role=menuitem] "Delete"'])
  })

  it('passes a disabled button whose hover style is scoped to enabled', async () => {
    const root = mount(
      '<button disabled class="probe">Save</button>',
      '.probe:hover:not(:disabled) { background: rgb(0, 0, 0); }'
    )
    expect(await checkDisabledHover(root, driver)).toEqual([])
  })

  it('passes a disabled control that takes no pointer events', async () => {
    const root = mount(
      '<button disabled class="probe">Save</button>',
      '.probe { pointer-events: none; } .probe:hover { background: rgb(0, 0, 0); }'
    )
    expect(await checkDisabledHover(root, driver)).toEqual([])
  })
})

describe('target-size', () => {
  it('catches a 16px icon button next to another target', () => {
    const root = mount(
      '<div style="display: flex; gap: 2px">' +
        '<button aria-label="Close" style="width: 16px; height: 16px; padding: 0"></button>' +
        '<button style="width: 80px; height: 32px">Save</button>' +
        '</div>'
    )
    expect(checkTargetSize(root)).toEqual([
      expect.objectContaining({ rule: 'target-size', element: 'button "Close"' }),
    ])
  })

  it('passes a 24px button', () => {
    const root = mount(
      '<div style="display: flex; gap: 0">' +
        '<button aria-label="Close" style="width: 24px; height: 24px; padding: 0"></button>' +
        '<button style="width: 24px; height: 24px; padding: 0">A</button>' +
        '</div>'
    )
    expect(checkTargetSize(root)).toEqual([])
  })

  it('passes an undersized target with enough space around it (spacing exception)', () => {
    const root = mount(
      '<div style="display: flex; gap: 12px; align-items: center">' +
        '<button aria-label="Close" style="width: 16px; height: 16px; padding: 0"></button>' +
        '<button style="width: 80px; height: 32px">Save</button>' +
        '</div>'
    )
    expect(checkTargetSize(root)).toEqual([])
  })

  it('passes an inline link in running text', () => {
    const root = mount(
      '<p style="font-size: 12px; line-height: 16px">Read the <a href="#docs">docs</a> or ' +
        '<a href="#guide">the guide</a> first.</p>'
    )
    expect(checkTargetSize(root)).toEqual([])
  })

  it('measures a checkbox by the label that wraps it', () => {
    const root = mount(
      '<label style="display: inline-flex; align-items: center; gap: 8px; min-height: 24px">' +
        '<input type="checkbox" style="width: 16px; height: 16px; margin: 0"> Remember me</label>' +
        '<button style="width: 80px; height: 32px">Save</button>'
    )
    expect(checkTargetSize(root)).toEqual([])
  })

  it('skips visually hidden and disabled controls', () => {
    const root = mount(
      '<input type="radio" style="position: absolute; width: 1px; height: 1px; opacity: 0">' +
        '<button disabled style="width: 16px; height: 16px; padding: 0">x</button>' +
        '<button style="width: 80px; height: 32px">Save</button>'
    )
    expect(checkTargetSize(root)).toEqual([])
  })

  it('skips a target covered by another element', () => {
    const root = mount(
      '<div style="position: relative; width: 120px; height: 40px">' +
        '<button aria-label="Behind" style="position: absolute; inset: 0 auto auto 0; width: 16px; height: 16px; padding: 0"></button>' +
        '<div style="position: absolute; inset: 0; background: white"></div>' +
        '</div>' +
        '<button style="width: 80px; height: 32px">Save</button>'
    )
    expect(checkTargetSize(root)).toEqual([])
  })

  it('applies the circle test between two undersized targets', () => {
    const box = (left: number) => ({
      left,
      top: 0,
      right: left + 16,
      bottom: 16,
      width: 16,
      height: 16,
    })
    expect(passesSpacing(box(0), [{ box: box(20), undersized: true }])).toBe(false)
    expect(passesSpacing(box(0), [{ box: box(24), undersized: true }])).toBe(true)
  })
})

describe('focus-visible', () => {
  it('catches an element that hides its focus ring', async () => {
    mount(
      '<button class="bare">One</button><button class="ring">Two</button>',
      '.bare, .ring { outline: none; } .ring:focus-visible { box-shadow: 0 0 0 2px rgb(0, 0, 255); }'
    )
    expect(await checkFocusVisible(document, driver)).toEqual([
      expect.objectContaining({ rule: 'focus-visible', element: 'button "One"' }),
    ])
  })

  it('accepts a ring on the parent or a pseudo-element', async () => {
    mount(
      '<div class="field"><input aria-label="Name" class="input"></div>' +
        '<button class="pseudo">Go</button>',
      `.input, .pseudo { outline: none; }
       .field:focus-within { box-shadow: 0 0 0 2px rgb(0, 0, 255); }
       .pseudo { position: relative; }
       .pseudo::after { content: ''; position: absolute; inset: -2px; opacity: 0; box-shadow: 0 0 0 2px rgb(0, 0, 255); }
       .pseudo:focus-visible::after { opacity: 1; }`
    )
    expect(await checkFocusVisible(document, driver)).toEqual([])
  })

  it('catches a ring drawn on :focus, which a pointer press shows too', async () => {
    mount(
      '<button class="probe">Save</button>',
      '.probe { outline: none; } .probe:focus { box-shadow: 0 0 0 2px rgb(0, 0, 255); }'
    )
    expect(await checkFocusVisible(document, driver)).toEqual([
      expect.objectContaining({ rule: 'focus-visible', element: 'button "Save" (pointer press)' }),
    ])
  })

  it('passes the default :focus-visible outline', async () => {
    mount('<button>One</button><a href="#two">Two</a>')
    expect(await checkFocusVisible(document, driver)).toEqual([])
  })
})

describe('runCraftChecks', () => {
  it('skips the rules a story opts out of', async () => {
    mount(
      '<button aria-label="Close" style="width: 16px; height: 16px; padding: 0; outline: none"></button>' +
        '<button aria-label="Open" style="width: 16px; height: 16px; padding: 0"></button>'
    )
    const all = await runCraftChecks(document, driver)
    expect(new Set(all.map(v => v.rule))).toEqual(new Set(['target-size', 'focus-visible']))
    const some = await runCraftChecks(document, driver, { disable: ['target-size'] })
    expect(some.map(v => v.rule)).toEqual(['focus-visible'])
  })

  it('describes elements by tag, role or type, and name', () => {
    const root = mount(
      '<div role="tab">Overview</div><input type="checkbox" aria-label="Agree"><button></button>'
    )
    expect([...root.children].map(describeElement)).toEqual([
      'div[role=tab] "Overview"',
      'input[type=checkbox] "Agree"',
      'button (unnamed)',
    ])
  })
})
