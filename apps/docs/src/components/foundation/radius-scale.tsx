import { clsx } from 'clsx'
import { RADIUS_SCALE } from '../../foundation/token-meta'

export function RadiusScale() {
  return (
    <div className="foundation-preview not-prose my-6">
      <div className="flex flex-wrap gap-6">
        {RADIUS_SCALE.map(({ token, utility, px, cssVar }) => (
          <div key={token} className="flex w-24 flex-col items-center gap-2">
            <div
              className={clsx('border-primary/40 bg-muted size-24 border-2', utility)}
              style={{ borderRadius: `var(${cssVar})` }}
              title={`${cssVar} → ${px} (default)`}
            />
            <div className="text-center font-mono text-xs">
              <div className="text-foreground">{utility}</div>
              <div className="text-muted-foreground">{px}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        Boxes use <code className="text-foreground/90">96×96px</code> and apply radius via{' '}
        <code className="text-foreground/90">var(--radius-*)</code> so token values always win over
        doc styles.
      </p>
    </div>
  )
}
