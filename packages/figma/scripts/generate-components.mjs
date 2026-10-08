import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { buttonAnatomy, readRecipe } from '../dist/index.js'
import {
  buttonContract,
  buttonSizes,
} from '../../ui-foundation/src/components/button/button-contract.ts'

// Generates the Button component model from the code contract, the recipe CSS and the token sync model.
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const output = new URL('../generated/atom63.figma-components.json', import.meta.url)

const model = readRecipe({
  css: read('../../ui-react/src/components/button/button.css'),
  contract: { ...buttonContract, sizes: buttonSizes },
  anatomy: buttonAnatomy,
  sync: JSON.parse(read('../../styles/generated/atom63.figma-sync.json')),
  sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
})
const text = `${JSON.stringify(model, null, 2)}\n`

if (process.argv.includes('--check')) {
  const current = existsSync(output) ? readFileSync(output, 'utf8') : ''
  if (current !== text) {
    console.error(
      'generated/atom63.figma-components.json is stale; run pnpm --filter @atom63/figma generate:components'
    )
    process.exit(1)
  }
  console.log('generated/atom63.figma-components.json is up to date')
} else {
  writeFileSync(output, text)
  console.log(
    `wrote generated/atom63.figma-components.json: ${model.variants.length} variants, ` +
      `${model.tokens.length} tokens, ${model.literals.length} literals, ${model.skipped.length} skipped`
  )
}
