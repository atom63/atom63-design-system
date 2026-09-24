import { gzipSync } from 'node:zlib'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const distDirectory = path.join(workspaceRoot, 'packages/ui-react/dist')
// Combined gzip of every published JS entry. The media lightbox lives on
// `./media` (~23 kB gzip of its own), and has grown deliberately: 64 kB was the
// pre-lightbox kit budget, 72 kB was the budget before its motion pass, and 74
// before the gesture and loading work. What that ~2 kB bought, in order of
// size: a body scroll lock that outlives the overlay (the only thing that stops
// a trackpad's coast scrolling the page it uncovers), aspect detection so the
// enlarged photo has a placeholder before it loads, and a trailing-window
// velocity tracker shared by the gesture hooks.
//
// 76 kB held 70.6 kB of actual output. Splitting the lightbox into composable
// parts took that to 78.7 kB — +8.1 kB, the largest single jump this budget has
// absorbed — so it moves to 82. The growth is the new public surface, not
// duplication: the monolith is gone, and `./media/lightbox` is a 0.3 kB barrel
// over a shared chunk. What the 8 kB bought is 22 parts that each carry their
// own accessibility and a Base UI `render` prop, three contexts split by change
// frequency so a swipe cannot re-render every chrome part of every slide, and
// three internal registries wiring parts to each other. That is the cost of the
// lightbox's look becoming replaceable rather than fixed; a second consumer now
// composes its own chrome instead of forking the component.
//
// 82 kB held 81.0 kB. Image-backed surfaces take it to 83.9, so it moves to 84.
// The +2.9 kB is `ProgressiveBlur` and dominant-colour extraction, previously
// private to atom63.io and now shared because a package-owned surface (the
// timeline gallery) needs them and cannot import from an app. Most of it is the
// extraction: a pixel-bucketing pass, HSL conversion both ways, and a binary
// search that caps a tint's relative luminance so white text clears AA over any
// hue. It is plain ESM with no side effects, so a consumer that never tints an
// image tree-shakes all of it — this budget measures published output, which is
// the number that can only be checked once.
//
// 84 kB held 85.7 kB when this check moved into the design-system repository:
// `Atom63Theme` (3b61f6c) and the `./preview` entry (fb98662) landed after the
// extraction, while the check still lived in atom63-vite, and shipped in
// 0.2.0-beta.3 at that size. The budget re-baselines at 86 kB from here.
//
// 86 kB held 85.8 kB. Generating custom brand ramps in OKLCH takes it to 86.6,
// so it moves to 87. The +0.8 kB is OKLCH to sRGB conversion both ways and a
// binary search that lowers chroma until each step fits the sRGB gamut. It buys
// ramps where every hue has the same perceived lightness per step, so a custom
// brand meets WCAG AA like the built-in ones; the HSL ramps it replaces fell to
// 1.7:1 for yellow and green brands.
const gzipBudgetBytes = 87 * 1024
const files = (await readdir(distDirectory, { recursive: true }))
  .filter(file => file.endsWith('.js'))
  .sort()

if (files.length === 0) {
  console.error('UI React bundle-size check failed: build output is missing')
  process.exit(1)
}

let gzipBytes = 0
for (const file of files) {
  gzipBytes += gzipSync(await readFile(path.join(distDirectory, file))).byteLength
}

const formattedSize = `${(gzipBytes / 1024).toFixed(1)} kB`
const formattedBudget = `${(gzipBudgetBytes / 1024).toFixed(0)} kB`

if (gzipBytes > gzipBudgetBytes) {
  console.error(
    `UI React bundle-size check failed: ${formattedSize} gzip exceeds ${formattedBudget} budget`
  )
  process.exit(1)
}

console.log(`UI React bundle-size check passed: ${formattedSize} gzip / ${formattedBudget} budget`)
