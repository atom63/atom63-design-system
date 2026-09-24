/**
 * Generates generated/atom63.figma-sync.json: the Figma variable model the
 * companion plugin applies. It reads the token manifest and resolves values in
 * a real browser, so calc(), color-mix() and var() chains get the same result
 * the web renderer gets.
 *
 * Model: tokens defined only at :root become single-mode collections (one per
 * manifest layer). Every personalization axis that remaps tokens through a
 * data-a63-* attribute becomes its own collection whose modes are the axis
 * values, because a Figma collection has exactly one mode dimension. After that
 * first placement by declaration scope, placeByMeasuredAxes() measures which
 * axes each literal value really varies on and moves it to that axis, or lists
 * it as `computed` when it varies on more axes than one collection can hold.
 *
 * A value that is exactly var(--other) becomes a Figma alias when --other is a
 * synced variable. A color-mix() whose second weight resolves to 0% reduces to
 * its first operand, so tint-aware roles keep their alias at the default tint.
 * Everything else is resolved per mode to a literal.
 *
 * Themes are the exception to one-axis-per-collection: aqua and terminal vary a
 * token by theme and mode together. Every token any theme overrides goes to one
 * Theme collection whose modes are theme × mode (`aqua-dark`), each resolved in
 * the browser with both attributes set. Such a token may otherwise vary only by
 * mode; a theme token on any other axis fails the build.
 */
/* global document, getComputedStyle -- resolveInPage runs inside the browser page */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(packageRoot, 'generated/atom63.tokens.json')
const outputPath = path.join(packageRoot, 'generated/atom63.figma-sync.json')
const computedOutputPath = path.join(packageRoot, 'generated/atom63.computed-values.json')
const cssEntries = ['src/tokens/index.css', 'src/contracts/index.css', 'src/themes/index.css']

const themes = ['modern', 'aqua', 'retro', 'terminal']
const themeCollection = {
  name: 'Atom63 Theme',
  modes: themes.flatMap(theme => ['light', 'dark'].map(mode => `${theme}-${mode}`)),
}

const layerCollections = {
  foundation: 'Atom63 Foundation',
  semantic: 'Atom63 Semantic',
  contract: 'Atom63 Contract',
}

