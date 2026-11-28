// Reads changed file paths, one per line, on stdin and prints `ios=true` or
// `ios=false` for the CI changes job's $GITHUB_OUTPUT.
import { readFileSync } from 'node:fs'

import { affectsIos } from './lib/ios-impact.mjs'

const files = readFileSync(0, 'utf8').split('\n').filter(Boolean)
console.log(`ios=${affectsIos(files)}`)
