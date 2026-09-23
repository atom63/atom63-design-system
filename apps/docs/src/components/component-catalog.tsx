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
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoComplete="off"
            aria-controls="component-catalog-results"
            aria-describedby="component-catalog-count"
            className="h-11 w-full rounded-md border border-input bg-background pr-3 pl-9 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:text-sm lg:h-9"
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
            className="m-0 text-sm text-muted-foreground tabular-nums"
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
                  className="inline-flex min-h-11 items-center rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:min-h-9 lg:px-2"
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
                  className="m-0 text-base font-medium text-foreground"
                  id={`component-group-${group.id}`}
                >
                  {group.title}
                </h2>
                <p className="mt-1 mb-0 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {group.items.length}
              </span>
            </div>

            <ul className="grid list-none gap-x-6 p-0 sm:grid-cols-2">
              {group.items.map(item => (
                <li className="border-b border-border/60" key={item.slug}>
                  <Link
                    className="group/component flex min-h-11 items-center gap-2.5 rounded-sm py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:min-h-9 lg:py-1.5"
                    to={componentDocPath(item.slug)}
                  >
                    <span className="min-w-0 flex-1 font-medium text-foreground group-hover/component:underline">
                      {componentLabel(item.slug)}
                    </span>
                    {item.status === 'preview' ? (
                      <span className="text-xs text-muted-foreground">Preview</span>
                    ) : null}
                    <ArrowRight
                      aria-hidden
                      className="size-3.5 shrink-0 text-muted-foreground group-hover/component:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {visibleCount === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-border bg-muted/20 px-6 text-center">
            <p className="m-0 font-medium text-foreground">No components found</p>
            <p className="mt-1 mb-0 text-sm text-muted-foreground">
              Try a component name, category, or interaction term.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
