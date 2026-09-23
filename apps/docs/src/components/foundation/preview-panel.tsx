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
        'foundation-preview not-prose not-mdx my-5 border-y border-border py-3 text-xs',
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
      <p className="text-xs font-medium text-foreground">{children}</p>
      {caption ? <p className="font-mono text-[10px] text-muted-foreground">{caption}</p> : null}
    </div>
  )
}
