import { mdxComponents } from '../mdx-kit'
import { Link } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import uiReactIndexSource from '../../../../packages/ui-react/src/index.ts?raw'
import { componentDocPath, componentLabel } from '../lib/component-catalog'
import {
  componentExportSurface,
  getComponentDoc,
  type ComponentExportSurface,
} from '../lib/component-docs'

export function ComponentReferenceUtilities({ componentSlug }: { componentSlug: string }) {
  const doc = getComponentDoc(componentSlug)
  if (!doc) {
    return null
  }

  const H2 = mdxComponents.h2
  const Pre = mdxComponents.pre
  const Code = mdxComponents.code
  const Ul = mdxComponents.ul
  const Li = mdxComponents.li
  const exports = componentExportSurface(componentSlug, uiReactIndexSource)
  const importStatement = `import { ${doc.usageExports.join(', ')} } from '${doc.item.importPath}'`

  return (
    <>
      <H2 id="usage">Usage</H2>
      <Pre>
        <Code className="language-tsx">{importStatement}</Code>
      </Pre>

      <ApiSurfaceDisclosure exports={exports} />

      <H2 id="related-components">Related components</H2>
      <Ul>
        {doc.related.map(item => (
          <Li key={item.slug}>
            <Link to={componentDocPath(item.slug)}>{componentLabel(item.slug)}</Link>
          </Li>
        ))}
      </Ul>
    </>
  )
}

function ApiSurfaceDisclosure({ exports }: { exports: ComponentExportSurface }) {
  const exportCount = exports.values.length + exports.types.length

  return (
    <details
      className="group not-prose my-8 rounded-lg border border-border bg-muted/20"
      data-toc-exclude=""
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:min-h-9 [&::-webkit-details-marker]:hidden">
        <span className="flex-1 text-foreground">API surface</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {exportCount} {exportCount === 1 ? 'export' : 'exports'}
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 text-muted-foreground transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="border-t border-border px-4 pt-4 pb-5">
        <p className="mt-0 mb-4 text-sm leading-6 text-muted-foreground">
          Values and types assigned to this family by the root{' '}
          <code className="font-mono text-xs text-foreground">@atom63/ui-react</code> barrel.
          TypeScript remains the source of truth for the complete prop contract.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ExportList label="Values" names={exports.values} />
          <ExportList label="Types" names={exports.types} />
        </div>
      </div>
    </details>
  )
}

function ExportList({ label, names }: { label: string; names: readonly string[] }) {
  return (
    <section aria-labelledby={`component-exports-${label.toLowerCase()}`}>
      <h3
        className="mb-2 text-sm font-medium text-foreground"
        id={`component-exports-${label.toLowerCase()}`}
      >
        {label}
      </h3>
      {names.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {names.map(name => (
            <li
              className="rounded-md border border-border bg-muted/60 px-2 py-1 font-mono text-xs"
              key={name}
            >
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-muted-foreground">None exported.</p>
      )}
    </section>
  )
}
