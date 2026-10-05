/// <reference types="@figma/plugin-typings" />
/**
 * The figma global as the engine's StylesApi. The plugin typings' objects
 * satisfy the engine's structural interfaces; the casts narrow overloads.
 */
import type { EffectStyleLike, StylesApi, TextStyleLike } from '@atom63/figma'

export function figmaApi(): StylesApi {
  return {
    variables: {
      getLocalVariableCollectionsAsync: () => figma.variables.getLocalVariableCollectionsAsync(),
      getVariableByIdAsync: id => figma.variables.getVariableByIdAsync(id),
      createVariableCollection: name => figma.variables.createVariableCollection(name),
      createVariable: (name, collection, type) =>
        figma.variables.createVariable(name, collection as VariableCollection, type),
      createVariableAlias: variable => figma.variables.createVariableAlias(variable as Variable),
    },
    getLocalTextStylesAsync: async () =>
      (await figma.getLocalTextStylesAsync()) as unknown as TextStyleLike[],
    getLocalEffectStylesAsync: async () =>
      (await figma.getLocalEffectStylesAsync()) as unknown as EffectStyleLike[],
    createTextStyle: () => figma.createTextStyle() as unknown as TextStyleLike,
    createEffectStyle: () => figma.createEffectStyle() as unknown as EffectStyleLike,
    loadFontAsync: font => figma.loadFontAsync(font),
  }
}
