import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/*
 * Contract guard. A contract's top-level `variants` axis tells people and agents
 * which `variant` values to pass (AGENTS.md rule 3), so the React component must
 * accept a `variant` prop. An axis the component draws some other way (from
 * context, or through differently named props) does not belong in `variants`.
 */

const componentsDir = dirname(fileURLToPath(import.meta.url))
const contractsDir = join(
  componentsDir,
  '..',
  '..',
  '..',
  'ui-foundation',
  'contracts',
  'components'
)

const withVariants = readdirSync(contractsDir)
  .filter(file => file.endsWith('.json'))
  .map(file => JSON.parse(readFileSync(join(contractsDir, file), 'utf8')))
  .filter(source => source.contract?.variants)
  .map(source => source.component as string)

describe('contract variants', () => {
  it('finds contracts with a variants axis', () => {
    expect(withVariants.length).toBeGreaterThan(0)
  })

  it.each(withVariants)('%s accepts the variant prop its contract lists', slug => {
    const source = join(componentsDir, slug, `${slug}.tsx`)
    expect(existsSync(source), `${slug}.tsx is missing`).toBe(true)
    expect(readFileSync(source, 'utf8')).toMatch(/\bvariant\??:/)
  })
})
