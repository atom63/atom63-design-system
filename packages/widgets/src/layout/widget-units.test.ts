import { describe, expect, it } from 'vitest'
import {
  WIDGET_CANONICAL_CELL_PX,
  WIDGET_MAX_PRESENTATION_SCALE,
  WIDGET_TYPE_FLOOR,
  WIDGET_UNIT_BASE_PX,
  WIDGET_UNIT_SPAN,
} from './widget-units'

describe('WIDGET_UNIT_SPAN', () => {
  it('defines the three widget shapes in widget units', () => {
    expect(WIDGET_UNIT_SPAN).toEqual({
      small: { cols: 1, rows: 1 },
      medium: { cols: 2, rows: 1 },
      large: { cols: 2, rows: 2 },
    })
  })

  it('uses a 256px design canvas per widget unit', () => {
    expect(WIDGET_UNIT_BASE_PX).toBe(256)
  })

  it('uses the OS63 cell as the 100% presentation size', () => {
    expect(WIDGET_CANONICAL_CELL_PX).toBe(188)
    expect(WIDGET_MAX_PRESENTATION_SCALE).toBe(1.375)
  })
})

describe('WIDGET_TYPE_FLOOR', () => {
  it('floors label and body type but leaves display unfloored', () => {
    expect(WIDGET_TYPE_FLOOR).toEqual({ label: 11, body: 12, display: 0 })
  })
})
