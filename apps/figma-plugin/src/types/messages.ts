/**
 * Cipher - Figma Design System Plugin
 * Type-safe message interfaces for UI ↔ Main thread communication
 */

// ============================================================================
// COLLECTION & STYLE DATA TYPES
// ============================================================================

/** Collection summary for UI display */
export interface CollectionInfo {
  id: string
  name: string
  variableCount: number
}

/** Style group for UI display */
export interface StyleGroup {
  count: number
  name: string
}

/** Style groups organized by category */
export interface StylesByCategory {
  effect: StyleGroup[]
  grid: StyleGroup[]
  paint: StyleGroup[]
  text: StyleGroup[]
}

/** Style counts by category */
export interface StyleCounts {
  effect: number
  grid: number
  paint: number
  text: number
  total: number
}

/** Selected style group for export/import */
export interface SelectedStyleGroup {
  category: 'paint' | 'text' | 'effect' | 'grid'
  group: string
}

// ============================================================================
// UI → MAIN THREAD MESSAGES
// ============================================================================

/** Request list of Figma variable collections */
export interface GetCollectionsMessage {
  type: 'get-collections'
}

/** Figma font family plus the available styles exposed to plugins */
export interface FontFamilyInfo {
  family: string
  styles: string[]
}

/** Request list of Figma styles grouped by category */
export interface GetStylesMessage {
  type: 'get-styles'
}

/** CSS file in export result */
export interface CSSFileInfo {
  content: string
  name: string
  variableCount: number
}

/** Request detailed style list for the styles manager */
export interface GetStyleDetailsMessage {
  type: 'get-style-details'
}

/** Individual style info for the styles manager */
export interface StyleInfo {
  category: 'paint' | 'text' | 'effect' | 'grid'
  description: string
  id: string
  name: string
  /** Preview values — depends on category */
  preview: StylePreview
}

/** Individual paint layer info */
export interface PaintInfo {
  /** Hex color for solid paints */
  color?: string
  /** Variable bound to this paint's color */
  colorVariable?: string
  opacity?: number
  /** Variable bound to this paint's opacity */
  opacityVariable?: string
  paintType:
    | 'SOLID'
    | 'GRADIENT_LINEAR'
    | 'GRADIENT_RADIAL'
    | 'GRADIENT_ANGULAR'
    | 'GRADIENT_DIAMOND'
    | 'IMAGE'
    | 'VIDEO'
  /** Gradient color stops */
  stops?: { color: string; position: number; variable?: string }[]
}

/** Individual effect layer info */
export interface EffectInfo {
  color?: string
  colorVariable?: string
  description: string
  effectType: string
  radiusVariable?: string
  spreadVariable?: string
}

export type StylePreview =
  | { type: 'paint'; paints: PaintInfo[] }
  | {
      type: 'text'
      fontFamily: string
      fontStyle: string
      fontSize: string
      lineHeight: string
      variables?: Record<string, string>
    }
  | { type: 'effect'; effects: EffectInfo[] }
  | { type: 'grid'; patterns: string[] }

/** Response with style details */
export interface StyleDetailsListMessage {
  data: {
    styles: StyleInfo[]
    counts: StyleCounts
  }
  type: 'style-details-list'
}

/** Delete styles in bulk */
export interface DeleteStylesMessage {
  data: {
    styleIds: string[]
    category: 'paint' | 'text' | 'effect' | 'grid'
  }
  type: 'delete-styles'
}

/** Styles deleted result */
export interface StylesDeletedMessage {
  data: {
    success: number
    failed: number
  }
  type: 'styles-deleted'
}

/** Rename styles in bulk */
export interface RenameStylesMessage {
  data: {
    renames: {
      id: string
      category: 'paint' | 'text' | 'effect' | 'grid'
      newName: string
    }[]
  }
  type: 'rename-styles'
}

/** Styles renamed result */
export interface StylesRenamedMessage {
  data: {
    success: number
    failed: number
  }
  type: 'styles-renamed'
}

/** Scan unbound styles and suggest variable rebindings */
export interface ScanRebindMessage {
  data: {
    styleIds: string[]
  }
  type: 'scan-rebind'
}

/** A suggested rebinding: unbound style property → matching variable */
export interface RebindSuggestion {
  /** Current color hex (for color bindings) */
  currentColor?: string
  /** Current value display string (for text bindings) */
  currentValue?: string
  /** Field identifier: 'solid:0', 'stop:0:1', 'effect:0' for colors; 'fontSize', 'lineHeight', 'fontFamily', 'fontStyle' for text */
  field: string
  matchType: 'exact' | 'name'
  styleId: string
  styleName: string
  suggestedVariableId: string
  suggestedVariableName: string
}

