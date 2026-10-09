import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { buildComponentModel, buttonAnatomy } from '../dist/index.js'
import {
  buttonContract,
  buttonSizes,
} from '../../ui-foundation/src/components/button/button-contract.ts'

// Generates the Button component model from the code contract, the recipe CSS, the token sync model
// and the agent index (its doc block: catalog → agent index → Figma model; run check:index first).
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const output = new URL('../generated/atom63.figma-components.json', import.meta.url)

const model = buildComponentModel({
  css: read('../../ui-react/src/components/button/button.css'),
  contract: { ...buttonContract, sizes: buttonSizes },
  anatomy: buttonAnatomy,
  sync: JSON.parse(read('../../styles/generated/atom63.figma-sync.json')),
  sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
  index: JSON.parse(read('../../cli/generated/agent-index.json')),
  slug: 'button',
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
