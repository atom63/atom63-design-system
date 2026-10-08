import { createFakeNodes } from './fake-nodes'

describe('the Figma node fake', () => {
  it('creates a page and a component and reads them back', async () => {
    const fake = createFakeNodes()
    const page = fake.figma.createPage()
    page.name = 'Components'
    const component = fake.figma.createComponent()
    component.name = 'Variant=default'
    const label = fake.figma.createText()
    label.name = 'Label'
    component.appendChild(label)
    const set = fake.figma.combineAsVariants([component], page)
    set.name = 'Button'

    const found = fake.figma.root.children.find(item => item.name === 'Components')!
    await found.loadAsync()
    expect(found.children.map(node => [node.type, node.name])).toEqual([
      ['COMPONENT_SET', 'Button'],
    ])
    expect(fake.findVariant('Button', 'Variant=default')).toBe(component)
    expect(component.parent).toBe(set)
    expect(component.children!.map(node => node.name)).toEqual(['Label'])
    expect(set.componentPropertyDefinitions).toEqual({
      Variant: { type: 'VARIANT', defaultValue: 'default' },
    })
  })

  it('fails where Figma fails', async () => {
    const fake = createFakeNodes()
    const frame = fake.figma.createFrame()
    expect(() => (frame.fills as unknown[]).push({})).toThrow()
    expect(() => {
      ;(frame as { width: number }).width = 10
    }).toThrow()
    expect(() => frame.setBoundVariable('cornerRadius', null)).toThrow()
    const text = fake.figma.createText()
    expect(() => {
      text.characters = 'Hi'
    }).toThrow(/unloaded font/)
    await fake.figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    text.characters = 'Hi'
    expect(() => frame.appendChild(frame)).toThrow()
    text.name = 'Label'
    frame.appendChild(text)
    expect(() => {
      text.componentPropertyReferences = { characters: 'Label#1:0' }
    }).toThrow()
  })

  it('counts writes and binds paints by returning new objects', async () => {
    const fake = createFakeNodes()
    const collection = fake.api.createVariableCollection('Base')
    const color = fake.api.createVariable('neutral', collection, 'COLOR')
    const frame = fake.figma.createFrame()
    const before = fake.writes
    const paint = { type: 'SOLID' as const, color: { r: 0, g: 0, b: 0 } }
    const bound = fake.figma.variables.setBoundVariableForPaint(paint, 'color', color)
    expect(paint).not.toHaveProperty('boundVariables')
    frame.fills = [bound]
    expect(frame.fills[0].boundVariables?.color?.id).toBe(color.id)
    expect(fake.writes).toBe(before + 2)
  })
})
