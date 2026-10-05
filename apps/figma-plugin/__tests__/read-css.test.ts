import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { orderCssFiles, readProject } from '../src/app/read-css'

const dir = resolve(__dirname, '../../../packages/figma/test/fixtures/project-tokens')
const fixture = readdirSync(dir).map(name => ({
  name,
  text: readFileSync(resolve(dir, name), 'utf8'),
}))

describe('orderCssFiles', () => {
  it('puts files in the order index.css imports them, then the rest by name', () => {
    const files = [
      { name: 'zeta.css', text: '' },
      { name: 'theme.css', text: '' },
      { name: 'palette.css', text: '' },
      { name: 'index.css', text: '@import "./palette.css";\n@import "./theme.css";' },
    ]
    expect(orderCssFiles(files).map(file => file.name)).toEqual([
      'palette.css',
      'theme.css',
      'index.css',
      'zeta.css',
    ])
  })
})

describe('readProject', () => {
  it('reads token CSS into a model with its styles', () => {
    const project = readProject(orderCssFiles(fixture))
    expect(project.model.summary.variables).toBeGreaterThan(300)
    expect(project.model.styles?.text.map(style => style.name)).toContain('Text/base')
    expect(project.model.styles?.effects.map(style => style.name)).toContain('Shadow/md')
  })
})
