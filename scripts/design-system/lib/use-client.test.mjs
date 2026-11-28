import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  addDirective,
  hasUseClient,
  isBarrel,
  needsUseClient,
  planUseClient,
} from './use-client.mjs'

const sources = {
  'src/button.tsx': `'use client'\nimport { useState } from 'react'\nexport function Button() {}`,
  'src/button/index.ts': `/* Button */\nexport { Button } from '../button'\nexport type { ButtonProps } from '../button'`,
  'src/provider.tsx': `/** Docs. */\n"use client";\nexport const UIProvider = () => null`,
  'src/provider-entry.ts': `'use client'\nexport { UIProvider } from './provider'`,
  'src/options.ts': `export const THEME_OPTIONS = ['modern']`,
  'src/menu.tsx': `'use client'\nexport function Menu() {}`,
  'src/helper.ts': `export const helper = () => 1`,
}
const read = file => sources[file]
const output = (inputs, entryPoint) => ({
  inputs: Object.fromEntries(inputs.map(file => [file, {}])),
  ...(entryPoint ? { entryPoint } : {}),
})

describe('use-client', () => {
  it('detects the directive after comments, and barrels', () => {
    assert.equal(hasUseClient(sources['src/provider.tsx']), true)
    assert.equal(hasUseClient(sources['src/options.ts']), false)
    assert.equal(isBarrel(sources['src/button/index.ts']), true)
    assert.equal(isBarrel(sources['src/helper.ts']), false)
  })

  it('marks outputs holding client modules and barrels, and client entry stubs', () => {
    const metafile = {
      outputs: {
        'dist/chunk-A.js': output(['src/button.tsx', 'src/button/index.ts']),
        'dist/chunk-A.js.map': output([]),
        'dist/provider.js': output([], 'src/provider-entry.ts'),
        'dist/chunk-B.js': output(['src/provider.tsx', 'node_modules/x/index.js']),
        'dist/options.js': output(['src/options.ts'], 'src/options.ts'),
      },
    }
    const { mark, failures } = planUseClient(metafile, read)
    assert.deepEqual(mark, ['dist/chunk-A.js', 'dist/provider.js', 'dist/chunk-B.js'])
    assert.deepEqual(failures, [])
  })

  it('fails when a client module shares a file with an undeclared module, and passes once declared', () => {
    const metafile = { outputs: { 'dist/theme.js': output(['src/menu.tsx', 'src/options.ts']) } }
    const failing = planUseClient(metafile, read)
    assert.deepEqual(failing.mark, [])
    assert.equal(failing.failures.length, 1)
    assert.match(failing.failures[0], /src\/menu\.tsx.*src\/options\.ts/)

    const declared = planUseClient(metafile, read, { serverSafe: ['src/options.ts'] })
    assert.deepEqual(declared.failures, [])
    assert.deepEqual(declared.unmarked, [
      { output: 'dist/theme.js', client: ['src/menu.tsx'], serverSafe: ['src/options.ts'] },
    ])
  })

  it('fails on a stale or wrong server-safe declaration', () => {
    const metafile = { outputs: { 'dist/menu.js': output(['src/menu.tsx']) } }
    const { failures } = planUseClient(metafile, read, {
      serverSafe: ['src/menu.tsx', 'src/gone.ts'],
    })
    assert.equal(failures.length, 2)
  })

  it('prepends the directive once and shifts the source map by a line', () => {
    const { code, map } = addDirective('export {}\n', JSON.stringify({ mappings: 'AAAA' }))
    assert.equal(code, `'use client';\nexport {}\n`)
    assert.equal(JSON.parse(map).mappings, ';AAAA')
    assert.equal(addDirective(code, undefined).code, code)
  })

  it('flags a component that calls a hook without the directive', () => {
    assert.equal(
      needsUseClient(
        `import * as React from 'react'\nexport const C = () => { const id = React.useId(); return <div id={id} /> }`
      ),
      true
    )
    assert.equal(
      needsUseClient(
        `export function C() { const ref = useRef<HTMLDivElement>(null); return <div ref={ref} /> }`
      ),
      true
    )
    assert.equal(
      needsUseClient(`export function C() { const value = use(promise); return <p>{value}</p> }`),
      true
    )
    assert.equal(needsUseClient(`export function C(props) { return useRender({ props }) }`), true)
  })

  it('passes a client component, a server component and hook names that are not calls', () => {
    assert.equal(
      needsUseClient(`'use client'\nexport function C() { useState(0); return null }`),
      false
    )
    assert.equal(
      needsUseClient(
        `/** Docs. */\n"use client";\nexport function C() { useState(0); return null }`
      ),
      false
    )
    assert.equal(
      needsUseClient(`// useState() in a comment\nexport const C = () => <p>{'useState()'}</p>`),
      false
    )
    assert.equal(
      needsUseClient(
        `export const C = () => <p />\nexport function useThing() {}\nconst user = reuse(1)\nobj.useMemo()`
      ),
      false
    )
  })
})
