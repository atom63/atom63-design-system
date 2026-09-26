import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  changedFiles,
  countJsxElements,
  countTypeErrors,
  findLiterals,
  isMeasuredFile,
  measureSources,
  systemShare,
} from './vibe-measure.mjs'

describe('changedFiles', () => {
  it('lists added, changed and removed files', () => {
    const before = new Map([
      ['src/a.tsx', 'a'],
      ['src/b.tsx', 'b'],
      ['src/c.tsx', 'c'],
    ])
    const after = new Map([
      ['src/a.tsx', 'a'],
      ['src/b.tsx', 'B'],
      ['src/d.tsx', 'd'],
    ])
    assert.deepEqual(changedFiles(before, after), {
      added: ['src/d.tsx'],
      changed: ['src/b.tsx'],
      removed: ['src/c.tsx'],
    })
  })
})

describe('isMeasuredFile', () => {
  it('measures source under src only', () => {
    assert.ok(isMeasuredFile('src/pages/settings.tsx'))
    assert.ok(isMeasuredFile('src/styles.css'))
    assert.ok(!isMeasuredFile('src/vite-env.d.ts'))
    assert.ok(!isMeasuredFile('vite.config.ts'))
    assert.ok(!isMeasuredFile('src/content/post.mdx'))
  })
})

describe('countJsxElements', () => {
  const source = `
import { Button, Card } from '@atom63/ui-react'
import { Page } from '@atom63/ui-react/layout'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { Row } from './row'
import type { ReactNode } from 'react'

type Props = { items: Array<string>; render?: (node: ReactNode) => ReactNode }

function Local() {
  return <span />
}

export function Settings({ items }: Props) {
  const [open] = useState<boolean>(false)
  return (
    <Page>
      <Card>
        <Menu.Root />
        <Link to="/" />
        <Bell />
        <Row />
        <Local />
        <button type="button">Raw</button>
        <input />
        <div>{items.length < 3 ? <p>few</p> : null}</div>
        <Button>Save</Button>
      </Card>
    </Page>
  )
}
`
  it('sorts elements by where they come from', () => {
    const counts = countJsxElements(source)
    assert.equal(counts.system, 3)
    assert.deepEqual(counts.systemNames, { Button: 1, Card: 1, Page: 1 })
    assert.equal(counts.thirdParty, 2)
    assert.equal(counts.icons, 1)
    assert.equal(counts.local, 2)
    assert.equal(counts.interactiveHtml, 2)
    assert.equal(counts.otherHtml, 3)
  })

  it('does not count generics or comparisons as elements', () => {
    const counts = countJsxElements('const a = new Map<string, Array<number>>()\nconst b = 1 < 2\n')
    assert.equal(
      counts.system + counts.thirdParty + counts.local + counts.interactiveHtml + counts.otherHtml,
      0
    )
  })
})

describe('systemShare', () => {
  it('divides system elements by system, third-party and interactive HTML', () => {
    assert.equal(systemShare({ system: 3, thirdParty: 1, interactiveHtml: 2 }), 0.5)
    assert.equal(systemShare({ system: 0, thirdParty: 0, interactiveHtml: 4 }), 0)
    assert.equal(systemShare({ system: 0, thirdParty: 0, interactiveHtml: 0 }), null)
  })
})

describe('findLiterals', () => {
  it('finds palette utilities and literal colors in TSX', () => {
    const found = findLiterals(
      'src/page.tsx',
      `<div className="bg-blue-500 text-gray-600 bg-[#fafafa] text-muted-foreground" style={{ color: '#333', borderColor: 'rgb(0 0 0)' }} />\n<a href="#top" />`
    )
    assert.deepEqual(found.paletteUtilities, ['bg-blue-500', 'text-gray-600', 'bg-[#fafafa]'])
    assert.deepEqual(found.literalColors, ['#333', 'rgb(0'])
  })

  it('finds literal colors in CSS declarations, not selectors', () => {
    const found = findLiterals(
      'src/styles.css',
      '#root { color: #111; background: oklch(0.9 0 0); border-color: var(--a63-border); }'
    )
    assert.deepEqual(found.paletteUtilities, [])
    assert.deepEqual(found.literalColors, ['color: #111', 'background: oklch('])
  })

  it('finds nothing in token-only code', () => {
    const found = findLiterals(
      'src/page.tsx',
      '<div className="bg-background text-muted-foreground border-border" />'
    )
    assert.deepEqual(found, { paletteUtilities: [], literalColors: [] })
  })
})

describe('countTypeErrors', () => {
  it('counts tsc diagnostics', () => {
    const output =
      "src/a.tsx(3,5): error TS2322: Type 'string' is not assignable.\nsrc/b.tsx(1,1): error TS2307: Cannot find module.\n"
    assert.equal(countTypeErrors(output), 2)
    assert.equal(countTypeErrors(''), 0)
  })
})

describe('measureSources', () => {
  it('adds the measures of every file', () => {
    const measures = measureSources(
      new Map([
        [
          'src/pages/a.tsx',
          'import { Button } from \'@atom63/ui-react\'\nexport const A = () => <div className="ml-2 bg-red-500"><Button /><button /></div>\n',
        ],
        ['src/a.css', '.x { color: #fff; }\n'],
      ])
    )
    assert.equal(measures.jsx.system, 1)
    assert.equal(measures.jsx.interactiveHtml, 1)
    assert.equal(measures.share, 0.5)
    assert.deepEqual(measures.literals.paletteUtilities, ['bg-red-500'])
    assert.deepEqual(measures.literals.literalColors, ['color: #fff'])
    assert.deepEqual(measures.craft.map(({ rule }) => rule).sort(), [
      'physical-properties',
      'raw-color',
      'raw-color',
    ])
  })
})
