import { useEffect } from 'react'

const POLL_INTERVAL_MS = 60
const MAX_ATTEMPTS = 40
const SCROLL_OFFSET = 96
const CORRECTION_DELAY_MS = 500
const MAX_CORRECTIONS = 2

/**
 * MDX heading ids are assigned by `PageTableOfContents` after the lazy page mounts,
 * so a `#anchor` navigation has nothing to scroll to on the first frame.
 */
export function useHashScroll(slug: string) {
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      return
    }

    let attempts = 0
    let corrections = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    const scrollToTarget = (target: HTMLElement) => {
      const container = document.querySelector<HTMLElement>('[data-mdx-scroll-root]')
      const scroller =
        container && container.scrollHeight > container.clientHeight ? container : null

      if (scroller) {
        const top =
          target.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop -
          SCROLL_OFFSET
        scroller.scrollTo({ behavior: 'smooth', top })
        return
      }

      window.scrollTo({
        behavior: 'smooth',
        top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
      })
    }

    const tryScroll = () => {
      const target = document.getElementById(hash)
      if (target) {
        scrollToTarget(target)

        // Code blocks and lazy media settle after the first scroll, so correct once.
        if (corrections < MAX_CORRECTIONS) {
          corrections += 1
          timer = setTimeout(tryScroll, CORRECTION_DELAY_MS)
        }
        return
      }

      attempts += 1
      if (attempts < MAX_ATTEMPTS) {
        timer = setTimeout(tryScroll, POLL_INTERVAL_MS)
      }
    }

    tryScroll()

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [slug])
}
