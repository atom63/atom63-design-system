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

/* The variables a style value reads with no fallback; a var() with a fallback
   (an optional theme lever such as --a63-overlay-radius) may stay unset. */
const requiredReads = (value: string) =>
  [...value.matchAll(/var\((--[\w-]+)\s*(,)?/g)].filter(match => !match[2]).map(match => match[1])
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
        for (const name of requiredReads(value)) {
          expect(documentedProperties.has(name), `${variant} ${property} reads ${name}`).toBe(true)
        }
      }
      act(() => toast.dismiss(`documented-${variant}`))
    }
  )

  it('paints the default toast from the overlay contract', async () => {
    render(<Toaster />)
    act(() => {
      toast('Saved (overlay)', { id: 'documented-overlay' })
    })

    const message = await screen.findByText('Saved (overlay)')
    const item = message.closest('[data-sonner-toast]') as HTMLElement
    const list = message.closest('ol') as HTMLElement
    const expected = {
      'backdrop-filter': '--a63-overlay-backdrop',
      'background-image': '--a63-overlay-gloss',
      'border-style': '--a63-overlay-border-style',
      'border-width': '--a63-overlay-border-width',
      'box-shadow': '--a63-overlay-shadow',
    }
    for (const [property, token] of Object.entries(expected)) {
      expect(item.style.getPropertyValue(property), property).toContain(token)
    }
    expect(list.style.getPropertyValue('--border-radius')).toContain('--a63-overlay-radius')
    for (const name of requiredReads(item.getAttribute('style') ?? '')) {
      expect(documentedProperties.has(name), `toast reads ${name}`).toBe(true)
    }
    act(() => toast.dismiss('documented-overlay'))
  })
})
