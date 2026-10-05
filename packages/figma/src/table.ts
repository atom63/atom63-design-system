/**
 * What a Figma file already holds of a token set: the variables written from
 * code (found by their code syntax, so a table an agent wrote counts too) and
 * the styles a sync writes.
 */
import { readDocument } from './apply'
import type { StylesApi } from './style-sync'

export interface TokenTable {
  collections: { name: string; modes: number; variables: number }[]
  /** Variables with a code syntax, so written from code by a sync, the plugin or an agent. */
  variables: number
  textStyles: number
  effectStyles: number
}

export async function readTokenTable(figma: StylesApi): Promise<TokenTable> {
  const collections = (await readDocument(figma.variables))
    .map(collection => ({
      name: collection.name,
      modes: collection.modes.length,
      variables: collection.variables.filter(variable => variable.token).length,
    }))
    .filter(collection => collection.variables > 0)
  const textStyles = (await figma.getLocalTextStylesAsync()).filter(style =>
    style.name.startsWith('Text/')
  ).length
  const effectStyles = (await figma.getLocalEffectStylesAsync()).filter(style =>
    style.name.startsWith('Shadow/')
  ).length
  return {
    collections,
    variables: collections.reduce((total, item) => total + item.variables, 0),
    textStyles,
    effectStyles,
  }
}
