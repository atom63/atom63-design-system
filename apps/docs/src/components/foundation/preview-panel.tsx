import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type FoundationPreviewPanelProps = {
  children: ReactNode
  className?: string
}

export function FoundationPreviewPanel({ children, className }: FoundationPreviewPanelProps) {
  return (
    <div
      className={clsx(
        'foundation-preview not-prose not-mdx border-border my-5 border-y py-3 text-xs',
        className
      )}
    >
      {children}
    </div>
  )
}

type FoundationPreviewHeaderProps = {
  caption?: ReactNode
  children: ReactNode
  className?: string
}

export function FoundationPreviewHeader({
  caption,
  children,
  className,
}: FoundationPreviewHeaderProps) {
  return (
    <div className={clsx('mb-2 flex flex-wrap items-baseline justify-between gap-2', className)}>
      <p className="text-foreground text-xs font-medium">{children}</p>
      {caption ? <p className="text-muted-foreground font-mono text-[10px]">{caption}</p> : null}
    </div>
  )
}
