import { readJson, relativeToRoot, fromRoot, writeAuditJson } from './audit-utils.mjs'
import { publishedPackageDirs } from './published-packages.mjs'

const packageDirectories = publishedPackageDirs
const tiersPath = 'docs/design-system/package-export-tiers.json'
const tierInventory = await readJson(fromRoot(tiersPath))
const tierProblems = []

function selectQualityScripts(scripts = {}) {
  return Object.fromEntries(
    Object.entries(scripts)
      .filter(([name]) => /^(build|lint|test|typecheck)(:|$)/.test(name))
      .sort(([left], [right]) => left.localeCompare(right))
  )
}

const packages = []

for (const directory of packageDirectories) {
  const manifestPath = fromRoot(directory, 'package.json')
  const manifest = await readJson(manifestPath)
  const exportsMap = manifest.exports ?? null
  const tiers = tierInventory.packages[manifest.name] ?? null
  if (tiers) {
    const keys = Object.keys(exportsMap ?? {})
    for (const key of keys) {
      if (!tierInventory.tierDefinitions[tiers[key]]) {
        tierProblems.push(`${manifest.name} export ${key} has no known tier in ${tiersPath}`)
      }
    }
    for (const key of Object.keys(tiers)) {
      if (!keys.includes(key))
        tierProblems.push(`${tiersPath} tiers ${manifest.name} ${key}, which it does not export`)
    }
  }

  packages.push({
    directory,
    manifestPath: relativeToRoot(manifestPath),
    name: manifest.name ?? null,
    version: manifest.version ?? null,
    private: manifest.private === true,
    exports: exportsMap,
    exportKeys:
      exportsMap && typeof exportsMap === 'object' && !Array.isArray(exportsMap)
        ? Object.keys(exportsMap).sort((a, b) => a.localeCompare(b))
        : [],
    files: manifest.files ?? null,
    sideEffects: manifest.sideEffects ?? null,
    peerDependencies: manifest.peerDependencies ?? {},
    qualityScripts: selectQualityScripts(manifest.scripts),
    publishConfig: manifest.publishConfig ?? null,
    publishAccess: manifest.publishConfig?.access ?? null,
    exportTiers: tiers,
  })
}

if (tierProblems.length > 0) {
  console.error(tierProblems.join('\n'))
  process.exit(1)
}

const audit = {
  schemaVersion: 1,
  inputs: [...packageDirectories.map(directory => `${directory}/package.json`), tiersPath],
  summary: {
    packageCount: packages.length,
    publishableCount: packages.filter(item => !item.private).length,
    privateCount: packages.filter(item => item.private).length,
    packagesWithExports: packages.filter(item => item.exportKeys.length > 0).length,
    packagesWithFilesWhitelist: packages.filter(item => Array.isArray(item.files)).length,
    packagesWithPeerDependencies: packages.filter(
      item => Object.keys(item.peerDependencies).length > 0
    ).length,
    packagesWithPublishAccess: packages.filter(item => item.publishAccess !== null).length,
  },
  packages,
}

const outputPath = await writeAuditJson('docs/design-system/audits/package-surface.json', audit)

console.log(`Audited ${packages.length} package surfaces -> ${relativeToRoot(outputPath)}`)