/** Response with rebind suggestions */
export interface RebindSuggestionsMessage {
  data: {
    suggestions: RebindSuggestion[]
  }
  type: 'rebind-suggestions'
}

/** Apply selected rebindings */
export interface ApplyRebindMessage {
  data: {
    bindings: {
      styleId: string
      field: string
      variableId: string
    }[]
  }
  type: 'apply-rebind'
}

/** Undo rebindings (unbind variables from styles) */
export interface UndoRebindMessage {
  data: {
    bindings: {
      styleId: string
      field: string
    }[]
  }
  type: 'undo-rebind'
}

/** Rebind result */
export interface RebindAppliedMessage {
  data: {
    success: number
    failed: number
    /** Successfully applied bindings for undo */
    applied: { styleId: string; field: string }[]
  }
  type: 'rebind-applied'
}

/** Undo rebind result */
export interface RebindUndoneMessage {
  data: {
    success: number
    failed: number
  }
  type: 'rebind-undone'
}

/** Duplicate styles */
export interface DuplicateStylesMessage {
  data: {
    styleIds: string[]
  }
  type: 'duplicate-styles'
}

/** Styles duplicated result */
export interface StylesDuplicatedMessage {
  data: {
    success: number
    failed: number
    newStyleIds: string[]
  }
  type: 'styles-duplicated'
}

/** Edit style properties */
export interface EditStylesMessage {
  data: {
    edits: StyleEdit[]
  }
  type: 'edit-styles'
}

/** A single style edit */
export interface StyleEdit {
  /** For paint styles: new color hex (solid only) */
  color?: string
  /** Description (any style type) */
  description?: string
  fontFamily?: string
  /** For text styles */
  fontSize?: number
  fontStyle?: string
  letterSpacing?: number
  lineHeight?: { value: number; unit: 'PIXELS' | 'PERCENT' } | 'AUTO'
  /** For paint styles: new opacity 0-1 */
  opacity?: number
  paragraphSpacing?: number
  styleId: string
}

/** Styles edited result */
export interface StylesEditedMessage {
  data: {
    success: number
    failed: number
  }
  type: 'styles-edited'
}

/** Resize plugin window */
export interface ResizeWindowMessage {
  data: {
    mode: 'compact' | 'default'
  }
  type: 'resize-window'
}

/** Request all variables with full details for the manage page */
export interface GetVariablesMessage {
  data?: {
    collectionIds?: string[]
  }
  type: 'get-variables'
}

/** Variable detail for manage page display */
export interface VariableInfo {
  collectionId: string
  collectionName: string
  description: string
  id: string
  name: string
  resolvedType: string
  valuesByMode: Record<string, string>
}

/** Response with full variable details */
export interface VariablesListMessage {
  data: {
    variables: VariableInfo[]
    collections: CollectionInfo[]
  }
  type: 'variables-list'
}

/** Rename variables in bulk */
export interface RenameVariablesMessage {
  data: {
    renames: { id: string; newName: string }[]
  }
  type: 'rename-variables'
}

/** Check if variables have dependencies before deleting */
export interface CheckDependenciesMessage {
  data: {
    variableIds: string[]
  }
  type: 'check-dependencies'
}

/** Delete variables in bulk */
export interface DeleteVariablesMessage {
  data: {
    variableIds: string[]
  }
  type: 'delete-variables'
}

/** Variables renamed result */
export interface VariablesRenamedMessage {
  data: {
    success: number
    failed: number
    previousNames: { id: string; oldName: string }[]
  }
  type: 'variables-renamed'
}

/** Snapshot of a deleted variable for undo */
export interface DeletedVariableSnapshot {
  collectionId: string
  description: string
  name: string
  resolvedType: string
  valuesByMode: Record<string, any>
}

/** Variables deleted result */
export interface VariablesDeletedMessage {
  data: {
    success: number
    failed: number
    snapshots: DeletedVariableSnapshot[]
  }
  type: 'variables-deleted'
}

/** Restore previously deleted variables */
export interface RestoreVariablesMessage {
  data: {
    snapshots: DeletedVariableSnapshot[]
  }
  type: 'restore-variables'
}

/** Variables restored result */
export interface VariablesRestoredMessage {
  data: {
    success: number
    failed: number
  }
  type: 'variables-restored'
}

/** Move variables to a different collection */
export interface MoveVariablesMessage {
  data: {
    variableIds: string[]
    targetCollectionId: string
  }
  type: 'move-variables'
}

