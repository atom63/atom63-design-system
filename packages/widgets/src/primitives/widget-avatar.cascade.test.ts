/** @vitest-environment node */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * The website once loaded `@atom63/ui-react/recipes.css` a second time after
 * `@atom63/widgets/styles.css`. Both sheets share `@layer components`, so a
 * one-class fill (`.a63-WidgetAvatar-avatar { --avatar-size: 100% }`) lost to
 * the later `.a63-Avatar` 32px default. This injects the real styles in that
 * order in Chromium and checks the face still fills the token box.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

const avatarCss = readFileSync(
  path.join(here, '../../../ui-react/src/components/avatar/avatar.css'),
  'utf8'
)
const widgetAvatarCss = readFileSync(path.join(here, 'widget-avatar.css'), 'utf8')

const TOKENS = `
:root {
  --a63-space-unit: 4px;
  --a63-space-1: 4px;
  --a63-space-3: 12px;
  --a63-space-3_5: 14px;
  --a63-space-4: 16px;
  --a63-space-5: 20px;
  --a63-space-6: 24px;
  --a63-surface-muted: #eee;
  --a63-surface-page: #fff;
  --shadow-sm: none;
  --duration-normal: 0s;
  --duration-slower: 0s;
  --duration-333: 0s;
  --ease-standard: linear;
  --ease-inout: linear;
  --a63-avatar-radius: 9999px;
  --radius-full: 9999px;
  --a63-control-border-width: 1px;
  --a63-border-subtle: transparent;
  --a63-action-primary: transparent;
}
`

const SIZES = [
  { size: 'sm', px: 48 },
  { size: 'md', px: 64 },
  { size: 'lg', px: 80 },
] as const

function layer(css: string): string {
  return `@layer components { ${css} }`
}

const documentHtml = `<!doctype html>
<html>
  <head>
    <style>${TOKENS}</style>
    <style>${layer(avatarCss)}</style>
    <style>${layer(widgetAvatarCss)}</style>
    <style>${layer(avatarCss)}</style>
  </head>
  <body>
    ${SIZES.map(
      ({ size }) => `
      <div class="a63-WidgetAvatar" data-widget-avatar-size="${size}" data-probe="${size}">
        <div class="a63-Avatar a63-WidgetAvatar-avatar" data-size="default"></div>
      </div>`
    ).join('')}
  </body>
</html>`

const MEASURE = () =>
  [...document.querySelectorAll<HTMLElement>('[data-probe]')].map(root => {
    const face = root.querySelector<HTMLElement>('.a63-WidgetAvatar-avatar')
    if (!face) throw new Error('missing face')
    return {
      size: root.getAttribute('data-probe'),
      root: { height: root.offsetHeight, width: root.offsetWidth },
      face: { height: face.offsetHeight, width: face.offsetWidth },
      avatarSize: getComputedStyle(face).getPropertyValue('--avatar-size').trim(),
    }
  })

describe('WidgetAvatar face fill', () => {
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

  it('fills the 48/64/80 token box when recipes load again after widgets', async () => {
    const page = await browser.newPage()
    await page.setContent(documentHtml, { waitUntil: 'domcontentloaded' })
    const measured = await page.evaluate(MEASURE)
    await page.close()

    expect(measured).toHaveLength(SIZES.length)
    for (const { px, size } of SIZES) {
      const row = measured.find(item => item.size === size)
      expect(row, size).toEqual({
        avatarSize: '100%',
        face: { height: px, width: px },
        root: { height: px, width: px },
        size,
      })
    }
  })
})
