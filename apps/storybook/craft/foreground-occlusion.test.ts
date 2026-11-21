// The LayeredScene occlusion check on hand-written fixtures in Chromium: a
// control under an opaque part of the cut-out must be caught, one under its
// transparent part must pass.
import { afterEach, describe, expect, it } from 'vitest'

import { findOccludedElements } from '../../../scripts/design-system/lib/foreground-occlusion.mjs'

/** A 400×200 cut-out, transparent except for an opaque band over its bottom quarter. */
function cutOut(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 200
  canvas.getContext('2d')!.fillRect(0, 150, 400, 50)
  return canvas.toDataURL('image/png')
}

async function mountScene(buttonTop: number) {
  const scene = document.createElement('div')
  scene.setAttribute('data-slot', 'layered-scene')
  scene.style.cssText = 'position: relative; width: 400px; height: 200px'
  scene.innerHTML = `
    <div data-slot="layered-scene-stage" style="position: absolute; inset: 0">
      <button type="button" style="position: absolute; top: ${buttonTop}px; left: 20px; width: 80px; height: 30px">Run</button>
    </div>
    <div data-slot="layered-scene-foreground" style="position: absolute; inset: 0; pointer-events: none">
      <img alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover" />
    </div>`
  document.body.append(scene)
  const image = scene.querySelector('img')!
  image.src = cutOut()
  await image.decode()
  return scene
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('findOccludedElements', () => {
  it('reports a control under the opaque band', async () => {
    const scene = await mountScene(160)
    const result = await findOccludedElements(scene)
    expect(result.occluded).toEqual(['button "Run"'])
    expect(result.unreadable).toEqual([])
  })

  it('passes a control over the transparent part', async () => {
    const scene = await mountScene(40)
    const result = await findOccludedElements(scene)
    expect(result.occluded).toEqual([])
    expect(result.checked).toBeGreaterThan(0)
  })
})
