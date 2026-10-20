/**
 * Proves the project starter works: for every kind, generate an app, install
 * it against freshly packed design system tarballs, typecheck and build it,
 * hold its source to the craft rules, and open every route of an app kind
 * (lib/route-check.mjs). With --shadcn it also adds a shadcn
 * component to the first kind's app (the Tailwind + shadcn path the starter
 * promises), then installs the list page template from the Atom63 shadcn
 * registry, served locally, and typechecks and builds again.
 *
 * Needs the packages built first (dist is packed). Needs the network for the
 * third-party dependencies.
 *
 * Usage: node scripts/design-system/check-starter.mjs [--kind <kind>] [--shadcn] [--keep]
 */
import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { kinds, planProject, writeProject } from '../../packages/create/src/generate.mjs'
import { execCommandSync, spawnCommand } from './lib/command.mjs'
import { scanCss, scanSource } from './lib/craft-rules.mjs'
import { pnpmOverridesYaml } from './lib/pnpm-overrides.mjs'
import { checkRoutes } from './lib/route-check.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packages = {
  '@atom63/styles': 'packages/styles',
  '@atom63/ui-foundation': 'packages/ui-foundation',
  '@atom63/ui-react': 'packages/ui-react',
  '@atom63/mdx': 'packages/mdx',
}
/* Routes each kind's route check opens; keep them in step with its router. */
const kindRoutes = {
  app: ['/', '/invoices', '/settings', '/welcome', '/sign-in'],
}
const withShadcn = process.argv.includes('--shadcn')
const keep = process.argv.includes('--keep')
const kindFlag = process.argv.indexOf('--kind')
const checkedKinds = kindFlag === -1 ? kinds : [process.argv[kindFlag + 1]]

const work = mkdtempSync(path.join(tmpdir(), 'atom63-starter-'))
const tarballs = path.join(work, 'tarballs')

const run = (command, args, cwd) => {
  process.stdout.write(`\n$ ${command} ${args.join(' ')}\n`)
  execCommandSync(command, args, { cwd, stdio: 'inherit', env: { ...process.env, CI: 'true' } })
}

/** Serve a directory over HTTP on a free local port. */
function serveRegistry(directory) {
  const server = createServer((request, response) => {
    const file = path.join(directory, decodeURIComponent(new URL(request.url, 'http://x').pathname))
    if (!file.startsWith(directory) || !existsSync(file)) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { 'content-type': 'application/json' })
    createReadStream(file).pipe(response)
  })
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() })
    })
  })
}

/* Like run(), but without blocking the event loop, so the registry server in
   this process can answer while the child runs. */
const runAsync = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    process.stdout.write(`\n$ ${command} ${args.join(' ')}\n`)
    const child = spawnCommand(command, args, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    })
    child.on('error', reject)
    child.on('exit', code =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args[0]} exited with ${code}`))
    )
  })

let failed = false
try {
  for (const [name, directory] of Object.entries(packages)) {
    const manifest = JSON.parse(readFileSync(path.join(root, directory, 'package.json'), 'utf8'))
    if (manifest.files?.includes('dist')) {
      const dist = path.join(root, directory, 'dist')
      try {
        readdirSync(dist)
      } catch {
        throw new Error(`${name} has no dist; build it before running the starter check`)
      }
    }
    run('pnpm', ['pack', '--pack-destination', tarballs], path.join(root, directory))
  }
  const tarballFor = name => {
    const prefix = name.replace('@', '').replace('/', '-')
    const file = readdirSync(tarballs).find(entry => entry.startsWith(`${prefix}-`))
    if (!file) throw new Error(`No tarball for ${name}`)
    return `file:${path.join(tarballs, file)}`
  }

  for (const kind of checkedKinds) {
    const app = path.join(work, `app-${kind}`)
    const files = planProject({ name: `starter-check-${kind}`, kind, title: 'Starter check' })
    writeProject(app, files)

    // Point the app, and every package that depends on another, at the tarballs.
    const manifestPath = path.join(app, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const overrides = Object.fromEntries(
      Object.keys(packages).map(name => [name, tarballFor(name)])
    )
    for (const name of Object.keys(packages)) manifest.dependencies[name] = overrides[name]
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    writeFileSync(path.join(app, 'pnpm-workspace.yaml'), pnpmOverridesYaml(overrides))

    run('pnpm', ['install', '--no-frozen-lockfile'], app)
    run('pnpm', ['typecheck'], app)
    run('pnpm', ['build'], app)

    const violations = []
    for (const [relative, text] of files) {
      if (!relative.startsWith('src/')) continue
      const found = relative.endsWith('.css')
        ? scanCss(text)
        : /\.(tsx?|mdx)$/.test(relative)
          ? scanSource(text)
          : []
      for (const violation of found)
        violations.push(`${relative}:${violation.line} ${violation.rule} ${violation.match}`)
    }
    if (violations.length > 0) {
      throw new Error(`The ${kind} starter breaks the craft rules:\n  ${violations.join('\n  ')}`)
    }
    process.stdout.write(`\nThe ${kind} starter passes the craft rules.\n`)

    if (kindRoutes[kind]) {
      const { problems, summary } = await checkRoutes({ appDir: app, routes: kindRoutes[kind] })
      if (problems.length > 0) {
        throw new Error(`The ${kind} starter fails its route check:\n  ${problems.join('\n  ')}`)
      }
      process.stdout.write(`The ${kind} starter passes its route check (${summary}).\n`)
    }

    if (withShadcn && kind === checkedKinds[0]) {
      run(
        'pnpm',
        [
          'dlx',
          'shadcn@latest',
          'add',
          'button',
          '--yes',
          '--overwrite',
          '--path',
          'src/components/ui',
        ],
        app
      )
      writeFileSync(
        path.join(app, 'src/shadcn-check.tsx'),
        "import { Button } from '@/components/ui/button'\n\nexport const ShadcnCheck = () => <Button>shadcn</Button>\n"
      )
      run('pnpm', ['build'], app)

      // The template registry: a page item pulls its blocks in by URL.
      const { url, close } = await serveRegistry(path.join(work, 'registry'))
      try {
        run(
          'node',
          [
            path.join(root, 'scripts/design-system/build-registry.mjs'),
            '--base',
            url,
            '--out',
            path.join(work, 'registry/r'),
          ],
          root
        )
        await runAsync(
          'pnpm',
          ['dlx', 'shadcn@latest', 'add', `${url}/r/list-page.json`, '--yes', '--overwrite'],
          app
        )
      } finally {
        close()
      }
      for (const block of ['data-table-section', 'empty-state', 'app-shell']) {
        const file = path.join(app, `src/components/atom63/blocks/${block}/${block}.tsx`)
        if (!existsSync(file)) throw new Error(`shadcn add list-page did not install ${block}`)
      }
      writeFileSync(
        path.join(app, 'src/template-check.tsx'),
        "import { ListPage } from '@/components/atom63/pages/list-page/list-page'\n\nexport const TemplateCheck = () => <ListPage />\n"
      )
      run('pnpm', ['typecheck'], app)
      run('pnpm', ['build'], app)
    }
  }

  process.stdout.write('\nStarter check passed.\n')
} catch (error) {
  failed = true
  process.stderr.write(`\nStarter check failed: ${error.message}\n`)
} finally {
  if (keep) process.stdout.write(`Kept ${work}\n`)
  else rmSync(work, { recursive: true, force: true })
}
process.exitCode = failed ? 1 : 0
