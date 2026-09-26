import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import {
  shouldReduceWidgetHostMotion,
  widgetHostSizeMotionTransition,
} from './widget-host-transition-config'

/** Header slot that only exists on some sizes (e.g. profile small). */
export function WidgetHostOptionalHeader({
  children,
  visible,
}: {
  children: ReactNode
  visible: boolean
}) {
  const reduceMotion = useReducedMotion()
  const prefersReducedMotion = shouldReduceWidgetHostMotion(reduceMotion)

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          animate={
            prefersReducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }
          }
          className="a63-WidgetHostOptionalHeader"
          data-slot="widget-host-optional-header"
          exit={prefersReducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
          initial={
            prefersReducedMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }
          }
          key="widget-host-optional-header"
          transition={prefersReducedMotion ? { duration: 0 } : widgetHostSizeMotionTransition}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
