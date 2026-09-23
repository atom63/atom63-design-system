import type { ReactNode } from 'react'
import { FoundationPreviewPanel } from './foundation/preview-panel'

type TokenSwatchProps = {
  className?: string
  hint?: string
  name: string
  variable?: string
}

export function TokenSwatch({ name, className, hint, variable }: TokenSwatchProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background/70 p-2.5">
      <div
        className={`size-8 shrink-0 rounded-sm border border-border ${className ?? ''}`}
        style={variable ? { backgroundColor: `var(${variable})` } : undefined}
      />
      <div>
        <p className="font-mono text-xs text-foreground">{name}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  )
}

export function TokenSwatchGrid({ children }: { children: ReactNode }) {
  return (
    <FoundationPreviewPanel className="grid gap-2 sm:grid-cols-2">
      {children}
    </FoundationPreviewPanel>
  )
}
