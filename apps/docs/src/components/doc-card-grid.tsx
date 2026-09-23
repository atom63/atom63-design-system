import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { ComponentType } from 'react'
import { docNavSurface } from '../lib/doc-surfaces'

export type DocCardItem = {
  description: string
  href: string
  icon?: ComponentType<{ className?: string }>
  title: string
}

type DocCardGridProps = {
  items: DocCardItem[]
}

const cardClassName = `group bg-card focus-visible:ring-ring focus-visible:ring-offset-background relative flex flex-col gap-1.5 rounded-xl border p-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${docNavSurface}`

/** Entry-point grid for area landing pages — one card per destination. */
export function DocCardGrid({ items }: DocCardGridProps) {
  return (
    // Container queries, not viewport breakpoints: the docked agent rail
    // and the page TOC both narrow this column without changing viewport
    // width, and a 3-up grid in the leftover space breaks card titles
    // mid-word.
    <div className="not-prose @container my-6" data-mdx-width="wide">
      <div className="grid gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
        {items.map(item => {
          const Icon = item.icon

          return (
            <Link className={cardClassName} key={item.href} to={item.href}>
              <span className="flex min-w-0 items-center gap-2">
                {Icon ? <Icon className="text-muted-foreground size-4 shrink-0" /> : null}
                <span className="text-foreground min-w-0 text-sm font-medium">{item.title}</span>
                <ArrowUpRight
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground ml-auto size-3.5 shrink-0 transition-colors"
                />
              </span>
              <span className="text-muted-foreground text-sm leading-6">{item.description}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
