import { Link } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  componentCatalogGroups,
  componentCatalogItems,
  componentDocPath,
  componentLabel,
} from '../lib/component-catalog'

export function ComponentCatalog() {
  const stableCount = componentCatalogItems.filter(item => item.status === 'stable').length
  const previewCount = componentCatalogItems.length - stableCount
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredGroups = useMemo(
    () =>
      componentCatalogGroups.flatMap(group => {
        const items = group.items.filter(item =>
          `${componentLabel(item.slug)} ${item.slug} ${item.summary} ${item.usage} ${group.title} ${group.description}`
            .toLowerCase()
            .includes(normalizedQuery)
        )
        return items.length > 0 ? [{ ...group, items }] : []
      }),
    [normalizedQuery]
  )
  const visibleCount = filteredGroups.reduce((total, group) => total + group.items.length, 0)

  return (
    <div className="not-prose my-6 space-y-8" data-mdx-width="wide">
      <div className="space-y-3">
        <label className="relative block max-w-md" htmlFor="component-catalog-filter">
          <span className="sr-only">Filter components</span>
          <Search
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          />
          <input
            autoComplete="off"
            aria-controls="component-catalog-results"
            aria-describedby="component-catalog-count"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 h-11 w-full rounded-md border pr-3 pl-9 text-base outline-none focus-visible:ring-2 md:text-sm lg:h-9"
            id="component-catalog-filter"
            onChange={event => setQuery(event.currentTarget.value)}
            placeholder={`Filter ${componentCatalogItems.length} components…`}
            spellCheck={false}
            type="search"
            value={query}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            aria-live="polite"
            className="text-muted-foreground m-0 text-sm tabular-nums"
            id="component-catalog-count"
          >
            {normalizedQuery
              ? `${visibleCount} of ${componentCatalogItems.length} components`
              : `${componentCatalogItems.length} components · ${stableCount} stable${
                  previewCount > 0 ? ` · ${previewCount} preview` : ''
                }`}
          </p>
          {!normalizedQuery ? (
            <nav aria-label="Component categories" className="flex flex-wrap gap-1 xl:hidden">
              {componentCatalogGroups.map(group => (
                <a
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center rounded-md px-2.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:min-h-9 lg:px-2"
                  href={`#component-group-${group.id}`}
                  key={group.id}
                >
                  {group.title}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      <div className="space-y-8" id="component-catalog-results">
        {filteredGroups.map(group => (
          <section aria-labelledby={`component-group-${group.id}`} key={group.id}>
            <div className="mb-3 flex items-end justify-between gap-4 border-b pb-3">
              <div>
                <h2
                  className="text-foreground m-0 text-base font-medium"
                  id={`component-group-${group.id}`}
                >
                  {group.title}
                </h2>
                <p className="text-muted-foreground mt-1 mb-0 max-w-2xl text-sm leading-6">
                  {group.description}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {group.items.length}
              </span>
            </div>

            <ul className="grid list-none gap-x-6 p-0 sm:grid-cols-2">
              {group.items.map(item => (
                <li className="border-border/60 border-b" key={item.slug}>
                  <Link
                    className="group/component focus-visible:ring-ring flex min-h-11 items-center gap-2.5 rounded-sm py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:min-h-9 lg:py-1.5"
                    to={componentDocPath(item.slug)}
                  >
                    <span className="text-foreground min-w-0 flex-1 font-medium group-hover/component:underline">
                      {componentLabel(item.slug)}
                    </span>
                    {item.status === 'preview' ? (
                      <span className="text-muted-foreground text-xs">Preview</span>
                    ) : null}
                    <ArrowRight
                      aria-hidden
                      className="text-muted-foreground group-hover/component:text-foreground size-3.5 shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {visibleCount === 0 ? (
          <div className="border-border bg-muted/20 flex min-h-40 flex-col items-center justify-center rounded-lg border px-6 text-center">
            <p className="text-foreground m-0 font-medium">No components found</p>
            <p className="text-muted-foreground mt-1 mb-0 text-sm">
              Try a component name, category, or interaction term.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
