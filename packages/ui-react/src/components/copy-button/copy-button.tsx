'use client'

import type { CopyButtonSize, CopyButtonVariant } from '@atom63/ui-foundation'
import { Copy } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '../../lib/cn'
import { AnimatedCheck } from '../animated-check'
import { Button, type ButtonProps } from '../button'

export interface CopyButtonProps extends Omit<
  ButtonProps,
  'children' | 'size' | 'value' | 'variant'
> {
  children?: React.ReactNode
  copiedLabel?: string
  label?: string
  size?: CopyButtonSize
  successMessage?: string
  value: string
  variant?: CopyButtonVariant
}

export interface CopyButtonFeedbackProps {
  children?: React.ReactNode
  copied: boolean
}

const feedbackEnterTransition = {
  filter: { delay: 0.12, duration: 0.18, ease: [0.32, 0.72, 0, 1] as const },
  opacity: { delay: 0.12, duration: 0.18, ease: [0.32, 0.72, 0, 1] as const },
}
const feedbackExitTransition = {
  filter: { duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
  opacity: { duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
}
const reducedMotionTransition = {
  opacity: { duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
}

/*
 * CopyButton — a DS Button that copies `value` to the clipboard and swaps its
 * copy icon for a self-drawing check (AnimatedCheck), toasting via sonner.
 * Ported faithfully from prod @atom63/ui: same clipboard + toast behavior and
 * the copy/check feedback, restyled onto a `.a63-CopyButton` recipe (the group
 * hover/press icon-scale + one-cell stack live in CSS, not Tailwind).
 */
export function CopyButton({
  children,
  className,
  copiedLabel = 'Copied to clipboard',
  label = 'Copy',
  onClick,
  size,
  successMessage,
  value,
  variant = 'ghost',
  ...props
}: CopyButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const resolvedSize = size ?? (children ? 'sm' : 'icon-sm')

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(successMessage ?? `${label} copied to clipboard`)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Button
      {...props}
      aria-label={children ? undefined : copied ? copiedLabel : label}
      className={cn('a63-CopyButton', !children && 'a63-CopyButton--icon-only', className)}
      data-copied={copied ? '' : undefined}
      // `handleCopy` is async and swallows its own failures; `void` marks the
      // floating promise as deliberate so onClick still gets a void-returning handler.
      onClick={event => {
        onClick?.(event)
        void handleCopy()
      }}
      size={resolvedSize}
      // The label only: the copied value may be a secret, and a title shows it on hover.
      title={label}
      variant={variant}
    >
      <CopyButtonFeedback copied={copied}>{children}</CopyButtonFeedback>
    </Button>
  )
}

/** Controlled copy/check feedback for copy flows that manage their own async work. */
export function CopyButtonFeedback({
  children,
  copied,
}: CopyButtonFeedbackProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const swapFrom = reduceMotion ? { opacity: 0 } : { filter: 'blur(2px)', opacity: 0 }
  const swapTo = reduceMotion ? { opacity: 1 } : { filter: 'blur(0px)', opacity: 1 }

  return (
    <span className="a63-CopyButton-swap" data-slot="copy-button-swap">
      <motion.span
        animate={copied ? swapFrom : swapTo}
        aria-hidden={copied ? true : undefined}
        className="a63-CopyButton-item"
        data-slot="copy-button-item"
        initial={false}
        transition={
          reduceMotion
            ? reducedMotionTransition
            : copied
              ? feedbackExitTransition
              : feedbackEnterTransition
        }
      >
        <Copy className="a63-CopyButton-icon" />
        {children}
      </motion.span>
      <motion.span
        animate={copied ? swapTo : swapFrom}
        aria-hidden={copied ? undefined : true}
        className="a63-CopyButton-item"
        data-slot="copy-button-item"
        initial={false}
        transition={
          reduceMotion
            ? reducedMotionTransition
            : copied
              ? feedbackEnterTransition
              : feedbackExitTransition
        }
      >
        <AnimatedCheck className="a63-CopyButton-check" variant={copied ? 'animated' : 'static'} />
        {children && <span>Copied!</span>}
      </motion.span>
    </span>
  )
}
