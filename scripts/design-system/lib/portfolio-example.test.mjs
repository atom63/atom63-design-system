import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { planPortfolioExample, portfolioExampleDrift } from './portfolio-example.mjs'

describe('examples/portfolio', () => {
  it('takes the design system packages from the workspace', () => {
    const manifest = JSON.parse(planPortfolioExample().get('package.json'))
    assert.equal(manifest.dependencies['@atom63/ui-react'], 'workspace:*')
    assert.equal(manifest.dependencies['@atom63/agent'], 'workspace:*')
  })

  it('matches the portfolio starter', () => {
    const drift = portfolioExampleDrift()
    assert.deepEqual(
      drift,
      [],
      'examples/portfolio is out of date; run pnpm generate:example:portfolio'
    )
  })
})
