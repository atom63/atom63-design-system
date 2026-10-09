import { differenceLine, propertyName, readableValue, variantName } from '../src/app/difference'

describe('differenceLine', () => {
  it('reads a paint difference the way a person would say it', () => {
    expect(
      differenceLine('Button', {
        variant: 'Variant=primary, Size=md, State=rest',
        what: 'Variant=primary, Size=md, State=rest.fills',
        actual: '[]',
        expected: '{"bound":"action/primary","color":{"r":0.02,"g":0.365,"b":0.824,"a":1}}',
      })
    ).toBe('Button · primary / md / rest — fill: none → action/primary')
  })

  it('leaves out values the engine did not report', () => {
    expect(differenceLine('Button', { variant: 'Size=Large', what: 'Label property' })).toBe(
      'Button · Large — Label property'
    )
  })
})

describe('variantName and propertyName', () => {
  it('joins the variant coordinates by their values', () => {
    expect(variantName('Variant=primary, Size=md, State=rest')).toBe('primary / md / rest')
    expect(variantName('Default')).toBe('Default')
  })

  it('drops the variant from the path and names the property', () => {
    expect(propertyName('Size=md', 'Size=md.strokes')).toBe('stroke')
    expect(propertyName('Size=md', 'Label.fontName')).toBe('Label font')
    expect(propertyName('Size=md', 'Size=md.paddingLeft')).toBe('paddingLeft')
  })
})

describe('readableValue', () => {
  it('names a bound paint by its variable and a literal one by hex', () => {
    expect(
      readableValue(
        '[{"type":"SOLID","color":{"r":1,"g":1,"b":1},"opacity":1,"bound":"surface/page"}]'
      )
    ).toBe('surface/page')
    expect(readableValue('[{"type":"SOLID","color":{"r":1,"g":0,"b":0},"opacity":0.5}]')).toBe(
      '#FF0000 at 50%'
    )
    expect(readableValue('{"color":{"r":0,"g":0,"b":0,"a":1}}')).toBe('#000000')
  })

  it('shows numbers plainly and nothing as none', () => {
    expect(readableValue('12')).toBe('12')
    expect(readableValue('1200.5')).toBe('1,200.5')
    expect(readableValue('{"value":8,"bound":[]}')).toBe('8')
    expect(readableValue('{"bound":[]}')).toBe('none')
    expect(readableValue('[]')).toBe('none')
    expect(readableValue('null')).toBe('none')
    expect(readableValue(undefined)).toBe('none')
  })

  it('reads fonts, sizes, flags and other objects without JSON', () => {
    expect(
      readableValue('{"font":{"family":"Inter","style":"Medium"},"family":[],"weight":[]}')
    ).toBe('Inter Medium')
    expect(readableValue('{"width":24,"height":32}')).toBe('24 × 32')
    expect(readableValue('{"value":false,"bound":[]}')).toBe('no')
    expect(readableValue('"ABSOLUTE"')).toBe('ABSOLUTE')
    expect(readableValue('{"mode":"light","count":2}')).toBe('mode light, count 2')
  })

  it('keeps a cut value readable', () => {
    expect(readableValue('{"bound":"action/primary","color":{"r":0.0…')).toBe('action/primary')
    expect(readableValue('[{"type":"GRADIENT_LINEAR","opa…')).toBe('type GRADIENT_LINEAR, opa…')
  })
})
