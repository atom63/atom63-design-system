import { Skeleton } from '@atom63/ui-react'
import { clsx } from 'clsx'

type MdxPageSkeletonVariant = 'docs' | 'lesson'

export interface MdxPageSkeletonProps {
  className?: string
  showInlineToc?: boolean
  showRail?: boolean
  variant?: MdxPageSkeletonVariant
}

const paragraphRows = [
  { key: 'paragraph-1', width: 'w-full' },
  { key: 'paragraph-2', width: 'w-11/12' },
  { key: 'paragraph-3', width: 'w-4/5' },
] as const

const railRows = [
  { key: 'rail-1', width: 'w-8/12' },
  { key: 'rail-2', width: 'w-11/12' },
  { key: 'rail-3', width: 'w-7/12' },
] as const

function SkeletonRows({ rows }: { rows: readonly { key: string; width: string }[] }) {
  return (
    <div className="space-y-2.5">
      {rows.map(row => (
        <Skeleton className={`h-4 rounded-sm ${row.width}`} key={row.key} />
      ))}
    </div>
  )
}

export function MdxPageSkeleton({
  className,
  showInlineToc = true,
  showRail = true,
  variant = 'docs',
}: MdxPageSkeletonProps) {
  const isLesson = variant === 'lesson'

  return (
    <output
      aria-label="Loading page content"
      aria-live="polite"
      className={className ? `block ${className}` : 'block'}
      data-slot="mdx-page-skeleton"
    >
      <div
        className={clsx(
          'grid w-full min-w-0 grid-cols-1',
          showRail && '2xl:grid-cols-[minmax(0,1fr)_12rem] 2xl:gap-8'
        )}
      >
        <div className="min-w-0">
          <header className="space-y-4 pb-8">
            <Skeleton className="h-3 w-40 rounded-sm" />
            <Skeleton className="h-10 w-11/12 max-w-xl rounded-sm md:h-12" />
            <Skeleton className="h-5 w-10/12 max-w-2xl rounded-sm" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-sm" />
              {isLesson ? <Skeleton className="h-6 w-16 rounded-sm" /> : null}
            </div>
          </header>

          {showInlineToc ? (
            <div className="mb-8 space-y-2">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-3 w-44 rounded-sm" />
            </div>
          ) : null}

          <div className="space-y-8">
            <section className="space-y-5">
              <SkeletonRows rows={paragraphRows} />
              <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            </section>

            <section className="space-y-4">
              <Skeleton className="h-7 w-56 rounded-sm" />
              <SkeletonRows rows={paragraphRows} />
            </section>
          </div>
        </div>

        {showRail ? (
          <aside aria-hidden className="hidden pt-2 2xl:block">
            <div className="sticky top-6 space-y-3">
              <Skeleton className="h-3 w-20 rounded-sm" />
              <SkeletonRows rows={railRows} />
            </div>
          </aside>
        ) : null}
      </div>
    </output>
  )
}
