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
 */
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const check = process.argv.includes('--check')

/** Package folder -> { report name: entry .d.ts relative to the package }. */
const packages = {
  'packages/ui-foundation': { 'ui-foundation': 'dist/index.d.ts' },
  'packages/ui-react': {
    'ui-react': 'dist/index.d.ts',
    'ui-react.layout': 'dist/layout/index.d.ts',
    'ui-react.media': 'dist/media/index.d.ts',
    'ui-react.media-lightbox': 'dist/media/media-lightbox/parts/index.d.ts',
    'ui-react.preview': 'dist/preview/index.d.ts',
    'ui-react.theme': 'dist/theme/index.d.ts',
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

const tempFolder = mkdtempSync(path.join(tmpdir(), 'atom63-api-report-'))
const failures = []

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
          compiler: { overrideTsconfig: { compilerOptions, files: [entryPath] } },
          apiReport: {
            enabled: true,
            reportFileName: reportName,
            reportFolder,
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
      const result = Extractor.invoke(config, { localBuild: !check, showVerboseMessages: false })
      if (!result.succeeded || (check && result.apiReportChanged)) {
        failures.push(
          `${packageDir}/api/${reportName}.api.md: ${
            result.apiReportChanged ? 'report is out of date' : 'API Extractor failed'
          } (${result.errorCount} errors, ${result.warningCount} warnings)`
        )
      }
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
