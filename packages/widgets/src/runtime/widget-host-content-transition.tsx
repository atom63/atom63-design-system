import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useLayoutEffect, useRef } from 'react'
import { cn } from '../utils'
import {
  getWidgetHostCrossfadeMotion,
  shouldReduceWidgetHostMotion,
  widgetHostSizeMotionTransition,
} from './widget-host-transition-config'

/**
 * Crossfade inner widget content while the outer card shell stays mounted.
 *
 * Each layer grows from its top-start corner. `originClassName` adds a class
 * to the layer to change that (a consumer utility such as `origin-center`
 * outranks the stylesheet's default).
 */
export function WidgetHostContentTransition({
  children,
  className,
  contentClassName,
  contentKey,
  originClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
  contentKey: string
  originClassName?: string
}) {
  const reduceMotion = useReducedMotion()
  const slotRef = useRef<HTMLDivElement>(null)
  const frozenExitWidthRef = useRef<number | null>(null)

  // contentKey is an intentional re-measure trigger — it freezes the outgoing slot width right before the content swaps, even though the effect body doesn't read it.
  useLayoutEffect(() => {
    frozenExitWidthRef.current = slotRef.current?.offsetWidth ?? null
  }, [contentKey])

  const prefersReducedMotion = shouldReduceWidgetHostMotion(reduceMotion)
  const frozenExitWidth = frozenExitWidthRef.current

  return (
    <div
      className={cn('a63-WidgetHostContentTransition', className)}
      data-slot="widget-host-content-transition"
      ref={slotRef}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          animate={{
            ...getWidgetHostCrossfadeMotion('active', reduceMotion),
            width: '100%',
          }}
          className={cn('a63-WidgetHostContentTransition-layer', originClassName, contentClassName)}
          exit={{
            ...getWidgetHostCrossfadeMotion('exit', reduceMotion),
            width: frozenExitWidth ?? '100%',
          }}
          initial={{
            ...getWidgetHostCrossfadeMotion('enter', reduceMotion),
            width: '100%',
          }}
          key={contentKey}
          style={{
            willChange: prefersReducedMotion ? undefined : 'opacity, filter',
          }}
          transition={prefersReducedMotion ? { duration: 0 } : widgetHostSizeMotionTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
