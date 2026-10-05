import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// @ts-expect-error -- a plain ES module script without types
import { pullTemplate } from '../scripts/pull-template.mjs'

const NAMES = ['index', 'palette', 'axes', 'semantic', 'scale', 'theme']

function templateDir(skip?: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'template-'))
  mkdirSync(join(dir, 'src/styles/tokens'), { recursive: true })
  for (const name of NAMES)
    if (name !== skip) writeFileSync(join(dir, 'src/styles/tokens', `${name}.css`), `/* ${name} */`)
  writeFileSync(join(dir, 'src/styles/tokens', 'extra.css'), '/* not copied */')
  return dir
}

describe('pullTemplate', () => {
  it('copies exactly the six token files', () => {
    const to = mkdtempSync(join(tmpdir(), 'copy-'))
    expect(pullTemplate(templateDir(), to)).toEqual(NAMES.map(name => `${name}.css`))
    expect(readFileSync(join(to, 'axes.css'), 'utf8')).toBe('/* axes */')
    expect(() => readFileSync(join(to, 'extra.css'))).toThrow()
  })

  it('refuses a checkout without one of the files', () => {
    expect(() => pullTemplate(templateDir('theme'), mkdtempSync(join(tmpdir(), 'copy-')))).toThrow(
      'theme.css'
    )
  })
})
