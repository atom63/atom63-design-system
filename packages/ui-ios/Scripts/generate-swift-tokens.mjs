import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  brands,
  computedKey,
  createResolver,
  selectionKey,
  skins,
  surfaces,
} from './lib/theme-graph.mjs'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(packageRoot, '../styles/generated/atom63.tokens.json')
const figmaModelPath = resolve(packageRoot, '../styles/generated/atom63.figma-sync.json')
const outputPath = resolve(packageRoot, 'Sources/Atom63UI/Generated/Atom63Tokens.generated.swift')
const graphOutputPath = resolve(
  packageRoot,
  'Sources/Atom63UI/Generated/AtomTokenGraph.generated.swift'
)
const fixtureOutputPath = resolve(
  packageRoot,
  'Tests/Atom63UITests/AtomThemeFixture.generated.swift'
)
const computedValuesPath = resolve(packageRoot, '../styles/generated/atom63.computed-values.json')

/*
 * Every value comes from the @atom63/styles token manifest, the one interface
 * all renderers read. The manifest records each declaration with its selector
 * scope and media conditions, so the iOS control ramp owned by the
 * `[data-a63-design-language='ios']` block is looked up here instead of being
 * restated in Swift or re-parsed from CSS.
 */
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

/*
 * Colors come from the Figma sync model instead: @atom63/styles resolves every
 * semantic token there per mode in Chromium, so iOS, Figma and the web read the
 * same values. Axes other than light/dark use the defaults an app starts with.
 */
const figmaModel = JSON.parse(await readFile(figmaModelPath, 'utf8'))
const computedValues = JSON.parse(await readFile(computedValuesPath, 'utf8'))
const graph = createResolver(figmaModel, computedValues)
/* The static colors are the selection an app starts with. */
const defaultSelection = { skin: 'modern', brand: 'b1', surface: 'n1' }

const rootBlock = {
  label: ':root',
  matches: entry => !entry.conditions && /(^|,\s*):root(\s*,|$)/.test(entry.scope),
}
const iosBlock = {
  label: "[data-a63-design-language='ios']",
  matches: entry => !entry.conditions && entry.scope.includes("[data-a63-design-language='ios']"),
}
const coarseBlock = {
  label: '@media (pointer: coarse)',
  matches: entry => entry.conditions?.includes('@media (pointer: coarse)') ?? false,
}

function blockValue(block, name) {
  const entry = manifest.entries.find(
    candidate => candidate.name === name && block.matches(candidate)
  )
  if (!entry) throw new Error(`Missing --${name} in ${block.label} of the token manifest`)
  return entry.value
}

const spaceUnitPx = Number(/^([\d.]+)px$/.exec(declaration('spacing-1'))?.[1])
if (!Number.isFinite(spaceUnitPx)) {
  throw new Error('Expected --spacing-1 to be a pixel value')
}

/** `calc(var(--a63-space-unit) * 11)` → 44 */
function spaceUnits(block, name) {
  const value = blockValue(block, name)
  const match = /^calc\(var\(--a63-space-unit\) \* ([\d.]+)\)$/.exec(value)
  if (!match) throw new Error(`Expected --${name} to be a space-unit multiple, received ${value}`)
  return Number(match[1]) * spaceUnitPx
}

/** `var(--a63-space-3_5)` → 14 */
function spaceToken(block, name) {
  const value = blockValue(block, name)
  const match = /^var\(--a63-space-([\d_]+)\)$/.exec(value)
  if (!match) throw new Error(`Expected --${name} to be a space token, received ${value}`)
  return Number(match[1].replace('_', '.')) * spaceUnitPx
}

/** `2.75rem` → 44 */
function rem(block, name) {
  const value = blockValue(block, name)
  const match = /^([\d.]+)rem$/.exec(value)
  if (!match) throw new Error(`Expected --${name} to be a rem value, received ${value}`)
  return Number(match[1]) * 16
}

/** `scale(0.97)` → 0.97 */
function pressScale(block) {
  const value = blockValue(block, 'a63-control-press-transform')
  const match = /^scale\(([\d.]+)\)$/.exec(value)
  if (!match) throw new Error(`Expected iOS press transform to be scale(), received ${value}`)
  return Number(match[1])
}

