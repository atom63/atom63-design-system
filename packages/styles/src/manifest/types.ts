export type Atom63TokenLifecycle = 'internal' | 'preview' | 'stable' | 'deprecated'

export type Atom63TokenType =
  | 'color'
  | 'dimension'
  | 'radius'
  | 'typography'
  | 'shadow'
  | 'blur'
  | 'motion'
  | 'z-index'
  | 'string'

export type Atom63TokenLayer = 'foundation' | 'semantic' | 'contract' | 'theme' | 'os' | 'utility'

export interface Atom63TokenFigmaMapping {
  collection: string
  path: string
  mode?: string
}

export interface Atom63TokenManifestEntry {
  name: string
  cssVar: string
  type: Atom63TokenType
  value: string
  sourceFile: string
  layer: Atom63TokenLayer
  figma?: Atom63TokenFigmaMapping
  lifecycle: Atom63TokenLifecycle
  description?: string
  aliases?: string[]
  /** Selector that owns this declaration. Required when a token has scoped values. */
  scope?: string
  /** At-rules, outermost first, that condition this declaration. */
  conditions?: string[]
}

export interface Atom63TokenManifest {
  schemaVersion: 1
  generatedBy: string
  generatedFrom: string[]
  summary: {
    sourceFiles: number
    declarations: number
    uniqueCssVariables: number
    figmaMappedDeclarations: number
  }
  entries: Atom63TokenManifestEntry[]
}

export type Atom63FigmaTokenManifestEntry = Atom63TokenManifestEntry & {
  figma: Atom63TokenFigmaMapping
}

export interface Atom63FigmaTokenManifest {
  schemaVersion: 1
  generatedBy: string
  derivedFrom: string
  entries: Atom63FigmaTokenManifestEntry[]
}
