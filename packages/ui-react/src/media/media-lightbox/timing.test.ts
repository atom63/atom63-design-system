import { describe, expect, it } from 'vitest'
import { applyTimingVars, clearTimingVars, LIGHTBOX_TIMING } from './timing'

describe('lightbox timing presets', () => {
  it('keeps `default` identical to the current hand-tuned motion', () => {
    // 360ms + emphasized easing 是拆分前 CSS 里写死的值。default 预设必须
    // 逐字复现它，否则"零观感变化"这个锚点就没了。
    expect(LIGHTBOX_TIMING.default.vtDurationMs).toBe(360)
    expect(LIGHTBOX_TIMING.default.mediaSpring.stiffness).toBe(520)
    expect(LIGHTBOX_TIMING.default.mediaSpring.damping).toBe(44)
  })

  it('offers snappy, relaxed and spring alternatives', () => {
    expect(LIGHTBOX_TIMING.snappy.vtDurationMs).toBe(340)
    expect(LIGHTBOX_TIMING.relaxed.vtDurationMs).toBe(400)
    expect(LIGHTBOX_TIMING.spring.vtDurationMs).toBe(450)
  })

  it('writes the preset onto an element and takes it back off', () => {
    const el = document.createElement('div')

    applyTimingVars(el, 'relaxed')
    expect(el.style.getPropertyValue('--a63-lightbox-vt-duration')).toBe('400ms')
    expect(el.style.getPropertyValue('--a63-lightbox-vt-easing')).not.toBe('')

    clearTimingVars(el)
    expect(el.style.getPropertyValue('--a63-lightbox-vt-duration')).toBe('')
    expect(el.style.getPropertyValue('--a63-lightbox-vt-easing')).toBe('')
  })
})