function easing(name) {
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(blockValue(rootBlock, name))
  if (!match) throw new Error(`Missing cubic-bezier --${name}`)
  const parts = match[1].split(',').map(part => Number(part.trim()))
  if (parts.length !== 4 || parts.some(part => !Number.isFinite(part))) {
    throw new Error(`Malformed cubic-bezier --${name}`)
  }
  return parts
}

const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
const controlHeights = Object.fromEntries(
  sizes.map(size => [size, spaceUnits(iosBlock, `a63-control-height-${size}`)])
)
const controlPadding = Object.fromEntries(
  sizes.map(size => [size, spaceToken(iosBlock, `a63-control-padding-inline-${size}`)])
)
const controlMinSize = rem(coarseBlock, 'a63-control-min-size')
const controlMinTarget = rem(coarseBlock, 'a63-control-min-target')
const controlPressScale = pressScale(iosBlock)
const controlEase = easing('ease-emphasized')
const actionDisabledOpacity = Number(blockValue(rootBlock, 'a63-action-disabled-opacity'))
if (!Number.isFinite(actionDisabledOpacity)) {
  throw new Error('Missing --a63-action-disabled-opacity in the action contract')
}

function declaration(name) {
  return blockValue(rootBlock, name)
}

function pixels(name) {
  const value = declaration(name)
  const match = value.match(/^([\d.]+)px$/)
  if (!match) {
    throw new Error(`Expected --${name} to be a pixel value, received ${value}`)
  }
  return Number(match[1])
}

function milliseconds(name) {
  const value = declaration(name)
  const match = value.match(/^([\d.]+)ms$/)
  if (!match) {
    throw new Error(`Expected --${name} to be a millisecond value, received ${value}`)
  }
  return Number(match[1])
}

function components({ r, g, b, a }) {
  return `AtomColorComponents(red: ${r}, green: ${g}, blue: ${b}, opacity: ${a})`
}

function dynamicColor(token) {
  const color = mode => components(graph.resolve(token, { ...defaultSelection, mode }))
  return `AtomDynamicColor(light: ${color('light')}, dark: ${color('dark')})`
}

/* Each Swift color is one web semantic or contract token. */
const colors = {
  surfacePage: '--a63-surface-page',
  surfacePanel: '--a63-surface-panel',
  surfaceMuted: '--a63-surface-muted',
  surfaceControl: '--a63-surface-control',
  surfaceOverlay: '--a63-surface-overlay',
  textPrimary: '--a63-text-primary',
  textSecondary: '--a63-text-secondary',
  textAccent: '--a63-text-accent',
  borderSubtle: '--a63-border-subtle',
  borderControl: '--a63-border-control',
  actionPrimary: '--a63-action-primary',
  actionPrimaryPressed: '--a63-action-primary-hover',
  actionPrimaryForeground: '--a63-action-primary-foreground',
  actionNeutral: '--a63-action-neutral',
  actionNeutralForeground: '--a63-action-neutral-foreground',
  actionDanger: '--a63-action-danger',
  actionDangerForeground: '--a63-action-danger-foreground',
  statusInfo: '--a63-status-info',
  statusSuccess: '--a63-status-success',
  statusWarning: '--a63-status-warning',
  focusRing: '--a63-focus-ring',
  scrim: '--a63-scrim',
  // The switch track when off: the web recipe falls back to surface-muted.
  selectionTrackOff: '--a63-surface-muted',
  selectionThumb: '--a63-selection-thumb',
  skeletonHighlight: '--a63-skeleton-highlight',
}

const spaces = {
  x1: 'spacing-1',
  x2: 'spacing-2',
  x3: 'spacing-3',
  x4: 'spacing-4',
  x5: 'spacing-5',
  x6: 'spacing-6',
}

const radii = {
  small: 'rounded-sm',
  medium: 'rounded-md',
  large: 'rounded-lg',
  extraLarge: 'rounded-xl',
}

