import { parseColor } from '../src/css-model'
import { evaluateChannel, parseOklch } from '../src/oklch-color'

const FOREGROUND = 'clamp(0.15, (0.57 - l) * 1000, 0.985) calc(c * 0.06) h'

/** Chrome 152, `color(from <expr> srgb r g b / alpha)`, clipped to 0–1 (2026-10-05). */
const CHROME: [string, [number, number, number]][] = [
  ['rgba(5, 93, 210, 1)', [0.96246, 0.982337, 1]],
  ['rgba(199, 66, 0, 1)', [1, 0.972021, 0.960043]],
  ['rgba(0, 94, 51, 1)', [0.968281, 0.985877, 0.973315]],
  ['rgba(185, 28, 107, 1)', [1, 0.968582, 0.980814]],
  ['rgba(94, 10, 202, 1)', [0.979523, 0.974978, 1]],
  ['rgba(205, 12, 61, 1)', [1, 0.968243, 0.967913]],
  ['rgba(255, 255, 0, 1)', [0.0446749, 0.0456746, 0.0236109]],
]

describe('evaluateChannel', () => {
  const channels = { l: 0.3, c: 0.2, h: 250, alpha: 1 }

  it('evaluates the template foreground channels', () => {
    expect(evaluateChannel('clamp(0.15, (0.57 - l) * 1000, 0.985)', channels, 1)).toBe(0.985)
    expect(
      evaluateChannel('clamp(0.15, (0.57 - l) * 1000, 0.985)', { ...channels, l: 0.9 }, 1)
    ).toBe(0.15)
    expect(evaluateChannel('calc(c * 0.06)', channels, 0.4)).toBeCloseTo(0.012, 10)
    expect(evaluateChannel('h', channels, 1)).toBe(250)
  })

  it('reads numbers, percentages, degrees, signs, min and max', () => {
    expect(evaluateChannel('50%', channels, 0.4)).toBeCloseTo(0.2, 10)
    expect(evaluateChannel('30deg', channels, 1)).toBe(30)
    expect(evaluateChannel('-l', channels, 1)).toBe(-0.3)
    expect(evaluateChannel('min(1, 2, -3)', channels, 1)).toBe(-3)
    expect(evaluateChannel('max(l, calc(l * 2))', channels, 1)).toBe(0.6)
    expect(evaluateChannel('none', channels, 1)).toBe(0)
  })

  it('refuses what it cannot read', () => {
    expect(evaluateChannel('x', channels, 1)).toBeNull()
    expect(evaluateChannel('calc(l * 2', channels, 1)).toBeNull()
    expect(evaluateChannel('l 2', channels, 1)).toBeNull()
    expect(evaluateChannel('clamp(1, 2)', channels, 1)).toBeNull()
  })
})

describe('parseOklch', () => {
  it.each(CHROME)('computes the template foreground on %s like Chrome', (base, expected) => {
    const color = parseOklch(`oklch(from ${base} ${FOREGROUND})`, parseColor)
    if (!color) throw new Error('no color')
    ;[color.r, color.g, color.b].forEach((value, index) =>
      expect(Math.abs(value - expected[index])).toBeLessThan(3e-4)
    )
    expect(color.a).toBe(1)
  })

  it('gives a near-black foreground on a light primary', () => {
    const color = parseOklch(`oklch(from rgba(255, 255, 0, 1) ${FOREGROUND})`, parseColor)
    expect(Math.max(color?.r ?? 1, color?.g ?? 1, color?.b ?? 1)).toBeLessThan(0.05)
  })

  it('returns the base color for l c h', () => {
    const color = parseOklch('oklch(from rgba(44, 127, 255, 1) l c h)', parseColor)
    expect(color?.r).toBeCloseTo(44 / 255, 6)
    expect(color?.g).toBeCloseTo(127 / 255, 6)
    expect(color?.b).toBeCloseTo(1, 6)
  })

  it('reads absolute oklch()', () => {
    const white = parseOklch('oklch(1 0 0)', parseColor)
    for (const value of [white?.r, white?.g, white?.b]) expect(value).toBeCloseTo(1, 10)
    expect(white?.a).toBe(1)
    expect(parseOklch('oklch(0% 0 0)', parseColor)).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    const red = parseOklch('oklch(62.8% 0.2577 29.23deg)', parseColor)
    expect(red?.r).toBeCloseTo(1, 3)
    expect(red?.g).toBeCloseTo(0, 3)
    expect(red?.b).toBeCloseTo(0, 3)
  })

  it('reads alpha after a slash or from the base', () => {
    expect(parseOklch('oklch(from #000 l c h / 0.5)', parseColor)?.a).toBe(0.5)
    expect(parseOklch('oklch(from #000 l c h / 50%)', parseColor)?.a).toBe(0.5)
    expect(parseOklch('oklch(from rgba(0, 0, 0, 0.25) l c h)', parseColor)?.a).toBe(0.25)
    expect(parseOklch('oklch(from #000 l c h / 2)', parseColor)?.a).toBe(1)
  })

  it.each([
    'oklch(from nonsense l c h)',
    'oklch(l c h)',
    'oklch(0.5 0.1)',
    'oklch(0.5 0.1 30 /)',
    'oklch((0.5 0.1 30)',
    'hsl(from #000 h s l)',
  ])('refuses %s', expression => {
    expect(parseOklch(expression, parseColor)).toBeNull()
  })

  it('is what parseColor returns for oklch()', () => {
    expect(parseColor(`oklch(from rgba(5, 93, 210, 1) ${FOREGROUND})`)).toEqual(
      parseOklch(`oklch(from rgba(5, 93, 210, 1) ${FOREGROUND})`, parseColor)
    )
  })
})