// Axis collections. `selector` recognizes the manifest scope that remaps a
// token for one axis value; `defaultMode` is the value :root represents.
const axes = [
  {
    id: 'mode',
    collection: 'Atom63 Mode',
    attribute: 'data-a63-mode',
    pattern: /a63-mode=['"](\w+)['"]|\.(dark|light)\b/,
    modes: ['light', 'dark'],
    defaultMode: 'light',
  },
  {
    id: 'brand',
    collection: 'Atom63 Brand',
    attribute: 'data-a63-brand',
    pattern: /a63-brand=['"](b\d)['"]/,
    modes: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
    defaultMode: 'b1',
  },
  {
    id: 'surface',
    collection: 'Atom63 Surface',
    attribute: 'data-a63-surface',
    pattern: /a63-surface=['"](n\d)['"]/,
    modes: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'],
    defaultMode: 'n1',
  },
  {
    id: 'design-language',
    collection: 'Atom63 Design Language',
    attribute: 'data-a63-design-language',
    pattern: /a63-design-language=['"](\w+)['"]/,
    modes: ['web', 'ios'],
    defaultMode: 'web',
  },
  {
    id: 'input',
    collection: 'Atom63 Input',
    attribute: 'data-a63-input',
    pattern: /a63-input=['"](\w+)['"]/,
    modes: ['pointer', 'touch', 'keyboard'],
    defaultMode: 'pointer',
  },
  {
    id: 'density',
    collection: 'Atom63 Density',
    attribute: 'data-a63-density',
    pattern: /a63-density=['"](\w+)['"]/,
    modes: ['comfortable', 'compact'],
    defaultMode: 'comfortable',
  },
  {
    id: 'radius',
    collection: 'Atom63 Radius',
    attribute: 'data-a63-radius',
    pattern: /a63-radius=['"](\w+)['"]/,
    modes: ['default', 'none', 'subtle', 'round'],
    defaultMode: 'default',
  },
  {
    id: 'type-scale',
    collection: 'Atom63 Type Scale',
    attribute: 'data-a63-type-scale',
    pattern: /a63-type-scale=['"](\w+)['"]/,
    modes: ['normal', 'compact', 'comfortable', 'large'],
    defaultMode: 'normal',
  },
  {
    id: 'font',
    collection: 'Atom63 Font',
    attribute: 'data-a63-font',
    pattern: /a63-font=['"](\w+)['"]/,
    modes: ['sans', 'serif', 'mono', 'pixel'],
    defaultMode: 'sans',
  },
  {
    id: 'window-size',
    collection: 'Atom63 Window Size',
    attribute: 'data-window-size',
    pattern: /window-size=['"](\w+)['"]/,
    modes: ['md', 'sm', 'xs'],
    defaultMode: 'md',
  },
]

const figmaTypes = {
  color: 'COLOR',
  dimension: 'FLOAT',
  radius: 'FLOAT',
  blur: 'FLOAT',
  'z-index': 'FLOAT',
  typography: 'FLOAT',
  motion: 'FLOAT',
  shadow: 'STRING',
}

function isRootScope(scope) {
  return scope.split(',').some(part => part.trim() === ':root')
}

/** Which axis (if any) a manifest entry belongs to; null means a :root default. */
function classify(entry) {
  if (entry.conditions?.length) return { skip: `conditional: ${entry.conditions.join(', ')}` }
  const theme = /data-a63-theme=['"](\w+)['"]/.exec(entry.scope)?.[1]
  if (theme) {
    const mode = /a63-mode=['"]dark|\.dark\b/.test(entry.scope)
      ? 'dark'
      : /a63-mode=['"]light|\.light\b/.test(entry.scope)
        ? 'light'
        : 'base'
    return { theme, mode }
  }
  for (const axis of axes) {
    const match = axis.pattern.exec(entry.scope)
    if (match) return { axis, mode: match.slice(1).find(Boolean) }
  }
  if (isRootScope(entry.scope)) return { axis: null }
  return { skip: `context scope: ${entry.scope.replace(/\s+/g, ' ')}` }
}

async function inlineCss(relativePath, seen = new Set()) {
  const filePath = path.join(packageRoot, relativePath)
  if (seen.has(filePath)) return ''
  seen.add(filePath)
  const source = await readFile(filePath, 'utf8')
  const parts = []
  let last = 0
  for (const match of source.matchAll(/@import\s+['"](\.[^'"]+)['"]\s*;/g)) {
    parts.push(source.slice(last, match.index))
    parts.push(await inlineCss(path.join(path.dirname(relativePath), match[1]), seen))
    last = match.index + match[0].length
  }
  parts.push(source.slice(last))
  return parts.join('')
}

/**
 * Runs in the page. For each token, reads the var()-substituted value on the
 * root element under the given attributes, then resolves it by type.
 */
function resolveInPage({ attributes, tokens }) {
  const root = document.documentElement
  for (const name of [...root.getAttributeNames()]) {
    if (name.startsWith('data-')) root.removeAttribute(name)
  }
  for (const [name, value] of Object.entries(attributes)) root.setAttribute(name, value)

  const probe = document.getElementById('probe')

  /**
   * Relative color syntax makes the browser serialize any color (hex, rgba,
   * oklch, color-mix) as float sRGB, without the 8-bit rounding and premultiplied
   * alpha a canvas read would add. Out-of-gamut channels clamp to Figma's sRGB.
   */
  function color(value) {
    probe.style.color = ''
    probe.style.color = `color(from ${value} srgb r g b / alpha)`
    if (!probe.style.color) return null
    const match = /^color\(srgb ([-\d.e]+) ([-\d.e]+) ([-\d.e]+)(?: \/ ([-\d.e]+))?\)$/.exec(
      getComputedStyle(probe).color
    )
    if (!match) return null
    const channel = text => Math.round(Math.min(1, Math.max(0, Number(text))) * 1e6) / 1e6
    return {
      r: channel(match[1]),
      g: channel(match[2]),
      b: channel(match[3]),
      a: channel(match[4] ?? '1'),
    }
  }

  function length(value) {
    // A bare percentage (avatar radius 50%, surface tint 0%) stays a percent
    // number; resolving it as a width would scale it by the probe container.
    const percent = /^(-?[\d.]+)%$/.exec(value.trim())
    if (percent) return Number(percent[1])
    probe.style.width = ''
    probe.style.width = value
    if (!probe.style.width) return null
    return Number.parseFloat(getComputedStyle(probe).width)
  }

  function number(value) {
    const trimmed = value.trim()
    if (/^-?[\d.]+$/.test(trimmed)) return Number(trimmed)
    const ms = /^(-?[\d.]+)(ms|s)$/.exec(trimmed)
    if (ms) return Number(ms[1]) * (ms[2] === 's' ? 1000 : 1)
    probe.style.zIndex = ''
    probe.style.zIndex = trimmed
    if (probe.style.zIndex) return Number(getComputedStyle(probe).zIndex)
    return null
  }

  /** Weight of each color-mix operand, e.g. `calc(100% - 0%)` → 100. */
  function percentage(value) {
    probe.style.width = ''
    probe.style.width = value
    if (!probe.style.width) return null
    return (Number.parseFloat(getComputedStyle(probe).width) / 1000) * 100
  }

  const styles = getComputedStyle(root)
  const results = {}
  for (const { cssVar, type, raw } of tokens) {
    const value = styles.getPropertyValue(cssVar).trim()
    const resolved =
      type === 'COLOR'
        ? color(value)
        : type === 'FLOAT'
          ? (length(value) ?? number(value) ?? (value || null))
          : value || null

    let mixWeights = null
    const mix =
      /^color-mix\(\s*in [^,]+,\s*var\((--[\w-]+)\)\s+(.+?),\s*var\((--[\w-]+)\)\s+(.+)\)$/s.exec(
        raw
      )
    if (mix) {
      const second = mix[4].replace(/var\((--[\w-]+)\)/g, (_, name) =>
        styles.getPropertyValue(name).trim()
      )
      mixWeights = { second: percentage(second), firstVar: mix[1] }
    }
    results[cssVar] = { value, resolved, mixWeights }
  }
  return results
}

function aliasTarget(raw, mixWeights, synced) {
  const direct = /^var\((--[\w-]+)\)$/.exec(raw.trim())
  if (direct && synced.has(direct[1])) return direct[1]
  if (mixWeights && mixWeights.second === 0 && synced.has(mixWeights.firstVar))
    return mixWeights.firstVar
  return null
}

function figmaPath(entry) {
  return entry.figma?.path ?? entry.cssVar.replace(/^--(a63-)?/, '').replaceAll('-', '/')
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const skipped = []
  const byVar = new Map()

  for (const entry of manifest.entries) {
    const type = figmaTypes[entry.type]
    if (!type) {
      skipped.push({ token: entry.cssVar, reason: `unsupported type: ${entry.type}` })
      continue
    }
    const placement = classify(entry)
    if (placement.skip) {
      skipped.push({ token: entry.cssVar, reason: placement.skip })
      continue
    }
    const record = byVar.get(entry.cssVar) ?? {
      entry,
      type,
      axis: null,
      modes: new Set(),
      rawByMode: {},
    }
    if (placement.theme) {
      record.themes ??= {}
      record.themes[placement.theme] ??= {}
      record.themes[placement.theme][placement.mode] = entry.value
    } else if (placement.axis) {
      if (record.axis && record.axis !== placement.axis) {
        throw new Error(
          `${entry.cssVar} varies on both ${record.axis.id} and ${placement.axis.id}; Figma cannot model that`
        )
      }
      record.axis = placement.axis
      record.modes.add(placement.mode)
      record.rawByMode[placement.mode] = entry.value
    } else {
      record.rawByMode.default = entry.value
      if (entry.layer && layerCollections[entry.layer]) record.entry = entry
    }
    byVar.set(entry.cssVar, record)
  }

  for (const record of byVar.values()) {
    if (record.themes && record.axis && record.axis.id !== 'mode') {
      throw new Error(
        `${record.entry.cssVar} varies by theme and ${record.axis.id}; the Theme collection only combines themes with mode`
      )
    }
  }

  // A token that only appears inside skipped contexts is dropped entirely.
  const synced = new Set(byVar.keys())
  const css = (await Promise.all(cssEntries.map(entry => inlineCss(entry)))).join('\n')

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body><div id="probe" style="position:absolute"></div><div style="width:1000px"><div id="pct"></div></div></body></html>`
    )

    // Percentages resolve against a 1000px container so `percentage()` works.
    await page.evaluate(() => {
      const probe = document.getElementById('probe')
      document.getElementById('pct').appendChild(probe)
      probe.style.position = 'static'
    })

    const resolveContext = async (attributes, records) =>
      page.evaluate(resolveInPage, {
        attributes,
        tokens: records.map(record => ({
          cssVar: record.entry.cssVar,
          type: record.type,
          raw: record.currentRaw,
        })),
      })

    const collections = new Map()
    const ensureCollection = (name, modes) => {
      if (!collections.has(name)) collections.set(name, { name, modes, variables: [] })
      return collections.get(name)
    }

    const themeRecords = [...byVar.values()].filter(record => record.themes)
    if (themeRecords.length) {
      const collection = ensureCollection(themeCollection.name, themeCollection.modes)
      // The raw value in effect for a theme and mode, for alias detection.
      const rawFor = (record, theme, mode) =>
        record.themes[theme]?.[mode] ??
        record.themes[theme]?.base ??
        record.rawByMode[mode] ??
        record.rawByMode.default ??
        ''
      const valuesByMode = {}
      for (const theme of themes) {
        for (const mode of ['light', 'dark']) {
          for (const record of themeRecords) record.currentRaw = rawFor(record, theme, mode)
          valuesByMode[`${theme}-${mode}`] = await resolveContext(
            { 'data-a63-theme': theme, 'data-a63-mode': mode },
            themeRecords
          )
        }
      }
      for (const record of themeRecords) {
        const values = {}
        let failed = null
        for (const theme of themes) {
          for (const mode of ['light', 'dark']) {
            const key = `${theme}-${mode}`
            const value = toValue(
              record,
              rawFor(record, theme, mode),
              valuesByMode[key][record.entry.cssVar],
              synced
            )
            if (!value)
              failed = `${key}: ${valuesByMode[key][record.entry.cssVar].value || '(empty)'}`
            values[key] = value
          }
        }
        if (failed) {
          // A theme value Figma cannot hold (a four-sided border color) keeps the
          // token in its own collection with the default value, instead of dropping it.
          skipped.push({
            token: record.entry.cssVar,
            reason: `theme value not representable, kept its default: ${failed}`,
          })
          record.themes = null
          continue
        }
        collection.variables.push(variable(record, values))
      }
    }

    const rootRecords = [...byVar.values()].filter(record => !record.axis && !record.themes)
    for (const record of rootRecords) record.currentRaw = record.rawByMode.default ?? ''
    const rootValues = await resolveContext({}, rootRecords)

    for (const record of rootRecords) {
      const collectionName = layerCollections[record.entry.layer] ?? layerCollections.foundation
      const collection = ensureCollection(collectionName, ['Value'])
      const result = rootValues[record.entry.cssVar]
      const value = toValue(record, record.rawByMode.default ?? '', result, synced)
      if (!value) {
        skipped.push({
          token: record.entry.cssVar,
          reason: `unresolvable value: ${result.value || '(empty)'}`,
        })
        continue
      }
      collection.variables.push(variable(record, { Value: value }))
    }

    for (const axis of axes) {
      const records = [...byVar.values()].filter(record => record.axis === axis && !record.themes)
      if (records.length === 0) continue
      const collection = ensureCollection(axis.collection, axis.modes)
      const valuesByMode = {}
      for (const mode of axis.modes) {
        for (const record of records) {
          record.currentRaw =
            record.rawByMode[mode] ??
            record.rawByMode.default ??
            record.rawByMode[axis.defaultMode] ??
            ''
        }
        // Set the attribute even for the default mode: some axes (type scale)
        // only define tokens under an explicit value, with no :root fallback.
        const attributes = { [axis.attribute]: mode }
        valuesByMode[mode] = await resolveContext(attributes, records)
      }
      for (const record of records) {
        const values = {}
        let failed = null
        for (const mode of axis.modes) {
          const value = toValue(
            record,
            record.rawByMode[mode] ??
              record.rawByMode.default ??
              record.rawByMode[axis.defaultMode] ??
              '',
            valuesByMode[mode][record.entry.cssVar],
            synced
          )
          if (!value)
            failed = `${mode}: ${valuesByMode[mode][record.entry.cssVar].value || '(empty)'}`
          values[mode] = value
        }
        if (failed) {
          skipped.push({ token: record.entry.cssVar, reason: `unresolvable value in ${failed}` })
          continue
        }
        collection.variables.push(variable(record, values))
      }
    }

    const computed = await placeByMeasuredAxes({
      collections,
      ensureCollection,
      byVar,
      resolveContext,
    })
    const computedValues = await resolveComputed(computed, byVar, resolveContext)

    // Drop aliases whose target was skipped, resolving them to literals is not
    // possible here, so report them instead of emitting a dangling reference.
    const emitted = new Set(
      [...collections.values()].flatMap(collection => collection.variables.map(v => v.token))
    )
    for (const collection of collections.values()) {
      collection.variables = collection.variables.filter(item => {
        const dangling = Object.values(item.values).find(
          value => value.alias && !emitted.has(value.alias)
        )
        if (dangling)
          skipped.push({ token: item.token, reason: `alias target not synced: ${dangling.alias}` })
        return !dangling
      })
      collection.variables.sort((left, right) => left.name.localeCompare(right.name))
    }

    const nameCollisions = []
    for (const collection of collections.values()) {
      const seen = new Set()
      for (const item of collection.variables) {
        if (seen.has(item.name)) nameCollisions.push(`${collection.name}/${item.name}`)
        seen.add(item.name)
      }
    }
    if (nameCollisions.length)
      throw new Error(`Duplicate Figma variable names: ${nameCollisions.join(', ')}`)

    alignAliasTypes([...collections.values()])

    const ordered = [...collections.values()]
    const output = {
      schemaVersion: 1,
      generatedBy: 'packages/styles/scripts/generate-figma-sync.mjs',
      derivedFrom: 'packages/styles/generated/atom63.tokens.json',
      summary: {
        collections: ordered.length,
        variables: ordered.reduce((sum, collection) => sum + collection.variables.length, 0),
        aliasValues: ordered.reduce(
          (sum, collection) =>
            sum +
            collection.variables.reduce(
              (count, item) =>
                count + Object.values(item.values).filter(value => value.alias).length,
              0
            ),
          0
        ),
        skipped: skipped.length,
        computed: computed.length,
      },
      collections: ordered,
      skipped: skipped.sort((left, right) => left.token.localeCompare(right.token)),
      computed,
    }

    const content = `${JSON.stringify(output, null, 2)}\n`
    const computedContent = formatComputed(computedValues)
    if (process.argv.includes('--check')) {
      const stale = []
      for (const [file, expected] of [
        [outputPath, content],
        [computedOutputPath, computedContent],
      ]) {
        const current = await readFile(file, 'utf8').catch(() => '')
        if (current === expected) continue
        const name = path.relative(packageRoot, file)
        stale.push(name)
        // Name the first line that differs, so a stale file in CI says why.
        const currentLines = current.split('\n')
        const expectedLines = expected.split('\n')
        const line = expectedLines.findIndex((text, index) => text !== currentLines[index])
        process.stderr.write(
          `${name}:${line + 1}\n  committed: ${currentLines[line] ?? '(end of file)'}\n  generated: ${expectedLines[line] ?? '(end of file)'}\n`
        )
      }
      if (stale.length) {
        process.stderr.write(
          `${stale.join(', ')} ${stale.length === 1 ? 'is' : 'are'} stale. Run: pnpm --filter @atom63/styles generate:figma\n`
        )
        process.exitCode = 1
        return
      }
      process.stdout.write('Figma sync model is current.\n')
      return
    }
    await writeFile(outputPath, content)
    await writeFile(computedOutputPath, computedContent)
    process.stdout.write(
      `Generated ${output.summary.variables} Figma variables in ${output.summary.collections} collections (${output.summary.aliasValues} alias values, ${output.summary.skipped} skipped).\n`
    )
  } finally {
    await browser.close()
  }
}

/**
 * A variable whose value is an alias follows its target across every axis, but a
 * literal (a computed calc() or color-mix(), resolved at the defaults) only
 * changes along its own collection's axis. Collections are chosen from where a
 * token is declared, so a formula declared at :root whose inputs sit on an axis
 * (a space step over the density unit, a radius over the radius multiplier, a
 * focus ring over the brand ramp) would stay frozen at the default mode.
 *
 * This pass measures in the page which axes each literal variable actually
 * varies on. A variable that varies on exactly one axis, other than the one its
 * collection represents, moves to that axis's collection with one resolved value
 * per mode, so Figma matches the browser in every mode. A variable that varies on more axes
 * than one collection can hold (a theme mix over the brand, a type step over
 * both window size and type scale) keeps its default value and is listed in
 * `computed` with its CSS expression, for renderers that evaluate formulas
 * natively and for the parity test.
 */
async function placeByMeasuredAxes({ collections, ensureCollection, byVar, resolveContext }) {
  const variables = [...collections.values()].flatMap(collection =>
    collection.variables.map(item => ({ collection, item }))
  )
  const measured = variables
    .filter(({ item }) => Object.values(item.values).some(value => !value.alias))
    .map(({ collection, item }) => ({ collection, item, record: byVar.get(item.token) }))
  const records = measured.map(({ record }) => {
    record.currentRaw = record.rawByMode.default ?? Object.values(record.rawByMode)[0] ?? ''
    return record
  })

  const key = value => JSON.stringify(value?.resolved ?? null)
  // Each axis alone, for the per-mode values of a moved variable.
  const results = {}
  for (const axis of axes) {
    results[axis.id] = {}
    for (const mode of axis.modes)
      results[axis.id][mode] = await resolveContext({ [axis.attribute]: mode }, records)
  }
  // Each axis again under every theme and mode, because a theme can make a token
  // depend on an axis it ignores under the default theme (retro's weather card
  // follows the brand; modern's does not).
  const variesByAxis = new Map(axes.map(axis => [axis.id, new Set()]))
  for (const theme of themes)
    for (const themeMode of ['light', 'dark'])
      for (const axis of axes) {
        const byMode = []
        for (const mode of axis.modes)
          byMode.push(
            await resolveContext(
              { 'data-a63-theme': theme, 'data-a63-mode': themeMode, [axis.attribute]: mode },
              records
            )
          )
        for (const record of records) {
          const token = record.entry.cssVar
          if (new Set(byMode.map(result => key(result[token]))).size > 1)
            variesByAxis.get(axis.id).add(token)
        }
      }
  const themeResults = {}
  for (const theme of themes)
    for (const mode of ['light', 'dark'])
      themeResults[`${theme}-${mode}`] = await resolveContext(
        { 'data-a63-theme': theme, 'data-a63-mode': mode },
        records
      )

  const axisOf = collection =>
    collection.name === themeCollection.name
      ? ['theme', 'mode']
      : [axes.find(axis => axis.collection === collection.name)?.id].filter(Boolean)

  const computed = []
  for (const { collection, item, record } of measured) {
    const token = item.token
    const variesOn = axes
      .filter(
        axis =>
          variesByAxis.get(axis.id).has(token) ||
          new Set(axis.modes.map(mode => key(results[axis.id][mode][token]))).size > 1
      )
      .map(axis => axis.id)
    const themeVaries = ['light', 'dark'].some(
      mode => new Set(themes.map(theme => key(themeResults[`${theme}-${mode}`][token]))).size > 1
    )
    if (themeVaries) variesOn.push('theme')
    const extra = variesOn.filter(axis => !axisOf(collection).includes(axis))
    if (extra.length === 0) continue

    // A value that varies on one axis belongs to that axis's collection, even
    // when its declaration scope placed it on another one it does not vary on.
    const axis = variesOn.length === 1 && axes.find(candidate => candidate.id === variesOn[0])
    const singleAxis = Boolean(axis)
    const perMode = singleAxis
      ? axis.modes.map(mode => [mode, results[axis.id][mode][token]?.resolved])
      : []
    if (
      singleAxis &&
      perMode.every(([, resolved]) => resolved !== null && resolved !== undefined)
    ) {
      const values = Object.fromEntries(
        perMode.map(([mode, resolved]) => [mode, { value: resolved }])
      )
      collection.variables = collection.variables.filter(other => other !== item)
      ensureCollection(axis.collection, axis.modes).variables.push(variable(record, values))
      continue
    }
    computed.push({
      token,
      collection: collection.name,
      variesOn: variesOn.sort(),
      expression: record.rawByMode.default ?? Object.values(record.rawByMode)[0] ?? '',
    })
  }
  return computed.sort((left, right) => left.token.localeCompare(right.token))
}

/**
 * The browser-resolved value of every `computed` variable in every combination
 * of the axes it varies on, for renderers that cannot evaluate CSS: iOS reads a
 * variable's value here instead of the default Figma shows. A key names each
 * axis and its mode, sorted by axis (`brand=b3,mode=dark,surface=n2,theme=aqua`).
 * It is a separate file so the Figma plugin, which bundles the sync model, does
 * not carry it.
 */
async function resolveComputed(computed, byVar, resolveContext) {
  const dimension = id =>
    id === 'theme'
      ? { id, attribute: 'data-a63-theme', modes: themes }
      : axes.find(axis => axis.id === id)
  const groups = new Map()
  for (const entry of computed) {
    const group = entry.variesOn.join('+')
    groups.set(group, [...(groups.get(group) ?? []), entry])
  }
  const values = {}
  for (const entries of groups.values()) {
    let combinations = [[]]
    for (const axis of entries[0].variesOn.map(dimension))
      combinations = combinations.flatMap(combination =>
        axis.modes.map(mode => [...combination, [axis, mode]])
      )
    const records = entries.map(entry => {
      const record = byVar.get(entry.token)
      record.currentRaw = entry.expression
      return record
    })
    for (const combination of combinations) {
      const attributes = Object.fromEntries(
        combination.map(([axis, mode]) => [axis.attribute, mode])
      )
      const key = combination.map(([axis, mode]) => `${axis.id}=${mode}`).join(',')
      const result = await resolveContext(attributes, records)
      for (const entry of entries) {
        values[entry.token] ??= { variesOn: entry.variesOn, values: {} }
        values[entry.token].values[key] = result[entry.token].resolved
      }
    }
  }
  return values
}

/** One line per combination, so a diff shows exactly which values moved. */
function formatComputed(values) {
  const tokens = Object.keys(values).sort()
  const body = tokens
    .map(token => {
      const { variesOn, values: byKey } = values[token]
      const lines = Object.entries(byKey).map(
        ([key, value]) => `      ${JSON.stringify(key)}: ${JSON.stringify(value)}`
      )
      return `    ${JSON.stringify(token)}: {\n      "variesOn": ${JSON.stringify(variesOn)},\n      "values": {\n${lines.map(line => `  ${line}`).join(',\n')}\n      }\n    }`
    })
    .join(',\n')
  return `{\n  "schemaVersion": 1,\n  "generatedBy": "packages/styles/scripts/generate-figma-sync.mjs",\n  "tokens": {\n${body}\n  }\n}\n`
}

function toValue(record, raw, result, synced) {
  const alias = aliasTarget(raw, result.mixWeights, synced)
  if (alias && alias !== record.entry.cssVar) return { alias }
  if (result.resolved === null || result.resolved === undefined || Number.isNaN(result.resolved))
    return null
  return { value: result.resolved }
}

/**
 * Figma only accepts an alias to a variable of the same resolved type. A token's
 * manifest type is a heuristic (a font stack is `typography`, so FLOAT), so a
 * variable whose values are aliases takes its type from the variables it points
 * at, following alias chains until nothing changes. A variable whose modes would
 * need different types fails the build instead of failing in Figma.
 */
function alignAliasTypes(collections) {
  const variables = collections.flatMap(collection => collection.variables)
  const byToken = new Map(variables.map(item => [item.token, item]))
  let changed = true
  while (changed) {
    changed = false
    for (const item of variables) {
      const values = Object.values(item.values)
      if (values.some(value => !value.alias)) continue
      const [type] = new Set(values.map(value => byToken.get(value.alias).type))
      if (type && type !== item.type) {
        item.type = type
        changed = true
      }
    }
  }
  const mismatches = variables.flatMap(item =>
    Object.entries(item.values)
      .filter(([, value]) => value.alias && byToken.get(value.alias).type !== item.type)
      .map(([mode, value]) => `${item.name} (${item.type}) ${mode} -> ${value.alias}`)
  )
  if (mismatches.length)
    throw new Error(`Figma aliases must match their target's type: ${mismatches.join(', ')}`)
}

/**
 * FLOAT tokens whose values are not numbers (font stacks, easing curves) are
 * emitted as STRING so every mode of a variable shares one Figma type.
 */
function variable(record, values) {
  const literals = Object.values(values).filter(value => !value.alias)
  const type =
    record.type === 'FLOAT' && literals.some(value => typeof value.value !== 'number')
      ? 'STRING'
      : record.type
  if (type === 'STRING') {
    for (const value of literals) value.value = String(value.value)
  }
  return {
    name: figmaPath(record.entry),
    token: record.entry.cssVar,
    type,
    values,
  }
}

await main()
