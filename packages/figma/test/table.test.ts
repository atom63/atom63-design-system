import { resolve } from 'node:path'

import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { checkModel, syncModel } from '../src/runtime'
import { deriveStyles } from '../src/styles'
import { readTokenTable } from '../src/table'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))
const model = { ...project.model, styles: deriveStyles(project.model, project.raw) }

describe('in-process sync', () => {
  it('syncs a token set with its styles and verifies it', async () => {
    const fake = createFakeFigma()
    const outcome = await syncModel(fake.figma, model)
    expect(outcome.applied.created).toBe(model.summary.variables)
    expect(outcome.verification).toMatchObject({ create: 0, update: 0 })
    expect(outcome.styles?.verification).toMatchObject({ create: [], update: [] })
  })

  it('checks a synced file as unchanged', async () => {
    const fake = createFakeFigma()
    await syncModel(fake.figma, model)
    const outcome = await checkModel(fake.figma, model)
    expect(outcome.planned).toMatchObject({ create: 0, update: 0 })
    expect(outcome.styles).toMatchObject({ create: [], update: [] })
  })
})

describe('readTokenTable', () => {
  it('reads an empty file as empty', async () => {
    expect(await readTokenTable(createFakeFigma().figma)).toEqual({
      collections: [],
      variables: 0,
      textStyles: 0,
      effectStyles: 0,
    })
  })

  it('counts the variables written from code and the styles', async () => {
    const fake = createFakeFigma()
    await syncModel(fake.figma, model)
    const table = await readTokenTable(fake.figma)
    expect(table.variables).toBe(model.summary.variables)
    expect(table.collections.map(item => item.name)).toEqual(
      model.collections.map(item => item.name)
    )
    expect(table.textStyles).toBe(model.styles.text.length)
    expect(table.effectStyles).toBe(model.styles.effects.length)
  })

  it('does not count a variable made in Figma', async () => {
    const fake = createFakeFigma()
    await syncModel(fake.figma, model)
    const collection = (await fake.api.getLocalVariableCollectionsAsync())[0]
    fake.api.createVariable('my-accent', collection, 'COLOR')
    expect((await readTokenTable(fake.figma)).variables).toBe(model.summary.variables)
  })
})
