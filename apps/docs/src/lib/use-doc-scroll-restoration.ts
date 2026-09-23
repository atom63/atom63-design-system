import { useRouter } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useRef } from 'react'

const SCROLL_RESTORATION_ID = 'docs-body'
const MAX_RESTORE_ATTEMPTS = 40
const RESTORE_INTERVAL_MS = 50

export function useDocScrollRestoration(scrollKey: string) {
  const router = useRouter()
  const currentKeyRef = useRef(scrollKey)
  const positionsRef = useRef(new Map<string, number>())

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(
      `[data-scroll-restoration-id="${SCROLL_RESTORATION_ID}"]`
    )
    if (!scroller) {
      return
    }

    const savePosition = () => {
      positionsRef.current.set(currentKeyRef.current, scroller.scrollTop)
    }

    const unsubscribe = router.subscribe('onBeforeNavigate', savePosition)
    document.addEventListener('click', savePosition, true)
    return () => {
      unsubscribe()
      document.removeEventListener('click', savePosition, true)
    }
  }, [router])

  useLayoutEffect(() => {
    currentKeyRef.current = scrollKey
    const positions = positionsRef.current
    const scroller = document.querySelector<HTMLElement>(
      `[data-scroll-restoration-id="${SCROLL_RESTORATION_ID}"]`
    )
    if (!scroller) {
      return
    }

    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const restoreY = positions.get(scrollKey) ?? 0

    const restore = () => {
      const maxScrollTop = scroller.scrollHeight - scroller.clientHeight
      if (maxScrollTop >= restoreY || attempts >= MAX_RESTORE_ATTEMPTS) {
        scroller.scrollTop = Math.min(restoreY, maxScrollTop)
        return
      }

      attempts += 1
      timer = setTimeout(restore, RESTORE_INTERVAL_MS)
    }

    if (!window.location.hash) {
      timer = setTimeout(restore, RESTORE_INTERVAL_MS)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [scrollKey])
}
