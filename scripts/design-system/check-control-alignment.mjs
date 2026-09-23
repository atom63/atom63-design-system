/**
 * Guardrail: controls on the same size rung must render at the same height.
 *
 * This exists because a unit test could not catch the bug it guards. #383 floored
 * square icon buttons at `--a63-control-min-target` while every other control
 * floored at `--a63-control-min-size`, so on a coarse pointer a 44px icon button
 * sat beside a 32px text button in the same toolbar row. Every recipe used a
 * legitimate token; the defect only existed once the cascade resolved, and only
 * on one axis combination. Nothing short of a real browser sees that.
 *
 * `@atom63/ui-react` runs on jsdom, which cannot resolve custom-property
 * cascades, so this drives Chromium through the root `playwright` dependency.
 * Moved here from atom63-vite with the design-system packages it checks.
 *
 * It renders source CSS directly — no app build, no dev server — so it is fast
 * enough to gate on.
 *
 * Usage: node scripts/check-control-alignment.mjs [--keep-fixture]
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const fileUrl = relative => `file://${path.join(repoRoot, relative)}`

/**
 * One row per size rung. Every entry must resolve to the SAME
 * `--a63-control-height-*` rung in its recipe — verified in the recipes, not
 * assumed: Button/Input/Select/Toggle all map sm→sm, md→md, lg→lg, and Button's
 * `icon*` sizes map to the matching rung.
 */
const rows = [
  {
    rung: 'sm',
    markup: `
      <button class="a63-Button" data-size="sm"><span class="a63-Button-label">sm</span></button>
      <button class="a63-Button" data-size="icon-sm"><span class="a63-Button-label">◆</span></button>
      <button class="a63-Toggle" data-size="sm"><span class="a63-Toggle-content">sm</span></button>
      <input class="a63-Input" data-size="sm" placeholder="sm" />
    `,
  },
  {
    rung: 'md',
    markup: `
      <button class="a63-Button" data-size="md"><span class="a63-Button-label">md</span></button>
      <button class="a63-Button" data-size="icon"><span class="a63-Button-label">◆</span></button>
      <button class="a63-Toggle" data-size="md"><span class="a63-Toggle-content">md</span></button>
      <input class="a63-Input" data-size="md" placeholder="md" />
    `,
  },
  {
    rung: 'lg',
    markup: `
      <button class="a63-Button" data-size="lg"><span class="a63-Button-label">lg</span></button>
      <button class="a63-Button" data-size="icon-lg"><span class="a63-Button-label">◆</span></button>
      <button class="a63-Toggle" data-size="lg"><span class="a63-Toggle-content">lg</span></button>
      <input class="a63-Input" data-size="lg" placeholder="lg" />
    `,
  },
]

/** The axis combinations that change control geometry. */
const environments = []
for (const designLanguage of ['web', 'ios']) {
  for (const input of ['pointer', 'touch']) {
    for (const density of ['comfortable', 'compact']) {
      environments.push({ designLanguage, input, density })
    }
  }
}

/**
 * Every control that a finger can activate, plus the touch target it is expected
 * to deliver. `expected` is the floor in px on a coarse pointer
 * (--a63-control-min-target resolves to 44 there).
 *
 * A control whose target cannot reach 44 must be declared here with a reason,
 * not left out — an omission is invisible, a declared exception is reviewable.
 *
 * `axis: 'height'` checks the height only. That is for controls whose width comes
 * from their container or their content (a full-width row, a text field), where a
 * narrow fixture would report a meaningless width. Compact controls default to
 * checking BOTH axes, because for them both are genuinely fixed.
 */
