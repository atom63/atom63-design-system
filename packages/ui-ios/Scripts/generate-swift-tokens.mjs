import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const primitivesPath = resolve(packageRoot, '../styles/src/tokens/foundation/primitives.css')
const motionPath = resolve(packageRoot, '../styles/src/tokens/foundation/motion.css')
const environmentPath = resolve(packageRoot, '../styles/src/contracts/environment.css')
const actionPath = resolve(packageRoot, '../styles/src/contracts/action.css')
const outputPath = resolve(packageRoot, 'Sources/Atom63UI/Generated/Atom63Tokens.generated.swift')

const source = await readFile(primitivesPath, 'utf8')
const declarations = new Map(
  [...source.matchAll(/--([a-z0-9_-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()])
)

const environmentSource = await readFile(environmentPath, 'utf8')
const motionSource = await readFile(motionPath, 'utf8')
const actionSource = await readFile(actionPath, 'utf8')

/*
 * The iOS control ramp is owned by the `[data-a63-design-language='ios']` block
 * in @atom63/styles. Parse it instead of restating the numbers in Swift — those
 * literals are exactly the drift this generator exists to prevent.
 */
function cssBlock(text, selector) {
  const start = text.indexOf(selector)
  if (start === -1) throw new Error(`Missing CSS block ${selector}`)
  const open = text.indexOf('{', start)
  const close = text.indexOf('\n}', open)
  if (open === -1 || close === -1) throw new Error(`Unterminated CSS block ${selector}`)
  return text.slice(open + 1, close)
}

const spaceUnitPx = Number(/^([\d.]+)px$/.exec(declaration('spacing-1'))?.[1])
if (!Number.isFinite(spaceUnitPx)) {
  throw new Error('Expected --spacing-1 to be a pixel value')
}

const iosBlock = cssBlock(environmentSource, "[data-a63-design-language='ios']")
const coarseBlock = cssBlock(environmentSource, '@media (pointer: coarse)')

function blockValue(block, name) {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(block)
  if (!match) throw new Error(`Missing --${name} in generated-from CSS block`)
  return match[1].trim()
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
  const match = new RegExp(`--${name}:\\s*cubic-bezier\\(([^)]+)\\);`).exec(motionSource)
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
const actionDisabledOpacity = Number(
  /--a63-action-disabled-opacity:\s*([\d.]+);/.exec(actionSource)?.[1]
)
if (!Number.isFinite(actionDisabledOpacity)) {
  throw new Error('Missing --a63-action-disabled-opacity in the action contract')
}

function declaration(name) {
  const value = declarations.get(name)
  if (!value) {
    throw new Error(`Missing CSS foundation token --${name}`)
  }
  return value
}

function rgba(name) {
  const value = declaration(name)
  const match = value.match(/^rgba\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\s*\)$/)
  if (!match) {
    throw new Error(`Expected --${name} to be rgba(), received ${value}`)
  }
  return match.slice(1).map(Number)
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

function components(name) {
  const [red, green, blue, opacity] = rgba(name)
  return `AtomColorComponents(red: ${red / 255}, green: ${green / 255}, blue: ${blue / 255}, opacity: ${opacity})`
}

function dynamicColor(light, dark = light) {
  return `AtomDynamicColor(light: ${components(light)}, dark: ${components(dark)})`
}

const colors = {
  surfacePage: ['color-n1-light-2', 'color-n1-dark-1'],
  surfacePanel: ['color-n1-light-1', 'color-n1-dark-2'],
  surfaceMuted: ['color-n1-light-3', 'color-n1-dark-3'],
  surfaceControl: ['color-n1-light-1', 'color-n1-dark-1'],
  textPrimary: ['color-n1-light-12', 'color-n1-dark-12'],
  textSecondary: ['color-n1-light-11', 'color-n1-dark-11'],
  borderSubtle: ['color-n1-light-4', 'color-n1-dark-6'],
  borderControl: ['color-n1-light-5', 'color-n1-dark-7'],
  actionPrimary: ['color-b1-500'],
  actionPrimaryPressed: ['color-b1-600'],
  actionPrimaryForeground: ['color-b1-50'],
  actionNeutral: ['color-n1-light-12', 'color-n1-dark-12'],
  actionNeutralForeground: ['color-n1-light-2', 'color-n1-dark-1'],
  actionDanger: ['color-danger-600'],
  actionDangerForeground: ['color-white-100'],
  statusInfo: ['color-info-500'],
  statusSuccess: ['color-success-600'],
  statusWarning: ['color-warning-600'],
  selectionTrackOff: ['color-n1-light-7', 'color-n1-dark-7'],
  selectionThumb: ['color-white-100'],
  skeletonHighlight: ['color-white-60', 'color-white-10'],
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
// Source: @atom63/styles foundation primitives. Do not edit manually.

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
    ([name, [light, dark]]) => `        public static let ${name} = ${dynamicColor(light, dark)}`
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
