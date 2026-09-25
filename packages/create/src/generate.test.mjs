import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, describe, it } from 'node:test'

import {
  packageName,
  planProject,
  resolveVersions,
  titleFromName,
  writeProject,
} from './generate.mjs'

const files = planProject({ name: 'my-site', date: '2026-09-25' })
const manifest = JSON.parse(files.get('package.json'))

describe('planProject', () => {
  it('writes the base and the site kind', () => {
    for (const file of [
      '.gitignore',
      'AGENTS.md',
      'components.json',
      'index.html',
      'src/main.tsx',
      'src/styles.css',
      'src/theme.tsx',
      'src/router.tsx',
      'src/pages/home.tsx',
      'src/pages/blog-post.tsx',
      'src/content/blog/hello-world.mdx',
      'vite.config.ts',
    ]) {
      assert.ok(files.has(file), file)
    }
    assert.ok(!files.has('_gitignore'))
  })

  it('fills the title and date placeholders everywhere', () => {
    for (const [file, content] of files) assert.doesNotMatch(content, /\{\{\w+\}\}/, file)
    assert.match(files.get('index.html'), /<title>My site<\/title>/)
    assert.match(files.get('src/content/blog/hello-world.mdx'), /date: '2026-09-25'/)
  })

  it('pins the design system packages to their versions in this repo', () => {
    const version = name =>
      JSON.parse(readFileSync(new URL(`../../${name}/package.json`, import.meta.url), 'utf8'))
        .version
    assert.equal(manifest.dependencies['@atom63/ui-react'], version('ui-react'))
    assert.equal(manifest.dependencies['@atom63/styles'], version('styles'))
    assert.equal(manifest.dependencies['@atom63/mdx'], version('mdx'))
    assert.match(manifest.devDependencies.vite, /^\^\d/)
    assert.equal(manifest.devDependencies.tailwindcss, resolveVersions().tailwindcss)
  })

  it('wires Tailwind, the token stack, the shadcn bridge and MDX', () => {
    const css = files.get('src/styles.css')
    assert.ok(css.indexOf("@import 'tailwindcss'") < css.indexOf("@import '@atom63/styles'"))
    assert.match(css, /@import '@atom63\/styles\/compat\/shadcn'/)
    assert.match(css, /@import '@atom63\/mdx\/styles\/a63\.css'/)
    assert.match(css, /@custom-variant dark/)
    assert.match(files.get('vite.config.ts'), /@mdx-js\/rollup/)
    assert.equal(JSON.parse(files.get('components.json')).aliases.utils, '@/lib/utils')
  })

  it('gives agents the docs-variant guidance and the rules', () => {
    const agents = files.get('AGENTS.md')
    assert.match(agents, /^# My site/)
    assert.match(agents, /https:\/\/system\.atom63\.io\/llms\.txt/)
    assert.match(agents, /<!-- atom63:agents:start/)
  })

  it('refuses an unknown kind', () => {
    assert.throws(() => planProject({ name: 'x', kind: 'shop' }), /Unknown kind "shop"/)
  })
})

describe('names', () => {
  it('derives an npm-safe name and a title', () => {
    assert.equal(packageName('/tmp/My Site!'), 'my-site')
    assert.equal(titleFromName('my-new_site'), 'My new site')
  })
})

describe('writeProject', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'atom63-create-test-'))
  after(() => rmSync(directory, { recursive: true, force: true }))

  it('writes into an empty directory and refuses a non-empty one', () => {
    const target = path.join(directory, 'app')
    writeProject(target, new Map([['src/a.txt', 'a']]))
    assert.equal(readFileSync(path.join(target, 'src/a.txt'), 'utf8'), 'a')
    writeFileSync(path.join(directory, 'taken.txt'), 'x')
    assert.throws(() => writeProject(directory, new Map([['b.txt', 'b']])), /not empty/)
  })
})
