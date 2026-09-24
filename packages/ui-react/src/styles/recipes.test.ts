import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/*
 * Cascade guard. DS component recipes MUST be imported into @layer components so
 * that consumer `className` utilities (Tailwind's @layer utilities) override the
 * recipe base — matching tailwind-merge semantics. An UNLAYERED recipe beats every
 * utility (unlayered > any layer), which silently clobbers overrides like
 * `<FrameHeader className="flex-row">` or `<Card className="bg-transparent">`.
 * See the @layer components fix in recipes.css.
 */

const stylesDir = dirname(fileURLToPath(import.meta.url))
const componentsDir = join(stylesDir, '..', 'components')
const styleSystemDir = join(stylesDir, '..', '..', '..', 'styles', 'src')
const repoDir = join(stylesDir, '..', '..', '..', '..')
const recipesCss = readFileSync(join(stylesDir, 'recipes.css'), 'utf8')
const resetCss = readFileSync(join(stylesDir, 'reset.css'), 'utf8')
// A contract or theme is its generated CSS plus the hand-written `.native.css`
// file that holds its values with no DTCG type (packages/styles).
const readWithNative = (path: string): string => {
  const native = path.replace(/\.css$/, '.native.css')
  return readFileSync(path, 'utf8') + (existsSync(native) ? readFileSync(native, 'utf8') : '')
}
const controlContractCss = readWithNative(join(styleSystemDir, 'contracts', 'control.css'))
const environmentContractCss = readWithNative(join(styleSystemDir, 'contracts', 'environment.css'))
const reverseCompatCss = readFileSync(join(styleSystemDir, 'compat', 'a63-from-shadcn.css'), 'utf8')
const readRecipe = (name: string): string =>
  readFileSync(join(componentsDir, name, `${name}.css`), 'utf8')

const componentImportLines = recipesCss
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.startsWith('@import') && line.includes('../components/'))

