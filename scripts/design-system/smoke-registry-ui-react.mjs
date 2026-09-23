import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const evidencePath = resolve(
  repositoryRoot,
  'docs/design-system/audits/registry-consumer-smoke.json'
)
const registry = 'https://registry.npmjs.org/'
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const write = process.argv.includes('--write')

const atom63Dependencies = {
  '@atom63/styles': 'beta',
  '@atom63/ui-foundation': 'beta',
  '@atom63/ui-react': 'beta',
}
const dependencies = {
  ...atom63Dependencies,
  react: '19.2.7',
  'react-dom': '19.2.7',
}
const devDependencies = {
  '@types/react': '19.2.17',
  '@types/react-dom': '19.2.3',
  '@vitejs/plugin-react': '6.1.0',
  typescript: '5.8.3',
  vite: '8.1.4',
}
const installCommand = `pnpm install --ignore-workspace --registry=${registry} --no-frozen-lockfile`
const verificationCommands = [installCommand, 'pnpm exec tsc --noEmit', 'pnpm exec vite build']
const consumerImports = [
  '@atom63/styles',
  '@atom63/ui-react/styles.css',
  '@atom63/ui-react',
  '@atom63/ui-foundation',
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function run(command, args, { cwd } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      shell: false,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolvePromise()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })
}

function containsLocalSpec(value) {
  return /^(file|link|workspace):/u.test(value)
}

function assertRegistrySpecs(
  manifest,
  label,
  dependencyFields = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
) {
  for (const dependencyField of dependencyFields) {
    for (const [name, spec] of Object.entries(manifest[dependencyField] ?? {})) {
      assert(
        typeof spec === 'string' && !containsLocalSpec(spec),
        `${label} ${dependencyField}.${name} must be a registry-compatible spec`
      )
    }
  }
}

