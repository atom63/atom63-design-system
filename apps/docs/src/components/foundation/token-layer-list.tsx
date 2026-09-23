import { TOKEN_LAYERS } from '../../foundation/token-meta'
import { FoundationPreviewPanel } from './preview-panel'

export function TokenLayerList() {
  return (
    <FoundationPreviewPanel>
      <ol className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {TOKEN_LAYERS.map((layer, index) => (
          <li key={layer.file} className="flex gap-3 bg-background/70 px-3 py-2.5 text-sm">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {index + 1}.
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-foreground">{layer.file}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{layer.role}</p>
            </div>
          </li>
        ))}
      </ol>
    </FoundationPreviewPanel>
  )
}
