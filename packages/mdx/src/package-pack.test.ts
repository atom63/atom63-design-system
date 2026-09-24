import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)

async function getPackedFilePaths() {
  const { stdout } = await execFileAsync('npm', ['pack', '--dry-run', '--json'], {
    cwd: resolve(import.meta.dirname, '..'),
    maxBuffer: 1024 * 1024,
  })
  const [manifest] = JSON.parse(stdout) as [{ files: { path: string }[] }]
  return new Set(manifest.files.map(file => file.path))
}

async function getPackageJson() {
  const packageJson = await readFile(resolve(import.meta.dirname, '..', 'package.json'), 'utf8')
  return JSON.parse(packageJson) as {
    exports: Record<
      string,
      string | { '@atom63/source'?: string; import?: string; types?: string; typescript?: string }
    >
  }
}

const publicExportSpecifiers = [
  '.',
  './blocks',
  './blocks/credits-block',
  './blocks/media-caption',
  './article',
  './editor',
  './lightbox',
  './runtime',
  './primitives',
  './styles/index.css',
  './styles/a63.css',
  './styles/shadcn.css',
  './styles/mdx-blocks.css',
  './styles/consumer.css',
] as const

describe('package tarball', () => {
  it('publishes built entrypoints without private source files', async () => {
    const files = await getPackedFilePaths()

    expect(files).toContain('API.md')
    expect(files).toContain('CONTRIBUTING.md')
    expect(files).toContain('dist/index.js')
    expect(files).toContain('dist/index.d.ts')
    expect(files).toContain('src/styles/index.css')
    expect(files).toContain('src/styles/a63.css')
    expect(files).toContain('src/styles/base.css')
    expect(files).toContain('src/styles/block-recipes.css')
    expect(files).toContain('src/styles/shadcn.css')
    expect(files).toContain('src/styles/consumer.css')
    expect(files).toContain('src/styles/mdx-blocks.css')
    expect(files).toContain('src/blocks/callout/callout.css')
    expect(files).toContain('src/blocks/code-block/code-block.css')
    expect(files).toContain('dist/editor/index.js')
    expect(files).toContain('dist/editor/index.d.ts')
    expect(files).toContain('dist/runtime/index.js')
    expect(files).toContain('dist/runtime/index.d.ts')
    expect(files).not.toContain('src/index.ts')
    expect(files).not.toContain('src/foundations/notice/notice-block.tsx')
    expect(files).not.toContain('src/package-pack.test.ts')
    expect(files).not.toContain('src/blocks/callout/callout.stories.tsx')
    expect(files).not.toContain('src/test/setup.ts')
  }, 90_000)

  it('keeps the public export map intentional, with JS from dist and CSS from src', async () => {
    const packageJson = await getPackageJson()

    expect(Object.keys(packageJson.exports)).toEqual(publicExportSpecifiers)

    for (const [specifier, target] of Object.entries(packageJson.exports)) {
      if (typeof target === 'string') {
        expect(specifier).toMatch(/\.css$/)
        expect(target).toMatch(/^\.\/src\/.+\.css$/)
        continue
      }

      expect(target.types).toMatch(/^\.\/dist\/.+\.d\.ts$/)
      expect(target.import).toMatch(/^\.\/dist\/.+\.js$/)
      expect(target['@atom63/source']).toMatch(/^\.\/src\/.+\.ts$/)
      expect(target.typescript).toBeUndefined()
    }
  })

  it('documents every public export in the API snapshot', async () => {
    const api = await readFile(resolve(import.meta.dirname, '..', 'API.md'), 'utf8')
    const packageJson = await getPackageJson()

    for (const specifier of Object.keys(packageJson.exports)) {
      const documentedImport =
        specifier === '.' ? '@atom63/mdx' : `@atom63/mdx${specifier.slice(1)}`
      expect(api).toContain(`\`${documentedImport}\``)
    }
  })
})
