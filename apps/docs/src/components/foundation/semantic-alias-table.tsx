import { SEMANTIC_ALIAS_MAP } from '../../foundation/semantic-alias-map'
import { FoundationPreviewPanel } from './preview-panel'

export function SemanticAliasTable() {
  return (
    <FoundationPreviewPanel className="overflow-x-auto p-0">
      <table className="w-full min-w-160 border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2 font-medium text-muted-foreground">Resolved</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Tailwind</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">shadcn</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Canonical</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {SEMANTIC_ALIAS_MAP.map(row => (
            <tr key={row.a63} className="border-b border-border last:border-b-0">
              <td className="px-3 py-2 align-middle">
                <span
                  aria-hidden
                  className="block size-7 rounded-sm border border-border"
                  style={{ backgroundColor: `var(${row.a63})` }}
                />
                <span className="sr-only">Swatch for {row.a63}</span>
              </td>
              <td className="px-3 py-2 align-middle font-mono text-xs text-foreground">
                {row.utility}
              </td>
              <td className="px-3 py-2 align-middle font-mono text-xs text-muted-foreground">
                {row.shadcn}
              </td>
              <td className="px-3 py-2 align-middle font-mono text-xs text-foreground">
                {row.a63}
              </td>
              <td className="px-3 py-2 align-middle text-xs text-muted-foreground">
                {row.meaning}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FoundationPreviewPanel>
  )
}
