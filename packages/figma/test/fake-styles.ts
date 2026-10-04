import type { VariableLike } from '../src/apply'

export interface FakeTextStyle {
  id: string
  name: string
  description: string
  fontName: { family: string; style: string }
  fontSize: number
  lineHeight: { unit: 'PIXELS'; value: number } | { unit: 'AUTO' }
  boundVariables: Record<string, { type: 'VARIABLE_ALIAS'; id: string }>
  setBoundVariable(field: string, variable: VariableLike | null): void
}
export interface FakeEffectStyle {
  id: string
  name: string
  description: string
  effects: unknown[]
}

export function createFakeStyles(
  fonts: string[],
  familiesOf: (variable: VariableLike) => string[]
) {
  let next = 0
  const textStyles: FakeTextStyle[] = []
  const effectStyles: FakeEffectStyle[] = []
  const loaded = new Set<string>()
  return {
    textStyles,
    effectStyles,
    api: {
      getLocalTextStylesAsync: async () => [...textStyles],
      getLocalEffectStylesAsync: async () => [...effectStyles],
      loadFontAsync: async (font: { family: string; style: string }) => {
        if (!fonts.includes(font.family))
          throw new Error(`The font "${font.family}" could not be loaded`)
        loaded.add(font.family)
      },
      createTextStyle(): FakeTextStyle {
        const style: FakeTextStyle = {
          id: `S:t${next++}`,
          name: '',
          description: '',
          fontName: { family: 'Inter', style: 'Regular' },
          fontSize: 12,
          lineHeight: { unit: 'AUTO' },
          boundVariables: {},
          setBoundVariable(field, variable) {
            if (!variable) {
              delete this.boundVariables[field]
              return
            }
            if (field === 'fontFamily')
              for (const family of familiesOf(variable))
                if (!loaded.has(family)) throw new Error(`Cannot use unloaded font "${family}"`)
            this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id }
          },
        }
        textStyles.push(style)
        return style
      },
      createEffectStyle(): FakeEffectStyle {
        const style = { id: `S:e${next++}`, name: '', description: '', effects: [] }
        effectStyles.push(style)
        return style
      },
    },
  }
}
