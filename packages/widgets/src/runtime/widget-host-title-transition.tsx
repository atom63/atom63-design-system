import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../utils'
import {
  getWidgetHostCrossfadeMotion,
  getWidgetHostSlideFadeMotion,
  shouldReduceWidgetHostMotion,
  widgetHostSizeMotionTransition,
} from './widget-host-transition-config'

export type WidgetHostTitleMotion = 'crossfade' | 'slide'

/** Crossfade title or header-end chrome while the header row stays mounted. */
export function WidgetHostTitleTransition({
  children,
  className,
  contentKey,
  variant = 'crossfade',
}: {
  children: ReactNode
  className?: string
  contentKey: string
  variant?: WidgetHostTitleMotion
}) {
  const reduceMotion = useReducedMotion()
  const prefersReducedMotion = shouldReduceWidgetHostMotion(reduceMotion)
  const slide = variant === 'slide'
  const phaseMotion = slide ? getWidgetHostSlideFadeMotion : getWidgetHostCrossfadeMotion

  return (
    <div
      // Crossfade keeps both layers in-flow on one grid cell (max height).
      // Slide never lets animated layers size the shell — parent height only.
      className={cn('a63-WidgetHostTitleTransition', className)}
      data-slot="widget-host-title-transition"
      data-variant={variant}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          animate={phaseMotion('active', reduceMotion)}
          // Slide layers pin to the reserved box so enter/exit cannot grow it.
          className="a63-WidgetHostTitleTransition-layer"
          exit={phaseMotion('exit', reduceMotion)}
          initial={phaseMotion('enter', reduceMotion)}
          key={contentKey}
          layout={false}
          style={{
            willChange: prefersReducedMotion ? undefined : slide ? 'opacity' : 'opacity, filter',
          }}
          transition={prefersReducedMotion ? { duration: 0 } : widgetHostSizeMotionTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
