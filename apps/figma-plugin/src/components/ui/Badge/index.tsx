import { Badge as Atom63Badge } from '@atom63/ui-react'
import type { ReactNode } from 'react'

import styles from './Badge.module.css'

export interface BadgeProps {
  children: ReactNode
  className?: string
  /** A leading dot, e.g. a variable's color swatch. */
  dot?: boolean
  /** The dot's color: a value from the document, so it is data rather than a token. */
  dotColor?: string
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'
}

/** The Atom63 Badge with the plugin's leading dot or icon. */
export function Badge({
  children,
  className,
  dot = false,
  dotColor,
  icon,
  size = 'md',
  variant = 'default',
}: BadgeProps) {
  return (
    <Atom63Badge className={className} size={size} variant={variant}>
      {dot && (
        <span
          aria-hidden
          className={styles.dot}
          style={dotColor ? { background: dotColor } : undefined}
        />
      )}
      {icon}
      {children}
    </Atom63Badge>
  )
}
