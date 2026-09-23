/**
 * Theme authoring guardrail for @atom63/styles themes: each theme scopes its
 * rules under [data-a63-theme], fixed pseudo overlays stay scoped to html/body,
 * and the mode-split themes (aqua, terminal) declare both light and dark paint.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const themeFiles = {
  aqua: 'packages/styles/src/themes/aqua.css',
  modern: 'packages/styles/src/themes/modern.css',
  terminal: 'packages/styles/src/themes/terminal.css',
  retro: 'packages/styles/src/themes/retro.css',
}
const modeSplitThemes = new Set(['aqua', 'terminal'])
const findings = []

for (const [themeId, file] of Object.entries(themeFiles)) {
  const source = await readFile(path.join(root, file), 'utf8')

  if (!new RegExp(`\\[data-a63-theme=['"]${themeId}['"]\\]`).test(source)) {
    findings.push(`${file}: missing [data-a63-theme="${themeId}"] scoped selectors`)
  }

  const documentScope = new RegExp(`(?:html|body)\\[data-a63-theme=['"]${themeId}['"]\\]`)
  for (const match of source.matchAll(/(?<selector>[^{}]*::(?:before|after)[^{]*)\{(?<body>[^{}]*position\s*:\s*fixed[^{}]*)\}/g)) {
    if (!documentScope.test(match.groups?.selector ?? '')) {
      findings.push(`${file}: fixed pseudo overlay must be scoped to html/body`)
      break
    }
  }

  const hasLightScope = [".light", ':root', ':not(.dark)', "[data-a63-mode='light']", '[data-a63-mode="light"]'].some(scope => source.includes(scope))
  const hasDarkScope = ['.dark', "[data-a63-mode='dark']", '[data-a63-mode="dark"]'].some(scope => source.includes(scope))
  if (modeSplitThemes.has(themeId) && !(hasLightScope && hasDarkScope)) {
    findings.push(`${file}: theme CSS should define independent light/dark scopes`)
  }
}

if (findings.length > 0) {
  process.stderr.write('\nTheme authoring check failed\n')
  for (const finding of findings) process.stderr.write(`- ${finding}\n`)
  process.exit(1)
}
process.stdout.write('Theme authoring check passed\n')
