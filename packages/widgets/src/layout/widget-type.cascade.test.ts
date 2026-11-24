/** @vitest-environment node */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CSSProperties } from 'react'
import { chromium, type Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { WidgetSize } from '../types'
import { WIDGET_TYPE_RAMP, type WidgetTypeRampRole, widgetTypeStyle } from './widget-type'

/**
 * `@atom63/styles` gives `body` the body text role with a FIXED line height
 * (15px / 23px on the web, #241). Widget type used to set only a font size and
 * inherit the line height, so a 12.5px row picked up the page's 23px line and
 * grew. This loads the real type tokens and the real `body` rule in Chromium
 * and checks every ramp role keeps its own leading — on the element and on
 * plain text inside it, which is how rows like the profile meta line are built.
 */

const here = path.dirname(fileURLToPath(import.meta.url))
const stylesSrc = path.join(here, '../../../styles/src/tokens')
const read = (...parts: string[]) => readFileSync(path.join(stylesSrc, ...parts), 'utf8')

const typeCss = [
  read('foundation/typography.css'),
  read('type-roles.css'),
  read('foundation/typography.native.css'),
].join('\n')

const ROLES = Object.keys(WIDGET_TYPE_RAMP) as WidgetTypeRampRole[]
const SIZES: WidgetSize[] = ['small', 'medium', 'large']

function toCss(style: CSSProperties): string {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}: ${value}`)
    .join('; ')
}

const probes = ROLES.flatMap(role =>
  SIZES.map(size => ({ role, size, style: toCss(widgetTypeStyle(role, size)) }))
)

const documentHtml = `<!doctype html>
<html>
  <head>
    <style>${typeCss}</style>
    <style>:root { --widget-u: calc(188px / 256); }</style>
  </head>
  <body>
    ${probes
      .map(
        ({ role, size, style }) => `
      <div data-probe="${role}:${size}" style="${style}"><span>Los Angeles, CA</span></div>`
      )
      .join('')}
  </body>
</html>`

const MEASURE = () => {
  const px = (value: string) => Number.parseFloat(value)
  const body = getComputedStyle(document.body)
  return {
    body: { fontSize: px(body.fontSize), lineHeight: px(body.lineHeight) },
    probes: [...document.querySelectorAll<HTMLElement>('[data-probe]')].map(el => {
      const child = el.querySelector('span') as HTMLElement
      const own = getComputedStyle(el)
      const inner = getComputedStyle(child)
      return {
        probe: el.getAttribute('data-probe'),
        fontSize: px(own.fontSize),
        lineHeight: px(own.lineHeight),
        childLineHeight: px(inner.lineHeight),
      }
    }),
  }
}

describe('widget type leading', () => {
  let browser: Browser

  beforeAll(async () => {
    const launch = { headless: true } as const
    try {
      browser = await chromium.launch(launch)
    } catch {
      browser = await chromium.launch({ ...launch, channel: 'chrome' })
    }
  }, 30_000)

  afterAll(async () => {
    await browser?.close()
  })

  it('does not inherit the 23px body line height on any ramp role', async () => {
    const page = await browser.newPage()
    await page.setContent(documentHtml, { waitUntil: 'domcontentloaded' })
    const measured = await page.evaluate(MEASURE)
    await page.close()

    // The real body rule is in force, so a missing leading would show up.
    expect(measured.body).toEqual({ fontSize: 15, lineHeight: 23 })
    expect(measured.probes).toHaveLength(probes.length)

    for (const row of measured.probes) {
      const [role] = (row.probe ?? '').split(':') as [WidgetTypeRampRole]
      // The line box follows the role's own size, not the page's 23px line.
      const ratio = row.lineHeight / row.fontSize
      expect(ratio, `${row.probe} line/size`).toBeGreaterThanOrEqual(0.8)
      expect(ratio, `${row.probe} line/size`).toBeLessThanOrEqual(1.6)
      expect(row.childLineHeight, `${row.probe} child`).toBeCloseTo(row.lineHeight, 1)

      const leading = (WIDGET_TYPE_RAMP[role] as { leading?: number }).leading
      expect(row.lineHeight, row.probe ?? '').toBeCloseTo(row.fontSize * (leading ?? 0), 1)
    }
  })
})
