import { motion } from 'motion/react'
import { Children, isValidElement, type ReactNode } from 'react'
import { motionDurations, motionEasings } from '../motion-tokens'
import { useMdxReducedMotion } from '../use-reduced-motion'

export type StaggerProps = {
  children: ReactNode
  className?: string
}

export function getStaggerVariants(reduced: boolean) {
  const hidden = reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: reduced ? 0 : 0.08 } },
    },
    item: {
      hidden,
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: motionDurations.base, ease: motionEasings.standard },
      },
    },
  }
}

export function Stagger({ children, className }: StaggerProps) {
  const reduced = useMdxReducedMotion()
  const variants = getStaggerVariants(reduced)
  return (
    <motion.div
      className={className}
      variants={variants.container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {Children.map(children, child =>
        isValidElement(child) ? <motion.div variants={variants.item}>{child}</motion.div> : child
      )}
    </motion.div>
  )
}
