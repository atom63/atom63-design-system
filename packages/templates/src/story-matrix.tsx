import { themes } from '@atom63/ui-foundation'
import { UIProvider } from '@atom63/ui-react'
import type { ReactNode } from 'react'

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

/* Shows `Phone` stories in Storybook's large-phone viewport. The visual project
   captures any story whose id ends in `-phone` at 390 px wide. */
export const phoneGlobals = { viewport: { value: 'mobile2', isRotated: false } }