const generated = `// Generated by Scripts/generate-swift-tokens.mjs.
// Source: the @atom63/styles token manifest and Figma sync model. Do not edit manually.

import SwiftUI

public struct AtomColorComponents: Equatable, Sendable {
    public let red: Double
    public let green: Double
    public let blue: Double
    public let opacity: Double

    public init(red: Double, green: Double, blue: Double, opacity: Double = 1) {
        self.red = red
        self.green = green
        self.blue = blue
        self.opacity = opacity
    }

    public var color: Color {
        Color(red: red, green: green, blue: blue, opacity: opacity)
    }
}

public struct AtomDynamicColor: Equatable, Sendable {
    public let light: AtomColorComponents
    public let dark: AtomColorComponents

    public init(light: AtomColorComponents, dark: AtomColorComponents) {
        self.light = light
        self.dark = dark
    }

    public func resolve(for colorScheme: ColorScheme) -> Color {
        (colorScheme == .dark ? dark : light).color
    }
}

public enum AtomTokens {
    public enum Color {
${Object.entries(colors)
  .map(
    ([name, token]) =>
      `        /// ${token}\n        public static let ${name} = ${dynamicColor(token)}`
  )
  .join('\n')}
    }

    public enum Space {
${Object.entries(spaces)
  .map(([name, token]) => `        public static let ${name}: Double = ${pixels(token)}`)
  .join('\n')}
    }

    public enum Radius {
${Object.entries(radii)
  .map(([name, token]) => `        public static let ${name}: Double = ${pixels(token)}`)
  .join('\n')}
    }

    public enum Motion {
        public static let fast: Double = ${milliseconds('duration-150') / 1000}
        public static let controlFeedback: Double = ${milliseconds('duration-150') / 1000}
        public static let standard: Double = ${milliseconds('duration-250') / 1000}
        public static let skeletonShimmer: Double = ${milliseconds('duration-1500') / 1000}
        /// --ease-emphasized, the iOS design-language control feedback curve.
        public static let emphasizedControlPoints: (Double, Double, Double, Double) = (${controlEase.join(', ')})
    }

    /// Control geometry from the shared iOS design-language block in @atom63/styles.
    ///
    /// Height is RENDERED geometry and minTouchTarget is the INTERACTION
    /// floor. They are different numbers on purpose — flooring rendered height
    /// with the touch target collapses the whole ramp to a single 44pt rung.
    public enum Control {
        public enum Height {
${sizes.map(size => `            public static let ${size}: Double = ${controlHeights[size]}`).join('\n')}
        }

        public enum PaddingInline {
${sizes.map(size => `            public static let ${size}: Double = ${controlPadding[size]}`).join('\n')}
        }

        /// Rendered floor. Never raised to the touch target.
        public static let minSize: Double = ${controlMinSize}
        /// Interaction floor (Apple HIG).
        public static let minTouchTarget: Double = ${controlMinTarget}
        public static let pressScale: Double = ${controlPressScale}
        public static let disabledOpacity: Double = ${actionDisabledOpacity}
    }
}
`

/* The AtomThemeColors fields, each one of the colors above. */
const themeColorFields = [
  'surfacePage',
  'surfacePanel',
  'surfaceMuted',
  'surfaceControl',
  'textPrimary',
  'textSecondary',
  'borderSubtle',
  'borderControl',
  'actionPrimary',
  'actionPrimaryPressed',
  'actionPrimaryForeground',
  'actionNeutral',
  'actionNeutralForeground',
  'actionDanger',
  'actionDangerForeground',
  'statusInfo',
  'statusSuccess',
  'statusWarning',
  'selectionTrackOff',
  'selectionThumb',
  'skeletonHighlight',
]

const swiftString = text => JSON.stringify(text)
const swiftComponents = ({ r, g, b, a }) =>
  `AtomColorComponents(red: ${r}, green: ${g}, blue: ${b}, opacity: ${a})`
const selectors = { 'skin-mode': '.skinMode', mode: '.mode', brand: '.brand', surface: '.surface' }

const reachable = [...graph.reachable(themeColorFields.map(field => colors[field]))].sort()
const variableLines = reachable
  .filter(token => !computedValues.tokens[token])
  .map(token => {
    const { collection, variable } = graph.byToken.get(token)
    const key = selectionKey(collection.name)
    const modes = key ? collection.modes : [graph.modeFor(collection, {})]
    const values = modes.map(mode => {
      const entry = variable.values[mode]
      const value = entry.alias
        ? `.alias(${swiftString(entry.alias)})`
        : `.color(${swiftComponents(entry.value)})`
      return `${swiftString(key ? mode : '')}: ${value}`
    })
    return `        ${swiftString(token)}: Variable(selector: ${key ? selectors[key] : '.fixed'}, values: [${values.join(', ')}]),`
  })
const computedLines = reachable
  .filter(token => computedValues.tokens[token])
  .map(token => {
    const { variesOn, values } = computedValues.tokens[token]
    const rows = Object.entries(values)
      .map(([combination, { r, g, b, a }]) => `${combination} ${r} ${g} ${b} ${a}`)
      .join('\n')
    return `        ${swiftString(token)}: Computed(\n            variesOn: ${JSON.stringify(variesOn)},\n            rows: """\n${rows}\n"""\n        ),`
  })

const graphFile = `// Generated by Scripts/generate-swift-tokens.mjs.
// Source: the @atom63/styles Figma sync model and computed values. Do not edit manually.

