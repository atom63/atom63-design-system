/**
 * First release of a new package: the one step the release workflow cannot do.
 * npm only accepts a trusted publisher for a package that already exists, so
 * a new package is published once with the maintainer's own npm login, and
 * then trusted to publish from release-beta.yml. After that, every release is
 * automatic.
 *
 * For each package directory it builds the package, publishes it to the
 * `beta` tag if npm does not have it yet, waits until npm serves it, and adds
 * the GitHub Actions trusted publisher with `npm trust github` (npm >= 11.15;
 * the script runs the latest npm for that step). npm asks for two-factor
 * confirmation at each publish and trust step.
 *
 * Then add the packages to scripts/design-system/published-packages.mjs and
 * PUBLISHED_PACKAGES in the workflow (lib/published-packages.test.mjs checks
 * the two agree).
 *
 * Usage: pnpm release:bootstrap packages/inform packages/agent [--dry-run]
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { publishedPackageDirs } from './published-packages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const repository = 'atom63/atom63-design-system'
const workflow = 'release-beta.yml'
const environment = 'npm-publish'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const dirs = args.filter(arg => !arg.startsWith('--'))

const run = (command, commandArgs, cwd = root) => {
  process.stdout.write(`\n$ ${command} ${commandArgs.join(' ')}\n`)
  if (!dryRun) execFileSync(command, commandArgs, { cwd, stdio: 'inherit' })
}

const onNpm = (name, version) => {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const fail = message => {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

if (dirs.length === 0)
  fail('Name the package directories, e.g. pnpm release:bootstrap packages/inform')

const packages = dirs.map(dir => {
  const relative = path.relative(root, path.resolve(root, dir))
  const manifest = JSON.parse(readFileSync(path.join(root, relative, 'package.json'), 'utf8'))
  if (manifest.private) fail(`${manifest.name} is private and is never published`)
  if (publishedPackageDirs.includes(relative)) {
    fail(`${manifest.name} already publishes from the release workflow`)
  }
  return { dir: relative, name: manifest.name, version: manifest.version }
})

if (!dryRun) {
  try {
    const user = execFileSync('npm', ['whoami'], { stdio: 'pipe' }).toString().trim()
    process.stdout.write(`npm user: ${user}\n`)
  } catch {
    fail('Not logged in to npm. Run `npm login` first.')
  }
}

for (const pkg of packages) {
  process.stdout.write(`\n=== ${pkg.name}@${pkg.version}\n`)
  if (onNpm(pkg.name, pkg.version)) {
    process.stdout.write(`${pkg.name}@${pkg.version} is already on npm; skipping the publish.\n`)
  } else {
    run('pnpm', ['--filter', pkg.name, 'build'])
    run(
      'pnpm',
      ['publish', '--access', 'public', '--tag', 'beta', '--no-git-checks'],
      path.join(root, pkg.dir)
    )
    // The registry can take a few minutes to serve a new package, and npm
    // trust rejects a package it cannot find yet.
    for (let attempt = 0; !dryRun && !onNpm(pkg.name, pkg.version); attempt++) {
      if (attempt === 30) throw new Error(`${pkg.name}@${pkg.version} is still not visible on npm`)
      process.stdout.write('Waiting for npm to serve the new package...\n')
      await sleep(10_000)
    }
  }
  run('npx', [
    '--yes',
    'npm@latest',
    'trust',
    'github',
    pkg.name,
    '--file',
    workflow,
    '--repository',
    repository,
    '--environment',
    environment,
    '--allow-publish',
    '--yes',
  ])
}

process.stdout.write(
  `\nDone. Add ${packages.map(pkg => pkg.dir).join(', ')} to scripts/design-system/published-packages.mjs and PUBLISHED_PACKAGES in .github/workflows/${workflow}.\n`
)
