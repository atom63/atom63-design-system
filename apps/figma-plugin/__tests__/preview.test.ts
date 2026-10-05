import { brandRamp, buildTemplateFiles, TEMPLATE_DEFAULTS } from '@atom63/figma'
import { previewValues } from '../src/app/preview'
import { readProject } from '../src/app/read-css'

const preview = (choices = TEMPLATE_DEFAULTS) =>
  previewValues(readProject(buildTemplateFiles(choices)).model)

describe('previewValues', () => {
  it('resolves primary through brand to the generated ramp', () => {
    const values = preview({ ...TEMPLATE_DEFAULTS, brand: '#e11d48' })
    expect(values.primary).toBe(brandRamp('#e11d48')[6])
  })

  it('follows the chosen radius and type scale', () => {
    expect(preview()).toMatchObject({ radius: 10, textSize: 15, textLeading: 23 })
    expect(preview({ ...TEMPLATE_DEFAULTS, radius: 'round', typeScale: 'large' })).toMatchObject({
      radius: 15,
      textSize: 18,
    })
  })

  it('uses the chosen font', () => {
    expect(preview({ ...TEMPLATE_DEFAULTS, font: 'Inter' }).font).toBe('Inter')
  })

  it('reads light-mode surfaces', () => {
    const values = preview()
    expect(values.background).toMatch(/^rgba\(/)
    expect(values.border).toMatch(/^rgba\(/)
  })
})
