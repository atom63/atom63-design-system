import assert from 'node:assert/strict'
import { it } from 'node:test'

import { pnpmOverridesYaml } from './pnpm-overrides.mjs'

it('writes each override as a quoted key and spec', () => {
  assert.equal(
    pnpmOverridesYaml({
      '@atom63/styles': 'file:/tmp/atom63-styles-0.1.0.tgz',
      '@atom63/ui-react': 'file:/tmp/a b/atom63-ui-react.tgz',
    }),
    'overrides:\n  "@atom63/styles": "file:/tmp/atom63-styles-0.1.0.tgz"\n  "@atom63/ui-react": "file:/tmp/a b/atom63-ui-react.tgz"\n'
  )
})
