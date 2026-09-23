import { SEMANTIC_ALIAS_MAP } from '../../foundation/semantic-alias-map'
import { FoundationPreviewPanel } from './preview-panel'

export function SemanticAliasTable() {
  return (
    <FoundationPreviewPanel className="overflow-x-auto p-0">
      <table className="w-full min-w-160 border-collapse text-left text-sm">
        <thead>
          <tr className="border-border bg-muted/40 border-b">
            <th className="text-muted-foreground px-3 py-2 font-medium">Resolved</th>
            <th className="text-muted-foreground px-3 py-2 font-medium">Tailwind</th>
            <th className="text-muted-foreground px-3 py-2 font-medium">shadcn</th>
            <th className="text-muted-foreground px-3 py-2 font-medium">Canonical</th>
            <th className="text-muted-foreground px-3 py-2 font-medium">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {SEMANTIC_ALIAS_MAP.map(row => (
            <tr key={row.a63} className="border-border border-b last:border-b-0">
              <td className="px-3 py-2 align-middle">
                <span
                  aria-hidden
                  className="border-border block size-7 rounded-sm border"
                  style={{ backgroundColor: `var(${row.a63})` }}
                />
                <span className="sr-only">Swatch for {row.a63}</span>
              </td>
              <td className="text-foreground px-3 py-2 align-middle font-mono text-xs">
                {row.utility}
              </td>
              <td className="text-muted-foreground px-3 py-2 align-middle font-mono text-xs">
                {row.shadcn}
              </td>
              <td className="text-foreground px-3 py-2 align-middle font-mono text-xs">
                {row.a63}
              </td>
              <td className="text-muted-foreground px-3 py-2 align-middle text-xs">
                {row.meaning}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FoundationPreviewPanel>
  )
}
