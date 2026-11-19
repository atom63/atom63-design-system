#!/usr/bin/env node
/**
 * Writes an API report (the public type signatures) for every entry point of
 * the published TypeScript packages, from the built `dist/*.d.ts` files.
 * Reports live in `packages/<name>/api/` and are committed, so a change to a
 * public type shows up in review.
 *
 *   node scripts/design-system/api-report.mjs          # update reports
 *   node scripts/design-system/api-report.mjs --check  # fail if a report is stale
 *
 * Build the packages first (`pnpm --filter @atom63/ui-react build`).
 *
 * TypeScript prints the members of a string-literal union in an order that
 * varies between runs and machines (`"md" | "lg" | "sm"` or `"sm" | "md" | "lg"`),
 * so the reports sort them. Tuples keep their order.
 */
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sortLiteralUnions } from './lib/api-report-format.mjs'
import { publishedPackageDirs } from './published-packages.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const check = process.argv.includes('--check')

/** Package folder -> { report name: entry .d.ts relative to the package }. */
const packages = {
  'packages/styles': { 'styles.z-layers': 'generated/z-layers.d.ts' },
  'packages/ui-foundation': { 'ui-foundation': 'dist/index.d.ts' },
  'packages/ui-react': {
    'ui-react': 'dist/index.d.ts',
    'ui-react.calendar': 'dist/calendar/index.d.ts',
    'ui-react.layout': 'dist/layout/index.d.ts',
    'ui-react.media': 'dist/media/index.d.ts',
    'ui-react.media-lightbox': 'dist/media/media-lightbox/parts/index.d.ts',
    'ui-react.preview': 'dist/preview/index.d.ts',
    'ui-react.theme': 'dist/theme/index.d.ts',
  },
  'packages/mdx': {
    mdx: 'dist/index.d.ts',
    'mdx.article': 'dist/article/index.d.ts',
    'mdx.blocks': 'dist/blocks/index.d.ts',
    'mdx.blocks-credits-block': 'dist/blocks/credits-block-entry.d.ts',
    'mdx.blocks-media-caption': 'dist/blocks/media-caption-entry.d.ts',
    'mdx.editor': 'dist/editor/index.d.ts',
    'mdx.lightbox': 'dist/lightbox/index.d.ts',
    'mdx.primitives': 'dist/primitives/index.d.ts',
    'mdx.runtime': 'dist/runtime/index.d.ts',
  },
  'packages/inform': {
    inform: 'dist/index.d.ts',
    'inform.react': 'dist/react/index.d.ts',
    'inform.surfaces': 'dist/surfaces/index.d.ts',
  },
  'packages/agent': {
    agent: 'dist/index.d.ts',
    'agent.react': 'dist/react/index.d.ts',
  },
  'packages/widgets': {
    widgets: 'dist/index.d.ts',
    'widgets.primitives': 'dist/primitives/index.d.ts',
    'widgets.runtime': 'dist/runtime/index.d.ts',
    'widgets.state': 'dist/state/index.d.ts',
  },
}

/* Resolve workspace packages the way consumers do (published .d.ts), not
   through the `@atom63/source` condition the repo tsconfig adds. */
const compilerOptions = {
  jsx: 'react-jsx',
  lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  module: 'ESNext',
  moduleResolution: 'bundler',
  skipLibCheck: true,
  strict: true,
  target: 'ES2022',
}

const failures = []

/* Every typed export of a published package needs a report above. */
for (const packageDir of publishedPackageDirs) {
  const manifest = JSON.parse(readFileSync(path.join(repoRoot, packageDir, 'package.json'), 'utf8'))
  const reported = new Set(Object.values(packages[packageDir] ?? {}))
  for (const [key, target] of Object.entries(manifest.exports ?? {})) {
    const types = typeof target === 'object' ? target?.types : undefined
    if (types && !reported.has(types.replace(/^\.\//, ''))) {
      failures.push(
        `${manifest.name} export ${key} (${types}) has no API report; add it to api-report.mjs`
      )
    }
  }
}

const tempFolder = mkdtempSync(path.join(tmpdir(), 'atom63-api-report-'))
const generatedFolder = path.join(tempFolder, 'generated')
mkdirSync(generatedFolder)

try {
  for (const [packageDir, entries] of Object.entries(packages)) {
    const projectFolder = path.join(repoRoot, packageDir)
    const reportFolder = path.join(projectFolder, 'api')
    mkdirSync(reportFolder, { recursive: true })
    for (const [reportName, entry] of Object.entries(entries)) {
      const entryPath = path.join(projectFolder, entry)
      if (!existsSync(entryPath)) {
        failures.push(`${packageDir}/${entry} is missing; build the package first`)
        continue
      }
      const config = ExtractorConfig.prepare({
        configObject: {
          projectFolder,
          mainEntryPointFilePath: entryPath,
          // API Extractor writes CRLF by default; the repo stores text as LF.
          newlineKind: 'lf',
          compiler: { overrideTsconfig: { compilerOptions, files: [entryPath] } },
          apiReport: {
            enabled: true,
            reportFileName: reportName,
            // Written here first, then sorted and compared with the committed report.
            reportFolder: generatedFolder,
            reportTempFolder: tempFolder,
          },
          docModel: { enabled: false },
          dtsRollup: { enabled: false },
          tsdocMetadata: { enabled: false },
          messages: {
            compilerMessageReporting: { default: { logLevel: 'warning' } },
            extractorMessageReporting: {
              default: { logLevel: 'warning' },
              // Recorded in the report, where review sees it.
              'ae-forgotten-export': { addToApiReportFile: true, logLevel: 'none' },
              // The packages do not use @public/@beta release tags or require TSDoc.
              'ae-missing-release-tag': { logLevel: 'none' },
              'ae-undocumented': { logLevel: 'none' },
            },
            tsdocMessageReporting: { default: { logLevel: 'none' } },
          },
        },
        configObjectFullPath: path.join(projectFolder, 'api-extractor.json'),
        packageJsonFullPath: path.join(projectFolder, 'package.json'),
      })
      const result = Extractor.invoke(config, { localBuild: true, showVerboseMessages: false })
      if (!result.succeeded) {
        failures.push(
          `${packageDir}/api/${reportName}.api.md: API Extractor failed (${result.errorCount} errors, ${result.warningCount} warnings)`
        )
        continue
      }
      const file = `${reportName}.api.md`
      const report = sortLiteralUnions(readFileSync(path.join(generatedFolder, file), 'utf8'))
      const committedPath = path.join(reportFolder, file)
      const committed = existsSync(committedPath) ? readFileSync(committedPath, 'utf8') : null
      if (report === committed) continue
      if (check) failures.push(`${packageDir}/api/${file}: report is out of date`)
      else writeFileSync(committedPath, report)
    }
  }
} finally {
  rmSync(tempFolder, { force: true, recursive: true })
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  if (check) {
    console.error(
      'Run `node scripts/design-system/api-report.mjs` after building, review the diff, and commit it.'
    )
  }
  process.exit(1)
}
console.log(check ? 'API reports are current.' : 'API reports written.')
