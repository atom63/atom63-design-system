import type { Transition } from 'motion/react'
import { MEDIA_SPRING } from './motion'

/**
 * 开合形变的时序档位。
 *
 * 只给具名档位、不收任意 easing 字符串：未经验证的曲线在 iOS Safari 上会被
 * 整段跳过或抖动，而一个 lightbox 的开合是它最显眼的一次动画。
 */
export type LightboxTiming = 'default' | 'snappy' | 'relaxed' | 'spring'

export interface LightboxTimingSpec {
  /** 驱动 FLIP 形变与下拉回弹。 */
  mediaSpring: Transition & { stiffness: number; damping: number }
  /** 驱动 View Transitions 伪元素，经 CSS 变量下发。 */
  vtDurationMs: number
  vtEasing: string
}

const EMPHASIZED = 'var(--a63-motion-ease-emphasized, cubic-bezier(0.32, 0.72, 0, 1))'

export const LIGHTBOX_TIMING: Record<LightboxTiming, LightboxTimingSpec> = {
  default: { mediaSpring: MEDIA_SPRING, vtDurationMs: 360, vtEasing: EMPHASIZED },
  snappy: {
    mediaSpring: { ...MEDIA_SPRING, damping: 40, stiffness: 640 },
    vtDurationMs: 340,
    vtEasing: EMPHASIZED,
  },
  relaxed: {
    mediaSpring: { ...MEDIA_SPRING, damping: 46, stiffness: 420 },
    vtDurationMs: 400,
    vtEasing: EMPHASIZED,
  },
  spring: {
    mediaSpring: { ...MEDIA_SPRING, damping: 34, stiffness: 380 },
    vtDurationMs: 450,
    vtEasing: EMPHASIZED,
  },
}

const DURATION_VAR = '--a63-lightbox-vt-duration'
const EASING_VAR = '--a63-lightbox-vt-easing'

/**
 * `::view-transition-*` 伪元素只解析 `:root` 上的自定义属性，所以时序不能写在
 * lightbox 自己的元素上——必须落到 documentElement，用完再收走。
 */
export function applyTimingVars(element: HTMLElement, timing: LightboxTiming): void {
  const spec = LIGHTBOX_TIMING[timing]
  element.style.setProperty(DURATION_VAR, `${spec.vtDurationMs}ms`)
  element.style.setProperty(EASING_VAR, spec.vtEasing)
}

export function clearTimingVars(element: HTMLElement): void {
  element.style.removeProperty(DURATION_VAR)
  element.style.removeProperty(EASING_VAR)
}
