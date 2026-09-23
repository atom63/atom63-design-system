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
    <div className="border-border bg-background/70 flex items-center gap-3 rounded-md border p-2.5">
      <div
        className={`border-border size-8 shrink-0 rounded-sm border ${className ?? ''}`}
        style={variable ? { backgroundColor: `var(${variable})` } : undefined}
      />
      <div>
        <p className="text-foreground font-mono text-xs">{name}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
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
