import { TOKEN_LAYERS } from '../../foundation/token-meta'
import { FoundationPreviewPanel } from './preview-panel'

export function TokenLayerList() {
  return (
    <FoundationPreviewPanel>
      <ol className="border-border divide-border divide-y overflow-hidden rounded-md border">
        {TOKEN_LAYERS.map((layer, index) => (
          <li key={layer.file} className="bg-background/70 flex gap-3 px-3 py-2.5 text-sm">
            <span className="text-muted-foreground font-mono text-xs tabular-nums">
              {index + 1}.
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground font-mono text-xs">{layer.file}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{layer.role}</p>
            </div>
          </li>
        ))}
      </ol>
    </FoundationPreviewPanel>
  )
}