/** Variables moved result */
export interface VariablesMovedMessage {
  data: {
    success: number
    failed: number
    previousCollections: { newId: string; id: string; collectionId: string }[]
  }
  type: 'variables-moved'
}

/** Duplicate variables */
export interface DuplicateVariablesMessage {
  data: {
    variableIds: string[]
  }
  type: 'duplicate-variables'
}

/** Variables duplicated result */
export interface VariablesDuplicatedMessage {
  data: {
    success: number
    failed: number
    newVariableIds: string[]
  }
  type: 'variables-duplicated'
}

/** Update variable values in bulk */
export interface UpdateVariableValuesMessage {
  data: {
    updates: {
      id: string
      valuesByMode: Record<string, any>
    }[]
  }
  type: 'update-variable-values'
}

/** Variables values updated result */
export interface VariableValuesUpdatedMessage {
  data: {
    success: number
    failed: number
    previousValues: {
      id: string
      valuesByMode: Record<string, any>
    }[]
  }
  type: 'variable-values-updated'
}

/** Scale numeric variable values by a factor */
export interface ScaleVariableValuesMessage {
  data: {
    variableIds: string[]
    factor: number
    operation: 'multiply' | 'divide'
  }
  type: 'scale-variable-values'
}

/** Scale variable values result */
export interface VariableValuesScaledMessage {
  data: {
    success: number
    failed: number
    previousValues: {
      id: string
      valuesByMode: Record<string, any>
    }[]
  }
  type: 'variable-values-scaled'
}

/** Close the plugin */
export interface CloseMessage {
  type: 'close'
}

/** Diff the Atom63 token model against the document without writing. */
export interface SyncPreviewMessage {
  type: 'sync-preview'
}

/** Apply the Atom63 token model, then re-plan to confirm nothing is left. */
export interface SyncApplyMessage {
  type: 'sync-apply'
}

/** Collect variables edited in Figma into a token patch for the repository. */
export interface SyncExportMessage {
  type: 'sync-export'
}

/** Plugin settings stored via clientStorage */
export interface PluginSettings {
  colorFormat: 'oklch' | 'hex' | 'rgba' | 'hsl'
  theme: 'system' | 'light' | 'dark'
}

/** Load settings from clientStorage */
export interface LoadSettingsMessage {
  type: 'load-settings'
}

/** Save settings to clientStorage */
export interface SaveSettingsMessage {
  data: Partial<PluginSettings>
  type: 'save-settings'
}

export type ComponentPrimitiveId =
  | 'accordion'
  | 'alert-dialog'
  | 'alert'
  | 'aspect-ratio'
  | 'attachment'
  | 'avatar'
  | 'badge'
  | 'breadcrumb'
  | 'bubble'
  | 'button-group'
  | 'button'
  | 'calendar'
  | 'card'
  | 'carousel'
  | 'chart'
  | 'checkbox'
  | 'collapsible'
  | 'combobox'
  | 'command'
  | 'context-menu'
  | 'dialog'
  | 'direction'
  | 'dropdown-menu'
  | 'drawer'
  | 'empty'
  | 'field'
  | 'hover-card'
  | 'input'
  | 'input-group'
  | 'input-otp'
  | 'item'
  | 'kbd'
  | 'label'
  | 'marker'
  | 'menubar'
  | 'message-scroller'
  | 'message'
  | 'native-select'
  | 'navigation-menu'
  | 'pagination'
  | 'popover'
  | 'progress'
  | 'questionnaire'
  | 'radio-group'
  | 'scroll-area'
  | 'select'
  | 'resizable'
  | 'separator'
  | 'sheet'
  | 'sidebar'
  | 'skeleton'
  | 'slider'
  | 'spinner'
  | 'switch'
  | 'table'
  | 'tabs'
  | 'textarea'
  | 'toggle-group'
  | 'toggle'
  | 'toast'
  | 'tooltip'

export interface ComponentBindingMiss {
  component: string
  field: string
  reference: string
  resolvedType: VariableResolvedDataType
}

export interface ComponentGenerationFailure {
  message: string
  primitive: ComponentPrimitiveId
  stage: string
}

