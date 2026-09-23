import { clsx } from 'clsx'
import { BLUR_SCALE, SHADOW_SCALE } from '../../foundation/token-meta'
import { FoundationPreviewHeader, FoundationPreviewPanel } from './preview-panel'

const SHADOW_NOTES: Record<(typeof SHADOW_SCALE)[number]['token'], string> = {
  '2xs': 'hairline',
  '2xl': 'highest',
  lg: 'float',
  md: 'lift',
  sm: 'raised',
  xl: 'overlay',
  xs: 'subtle',
}

export function EffectsReference() {
  return (
    <div className="space-y-6">
      <FoundationPreviewPanel>
        <FoundationPreviewHeader caption="effects.css">Shadows</FoundationPreviewHeader>
        <p className="text-muted-foreground mb-4 max-w-2xl leading-5">
          Source tokens increase y-offset and blur. Larger shadows are softer, so the preview gives
          each level enough stage space to show spread instead of density.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SHADOW_SCALE.map(({ token, utility }) => (
            <div
              key={token}
              className="border-border/70 grid grid-cols-[minmax(9rem,13rem)_minmax(0,1fr)] items-center gap-3 border-t py-3 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
            >
              <div
                className="flex min-h-28 items-center justify-center rounded-md px-6 py-7"
                style={{ backgroundColor: '#f8fafc' }}
              >
                <div
                  className={clsx(
                    'flex h-10 w-full items-center justify-center rounded-md border border-black/10 bg-white text-center',
                    utility
                  )}
                  title={utility}
                >
                  <span className="font-mono text-[10px] text-neutral-600">{utility}</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-foreground text-sm font-medium">{SHADOW_NOTES[token]}</div>
                <div className="text-muted-foreground mt-1 truncate font-mono text-[11px]">
                  --shadow-{token}
                </div>
                <div className="text-muted-foreground/70 truncate font-mono text-[10px]">
                  --effect-shadow-{token}
                </div>
              </div>
            </div>
          ))}
        </div>
      </FoundationPreviewPanel>

      <FoundationPreviewPanel>
        <FoundationPreviewHeader caption="backdrop blur utilities">Blur</FoundationPreviewHeader>
        <p className="text-muted-foreground mb-4 max-w-2xl leading-5">
          Material depth for glass panels and overlays. The sample uses the same restrained frame as
          the color token previews.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BLUR_SCALE.map(({ token, utility }) => (
            <div key={token} className="border-border/70 border-t pt-2">
              <div className="border-border bg-background relative aspect-4/3 overflow-hidden rounded-md border">
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,var(--a63-action-primary)_0_16%,transparent_17%),radial-gradient(circle_at_78%_32%,var(--a63-text-secondary)_0_13%,transparent_14%),radial-gradient(circle_at_52%_82%,var(--a63-surface-control-hover)_0_12%,transparent_13%)] opacity-40"
                  aria-hidden
                />
                <div className="bg-border/70 absolute inset-x-4 top-1/2 h-px" aria-hidden />
                <div className="bg-border/70 absolute top-4 bottom-4 left-1/2 w-px" aria-hidden />
                <div
                  className={clsx(
                    'border-border bg-card/45 absolute inset-4 flex items-center justify-center rounded-sm border',
                    utility
                  )}
                >
                  <span className="text-foreground font-mono text-[10px]">{utility}</span>
                </div>
              </div>
              <div
                className="text-muted-foreground mt-1 truncate text-right font-mono text-[10px]"
                title={`--blur-${token}`}
              >
                --blur-{token}
              </div>
            </div>
          ))}
        </div>
      </FoundationPreviewPanel>
    </div>
  )
}
