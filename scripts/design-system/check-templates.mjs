/**
 * check:templates — the mechanical gates for packages/templates (T5 in
 * docs/design-system/template-library-plan.md): complete metadata, imports
 * only from @atom63/*, react, lucide-react and the templates source, the
 * Desktop / Phone / Themes stories, and every block used by a page.
 * Craft rules run over the same files in check:craft.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { KINDS, checkTemplates } from './lib/templates-check.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const srcDir = path.join(root, 'packages/templates/src')

const entries = []
for (const dir of Object.keys(KINDS)) {
  const kindDir = path.join(srcDir, dir)
  if (!existsSync(kindDir)) continue
  for (const id of readdirSync(kindDir).sort()) {
    const folder = path.join(kindDir, id)
    const names = readdirSync(folder).filter(name => /\.(ts|tsx)$/.test(name))
    const storyName = names.find(name => /\.stories\.tsx$/.test(name))
    entries.push({
      dir,
      id,
      files: names
        .filter(name => !/\.(stories|test)\.tsx?$/.test(name))
        .map(name => ({
          path: `${dir}/${id}/${name}`,
          source: readFileSync(path.join(folder, name), 'utf8'),
        })),
      storySource: storyName ? readFileSync(path.join(folder, storyName), 'utf8') : null,
    })
  }
}

const problems = checkTemplates(entries)
if (problems.length > 0) {
  console.error(`check:templates found ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
const count = kind => entries.filter(entry => entry.dir === kind).length
console.log(`Templates check passed (${count('pages')} page(s), ${count('blocks')} block(s)).`)
