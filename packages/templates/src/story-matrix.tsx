import { themes } from '@atom63/ui-foundation'
import { UIProvider } from '@atom63/ui-react'
import type { ComponentType, ReactNode } from 'react'

/*
 * Story support shared by every template: one render per theme and mode, each
 * on its own page surface. Page templates repeat their landmarks (one `main`
 * per copy) by design, so the matrix turns off axe's landmark uniqueness
 * rules; every other rule still runs.
 *
 * `frame` is for templates in the app shell. Its sidebar is fixed to the
 * viewport and at least a viewport tall, so eight copies would stack on one
 * spot and grow with the capture. A framed cell has a fixed height and a
 * transform, which makes it the containing block for the fixed sidebar.
 */
const frameClass =
  'relative h-160 overflow-hidden [transform:translateZ(0)] [&_[data-slot=sidebar-wrapper]]:min-h-full [&_[data-slot=sidebar-container]]:h-full'

export function ThemeMatrix({ children, frame = false }: { children: ReactNode; frame?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div className="bg-background text-foreground rounded-lg p-6">
              <p className="text-muted-foreground mb-4 text-xs">
                {theme} / {mode}
              </p>
              {frame ? <div className={frameClass}>{children}</div> : children}
            </div>
          </UIProvider>
        ))
      )}
    </div>
  )
}

export const themeMatrixParameters = {
  a11y: {
    config: {
      rules: [
        { id: 'landmark-unique', enabled: false },
        { id: 'landmark-no-duplicate-main', enabled: false },
        { id: 'landmark-no-duplicate-banner', enabled: false },
      ],
    },
  },
}

/*
 * Every template story runs axe's `region` rule, which Storybook turns off by
 * default, so page chrome a product copies sits in landmarks, and names
 * `label-content-name-mismatch` so a control's accessible name keeps its
 * visible label. The theme matrix replaces these rules: its theme captions sit
 * outside the template's landmarks by design.
 */
export const landmarkParameters = {
  a11y: {
    config: {
      rules: [
        { id: 'region', enabled: true },
        { id: 'label-content-name-mismatch', enabled: true },
      ],
    },
  },
}

/* A content block sits in a page's main landmark; its stories render it there. */
export const inMain = (Story: ComponentType) => (
  <main>
    <Story />
  </main>
)

/* Keeps authored viewport stories and visual baselines on the same four widths. */
export const wideGlobals = { viewport: { value: 'a63-wide', isRotated: false } }
export const compactGlobals = { viewport: { value: 'a63-compact', isRotated: false } }
export const tabletGlobals = { viewport: { value: 'a63-tablet', isRotated: false } }
export const responsivePhoneGlobals = { viewport: { value: 'a63-phone', isRotated: false } }
export const phoneGlobals = responsivePhoneGlobals

/*
 * Checks a full-page template's safe-area owners with emulated insets, as on a
 * phone in landscape: `expect` maps a CSS selector to the computed padding it
 * must have once the insets are set (top 29px, bottom 31px, left and right 47px).
 */
export function checkSafeArea(
  canvasElement: HTMLElement,
  expect: Record<
    string,
    Partial<Record<'paddingBottom' | 'paddingInlineStart' | 'paddingTop', string>>
  >
) {
  const insets = { bottom: '31px', left: '47px', right: '47px', top: '29px' }
  for (const [edge, value] of Object.entries(insets)) {
    canvasElement.style.setProperty(`--a63-safe-area-${edge}`, value)
  }
  try {
    for (const [selector, paddings] of Object.entries(expect)) {
      const element = canvasElement.querySelector<HTMLElement>(selector)
      if (!element) throw new Error(`Expected ${selector}`)
      const style = getComputedStyle(element)
      for (const [property, value] of Object.entries(paddings)) {
        const actual = style[property as keyof typeof paddings]
        if (actual !== value) {
          throw new Error(`Expected ${selector} ${property} ${value}, got ${actual}`)
        }
      }
    }
  } finally {
    for (const edge of Object.keys(insets)) {
      canvasElement.style.removeProperty(`--a63-safe-area-${edge}`)
    }
  }
}
