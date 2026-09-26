import { describe, expect, it } from 'vitest'
import { WIDGET_CANONICAL_CELL_PX, WIDGET_TYPE_FLOOR, WIDGET_UNIT_BASE_PX } from './widget-units'
import {
  WIDGET_TYPE_RAMP,
  WIDGET_TYPE_ROLE_FLOOR,
  widgetChromeIconStyle,
  widgetTypeDesignPx,
  widgetTypeStyle,
} from './widget-type'

describe('WIDGET_TYPE_RAMP', () => {
  it('covers every ramp role with a floor bucket', () => {
    for (const role of Object.keys(WIDGET_TYPE_RAMP) as Array<keyof typeof WIDGET_TYPE_RAMP>) {
      expect(WIDGET_TYPE_ROLE_FLOOR[role]).toBeDefined()
      expect(WIDGET_TYPE_FLOOR[WIDGET_TYPE_ROLE_FLOOR[role]]).toBeDefined()
    }
  })

  it('keeps chrome quieter than content labels via design-px 14 / floor 10', () => {
    expect(widgetTypeDesignPx('chrome')).toBe(14)
    expect(String(widgetTypeStyle('chrome').fontSize)).toContain('max(10px')
  })

  // The unit is always 188/256, so a role whose design-px resolves below its
  // floor renders AT the floor — which is how label/body/name/title once
  // collapsed onto one 11-12px step. Each content role must now clear its own
  // floor, or the ladder silently flattens again.
  it('resolves every content role above its floor at the 1×1 footprint', () => {
    const unit = WIDGET_CANONICAL_CELL_PX / WIDGET_UNIT_BASE_PX
    const ladder = (['chrome', 'label', 'body', 'name', 'title', 'stat', 'headline'] as const).map(
      role => {
        const recipe = WIDGET_TYPE_RAMP[role]
        const floor =
          'floorPx' in recipe && recipe.floorPx != null
            ? recipe.floorPx
            : WIDGET_TYPE_FLOOR[WIDGET_TYPE_ROLE_FLOOR[role]]
        const rendered = widgetTypeDesignPx(role, 'small') * unit
        expect(rendered).toBeGreaterThanOrEqual(floor)
        return rendered
      }
    )

    // …and the ladder has to stay strictly ascending in the order above.
    for (let i = 1; i < ladder.length; i += 1) {
      expect(ladder[i]).toBeGreaterThan(ladder[i - 1])
    }
  })

  it('keeps the headline readable against body copy rather than level with it', () => {
    const unit = WIDGET_CANONICAL_CELL_PX / WIDGET_UNIT_BASE_PX
    const ratio =
      (widgetTypeDesignPx('headline', 'small') * unit) /
      Math.max(WIDGET_TYPE_FLOOR.body, widgetTypeDesignPx('body', 'small') * unit)
    expect(ratio).toBeGreaterThan(1.5)
  })

  it('gives the display-serif headline room for a second line', () => {
    expect(widgetTypeStyle('headline', 'small').lineHeight).toBe(1.18)
  })

  it('anchors the hand-authored display figures', () => {
    expect(widgetTypeDesignPx('title', 'small')).toBe(20)
    expect(widgetTypeDesignPx('display', 'small')).toBe(48)
    // 2×1 is a SHORT tile, so the hero figure steps DOWN rather than up.
    expect(widgetTypeDesignPx('display', 'medium')).toBe(44)
    expect(widgetTypeDesignPx('display', 'large')).toBe(64)
    expect(widgetTypeDesignPx('displayCompact', 'medium')).toBe(34)
  })

  // Footprint columns are a curve against a FLAT body, not three free values.
  // Unbounded, `title` reached 30 at 2×2 — a 1.76x step over body where 1×1
  // steps 1.18x, so the same hierarchy shouted on the biggest tile. Growth is
  // capped at the `name` curve (~1.22x off the 1×1 value) that the ramp already
  // followed before the heading roles drifted off it.
  it('grows heading roles along one bounded curve, never past 1.3x', () => {
    expect(widgetTypeDesignPx('body', 'small')).toBe(widgetTypeDesignPx('body', 'large'))

    for (const role of ['name', 'title', 'stat', 'headline'] as const) {
      const small = widgetTypeDesignPx(role, 'small')
      const medium = widgetTypeDesignPx(role, 'medium')
      const large = widgetTypeDesignPx(role, 'large')

      // Strictly monotonic: a wider tile must buy the role something, and
      // `headline` used to sit at 26 for both small and medium.
      expect(medium).toBeGreaterThan(small)
      expect(large).toBeGreaterThan(medium)
      expect(large / small).toBeLessThanOrEqual(1.3)
    }
  })

  it('emits floored calc() for label/body and unfloored wu for display', () => {
    const label = widgetTypeStyle('label', 'small')
    const display = widgetTypeStyle('display', 'large')

    expect(String(label.fontSize)).toContain('max(11px')
    expect(String(display.fontSize)).toBe('calc(64 * var(--widget-u, 1px))')
    expect(display.fontWeight).toBe(600)
  })

  it('applies chrome uppercase + tracking extras', () => {
    const chrome = widgetTypeStyle('chrome')
    expect(chrome.textTransform).toBe('uppercase')
    expect(chrome.letterSpacing).toBe('0.025em')
    expect(chrome.fontWeight).toBe(500)
  })

  it('sizes the chrome leading icon just above the label floor', () => {
    const icon = widgetChromeIconStyle()
    expect(String(icon.width)).toContain('max(11px')
    expect(String(icon.height)).toContain('max(11px')
  })

  it('allows weight override for soft display figures', () => {
    const soft = widgetTypeStyle('display', 'small', { weight: 200 })
    expect(soft.fontWeight).toBe(200)
  })
})
