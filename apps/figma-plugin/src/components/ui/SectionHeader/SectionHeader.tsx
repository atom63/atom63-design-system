import type React from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  action?: React.ReactNode
  description?: string
  /** The heading level; a view's title is 1. The variant sets the size, not the level. */
  level?: 1 | 2 | 3
  title: string
  variant?: 'primary' | 'secondary'
}

export function SectionHeader({
  title,
  description,
  action,
  level = 2,
  variant = 'primary',
}: SectionHeaderProps) {
  const Heading = `h${level}` as const
  return (
    <div className={`${styles.header} ${styles[variant]}`}>
      <div className={styles.content}>
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
