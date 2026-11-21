import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  analyseSource,
  countLiteralColors,
  extractSlotNames,
  isAnalysedFile,
  summariseApp,
} from './adoption.mjs'

const systemPackages = ['@atom63/ui-react', '@atom63/mdx', '@atom63/styles']

const page = `
import { Button, Dialog } from '@atom63/ui-react'
import * as Menu from '@atom63/ui-react/menu'
import { Logo } from '@atom63/brand'
import { Sheet } from '@/components/ui/sheet'
import { toast } from 'sonner'
import * as RadixPopover from '@radix-ui/react-popover'
import { Local } from './local'

export function Page() {
  return (
    <main>
      <Button>Save</Button>
      <Button variant="ghost">Cancel</Button>
      <Dialog />
      <Menu.Root><Menu.Item /></Menu.Root>
      <Logo />
      <Local />
      <button type="button">raw</button>
      <input />
      <select><option /></select>
      <textarea />
      <dialog open />
      <a href="/x" onClick={() => {}}>go</a>
      <a href="/y">plain link</a>
      <div role="button" tabIndex={0} />
      <span role={'button'} />
      <div role="link" />
    </main>
  )
}
`

describe('analyseSource', () => {
  const result = analyseSource(page, 'src/routes/page.tsx', { systemPackages })

  it('finds system imports, including subpath imports, and any @atom63 import', () => {
    assert.equal(result.importsSystem, true)
    assert.equal(result.importsAtom63, true)
    assert.deepEqual(result.systemPackagesImported, ['@atom63/ui-react'])
  })

  it('counts system components by tag, not local or non-system @atom63 ones', () => {
    assert.deepEqual(result.systemComponents, {
      Button: 2,
      Dialog: 1,
      'Menu.Root': 1,
      'Menu.Item': 1,
    })
  })

  it('counts hand-written interactive elements', () => {
    assert.deepEqual(result.handwritten, {
      button: 1,
      input: 1,
      select: 1,
      textarea: 1,
      dialog: 1,
      'a[onClick]': 1,
      '[role=button]': 2,
    })
  })

  it('lists other UI libraries and shadcn-style copies', () => {
    assert.deepEqual(result.otherUiImports, [
      'components/ui/sheet',
      'sonner',
      '@radix-ui/react-popover',
    ])
  })

  it('resolves relative imports into components/ui, but not imports inside it', () => {
    const outside = analyseSource(`import { X } from '../ui/button'`, 'src/components/app/a.tsx', {
      systemPackages,
    })
    assert.deepEqual(outside.otherUiImports, ['components/ui/button'])
    const inside = analyseSource(`import { X } from './button'`, 'src/components/ui/sheet.tsx', {
      systemPackages,
    })
    assert.deepEqual(inside.otherUiImports, [])
  })

  it('reports a file without system imports', () => {
    const plain = analyseSource(
      `import { Logo } from '@atom63/brand'\nexport const A = () => <Logo />`,
      'a.tsx',
      {
        systemPackages,
      }
    )
    assert.equal(plain.importsSystem, false)
    assert.equal(plain.importsAtom63, true)
    assert.deepEqual(plain.systemComponents, {})
  })
})

describe('countLiteralColors', () => {
  it('counts palette utilities and colour values in source', () => {
    const source = `const a = <div className="bg-blue-500 text-gray-600 p-4" style={{ color: '#ff0000' }} />`
    assert.deepEqual(countLiteralColors('a.tsx', source), {
      paletteUtilities: 2,
      literalColors: 1,
      localTokenDefinitions: 0,
    })
  })

  it('ignores token utilities and prose such as an order number', () => {
    const source = `const a = <p className="bg-surface-page text-text-primary">Order #1042</p>`
    assert.deepEqual(countLiteralColors('a.tsx', source), {
      paletteUtilities: 0,
      literalColors: 0,
      localTokenDefinitions: 0,
    })
  })

  it('counts CSS custom-property definitions apart from other literals', () => {
    const css = `:root { --brand: #112233; }\n.card { color: rgb(0 0 0); background: var(--a63-surface-page); }`
    assert.deepEqual(countLiteralColors('a.css', css), {
      paletteUtilities: 0,
      literalColors: 1,
      localTokenDefinitions: 1,
    })
  })
})

describe('extractSlotNames', () => {
  it('reads data-slot literals in JSX and in props objects', () => {
    const source = `<span data-slot="button-label" />\nconst p = { 'data-slot': 'dialog-popup' }\n<div data-slot={'card'} />\n<div data-slot={slot} />`
    assert.deepEqual(extractSlotNames(source), ['button-label', 'dialog-popup', 'card'])
  })
})

describe('isAnalysedFile', () => {
  it('skips tests, declarations and generated route trees', () => {
    assert.ok(isAnalysedFile('src/a.tsx'))
    assert.ok(isAnalysedFile('src/a.css'))
    assert.ok(!isAnalysedFile('src/a.test.tsx'))
    assert.ok(!isAnalysedFile('src/__tests__/a.tsx'))
    assert.ok(!isAnalysedFile('src/a.d.ts'))
    assert.ok(!isAnalysedFile('src/routeTree.gen.ts'))
    assert.ok(!isAnalysedFile('src/a.md'))
  })
})

describe('summariseApp', () => {
  it('adds up files and ranks system components', () => {
    const summary = summariseApp(
      [
        { relative: 'src/page.tsx', text: page },
        {
          relative: 'src/plain.tsx',
          text: 'export const A = () => <div className="bg-red-500" />',
        },
        { relative: 'src/components/ui/sheet.tsx', text: 'export const Sheet = () => <div />' },
        { relative: 'src/theme.css', text: ':root { --x: #fff; }' },
      ],
      { systemPackages, top: 2 }
    )
    assert.equal(summary.tsxFiles, 3)
    assert.equal(summary.tsxFilesImportingSystem, 1)
    assert.deepEqual(summary.tsxFilesByPackage, { '@atom63/ui-react': 1 })
    assert.equal(summary.systemComponentUses, 5)
    assert.equal(summary.distinctSystemComponents, 4)
    assert.deepEqual(summary.topSystemComponents, [
      { name: 'Button', count: 2 },
      { name: 'Dialog', count: 1 },
    ])
    assert.equal(summary.handwrittenTotal, 8)
    assert.deepEqual(summary.otherUiLibraries, {
      '@radix-ui/react-popover': 1,
      'components/ui/sheet': 1,
      sonner: 1,
    })
    assert.deepEqual(summary.shadcnCopyFiles, ['src/components/ui/sheet.tsx'])
    assert.deepEqual(summary.literalColors, {
      paletteUtilities: 1,
      literalColors: 0,
      localTokenDefinitions: 1,
    })
    assert.deepEqual(summary.topLiteralColorFiles, [{ file: 'src/plain.tsx', count: 1 }])
  })
})
