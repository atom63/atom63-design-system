'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { LIGHTBOX_TIMING } from '../timing'
import type { LightboxTiming } from '../timing'

export interface StageTransition {
  /**
   * The slide the stack turned away from a moment ago, still fading out to
   * `opacity: 0`. `null` once that fade has finished (or never started —
   * the opening render, or a `prefers-reduced-motion` switch, both leave it
   * `null` immediately).
   */
  outgoingIndex: number | null
}

interface UseStageTransitionOptions {
  index: number
  reducedMotion: boolean
  timing: LightboxTiming
}

/**
 * Every mounted slide sits in the same box; a page turn is nothing but an
 * index change, and CSS handles the actual fade — `Slide` sets its own
 * `opacity` from `isActive` and lets the transition it always carries
 * animate between whatever two values that produces. What plain state can't
 * do on its own is keep the slide being left *mounted* long enough to finish
 * fading: the moment `isActive` flips, `Slides`'s ordinary preload
 * neighbourhood may no longer include it (a `Home`/`End` jump lands far from
 * where the gallery was), and an unmounted slide fades into nothing.
 *
 * This hook is that missing piece: it names which index has to stay
 * force-mounted, for how long, and lets go the instant a newer jump makes
 * that answer stale.
 *
 * A run of jumps that lands before the fade duration elapses does not queue.
 * Each new index simply retargets `outgoingIndex` to whichever slide was
 * on screen a moment ago and restarts the clock — the previous outgoing
 * slide, mid-fade or not, is not entitled to a turn of its own and drops out
 * immediately. The crossfade always converges on the latest target.
 *
 * One visible consequence: on a rapid double-jump (e.g. `0 -> 1 -> 2` inside
 * one fade duration), slide `1` gets the retargeted `outgoingIndex` and
 * finishes its fade, but slide `0` — already mid-fade when jump two
 * superseded it — is not `outgoingIndex` any more and, once it also falls
 * outside the preload neighbourhood, unmounts on that same render. That
 * slide shows a cut instead of a completed fade-out. This is the intended
 * cost of "converge, don't queue," not a bug: the alternative is queueing
 * every intermediate jump's full fade, which is the opposite of what a fast
 * run of jumps should feel like. It never leaves the *destination* slide
 * blank or unfaded — only a bystander slide passed through on the way.
 */
export function useStageTransition({
  index,
  reducedMotion,
  timing,
}: UseStageTransitionOptions): StageTransition {
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null)
  const previousIndexRef = useRef(index)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const durationMs = LIGHTBOX_TIMING[timing].vtDurationMs

  // Layout, not passive: committing `outgoingIndex` before the browser paints
  // is what keeps the previous slide's mount decision correct for the very
  // frame that turns it inactive, rather than for the frame after.
  useLayoutEffect(() => {
    const previous = previousIndexRef.current
    if (index === previous) {
      return
    }
    previousIndexRef.current = index
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    // Reduced motion switches instantly — no slide ever gets a turn fading
    // out, so nothing needs to stay mounted past this render.
    if (reducedMotion) {
      setOutgoingIndex(null)
      return
    }
    setOutgoingIndex(previous)
    timerRef.current = setTimeout(() => {
      setOutgoingIndex(null)
      timerRef.current = null
    }, durationMs)
  }, [durationMs, index, reducedMotion])

  useLayoutEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    },
    []
  )

  return { outgoingIndex }
}
