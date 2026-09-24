import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(packageRoot, '../styles/generated/atom63.tokens.json')
const figmaModelPath = resolve(packageRoot, '../styles/generated/atom63.figma-sync.json')
const outputPath = resolve(packageRoot, 'Sources/Atom63UI/Generated/Atom63Tokens.generated.swift')

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
const variablesByToken = new Map(
  figmaModel.collections.flatMap(collection =>
    collection.variables.map(variable => [variable.token, { collection, variable }])
  )
)
const defaultModes = {
  'Atom63 Brand': 'b1',
  'Atom63 Surface': 'n1',
  'Atom63 Design Language': 'ios',
}

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

/** The RGBA value of a token in light or dark mode, following aliases. */
function resolveColor(token, mode, seen = []) {
  const found = variablesByToken.get(token)
  if (!found) throw new Error(`${token} is not in the Figma sync model`)
  if (seen.includes(token)) throw new Error(`Alias cycle: ${[...seen, token].join(' -> ')}`)
  const { collection, variable } = found
  const modeName = collection.modes.includes(mode)
    ? mode
    : (defaultModes[collection.name] ?? collection.modes[0])
  const entry = variable.values[modeName]
  if (entry?.alias) return resolveColor(entry.alias, mode, [...seen, token])
  const value = entry?.value
  if (typeof value !== 'object' || value === null || !('r' in value)) {
    throw new Error(`${token} does not resolve to a color in ${modeName} mode`)
  }
  return value
}

function components({ r, g, b, a }) {
  return `AtomColorComponents(red: ${r}, green: ${g}, blue: ${b}, opacity: ${a})`
}

function dynamicColor(token) {
  return `AtomDynamicColor(light: ${components(resolveColor(token, 'light'))}, dark: ${components(resolveColor(token, 'dark'))})`
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

if (process.argv.includes('--check')) {
  const current = await readFile(outputPath, 'utf8').catch(() => '')
  if (current !== generated) {
    console.error('Swift tokens are stale. Run: pnpm --filter @atom63/ui-ios generate:swift')
    process.exitCode = 1
  }
} else {
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, generated)
}
