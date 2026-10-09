/// <reference types="@figma/plugin-typings" />
/**
 * The figma global as the engine's StylesApi. The plugin typings' objects
 * satisfy the engine's structural interfaces; the casts narrow overloads.
 */
import type { EffectStyleLike, NodesApi, StylesApi, TextStyleLike } from '@atom63/figma'

type Made<K extends keyof NodesApi> = NodesApi[K] extends (...args: never[]) => infer R ? R : never

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

/**
 * The figma global as the engine's NodesApi, for the Atom63 design system:
 * component sets and spec cards need the node API. Only the engine writes
 * through it (real-Figma lessons such as loading pages and fonts, settling
 * property references and binding paints live there).
 */
export function nodesApi(): NodesApi {
  const styles = figmaApi()
  return {
    ...styles,
    variables: {
      ...styles.variables,
      // Figma's paint and variable, as the engine's narrower structural types.
      setBoundVariableForPaint: figma.variables.setBoundVariableForPaint.bind(
        figma.variables
      ) as unknown as NodesApi['variables']['setBoundVariableForPaint'],
    },
    get root() {
      return figma.root as unknown as NodesApi['root']
    },
    createPage: () => figma.createPage() as unknown as Made<'createPage'>,
    createFrame: () => figma.createFrame() as unknown as Made<'createFrame'>,
    createText: () => figma.createText() as unknown as Made<'createText'>,
    createComponent: () => figma.createComponent() as unknown as Made<'createComponent'>,
    combineAsVariants: (nodes, parent) =>
      figma.combineAsVariants(
        nodes as unknown as ComponentNode[],
        parent as unknown as PageNode
      ) as unknown as Made<'combineAsVariants'>,
  }
}
