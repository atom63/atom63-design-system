import { Z_LAYER_SCALE } from '../../foundation/token-meta'
import { FoundationPreviewHeader, FoundationPreviewPanel } from './preview-panel'

const GROUPS = [
  {
    name: 'In-context',
    caption: 'scoped within a stacking context',
  },
  {
    name: 'Window band',
    caption: 'dynamic focus shuffle, 300–399',
  },
  {
    name: 'Shell',
    caption: 'global, app-root chrome',
  },
  {
    name: 'System',
    caption: 'covers everything',
  },
] as const

export function ZLayerScale() {
  return (
    <div className="not-prose my-6 flex flex-col gap-5">
      {GROUPS.map(group => {
        const rows = Z_LAYER_SCALE.filter(layer => layer.group === group.name)
        return (
          <FoundationPreviewPanel key={group.name}>
            <FoundationPreviewHeader caption={group.caption}>{group.name}</FoundationPreviewHeader>
            <div className="flex flex-col gap-1.5">
              {rows.map(layer => (
                <div
                  key={layer.token}
                  className="grid grid-cols-[7rem_3rem_1fr] items-baseline gap-3 font-mono text-xs"
                >
                  <span className="text-foreground">{layer.token}</span>
                  <span className="text-right text-muted-foreground tabular-nums">
                    {layer.value}
                  </span>
                  <span className="font-sans text-muted-foreground">{layer.role}</span>
                </div>
              ))}
            </div>
          </FoundationPreviewPanel>
        )
      })}
      <p className="text-xs text-muted-foreground">
        Use named CSS tokens in markup, for example{' '}
        <code className="text-foreground/90">z-[var(--z-layer-modal)]</code>, or named constants
        such as <code className="text-foreground/90">Z_LAYERS.modal</code> from{' '}
        <code className="text-foreground/90">@atom63/styles/z-layers</code> in JS.
      </p>
    </div>
  )
}
