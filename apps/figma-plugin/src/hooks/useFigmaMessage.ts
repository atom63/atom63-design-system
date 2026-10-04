/**
 * Cipher - Figma Design System Plugin
 * Typed messages between the UI and the Figma main thread.
 */

import { useCallback, useEffect, useRef } from 'react'

import type { MainToUI, UIToMain } from '../messages'

/** Calls the handler with every message the main thread posts. */
export function useFigmaMessage(handler: (message: MainToUI) => void): void {
  // A ref keeps the listener stable while the handler sees the latest state.
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage
      if (msg && typeof msg === 'object' && 'type' in msg) {
        handlerRef.current(msg as MainToUI)
      }
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])
}

/** A stable function that posts a message to the main thread. */
export function usePostMessage(): (message: UIToMain) => void {
  return useCallback((message: UIToMain) => {
    parent.postMessage({ pluginMessage: message }, '*')
  }, [])
}
