import layoutProps from 'virtual:layout-props'
import { PropsTable } from './props-table'

/** The props of a page layout primitive (`Page`, `Container`, …), read from its TypeScript types. */
export function LayoutProps({ name }: { name: string }) {
  const rows = layoutProps[name]
  if (!rows) {
    throw new Error(`No props for ${name}: it is not a layout primitive the docs document.`)
  }
  return (
    <div className="not-prose my-5">
      <PropsTable rows={rows} />
    </div>
  )
}
