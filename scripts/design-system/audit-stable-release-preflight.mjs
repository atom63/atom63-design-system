import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const policyPath = 'docs/design-system/stable-release-policy.json'
const auditPath = 'docs/design-system/audits/stable-release-preflight.json'
const packageDirs = ['packages/styles', 'packages/ui-foundation', 'packages/ui-react']

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateStringArray(value, path) {
  assert(Array.isArray(value), `${path} must be an array`)
  assert(value.length > 0, `${path} must not be empty`)
  value.forEach((entry, index) => {
    assert(isNonEmptyString(entry), `${path}[${index}] must be a non-empty string`)
  })
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(repositoryRoot, path), 'utf8'))
}

function isPrerelease(version) {
  return /-[0-9A-Za-z]/.test(version)
}

async function main() {
  const writeMode = process.argv.includes('--write')
  const policy = await readJson(policyPath)

  assert(policy.schemaVersion === 1, 'schemaVersion must be 1')
  assert(
    policy.status === 'stable-promotion-not-approved',
    'stable promotion must remain explicitly not approved'
  )
  assert(Array.isArray(policy.firstWavePackages), 'firstWavePackages must be an array')
  assert(
    policy.firstWavePackages.length === packageDirs.length,
    'firstWavePackages must cover every first-wave package'
  )
  assert(policy.distTags?.beta, 'beta dist-tag policy is required')
  assert(policy.distTags?.latest, 'latest dist-tag policy is required')
  assert(
    policy.distTags.latest.allowedBeforeStableReady === false,
    'latest must not be allowed before stable readiness'
  )
  assert(
    policy.stablePromotionPreflight?.publishAllowed === false,
    'stable preflight must be no-publish'
  )
  assert(
    policy.stablePromotionPreflight.command === 'pnpm check:stable-release-preflight',
    'stable preflight command must be documented'
  )
  validateStringArray(
    policy.stablePromotionPreflight.requiredEvidence,
    'stablePromotionPreflight.requiredEvidence'
  )
  validateStringArray(policy.registryReadback, 'registryReadback')
  assert(
    policy.rollback?.owner === 'release-engineering',
    'rollback owner must be release-engineering'
  )
  assert(isNonEmptyString(policy.rollback.policy), 'rollback.policy must be non-empty')
  validateStringArray(policy.rollback.commands, 'rollback.commands')
  validateStringArray(policy.rollback.notes, 'rollback.notes')

  const packages = []
  for (const dir of packageDirs) {
    const manifest = await readJson(`${dir}/package.json`)
    assert(
      policy.firstWavePackages.includes(manifest.name),
      `${manifest.name} missing from firstWavePackages`
    )
    packages.push({
      name: manifest.name,
      version: manifest.version,
      prerelease: isPrerelease(manifest.version),
      private: manifest.private === true,
    })
  }

  const releaseReady =
    packages.every(pkg => !pkg.prerelease) &&
    policy.distTags.latest.allowedBeforeStableReady === true
  assert(
    !releaseReady,
    'stable/latest release unexpectedly appears approved; update policy and audit intentionally'
  )

  const audit = {
    schemaVersion: 1,
    status: 'no-publish-stable-preflight',
    policy: policyPath,
    generatedFrom: 'scripts/design-system/audit-stable-release-preflight.mjs',
    stablePromotionApproved: false,
    publishAllowed: policy.stablePromotionPreflight.publishAllowed,
    latestAllowedBeforeStableReady: policy.distTags.latest.allowedBeforeStableReady,
    packages,
    registryReadback: policy.registryReadback,
    rollbackOwner: policy.rollback.owner,
    rollbackCommands: policy.rollback.commands,
  }

  const formatted = await prettier.format(JSON.stringify(audit), {
    parser: 'json',
  })
  const outputFile = resolve(repositoryRoot, auditPath)
  if (writeMode) {
    await writeFile(outputFile, formatted)
    console.log(`Wrote stable release preflight audit -> ${auditPath}`)
    return
  }

  let existing = ''
  try {
    existing = await readFile(outputFile, 'utf8')
  } catch {
    throw new Error(`${auditPath} is missing; run pnpm check:stable-release-preflight -- --write`)
  }
  assert(
    existing === formatted,
    `${auditPath} is stale; run pnpm check:stable-release-preflight -- --write`
  )
  console.log(`Stable release preflight is current (${auditPath})`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