/// A web theme: the product skin that remaps contracts and semantic colors.
public enum AtomSkin: String, CaseIterable, Sendable {
${skins.map(skin => `    case ${skin}`).join('\n')}
}

/// A brand ramp, as \`data-a63-brand\` on the web.
public enum AtomBrand: String, CaseIterable, Sendable {
${brands.map(brand => `    case ${brand}`).join('\n')}
}

/// A neutral surface palette, as \`data-a63-surface\` on the web.
public enum AtomSurface: String, CaseIterable, Sendable {
${surfaces.map(surface => `    case ${surface}`).join('\n')}
}

extension AtomThemeColors {
    /// The colors the web renders for a skin, brand and surface, in light and dark mode.
    public init(skin: AtomSkin, brand: AtomBrand, surface: AtomSurface) {
        func color(_ token: String) -> AtomDynamicColor {
            AtomTokenGraph.dynamicColor(token, skin: skin, brand: brand, surface: surface)
        }
        self.init(
${themeColorFields.map((field, index) => `            ${field}: color(${swiftString(colors[field])})${index < themeColorFields.length - 1 ? ',' : ''}`).join('\n')}
        )
    }
}

/// The Figma variable graph the iOS colors can reach, and the browser-resolved
/// values of the computed variables in it (those that vary on more axes than one
/// collection holds). Resolution follows Scripts/lib/theme-graph.mjs.
enum AtomTokenGraph {
    static let variables: [String: Variable] = [
${variableLines.join('\n')}
    ]

    static let computed: [String: Computed] = [
${computedLines.join('\n')}
    ]
}
`

/*
 * Expected colors for a sample of selections, from the same resolver: every skin
 * with every brand on n1, and every skin with every surface on b1. The Swift test
 * checks its port against these; packages/styles checks the resolver against
 * Chromium for every selection.
 */
const sampleSelections = [
  ...skins.flatMap(skin => brands.map(brand => ({ skin, brand, surface: 'n1' }))),
  ...skins.flatMap(skin =>
    surfaces.filter(surface => surface !== 'n1').map(surface => ({ skin, brand: 'b1', surface }))
  ),
]
const fixtureRows = sampleSelections.flatMap(selection =>
  themeColorFields.flatMap(field =>
    ['light', 'dark'].map(mode => {
      const { r, g, b, a } = graph.resolve(colors[field], { ...selection, mode })
      return `${selection.skin} ${selection.brand} ${selection.surface} ${mode} ${field} ${r} ${g} ${b} ${a}`
    })
  )
)
const fixtureFile = `// Generated by Scripts/generate-swift-tokens.mjs. Do not edit manually.

/// Expected AtomThemeColors for sample selections, resolved by
/// Scripts/lib/theme-graph.mjs: \`skin brand surface mode field r g b a\`.
enum AtomThemeFixture {
    static let rows = """
${fixtureRows.join('\n')}
"""
}
`

const outputs = [
  [outputPath, generated],
  [graphOutputPath, graphFile],
  [fixtureOutputPath, fixtureFile],
]
if (process.argv.includes('--check')) {
  for (const [path, content] of outputs) {
    const current = await readFile(path, 'utf8').catch(() => '')
    if (current !== content) {
      console.error('Swift tokens are stale. Run: pnpm --filter @atom63/ui-ios generate:swift')
      process.exitCode = 1
      break
    }
  }
} else {
  await mkdir(dirname(outputPath), { recursive: true })
  for (const [path, content] of outputs) await writeFile(path, content)
}
