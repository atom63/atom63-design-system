import { afterEach, describe, expect, it } from 'vitest'
import swiftTokens from '../../../ui-ios/Sources/Atom63UI/Generated/Atom63Tokens.generated.swift?raw'
import { resetRoot, root } from '../test/apply-styles'

/*
 * Web/iOS parity: every color in the generated Swift tokens must equal what the
 * browser paints for its token, in light and dark mode, with the defaults an
 * app starts with (modern theme, brand b1, surface n1). The Swift generator
 * reads the Figma sync model; this test checks that model against the real CSS
 * cascade, so a drift in either shows up here.
 */

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

const colorPattern =
  /\/\/\/ (--[\w-]+)\n\s+public static let (\w+) = AtomDynamicColor\(light: AtomColorComponents\(red: ([\d.]+), green: ([\d.]+), blue: ([\d.]+), opacity: ([\d.]+)\), dark: AtomColorComponents\(red: ([\d.]+), green: ([\d.]+), blue: ([\d.]+), opacity: ([\d.]+)\)\)/g

const swiftColors = [...swiftTokens.matchAll(colorPattern)].map(match => {
  const [, token, name, ...channels] = match
  const n = channels.map(Number)
  return {
    token,
    name,
    light: { r: n[0] * 255, g: n[1] * 255, b: n[2] * 255, a: n[3] },
    dark: { r: n[4] * 255, g: n[5] * 255, b: n[6] * 255, a: n[7] },
  }
})

/** Paints the token on one pixel and reads it back as sRGB. */
function paint(token: string): Rgba {
  const probe = document.createElement('div')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { colorSpace: 'srgb' })!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
  return { r, g, b, a: a / 255 }
}

function setMode(mode: 'light' | 'dark') {
  root().setAttribute('data-a63-design-language', 'ios')
  root().setAttribute('data-a63-mode', mode)
  root().classList.remove('light', 'dark')
  root().classList.add(mode)
}

afterEach(() => {
  resetRoot()
  root().removeAttribute('data-a63-mode')
  root().classList.remove('light', 'dark')
})

describe('web/iOS color parity', () => {
  it('reads the Swift colors', () => {
    expect(swiftColors.length).toBeGreaterThan(20)
  })

  it('matches every Swift color to the browser value in light and dark mode', () => {
    const failures: string[] = []
    for (const mode of ['light', 'dark'] as const) {
      setMode(mode)
      for (const color of swiftColors) {
        const web = paint(color.token)
        const swift = color[mode]
        // One 8-bit step for rounding; alpha is premultiplied by the canvas read.
        const drift = Math.max(
          Math.abs(web.r - swift.r),
          Math.abs(web.g - swift.g),
          Math.abs(web.b - swift.b),
          Math.abs(web.a - swift.a) * 255
        )
        if (drift > 1.5) {
          failures.push(
            `${mode} ${color.name} (${color.token}): web rgba(${web.r}, ${web.g}, ${web.b}, ${web.a.toFixed(2)}), ` +
              `swift rgba(${swift.r.toFixed(1)}, ${swift.g.toFixed(1)}, ${swift.b.toFixed(1)}, ${swift.a})`
          )
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
