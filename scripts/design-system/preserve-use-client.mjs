#!/usr/bin/env node
/**
 * Post-build step: put `'use client'` back at the top of every built file that
 * holds a `'use client'` source module (see lib/use-client.mjs), then delete
 * the metafile so it is not published. Fails when a client module lands next
 * to a module that is neither client nor declared server-safe below.
 *
 * Run from a package directory after `tsup` with `metafile: true`:
 *   node ../../scripts/design-system/preserve-use-client.mjs
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { addDirective, planUseClient } from './lib/use-client.mjs'

// Modules without the directive that share a built file with client modules.
// The file stays unmarked so their exports (DEFAULT_MEDIA_LIGHTBOX_LABELS,
// isVideoSrc, THEME_OPTIONS, …) keep working in a server component; the client
// modules beside them get no boundary there. Today that is the media and
// lightbox internals and the theme entry.
const serverSafeByPackage = {
  '@atom63/ui-react': [
    'src/media/media-lightbox/direction.ts',
    'src/media/media-lightbox/labels.ts',
    'src/media/media-lightbox/motion.ts',
    'src/media/media-lightbox/origin-morph.ts',
    'src/media/media-lightbox/reveal-origin.ts',
    'src/media/media-lightbox/scroll-lock.ts',
    'src/media/media-lightbox/slide-media.tsx',
    'src/media/media-lightbox/timing.ts',
    'src/media/media-lightbox/track-physics.ts',
    'src/media/media-lightbox/use-media-aspect.ts',
    'src/media/media-lightbox/use-media-lightbox.ts',
    'src/media/media-lightbox/use-media-zoom.ts',
    'src/media/media-lightbox/use-min-width.ts',
    'src/media/media-lightbox/use-pull-to-dismiss.ts',
    'src/media/media-lightbox/velocity.ts',
    'src/media/media-lightbox/view-transition.ts',
    'src/media/media-lightbox/wheel-momentum.ts',
    'src/media/video-manager-context.tsx',
    'src/media/video-modal.tsx',
    'src/media/video-thumbnail.tsx',
    'src/media/video.tsx',
    'src/theme/appearance/appearance-section.tsx',
    'src/theme/core/apply-personalization.ts',
    'src/theme/core/auto-contrast.ts',
    'src/theme/core/auto-primary.ts',
    'src/theme/core/options.ts',
    'src/theme/providers/create-personalization-controller.tsx',
    'src/theme/providers/create-theme-provider.tsx',
  ],
  '@atom63/mdx': [],
}

const cwd = process.cwd()
const { name } = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'))
const metafilePath = path.join(cwd, 'dist/metafile-esm.json')
if (!existsSync(metafilePath)) {
  console.error(`${name}: dist/metafile-esm.json is missing; build with tsup \`metafile: true\`.`)
  process.exit(1)
}
const metafile = JSON.parse(readFileSync(metafilePath, 'utf8'))
rmSync(metafilePath)

const { mark, unmarked, failures } = planUseClient(
  metafile,
  file => readFileSync(path.join(cwd, file), 'utf8'),
  { serverSafe: serverSafeByPackage[name] ?? [] }
)

for (const output of mark) {
  const file = path.join(cwd, output)
  const mapFile = `${file}.map`
  const map = existsSync(mapFile) ? readFileSync(mapFile, 'utf8') : undefined
  const result = addDirective(readFileSync(file, 'utf8'), map)
  writeFileSync(file, result.code)
  if (result.map) writeFileSync(mapFile, result.map)
}

if (failures.length > 0) {
  console.error(`${name}: 'use client' cannot be kept:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
const note = unmarked.length > 0 ? `, ${unmarked.length} shared with server-safe modules` : ''
console.log(`${name}: kept 'use client' in ${mark.length} built file(s)${note}.`)
