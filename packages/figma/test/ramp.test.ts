import { brandRamp, oklchToRgb, parseHex, rgbToOklch } from '../src/ramp'

const channels = (css: string) => {
  const match = /^rgba\((\d+), (\d+), (\d+), 1\)$/.exec(css)
  if (!match) throw new Error(`not an rgba() step: ${css}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])] as const
}
const lightness = (css: string) =>
  rgbToOklch(channels(css).map(value => value / 255) as [number, number, number]).l

describe('brandRamp', () => {
  it('gives eleven rgba() steps with the input at its nearest step', () => {
    const ramp = brandRamp('#2c7fff')
    expect(ramp).toHaveLength(11)
    expect(ramp).toContain('rgba(44, 127, 255, 1)')
  })

  it.each(['#2c7fff', '#ffff00', '#000000', '#ffffff', '#e11d48', '#808080'])(
    'falls in lightness from 50 to 950 and stays in sRGB for %s',
    hex => {
      const ramp = brandRamp(hex)
      for (const step of ramp)
        for (const value of channels(step)) expect(value).toBeGreaterThanOrEqual(0)
      for (let index = 1; index < ramp.length; index++)
        expect(lightness(ramp[index])).toBeLessThan(lightness(ramp[index - 1]))
    }
  )

  it('keeps a grey input grey', () => {
    for (const step of brandRamp('#808080')) {
      const [r, g, b] = channels(step)
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(1)
    }
  })

  it.each(['blue', '#12', '', '#12345g'])('refuses %j with a message that names it', value => {
    expect(() => brandRamp(value)).toThrow(`"${value}" is not a hex color`)
  })
})

describe('OKLCH conversions', () => {
  it('reads white as full lightness and no chroma', () => {
    const white = rgbToOklch([1, 1, 1])
    expect(white.l).toBeCloseTo(1, 4)
    expect(white.c).toBeCloseTo(0, 4)
  })

  it('round-trips an sRGB color', () => {
    const rgb = parseHex('#e11d48') ?? [0, 0, 0]
    oklchToRgb(rgbToOklch(rgb)).forEach((value, index) => expect(value).toBeCloseTo(rgb[index], 4))
  })

  it('reads three- and six-digit hex', () => {
    expect(parseHex('#fff')).toEqual([1, 1, 1])
    expect(parseHex('2c7fff')).toEqual([44 / 255, 127 / 255, 1])
    expect(parseHex('#12')).toBeNull()
  })
})
