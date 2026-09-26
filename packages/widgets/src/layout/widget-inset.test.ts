import { describe, expect, it } from 'vitest'
import { WIDGET_BODY_GAP, WIDGET_BODY_INSET, widgetInsetPx, widgetInsetStyle } from './widget-inset'

describe('WIDGET_BODY_INSET', () => {
  it('steps small tighter than medium/large', () => {
    expect(WIDGET_BODY_INSET.small).toBe(16)
    expect(WIDGET_BODY_INSET.medium).toBe(22)
    expect(WIDGET_BODY_INSET.large).toBe(22)
    expect(WIDGET_BODY_GAP.large).toBeGreaterThan(WIDGET_BODY_GAP.small)
  })

  it('emits face padding on all sides and body padding without top', () => {
    const face = widgetInsetStyle('small', 'face')
    const body = widgetInsetStyle('medium', 'body')

    expect(String(face.paddingTop)).toContain('calc(16 * var(--widget-u')
    expect(String(face.paddingInline)).toContain('calc(16 * var(--widget-u')
    expect(String(face.gap)).toContain('calc(11 * var(--widget-u')

    expect(body.paddingTop).toBeUndefined()
    expect(String(body.paddingInline)).toContain('calc(22 * var(--widget-u')
    expect(String(body.paddingBottom)).toContain('calc(22 * var(--widget-u')
  })

  it('can omit gap when the composition owns its own rhythm', () => {
    const style = widgetInsetStyle('large', 'face', { gap: false })
    expect(style.gap).toBeUndefined()
    expect(widgetInsetPx('large')).toBe(22)
  })
})
