import { act, render, screen } from '@testing-library/react'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toast } from 'sonner'
import { describe, expect, it } from 'vitest'

import { Toaster } from './toaster'

/*
 * The custom properties the documented install defines: everything reachable
 * through @import from `@atom63/ui-react/styles.css` (src/styles/index.css),
 * which does not include the shadcn compat sheet.
 */
const here = dirname(fileURLToPath(import.meta.url))
const stylesEntry = join(here, '..', '..', 'styles', 'index.css')
const atom63StylesEntry = join(here, '..', '..', '..', '..', 'styles', 'src', 'index.css')

function collectDefinedProperties(file: string, seen = new Set<string>()): Set<string> {
  const defined = new Set<string>()
  if (seen.has(file) || !existsSync(file)) return defined
  seen.add(file)
  const css = readFileSync(file, 'utf8')
  for (const [, name] of css.matchAll(/(--[\w-]+)\s*:/g)) defined.add(name)
  for (const [, target] of css.matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
    const path = target === '@atom63/styles' ? atom63StylesEntry : join(dirname(file), target)
    for (const name of collectDefinedProperties(path, seen)) defined.add(name)
  }
  return defined
}

const documentedProperties = collectDefinedProperties(stylesEntry)
const SONNER_HOST_PROPERTIES = [
  '--normal-bg',
  '--normal-border',
  '--normal-text',
  '--border-radius',
]

describe('Toaster with only the documented styles', () => {
  it('reaches the token stack through the documented entry', () => {
    expect(documentedProperties.has('--a63-surface-overlay')).toBe(true)
    expect(documentedProperties.has('--popover')).toBe(false)
  })

  it.each(['default', 'inverse'] as const)(
    'paints the %s variant from variables @atom63/ui-react/styles.css defines',
    async variant => {
      render(<Toaster variant={variant} />)
      act(() => {
        toast(`Saved (${variant})`, { id: `documented-${variant}` })
      })

      const message = await screen.findByText(`Saved (${variant})`)
      const list = message.closest('ol') as HTMLElement
      for (const property of SONNER_HOST_PROPERTIES) {
        const value = list.style.getPropertyValue(property)
        expect(value, `${variant} ${property}`).not.toBe('')
        for (const [, name] of value.matchAll(/var\((--[\w-]+)/g)) {
          expect(documentedProperties.has(name), `${variant} ${property} reads ${name}`).toBe(true)
        }
      }
      act(() => toast.dismiss(`documented-${variant}`))
    }
  )
})