describe('recipes.css cascade layering', () => {
  it('imports every component recipe into @layer components', () => {
    const unlayered = componentImportLines.filter(line => !line.includes('layer(components)'))
    expect(
      unlayered,
      `recipes.css component imports missing \`layer(components)\`:\n${unlayered.join('\n')}`
    ).toEqual([])
  })

  describe('responsive control sizing contracts', () => {
    it('documents why rendered size resolves at component use-sites', () => {
      expect(controlContractCss).toContain('max(calc(height * density), size-appropriate min-SIZE)')
      expect(controlContractCss).toContain('Do not cache that formula in a :root custom property')
    })

    it('keeps the rendered floor separate from the interaction floor', () => {
      // Flooring rendered height with the touch target collapses xs/sm/md to a
      // single 44px rung on every phone. See web-ios-token-parity.md.
      expect(environmentContractCss).toMatch(
        /@media \(pointer: coarse\)[\s\S]*--a63-control-min-size: 2rem/
      )
      expect(controlContractCss).toContain('Floor with --a63-control-min-size (rendered geometry)')
    })

    it('raises the target floor for coarse pointers', () => {
      expect(environmentContractCss).toMatch(
        /@media \(pointer: coarse\)[\s\S]*--a63-control-min-target: 2\.75rem/
      )
      expect(environmentContractCss).toContain('--a63-control-min-target-lg: 3rem')
      expect(environmentContractCss).toContain('--a63-control-min-target-xl: 3.25rem')
    })

    it('provides a 16px editable-text floor on narrow viewports', () => {
      expect(environmentContractCss).toMatch(
        /@media \(max-width: 40rem\)[\s\S]*--a63-editable-font-size-min: 1rem/
      )
    })

    it('keeps the standalone shadcn compatibility contract in sync', () => {
      expect(reverseCompatCss).toContain('--a63-control-min-target: 2.75rem')
      expect(reverseCompatCss).toContain('--a63-control-min-target-lg: 3rem')
      expect(reverseCompatCss).toContain('--a63-control-min-target-xl: 3.25rem')
      expect(reverseCompatCss).toContain('--a63-editable-font-size-min: 1rem')
    })

    it('exposes safe-area and dynamic viewport contracts', () => {
      expect(environmentContractCss).toContain('--a63-safe-area-top: env(safe-area-inset-top, 0px)')
      expect(environmentContractCss).toContain(
        '--a63-safe-area-bottom: env(safe-area-inset-bottom, 0px)'
      )
      expect(environmentContractCss).toContain('--a63-viewport-height: 100dvh')
    })

    it.each([
      'autocomplete',
      'button',
      'button-group',
      'input',
      'menu',
      'segmented-control',
      'select',
      'tabs',
      'toggle',
    ])('%s resolves the shared size formula at its use-site', name => {
      expect(readRecipe(name)).toContain('--a63-control-height-')
      expect(readRecipe(name)).toContain('--a63-control-min-size')
    })

    it('keeps icon buttons square at their effective rendered size', () => {
      const buttonCss = readRecipe('button')
      expect(buttonCss).toContain('width: var(--button-height)')
      expect(buttonCss).toContain('min-width: var(--button-height)')
      expect(buttonCss).toContain('min-height: var(--button-height)')
      expect(buttonCss).toContain('aspect-ratio: 1')
    })

    it.each(['button', 'button-group'])('%s retains the lg/xl size hierarchy', name => {
      const recipe = readRecipe(name)
      expect(recipe).toContain('--a63-control-min-size-lg')
      expect(recipe).toContain('--a63-control-min-size-xl')
    })

    it.each(['autocomplete', 'input', 'segmented-control', 'select', 'sidebar', 'tabs', 'toggle'])(
      '%s retains the large size hierarchy',
      name => {
        expect(readRecipe(name)).toContain('--a63-control-min-size-lg')
      }
    )

    it.each(['button', 'segmented-control', 'tabs'])(
      '%s floors compact label targets in both dimensions',
      name => {
        expect(readRecipe(name)).toContain('min-width: var(--a63-control-min-target)')
      }
    )

    it('never floors a rendered height ramp with the interaction target', () => {
      // The regression this guards: max(height, min-target) as RENDERED geometry
      // collapses xs/sm/md to one 44px rung on every phone, because
      // `@media (pointer: coarse)` raises min-target to 2.75rem automatically.
      // Square icon buttons are the one declared exception — see button.css.
      const heightFloor = new RegExp(
        String.raw`([^{}]*)\{[^{}]*--[a-z-]+-height: max\(\s*` +
          String.raw`calc\(var\(--a63-control-height-[a-z0-9]+\) \* var\(--a63-density-scale, 1\)\),\s*` +
          String.raw`var\(--a63-control-min-target`,
        'g'
      )
      const offenders: string[] = []

      for (const line of componentImportLines) {
        const name = /components\/([^/]+)\//.exec(line)?.[1]
        if (!name) continue
        for (const match of readRecipe(name).matchAll(heightFloor)) {
          const selector = match[1].trim().split('\n').at(-1) ?? ''
          offenders.push(`${name} → ${selector}`)
        }
      }

      expect(
        offenders,
        `Recipes flooring rendered height with --a63-control-min-target:\n${offenders.join('\n')}`
      ).toEqual([])
    })

    it('keeps icon buttons on the same rendered ramp as text buttons', () => {
      // Regression guard: flooring icon buttons at the interaction target put a
      // 44px icon button beside a 32px text button in the same toolbar row on
      // coarse pointers. Same size token must mean same height.
      const buttonCss = readRecipe('button')
      expect(
        buttonCss.match(
          /\[data-size='icon[^']*'\] \{\s*--button-height: max\([^;]*--a63-control-min-target/g
        )
      ).toBeNull()
      expect(
        buttonCss.match(
          /\[data-size='icon[^']*'\] \{\s*--button-height: max\([^;]*--a63-control-min-size/g
        )
      ).toHaveLength(5)
    })

    it.each(['button', 'toggle'])('%s expands its touch target without inflating the box', name => {
      const recipe = readRecipe(name)
      expect(recipe).toMatch(/::before \{[^}]*min-height: var\(--a63-control-min-target\)/)
    })

    it('only clips icon-button overflow for themes that paint a gloss', () => {
      // The clip also clips the hit-area pseudo-element, so it is scoped to the
      // themes that actually set --a63-control-highlight. If a new theme starts
      // painting one, it has to be added to that selector or its gloss will
      // bleed past the button radius.
      const themeDir = join(styleSystemDir, 'themes')
      const glossThemes = readdirSync(themeDir)
        .filter(
          file => file.endsWith('.css') && file !== 'index.css' && !file.endsWith('.native.css')
        )
        .filter(file => readWithNative(join(themeDir, file)).includes('--a63-control-highlight:'))
        .map(file => file.replace('.css', ''))

      expect(glossThemes).toEqual(['aqua'])
      for (const theme of glossThemes) {
        expect(readRecipe('button')).toContain(
          `[data-a63-theme='${theme}'] .a63-Button[data-size^='icon']`
        )
      }
    })

    it('select resolves every supported visual dimension from the control and field contracts', () => {
      const recipe = readRecipe('select')
      for (const token of [
        '--a63-control-height-sm',
        '--a63-control-height-md',
        '--a63-control-height-lg',
        '--a63-control-padding-inline-sm',
        '--a63-control-padding-inline-md',
        '--a63-control-padding-inline-lg',
        '--a63-control-font-size-sm',
        '--a63-control-font-size-md',
        '--a63-control-font-size-lg',
        '--a63-control-icon-size-sm',
        '--a63-control-icon-size-md',
        '--a63-control-icon-size-lg',
        '--a63-field-background',
        '--a63-field-border',
        '--a63-field-radius',
        '--a63-field-shadow',
        '--a63-field-focus-border',
        '--a63-field-focus-ring',
      ]) {
        expect(recipe).toContain(token)
      }
      expect(recipe).toContain('min-height: var(--select-height)')
      expect(recipe).toContain('touch-action: manipulation')
    })

    it('keeps calendar and slider control geometry on the environment token axis', () => {
      const calendar = readRecipe('calendar')
      const slider = readRecipe('slider')

      expect(calendar).toContain('--a63-control-height-lg')
      expect(calendar).toContain('--a63-control-min-size')
      expect(calendar).toContain('--a63-control-icon-size-md')
      expect(slider).toContain('--slider-thumb: var(--a63-control-icon-size-md)')
      expect(calendar).not.toMatch(/@media[\s\S]{0,200}\.a63-Calendar\s*\{[\s\S]{0,100}--cell-size/)
      expect(slider).not.toMatch(/@media[\s\S]{0,200}\.a63-Slider\s*\{[\s\S]{0,100}--slider-thumb/)
    })

    it.each(['badge', 'checkbox', 'radio', 'resizable', 'switch'])(
      '%s preserves compact visuals with a minimum interaction area',
      name => {
        expect(readRecipe(name)).toContain('--a63-control-min-target')
      }
    )

    it.each(['badge', 'checkbox', 'radio'])(
      '%s reserves layout space around expanded compact targets',
      name => {
        expect(readRecipe(name)).toContain('calc((var(--a63-control-min-target) - var(--')
      }
    )

    it.each([
      'button-group',
      'menubar',
      'navigation-menu',
      'pagination',
      'segmented-control',
      'tabs',
    ])('%s defines a narrow inline overflow policy', name => {
      const recipe = readRecipe(name)
      expect(recipe).toContain('overflow-x: auto')
      expect(recipe).toContain('overscroll-behavior-inline: contain')
    })

    it.each(['alert-dialog', 'dialog', 'drawer', 'sheet'])(
      '%s accounts for viewport safe areas',
      name => {
        const recipe = readRecipe(name)
        expect(recipe).toContain('--a63-safe-area-')
        expect(recipe).toContain('--a63-viewport-height')
      }
    )

    it.each(['menubar', 'navigation-menu', 'resizable', 'segmented-control', 'tabs'])(
      '%s guards decorative hover feedback by input capability',
      name => {
        expect(readRecipe(name)).toContain('@media (hover: hover)')
      }
    )

    it.each(['autocomplete', 'command', 'input', 'input-otp', 'select', 'textarea'])(
      '%s applies the mobile editable-font floor',
      name => {
        expect(readRecipe(name)).toContain('--a63-editable-font-size-min')
      }
    )

    const appFixtures = ['design-system', 'learn']
      .map(app => ({ app, htmlPath: join(repoDir, 'apps', app, 'index.html') }))
      .filter(({ htmlPath }) => existsSync(htmlPath))

    if (appFixtures.length > 0) {
      it.each(appFixtures)('$app enables edge-to-edge safe areas', ({ htmlPath }) => {
        const html = readFileSync(htmlPath, 'utf8')
        expect(html).toContain('viewport-fit=cover')
      })
    }
  })

  it('imports every component recipe CSS file (none forgotten → none loaded unlayered)', () => {
    const recipeDirs = readdirSync(componentsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => existsSync(join(componentsDir, name, `${name}.css`)))

    const missing = recipeDirs.filter(
      name => !recipesCss.includes(`../components/${name}/${name}.css`)
    )
    expect(missing, `component recipes not imported by recipes.css: ${missing.join(', ')}`).toEqual(
      []
    )
  })

  it('keeps the scoped reset in @layer base (so recipes still override it)', () => {
    expect(resetCss).toMatch(/@layer\s+base\b/)
  })
})
