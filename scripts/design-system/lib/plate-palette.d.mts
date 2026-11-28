type Rgb = number[]

export interface Cluster {
  rgb: Rgb
  lab: { l: number; a: number; b: number }
  weight: number
}

export interface PlatePalette {
  mode: 'light' | 'dark'
  roles: { page: Rgb; ink: Rgb; accent: Rgb | null; neutrals: Rgb[] }
  surfaces: { light: Rgb; dark: Rgb; secondaryOnLight: Rgb; secondaryOnDark: Rgb }
  ramp: { step: number; rgb: Rgb }[] | null
  pairs: { pair: string; ratio: number; minimum: number }[]
  notes: string[]
  problems: string[]
}

export function quantize(pixels: Rgb[], k?: number, rounds?: number): Cluster[]
export function platePalette(input: { plate: Cluster[]; safeArea: Cluster[] }): PlatePalette
export function plateScopeCss(id: string, palette: PlatePalette, source: string): string
export function contrast(first: Rgb, second: Rgb): number
export function hex(rgb: Rgb): string
