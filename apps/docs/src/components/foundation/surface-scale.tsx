import { clsx } from 'clsx'
import { SURFACE_STEPS } from '../../foundation/token-meta'
import { FoundationPreviewHeader, FoundationPreviewPanel } from './preview-panel'

/** Primitives registered as `--color-n1-*` — surface aliases resolve to these. */
const LIGHT_BG: Record<number, string> = {
  1: 'bg-n1-light-1',
  2: 'bg-n1-light-2',
  3: 'bg-n1-light-3',
  4: 'bg-n1-light-4',
  5: 'bg-n1-light-5',
  6: 'bg-n1-light-6',
  7: 'bg-n1-light-7',
  8: 'bg-n1-light-8',
  9: 'bg-n1-light-9',
  10: 'bg-n1-light-10',
  11: 'bg-n1-light-11',
  12: 'bg-n1-light-12',
}

const DARK_BG: Record<number, string> = {
  1: 'bg-n1-dark-1',
  2: 'bg-n1-dark-2',
  3: 'bg-n1-dark-3',
  4: 'bg-n1-dark-4',
  5: 'bg-n1-dark-5',
  6: 'bg-n1-dark-6',
  7: 'bg-n1-dark-7',
  8: 'bg-n1-dark-8',
  9: 'bg-n1-dark-9',
  10: 'bg-n1-dark-10',
  11: 'bg-n1-dark-11',
  12: 'bg-n1-dark-12',
}

type SurfaceScaleProps = {
  mode: 'light' | 'dark'
}

export function SurfaceScale({ mode }: SurfaceScaleProps) {
  const bg = mode === 'light' ? LIGHT_BG : DARK_BG
  const surfaceVar = mode === 'light' ? 'surface-light' : 'surface-dark'
  const primitivePrefix = mode === 'light' ? 'n1-light' : 'n1-dark'

  return (
    <FoundationPreviewPanel>
      <FoundationPreviewHeader
        caption={
          <>
            --{surfaceVar}-N → --color-{primitivePrefix}-N
          </>
        }
      >
        <span className="capitalize">{mode} surfaces</span>
      </FoundationPreviewHeader>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
        {SURFACE_STEPS.map(step => (
          <div key={step} className="min-w-0">
            <div
              className={clsx('h-5 rounded-sm border border-border sm:h-6', bg[step])}
              title={`--${surfaceVar}-${step}`}
            />
            <span className="mt-1 block text-center font-mono text-[9px] text-muted-foreground">
              {step}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Utility reference: <code>bg-{primitivePrefix}-N</code>
      </p>
    </FoundationPreviewPanel>
  )
}
