import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { motionDurations, motionEasings } from '../motion-tokens'
import { useMdxReducedMotion } from '../use-reduced-motion'

export type RevealProps = {
  children: ReactNode
  className?: string
  /** Seconds to delay the entrance. */
  delay?: number
}

export function getRevealMotionProps(reduced: boolean, delay = 0) {
  if (reduced) {
    return { initial: false as const }
  }
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '0px 0px -10% 0px' },
    transition: { duration: motionDurations.base, ease: motionEasings.standard, delay },
  }
}

export function Reveal({ children, className, delay }: RevealProps) {
  const reduced = useMdxReducedMotion()
  return (
    <motion.div className={className} {...getRevealMotionProps(reduced, delay)}>
      {children}
    </motion.div>
  )
}
