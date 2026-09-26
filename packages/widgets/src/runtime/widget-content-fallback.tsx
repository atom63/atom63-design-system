import { LoaderCircle } from 'lucide-react'

/** Shared centered spinner for widget content loading (module defer + data fetch). */
export function WidgetContentFallback() {
  return (
    <output
      aria-busy="true"
      className="a63-WidgetContentFallback"
      data-slot="widget-content-fallback"
    >
      <LoaderCircle aria-hidden className="a63-WidgetContentFallback-icon a63-Widget-spin" />
    </output>
  )
}