/** Union of all UI → Main thread messages */
export type UIToMainMessage =
  | GetCollectionsMessage
  | GetStylesMessage
  | GetVariablesMessage
  | GetStyleDetailsMessage
  | DeleteStylesMessage
  | RenameStylesMessage
  | DuplicateStylesMessage
  | EditStylesMessage
  | RenameVariablesMessage
  | CheckDependenciesMessage
  | DeleteVariablesMessage
  | RestoreVariablesMessage
  | MoveVariablesMessage
  | DuplicateVariablesMessage
  | UpdateVariableValuesMessage
  | ScanRebindMessage
  | ApplyRebindMessage
  | UndoRebindMessage
  | ScaleVariableValuesMessage
  | ResizeWindowMessage
  | LoadSettingsMessage
  | SaveSettingsMessage
  | CloseMessage
  | SyncPreviewMessage
  | SyncApplyMessage
  | SyncExportMessage

// ============================================================================
// MAIN THREAD → UI MESSAGES
// ============================================================================

/** List of available collections */
export interface CollectionsListMessage {
  data: {
    collections: CollectionInfo[]
  }
  type: 'collections-list'
}

/** List of available styles */
export interface StylesListMessage {
  data: {
    stylesByCategory: StylesByCategory
    totalCounts: StyleCounts
  }
  type: 'styles-list'
}

/** Progress update during long operations */
export interface ProgressUpdateMessage {
  data: {
    current: number
    total: number
    message: string
  }
  type: 'progress-update'
}

/** General error message */
/** Plan without the per-variable change list, which is too large to send. */
export interface SyncPlanSummary {
  collections: {
    name: string
    exists: boolean
    addModes: string[]
    create: number
    update: number
    unchanged: number
    orphaned: string[]
    typeConflicts: string[]
  }[]
  totals: {
    create: number
    update: number
    unchanged: number
    orphaned: number
    typeConflicts: number
  }
}

export interface SyncModelSummary {
  collections: number
  variables: number
  aliasValues: number
  skipped: number
}

export interface SyncPreviewResultMessage {
  type: 'sync-preview-result'
  data: { model: SyncModelSummary; plan: SyncPlanSummary }
}

export interface SyncApplyResultMessage {
  type: 'sync-apply-result'
  data: {
    applied: {
      createdCollections: number
      addedModes: number
      created: number
      updated: number
      moved: number
      bindingsRebound: number
      bindingsRemaining: number
    }
    /** Plan computed after applying; a correct sync leaves nothing to create or update. */
    verification: SyncPlanSummary
  }
}

export interface SyncExportResultMessage {
  type: 'sync-export-result'
  data: {
    changes: { name: string; token: string }[]
    skipped: { name: string; reason: string }[]
    /** JSON for `pnpm --filter @atom63/styles tokens:apply`. */
    patch: string
  }
}

export interface SyncErrorMessage {
  type: 'sync-error'
  data: { message: string }
}

export interface ErrorMessage {
  data: {
    message: string
    details?: any
  }
  type: 'error'
}

/** Result of dependency check before deletion */
export interface DependencyCheckResultMessage {
  data: {
    dependencies: {
      [variableId: string]: {
        name: string
        referencedBy: { id: string; name: string; collectionName: string }[]
      }
    }
  }
  type: 'dependency-check-result'
}

/** Settings loaded from clientStorage */
export interface SettingsLoadedMessage {
  data: PluginSettings
  type: 'settings-loaded'
}

/** Union of all Main thread → UI messages */
export type MainToUIMessage =
  | CollectionsListMessage
  | StylesListMessage
  | VariablesListMessage
  | VariablesRenamedMessage
  | VariablesDeletedMessage
  | VariablesRestoredMessage
  | VariablesMovedMessage
  | VariablesDuplicatedMessage
  | VariableValuesUpdatedMessage
  | StyleDetailsListMessage
  | StylesDeletedMessage
  | StylesRenamedMessage
  | StylesDuplicatedMessage
  | StylesEditedMessage
  | RebindSuggestionsMessage
  | RebindAppliedMessage
  | RebindUndoneMessage
  | VariableValuesScaledMessage
  | ProgressUpdateMessage
  | DependencyCheckResultMessage
  | ErrorMessage
  | SettingsLoadedMessage
  | SyncPreviewResultMessage
  | SyncApplyResultMessage
  | SyncExportResultMessage
  | SyncErrorMessage

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** All possible message types */
export type PluginMessage = UIToMainMessage | MainToUIMessage

/** Extract message type strings */
export type UIToMainMessageType = UIToMainMessage['type']
export type MainToUIMessageType = MainToUIMessage['type']
export type PluginMessageType = PluginMessage['type']

/** Helper to extract data type for a specific message type */
export type MessageDataType<T extends PluginMessageType> =
  Extract<PluginMessage, { type: T }> extends { data: infer D } ? D : never
