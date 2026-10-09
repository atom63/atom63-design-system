import type { VariableLike } from '../src/apply'
import { createFakeApi } from './fake-api'
import { createFakeStyles } from './fake-styles'

type Script = (figma: unknown) => Promise<unknown>
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => Script

/** A `figma` global over the fake API, and a runner for `use_figma` script bodies. */
export function createFakeFigma({ fonts = ['Inter', 'Geist'] }: { fonts?: string[] } = {}) {
  const fake = createFakeApi()
  const familiesOf = (variable: VariableLike): string[] =>
    Object.values(variable.valuesByMode).flatMap(value => {
      // Figma takes a variable's whole string as one family name.
      if (typeof value === 'string') return [value]
      if (value && typeof value === 'object' && 'id' in value) {
        const target = fake.variables.get((value as { id: string }).id)
        return target ? familiesOf(target) : []
      }
      return []
    })
  const styles = createFakeStyles(fonts, familiesOf)
  const figma = { variables: fake.api, ...styles.api }
  const run = (script: string) => new AsyncFunction('figma', script)(figma)
  const { textStyles, effectStyles, requireFamilies } = styles
  return { ...fake, textStyles, effectStyles, requireFamilies, figma, run }
}
