#!/usr/bin/env node
/**
 * pnpm plate:palette <image> --id <plate-id> [--out <file.css>] [--safe-area top] [--colors 6]
 *
 * Reads a plate (the main picture of an art landing page), picks its page tone,
 * deep ink and accent, checks WCAG AA, and writes the scoped stylesheet for
 * `[data-a63-plate='<plate-id>']` (see lib/plate-palette.mjs). It refuses, and
 * writes nothing, when a required pair fails. The pixels are read in headless
 * Chromium (Playwright), so any format the browser decodes works.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'

import { chromium } from 'playwright'

import { hex, platePalette, plateScopeCss, quantize } from './lib/plate-palette.mjs'

const SAFE_AREAS = ['top', 'bottom', 'center', 'start', 'end']
const TYPES = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    colors: { type: 'string', default: '6' },
    id: { type: 'string' },
    out: { type: 'string' },
    'safe-area': { type: 'string', default: 'top' },
  },
})
const [image] = positionals
const safeArea = values['safe-area']
const type = TYPES[path.extname(image ?? '').toLowerCase()]
if (!image || !values.id || !SAFE_AREAS.includes(safeArea) || !type) {
  process.stderr.write(
    `usage: pnpm plate:palette <image.(png|webp|jpg|avif)> --id <plate-id> [--out <file.css>] [--safe-area ${SAFE_AREAS.join('|')}] [--colors 6]\n`
  )
  process.exit(2)
}

const dataUrl = `data:${type};base64,${(await readFile(image)).toString('base64')}`
const browser = await chromium.launch()
let samples
try {
  const page = await browser.newPage()
  samples = await page.evaluate(
    async ({ src, area }) => {
      const picture = new Image()
      picture.src = src
      await picture.decode()
      const width = 160
      const height = Math.max(1, Math.round((picture.naturalHeight / picture.naturalWidth) * width))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.drawImage(picture, 0, 0, width, height)
      const { data } = context.getImageData(0, 0, width, height)
      const inArea = (x, y) => {
        const u = x / width
        const v = y / height
        if (area === 'top') return v < 0.35
        if (area === 'bottom') return v > 0.65
        if (area === 'start') return u < 0.4
        if (area === 'end') return u > 0.6
        return u > 0.3 && u < 0.7 && v > 0.3 && v < 0.7
      }
      const plate = []
      const safe = []
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4
          if (data[i + 3] < 200) continue
          const rgb = [data[i], data[i + 1], data[i + 2]]
          plate.push(rgb)
          if (inArea(x, y)) safe.push(rgb)
        }
      }
      return { plate, safe }
    },
    { src: dataUrl, area: safeArea }
  )
} finally {
  await browser.close()
}

const palette = platePalette({
  plate: quantize(samples.plate, Number(values.colors)),
  safeArea: quantize(samples.safe, 3),
})

const report = [
  `plate ${values.id} (${image}), safe area ${safeArea}, suggested mode ${palette.mode}`,
  `  page   ${hex(palette.roles.page)}`,
  `  ink    ${hex(palette.roles.ink)}`,
  `  accent ${palette.roles.accent ? hex(palette.roles.accent) : 'none'}`,
  ...palette.roles.neutrals.map(rgb => `  other  ${hex(rgb)}`),
  'contrast',
  ...palette.pairs.map(
    ({ pair, ratio, minimum }) =>
      `  ${ratio >= minimum ? 'ok  ' : 'FAIL'} ${ratio.toFixed(2)}:1 (≥ ${minimum}) ${pair}`
  ),
  ...palette.notes.map(note => `note: ${note}`),
]
process.stderr.write(`${report.join('\n')}\n`)

if (palette.problems.length > 0) {
  process.stderr.write(`\nNot written: ${palette.problems.join('; ')}\n`)
  process.exit(1)
}

const css = plateScopeCss(values.id, palette, path.basename(image))
if (values.out) {
  await writeFile(values.out, css)
  process.stderr.write(`\nWrote ${values.out}\n`)
} else {
  process.stdout.write(css)
}
