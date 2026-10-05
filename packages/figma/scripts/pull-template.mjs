import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The site template's token files, the ones buildTemplateFiles edits.
const NAMES = ['index', 'palette', 'axes', 'semantic', 'scale', 'theme'].map(name => `${name}.css`)

/** Copies the template's six token files from a checkout into `toDir`. */
export function pullTemplate(fromDir, toDir) {
  const source = join(fromDir, 'src/styles/tokens')
  for (const name of NAMES)
    if (!existsSync(join(source, name))) throw new Error(`${join(source, name)} does not exist`)
  for (const name of NAMES) copyFileSync(join(source, name), join(toDir, name))
  return NAMES
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const from = process.argv[2]
  if (!from) {
    process.stderr.write('usage: template:pull <path to atom63-site-template>\n')
    process.exit(1)
  }
  const pkg = resolve(fileURLToPath(import.meta.url), '../..')
  pullTemplate(resolve(from), join(pkg, 'template/tokens'))
  execFileSync('node', [join(pkg, 'scripts/embed-template.mjs')], { stdio: 'inherit' })
  process.stdout.write('Copied the template tokens; review the diff, then run the tests.\n')
}
