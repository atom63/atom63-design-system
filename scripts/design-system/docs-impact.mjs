// Reads a pull request's changed file paths, one per line, on stdin and its
// description from PR_BODY. Prints a GitHub warning annotation, and a line in
// the job summary, when a change the docs site describes comes with no docs or
// story change. Always exits 0: the check reminds, it does not block a merge.
import { appendFileSync, readFileSync } from 'node:fs'

import { docsImpact } from './lib/docs-impact.mjs'

const files = readFileSync(0, 'utf8').split('\n').filter(Boolean)
const { status, sources } = docsImpact(files, process.env.PR_BODY ?? '')

const shown = sources.slice(0, 10).join(', ')
const more = sources.length > 10 ? ` and ${sources.length - 10} more` : ''

if (status === 'missing-docs') {
  const message = `This pull request changes ${shown}${more} but no page in apps/docs and no story. Update the docs site (system.atom63.io), or add "Docs: n/a" to the PR description if nothing a reader sees changed.`
  console.log(`::warning title=Docs not updated::${message}`)
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Docs not updated\n\n${message}\n`)
  }
} else if (status === 'opted-out') {
  console.log(`Docs check skipped: the PR description says "Docs: n/a" (${shown}${more}).`)
} else {
  console.log('Docs check: nothing to flag.')
}
