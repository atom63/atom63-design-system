/**
 * The site template's token set with a person's choices: a brand ramp from
 * one color, and a default for each axis. The output is the template's own
 * token CSS, edited by pattern, so Create in the plugin and Export CSS give
 * exactly the files a project started from the template holds.
 */
import type { CssFile } from './css-model'
import { brandRamp, RAMP_STEPS } from './ramp'
import { TEMPLATE_TOKENS } from './template-tokens.generated'

export { TEMPLATE_TOKENS }
export const NEUTRALS = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const
export const RADII = ['none', 'subtle', 'default', 'round'] as const
export const TYPE_SCALES = ['compact', 'normal', 'comfortable', 'large'] as const

export interface TemplateChoices {
  /** Hex color the b1 ramp is generated from; null keeps the template's own ramp. */
  brand: string | null
  neutral: (typeof NEUTRALS)[number]
  radius: (typeof RADII)[number]
  typeScale: (typeof TYPE_SCALES)[number]
  /** First family of --font-sans. */
  font: string
}

export const TEMPLATE_BRAND = '#2c7fff'
export const TEMPLATE_DEFAULTS: TemplateChoices = {
  brand: null,
  neutral: 'n1',
  radius: 'default',
  typeScale: 'normal',
  font: 'Geist',
}

/**
 * Makes the chosen value of a `data-*` axis the default: its block takes
 * `:root` and the place of the current default block, which moves to where the
 * chosen block was. The default block has to come first, because `:root` and an
 * attribute selector weigh the same and the later block wins.
 */
function moveDefault(css: string, attribute: string, value: string): string {
  const current = new RegExp(`:root,\\s*\\[data-${attribute}=["'][^"']+["']\\] \\{`).exec(css)
  const target = new RegExp(`\\[data-${attribute}=["']${value}["']\\] \\{`).exec(css)
  if (!target) throw new Error(`The template has no data-${attribute}="${value}" block`)
  if (!current) throw new Error(`The template has no default data-${attribute} block`)
  const currentEnd = css.indexOf('\n}', current.index) + 2
  if (target.index >= current.index && target.index < currentEnd) return css
  const targetEnd = css.indexOf('\n}', target.index) + 2
  const currentBlock = css.slice(current.index, currentEnd).replace(/^:root,\s*/, '')
  const targetBlock = `:root,\n${css.slice(target.index, targetEnd)}`
  const [first, second] =
    current.index < target.index
      ? [
          { start: current.index, end: currentEnd, text: targetBlock },
          { start: target.index, end: targetEnd, text: currentBlock },
        ]
      : [
          { start: target.index, end: targetEnd, text: targetBlock },
          { start: current.index, end: currentEnd, text: currentBlock },
        ]
  return (
    css.slice(0, first.start) +
    first.text +
    css.slice(first.end, second.start) +
    second.text +
    css.slice(second.end)
  )
}

function replaceRamp(css: string, ramp: string[]): string {
  return RAMP_STEPS.reduce(
    (text, step, index) =>
      text.replace(new RegExp(`(--color-b1-${step}:\\s*)[^;]+;`), `$1${ramp[index]};`),
    css
  )
}

function replaceFont(css: string, font: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(font))
    throw new Error(`"${font}" is not a font family name`)
  return css.replace(/(--font-sans:\s*)("[^"]*"|'[^']*'|[^,;]+)/, `$1"${font.trim()}"`)
}

export function buildTemplateFiles(choices: TemplateChoices): CssFile[] {
  const ramp = choices.brand === null ? null : brandRamp(choices.brand)
  const fontChanged = choices.font !== TEMPLATE_DEFAULTS.font
  if (fontChanged) replaceFont('', choices.font)
  return TEMPLATE_TOKENS.map(file => {
    let text = file.text
    if (file.name === 'palette.css' && ramp) text = replaceRamp(text, ramp)
    if (file.name === 'axes.css') {
      if (choices.neutral !== TEMPLATE_DEFAULTS.neutral)
        text = moveDefault(text, 'surface', choices.neutral)
      if (choices.radius !== TEMPLATE_DEFAULTS.radius)
        text = moveDefault(text, 'radius', choices.radius)
      if (choices.typeScale !== TEMPLATE_DEFAULTS.typeScale)
        text = moveDefault(text, 'type-scale', choices.typeScale)
    }
    if (file.name === 'theme.css' && fontChanged) text = replaceFont(text, choices.font)
    return { name: file.name, text }
  })
}
