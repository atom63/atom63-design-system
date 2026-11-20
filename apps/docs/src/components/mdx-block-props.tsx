import blockProps from 'virtual:mdx-block-props'
import { mdxBlockPropsSections } from '../lib/mdx-block-props'
import { PropsTable } from './props-table'

/** The props of an @atom63/mdx block and its parts, read from the block's TypeScript types. */
export function MdxBlockProps({ name }: { name: string }) {
  const sections = mdxBlockPropsSections(blockProps, name)
  if (!sections) {
    throw new Error(`No props for ${name}: it is not a component @atom63/mdx/blocks exports.`)
  }

  return (
    <div className="not-prose my-5 space-y-4">
      {sections.rows.length > 0 ? (
        <PropsTable rows={sections.rows} />
      ) : (
        <p className="m-0 text-sm text-muted-foreground">
          <code className="font-mono text-xs text-foreground">{name}</code> adds no props of its
          own.
        </p>
      )}
      {sections.parts.map(part => (
        <div className="space-y-2" key={part.name}>
          <p className="m-0 font-mono text-xs text-muted-foreground">{part.name}</p>
          <PropsTable rows={part.rows} />
        </div>
      ))}
      {sections.slots.length > 0 ? (
        <p className="m-0 text-sm text-muted-foreground">
          Slots, each taking <code className="font-mono text-xs">children</code>:{' '}
          {sections.slots.map((slot, index) => (
            <span key={slot}>
              {index > 0 ? ', ' : null}
              <code className="font-mono text-xs text-foreground">{slot}</code>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  )
}