const targets = [
  {
    name: 'Button sm',
    markup: `<button class="a63-Button" data-size="sm"><span class="a63-Button-label">A</span></button>`,
  },
  {
    name: 'Button icon-sm',
    markup: `<button class="a63-Button" data-size="icon-sm"><span class="a63-Button-label">A</span></button>`,
  },
  {
    name: 'Button icon-lg',
    markup: `<button class="a63-Button" data-size="icon-lg"><span class="a63-Button-label">A</span></button>`,
  },
  {
    name: 'Toggle sm',
    markup: `<button class="a63-Toggle" data-size="sm"><span class="a63-Toggle-content">A</span></button>`,
  },
  { name: 'Checkbox', markup: `<button class="a63-Checkbox"></button>` },
  { name: 'Radio', markup: `<button class="a63-Radio"></button>` },
  {
    name: 'Switch',
    markup: `<button class="a63-Switch"><span class="a63-Switch-thumb"></span></button>`,
  },
  {
    name: 'Slider thumb',
    markup: `<span class="a63-Slider"><span class="a63-Slider-control"><span class="a63-Slider-track"></span><span class="a63-Slider-thumb" data-pick></span></span></span>`,
  },
  { name: 'Badge (link)', markup: `<a href="#" class="a63-Badge" data-pick>A</a>` },

  /* ── Declared exceptions ──────────────────────────────────────────────
   * These three sit inside a scrolling container (`overflow-x: auto` on the Tabs
   * list and the SegmentedControl track, which computes overflow-y to auto too),
   * or are a bare field, so a hit-area pseudo-element is clipped or absent and
   * cannot deliver the target. Reaching 44 would mean raising their RENDERED
   * height on touch.
   *
   * That is deliberate, not a backlog item. Our own measurement of shipping iOS
   * apps (docs/design-system/web-ios-token-parity.md) finds compact controls at
   * 31.5pt sitting INSIDE a 44pt tappable row, and Apple's own segmented control
   * is 32pt — so a blanket 44 here would be wrong. Tabs and segments stay on the
   * rendered ramp. Fields measured 39.3–39.8pt, above our 32, but raising Input
   * alone would break the rung-alignment rows above, which require Button,
   * Toggle and Input to share a height.
   *
   * Lower these numbers only by making the target bigger. */
  {
    name: 'Input sm',
    markup: `<input class="a63-Input" data-size="sm" />`,
    axis: 'height',
    expected: 32,
    why: 'field; no interaction floor declared yet',
  },
  {
    name: 'Tabs tab',
    markup: `<div class="a63-Tabs"><div class="a63-Tabs-list"><button class="a63-Tabs-tab" data-pick>A</button><button class="a63-Tabs-tab">B</button></div></div>`,
    axis: 'height',
    expected: 32,
    why: 'scrolling tab list clips an overhanging pseudo',
  },
  {
    name: 'SegmentedControl item',
    markup: `<div class="a63-SegmentedControl"><div class="a63-SegmentedControl-track"><button class="a63-SegmentedControl-item" data-pick>A</button><button class="a63-SegmentedControl-item">B</button></div></div>`,
    axis: 'height',
    expected: 30,
    why: 'scrolling segment track clips an overhanging pseudo',
  },
  {
    name: 'ConnectedPanel trigger',
    markup: `<div class="a63-ConnectedPanel"><button class="a63-Button a63-ConnectedPanel-trigger" data-size="md" data-pick><span class="a63-Button-label">A</span></button></div>`,
    axis: 'height',
  },
]

function fixtureHtml() {
  const body = rows
    .map(row => `<div class="row" data-rung="${row.rung}">${row.markup}</div>`)
    .join('\n')

  const targetBody = targets
    .map(target => `<div class="target" data-name="${target.name}">${target.markup}</div>`)
    .join('\n')

  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="${fileUrl('packages/styles/src/index.css')}">
<link rel="stylesheet" href="${fileUrl('packages/ui-react/src/styles/reset.css')}">
<link rel="stylesheet" href="${fileUrl('packages/ui-react/src/styles/recipes.css')}">
<style>
  /* The apps all \`@import "tailwindcss"\`; preflight's block-margin reset is the
     only part of it these recipes depend on. Without it measurements are fiction. */
  h1,h2,h3,h4,h5,h6,p,figure,blockquote,dl,dd { margin: 0 }
  body { margin: 0; padding: 16px }
  .row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px }
  /* Far enough apart that one control's hit area can never reach another, which
     would silently inflate its measured target. */
  #targets { margin-top: 80px }
  .target { margin-bottom: 80px; padding-left: 24px }
