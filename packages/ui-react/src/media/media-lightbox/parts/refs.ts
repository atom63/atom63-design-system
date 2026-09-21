'use client'

import { createContext, useContext, type RefObject } from 'react'

/**
 * 手势与形变 hook 需要同时看到轨道、画框、缩放层和根元素，但这些元素分属不同
 * 部件。部件把自己的宿主元素登记到这里，hook 在 `Content` 层统一取用。
 *
 * 槽位为 null 是合法状态：省略 `Slides` 就没有轨道，对应的手势静默不启用。
 */
export interface LightboxRefs {
  rootRef: RefObject<HTMLDivElement | null>
  backdropRef: RefObject<HTMLDivElement | null>
  stageRef: RefObject<HTMLDivElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  mediaRef: RefObject<HTMLDivElement | null>
  zoomRef: RefObject<HTMLDivElement | null>
}

export const LightboxRefsContext = createContext<LightboxRefs | null>(null)

export function useLightboxRefs(): LightboxRefs {
  const refs = useContext(LightboxRefsContext)
  if (refs === null) {
    throw new Error('This lightbox part must be rendered inside Lightbox.Root.')
  }
  return refs
}
