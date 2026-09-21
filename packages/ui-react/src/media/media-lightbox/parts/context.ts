'use client'

import { createContext, useContext } from 'react'
import type { LightboxTiming } from '../timing'
import type {
  MediaLightboxAppearance,
  MediaLightboxItem,
  MediaLightboxLabels,
  MediaLightboxTransition,
} from '../types'

/**
 * 按变化频率分三层，而不是一个大 context。
 *
 * `items` 与 `labels` 一整场都不变，`index` 每次翻页变一次。合在一起的话，
 * 一次滑动会把每张 slide 的每个 chrome 部件全部重渲染一遍。
 */
export interface LightboxConfig {
  items: readonly MediaLightboxItem[]
  labels: MediaLightboxLabels
  appearance: Record<string, MediaLightboxAppearance> | undefined
  onAppearanceChange: ((id: string, appearance: MediaLightboxAppearance) => void) | undefined
  open: boolean
  preload: number
  transition: MediaLightboxTransition
  reducedMotion: boolean
  origin: HTMLElement | null | undefined
  timing: LightboxTiming
}

export interface LightboxState {
  index: number
  itemCount: number
  isZoomed: boolean
  goTo: (index: number) => void
  close: () => void
  zoomIn: () => void
  zoomOut: () => void
}

export interface LightboxSlide {
  item: MediaLightboxItem
  slideIndex: number
  isActive: boolean
  /** 在 preload 邻域内，媒体应当挂载。 */
  isNear: boolean
}

export const LightboxConfigContext = createContext<LightboxConfig | null>(null)
export const LightboxStateContext = createContext<LightboxState | null>(null)
export const LightboxSlideContext = createContext<LightboxSlide | null>(null)

function required<T>(value: T | null, part: string): T {
  if (value === null) {
    throw new Error(`${part} must be rendered inside Lightbox.Root.`)
  }
  return value
}

export function useLightboxConfig(): LightboxConfig {
  return required(useContext(LightboxConfigContext), 'This lightbox part')
}

/** 供 preset 之外的宿主判断自己是否在 lightbox 里，不抛错。 */
export function useOptionalLightboxConfig(): LightboxConfig | null {
  return useContext(LightboxConfigContext)
}

export function useLightboxState(): LightboxState {
  return required(useContext(LightboxStateContext), 'This lightbox part')
}

/** slide 之外使用是合法的（chrome 就在 slide 之外），故返回 null 而不抛错。 */
export function useLightboxSlide(): LightboxSlide | null {
  return useContext(LightboxSlideContext)
}