async function writeHarness(harnessDirectory) {
  const manifest = {
    name: 'atom63-registry-ui-react-smoke',
    private: true,
    version: '0.0.0',
    type: 'module',
    packageManager: 'pnpm@10.29.2',
    scripts: {
      build: 'vite build',
      typecheck: 'tsc --noEmit',
    },
    dependencies,
    devDependencies,
  }
  assertRegistrySpecs(manifest, 'consumer manifest')
  for (const [name, spec] of Object.entries(atom63Dependencies)) {
    assert(spec === 'beta', `${name} must be requested through the beta tag`)
  }

  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'Bundler',
      isolatedModules: true,
      esModuleInterop: true,
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
    },
    include: ['src'],
  }

  const source = `import '@atom63/styles'
import '@atom63/ui-react/styles.css'

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@atom63/ui-react'
import { buttonContract, type ButtonContract } from '@atom63/ui-foundation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const foundationContract: ButtonContract = buttonContract
void foundationContract

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atom63 registry consumer</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge>Public beta</Badge>
        <Input aria-label="Name" placeholder="Name" />
        <Button type="button">Built from registry packages</Button>
      </CardContent>
    </Card>
  )
}

const rootElement = document.querySelector('#root')
if (!(rootElement instanceof HTMLElement)) {
  throw new Error('Missing root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
`

  await mkdir(resolve(harnessDirectory, 'src'), { recursive: true })
  await Promise.all([
    writeFile(resolve(harnessDirectory, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(resolve(harnessDirectory, 'tsconfig.json'), `${JSON.stringify(tsconfig, null, 2)}\n`),
    writeFile(
      resolve(harnessDirectory, 'vite.config.ts'),
      "import react from '@vitejs/plugin-react'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig({ plugins: [react()] })\n"
    ),
    writeFile(
      resolve(harnessDirectory, 'index.html'),
      '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Atom63 registry smoke</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n'
    ),
    writeFile(resolve(harnessDirectory, 'src/main.tsx'), source),
  ])
}

async function inspectInstalledPackages(harnessDirectory) {
  const installedPackages = []
  for (const [name, requested] of Object.entries(atom63Dependencies)) {
    const manifestPath = resolve(
      harnessDirectory,
      'node_modules',
      ...name.split('/'),
      'package.json'
    )
    const resolvedManifestPath = await realpath(manifestPath)
    const nodeModulesRoot = await realpath(resolve(harnessDirectory, 'node_modules'))
    const relativeManifestPath = relative(nodeModulesRoot, resolvedManifestPath)
    assert(
      relativeManifestPath !== '..' && !relativeManifestPath.startsWith(`..${sep}`),
      `${name} did not resolve from the consumer node_modules directory`
    )

    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    assert(manifest.name === name, `${name} installed manifest name mismatch`)
    assert(
      typeof manifest.version === 'string' && manifest.version.length > 0,
      `${name} installed manifest has no version`
    )
    assertRegistrySpecs(manifest, `${name}@${manifest.version}`, [
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
    ])

    installedPackages.push({
      name,
      requested,
      resolved: manifest.version,
      manifest: `node_modules/${name}/package.json`,
    })
  }
  return installedPackages
}

async function formatEvidence(evidence) {
  const options = (await prettier.resolveConfig(evidencePath)) ?? {}
  return prettier.format(`${JSON.stringify(evidence, null, 2)}\n`, {
    ...options,
    filepath: evidencePath,
  })
}

async function checkOrWriteEvidence(evidence) {
  const expected = await formatEvidence(evidence)
  if (write) {
    await mkdir(dirname(evidencePath), { recursive: true })
    await writeFile(evidencePath, expected)
    return
  }

  const actual = await readFile(evidencePath, 'utf8').catch(() => null)
  assert(
    actual === expected,
    'Registry consumer smoke evidence is stale. Run: pnpm check:ds-registry-smoke -- --write'
  )
}

async function main() {
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'atom63-ds-registry-smoke-'))
  const harnessDirectory = resolve(temporaryRoot, 'consumer')
  let succeeded = false

  await mkdir(harnessDirectory, { recursive: true })

  try {
    const relativeHarnessPath = relative(repositoryRoot, harnessDirectory)
    assert(
      relativeHarnessPath === '..' || relativeHarnessPath.startsWith(`..${sep}`),
      'Registry smoke consumer must be outside the repository'
    )
    await writeHarness(harnessDirectory)
    await run(
      pnpmCommand,
      ['install', '--ignore-workspace', `--registry=${registry}`, '--no-frozen-lockfile'],
      { cwd: harnessDirectory }
    )
    const installedPackages = await inspectInstalledPackages(harnessDirectory)
    await run(pnpmCommand, ['exec', 'tsc', '--noEmit'], {
      cwd: harnessDirectory,
    })
    await run(pnpmCommand, ['exec', 'vite', 'build'], {
      cwd: harnessDirectory,
    })

    const evidence = {
      schemaVersion: 1,
      status: 'passed',
      consumer: 'clean-external-vite-react',
      registry,
      packages: installedPackages,
      requestedSpecs: {
        dependencies,
        devDependencies,
      },
      commands: verificationCommands,
      imports: consumerImports,
      verification: {
        temporaryConsumerOutsideRepository: 'passed',
        registryOnlyDependencySpecs: 'passed',
        installedManifestsFromNodeModules: 'passed',
        installedPackageRuntimeSpecsRegistryCompatible: 'passed',
        typescriptNoEmit: 'passed',
        viteProductionBuild: 'passed',
      },
    }
    await checkOrWriteEvidence(evidence)

    console.log('\nAtom63 registry-only consumer smoke passed.')
    console.log(`Consumer: ${harnessDirectory} (removed after success)`)
    console.log(`Registry: ${registry}`)
    console.log(
      `Packages: ${installedPackages
        .map(({ name, requested, resolved }) => `${name}@${requested} -> ${resolved}`)
        .join(', ')}`
    )
    console.log(`Evidence: ${relative(repositoryRoot, evidencePath)}`)
    succeeded = true
  } catch (error) {
    console.error(
      `\nAtom63 registry-only consumer smoke failed. Consumer preserved at: ${harnessDirectory}`
    )
    throw error
  } finally {
    if (succeeded) {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
