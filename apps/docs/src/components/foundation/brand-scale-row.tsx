import { BRAND_SCALES, NEUTRAL_SCALES } from '../../foundation/token-meta'
import { FoundationPreviewPanel } from './preview-panel'

const BRAND_500: Record<string, string> = {
  b1: 'bg-b1-500',
  b2: 'bg-b2-500',
  b3: 'bg-b3-500',
  b4: 'bg-b4-500',
  b5: 'bg-b5-500',
  b6: 'bg-b6-500',
}

const NEUTRAL_9: Record<string, string> = {
  n1: 'bg-n1-light-9 dark:bg-n1-dark-9',
  n2: 'bg-n2-light-9 dark:bg-n2-dark-9',
  n3: 'bg-n3-light-9 dark:bg-n3-dark-9',
  n4: 'bg-n4-light-9 dark:bg-n4-dark-9',
  n5: 'bg-n5-light-9 dark:bg-n5-dark-9',
  n6: 'bg-n6-light-9 dark:bg-n6-dark-9',
}

export function BrandScaleRow() {
  return (
    <FoundationPreviewPanel className="grid gap-2 sm:grid-cols-2">
      {BRAND_SCALES.map(({ id, label }) => (
        <div
          key={id}
          className="flex items-center gap-3 rounded-md border border-border bg-background/70 p-2.5"
        >
          <div className={`size-8 shrink-0 rounded-sm border border-border ${BRAND_500[id]}`} />
          <div>
            <p className="font-mono text-xs text-foreground">{id}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono text-[10px] text-muted-foreground">color-{id}-500</p>
          </div>
        </div>
      ))}
    </FoundationPreviewPanel>
  )
}

export function NeutralScaleRow() {
  return (
    <FoundationPreviewPanel className="grid gap-2 sm:grid-cols-2">
      {NEUTRAL_SCALES.map(({ id, label }) => (
        <div
          key={id}
          className="flex items-center gap-3 rounded-md border border-border bg-background/70 p-2.5"
        >
          <div className={`size-8 shrink-0 rounded-sm border border-border ${NEUTRAL_9[id]}`} />
          <div>
            <p className="font-mono text-xs text-foreground">{id}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              color-{id}-light-9 / dark-9
            </p>
          </div>
        </div>
      ))}
    </FoundationPreviewPanel>
  )
}