</style>
</head>
<body class="a63-UIProvider">${body}<div id="targets">${targetBody}</div></body></html>`
}

async function main() {
  const keepFixture = process.argv.includes('--keep-fixture')
  const dir = await mkdtemp(path.join(tmpdir(), 'a63-control-alignment-'))
  const fixture = path.join(dir, 'fixture.html')
  await writeFile(fixture, fixtureHtml())

  const browser = await chromium.launch()
  const failures = []
  const observed = []

  try {
    // Tall enough that every specimen is inside the viewport: the touch-target
    // pass uses elementFromPoint, which only sees the visible area and would
    // silently report 1x1 for anything scrolled out of view.
    const context = await browser.newContext({ viewport: { width: 900, height: 2600 } })
    const page = await context.newPage()
    await page.goto(`file://${fixture}`, { waitUntil: 'load' })

    // The scoped reset only applies inside .a63-UIProvider; if that regressed,
    // box-sizing would be content-box and every number below would be wrong.
    const boxSizing = await page.evaluate(
      () => getComputedStyle(document.querySelector('.a63-Button')).boxSizing
    )
    if (boxSizing !== 'border-box') {
      throw new Error(
        `Fixture is not resolving the scoped reset (box-sizing: ${boxSizing}). ` +
          'Measurements would be meaningless; fix the fixture before trusting this check.'
      )
    }

    for (const env of environments) {
      await page.evaluate(({ designLanguage, input, density }) => {
        const root = document.documentElement
        root.setAttribute('data-a63-design-language', designLanguage)
        root.setAttribute('data-a63-input', input)
        root.setAttribute('data-a63-density', density)
      }, env)

      const measured = await page.evaluate(() =>
        [...document.querySelectorAll('.row')].map(row => ({
          rung: row.dataset.rung,
          controls: [...row.children].map(el => ({
            name: `${el.className.split(' ')[0].replace('a63-', '')}[${el.dataset.size}]`,
            height: Math.round(el.getBoundingClientRect().height * 100) / 100,
          })),
        }))
      )

      const tag = `${env.designLanguage}/${env.input}/${env.density}`
      for (const { rung, controls } of measured) {
        const heights = new Set(controls.map(control => control.height))
        observed.push(
          `  ${tag.padEnd(26)} ${rung.padEnd(3)} ${controls
            .map(c => `${c.name}=${c.height}`)
            .join('  ')}`
        )
        if (heights.size > 1) {
          failures.push(
            `${tag} rung "${rung}": ${controls.map(c => `${c.name}=${c.height}px`).join(', ')}`
          )
        }
      }
    }

    /* Touch-target pass. Heights above are read from the box; a touch target is
       not — it includes hit-area pseudo-elements, and is cut back by any
       ancestor that clips. So measure what a finger actually gets: walk outward
       from the centre and ask the document what is under each point. That is
       what caught Switch and Slider shipping 42px targets from a formula that
       looked correct, and ConnectedPanel losing its target to an ancestor's
       `overflow: hidden`. */
    await page.evaluate(() => {
      const root = document.documentElement
      root.setAttribute('data-a63-design-language', 'web')
      root.setAttribute('data-a63-input', 'touch')
      root.setAttribute('data-a63-density', 'comfortable')
    })

    const measuredTargets = await page.evaluate(() =>
      [...document.querySelectorAll('.target')].map(target => {
        const el = target.querySelector('[data-pick]') ?? target.firstElementChild
        const box = el.getBoundingClientRect()
        const cx = box.left + box.width / 2
        const cy = box.top + box.height / 2
        const hits = (x, y) => {
          const hit = document.elementFromPoint(x, y)
          return hit === el || el.contains(hit)
        }
        const reach = (dx, dy) => {
          let d = 0
          while (d < 240 && hits(cx + dx * (d + 1), cy + dy * (d + 1))) d += 1
          return d
        }
        return {
          name: target.dataset.name,
          width: reach(-1, 0) + reach(1, 0) + 1,
          height: reach(0, -1) + reach(0, 1) + 1,
        }
      })
    )

    const minTarget = await page.evaluate(
      () =>
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--a63-control-min-target')
        ) * 16
    )

    for (const { name, width, height } of measuredTargets) {
      const declared = targets.find(t => t.name === name)
      const expected = declared.expected ?? minTarget
      const smallest = declared.axis === 'height' ? height : Math.min(width, height)
      const suffix = declared.expected ? `  (declared exception: ${declared.why})` : ''
      observed.push(
        `  touch target${' '.repeat(14)} ${name.padEnd(24)} ${width}x${height}${suffix}`
      )
      if (smallest < expected) {
        failures.push(
          `touch target "${name}": ${width}x${height}px, smallest side ${smallest}px < ${expected}px`
        )
      }
      if (declared.expected && smallest > minTarget) {
        failures.push(
          `touch target "${name}" is declared as an exception (${declared.expected}px) but now ` +
            `measures ${smallest}px, at or above the ${minTarget}px floor — remove the exception`
        )
      }
    }

    await context.close()
  } finally {
    await browser.close()
    if (!keepFixture) await rm(dir, { recursive: true, force: true })
  }

  if (failures.length > 0) {
    console.error('Control alignment check FAILED.\n')
    console.error(
      'Controls sharing a size rung rendered at different heights. A row of mixed\n' +
        'controls will visibly stagger. Same size token must mean same height.\n'
    )
    for (const failure of failures) console.error(`  ${failure}`)
    console.error('\nFull measurements:')
    for (const line of observed) console.error(line)
    process.exitCode = 1
    return
  }

  console.log(
    `Control alignment check passed ` +
      `(${rows.length} rungs × ${environments.length} axis combinations).`
  )
  if (keepFixture) console.log(`Fixture kept at ${fixture}`)
}

await main()
