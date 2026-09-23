import type * as React from 'react'
import { cn } from '../lib/cn'

/** Minimal loading placeholder (inlined — no @atom63/ui dep). */
function Skeleton({ className }: { className?: string }): React.ReactElement {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

export const DEFAULT_PAGE_SKELETON_COUNT = 6

export interface PageSkeletonProps {
  className?: string
  count?: number
  showFilters?: boolean
  showHeader?: boolean
  variant?: 'list' | 'card' | 'grid'
}

export function PageSkeleton({
  variant = 'list',
  count = DEFAULT_PAGE_SKELETON_COUNT,
  className,
  showFilters = true,
  showHeader = true,
}: PageSkeletonProps) {
  const skeletonItems = Array.from({ length: count }, (_, index) => ({
    id: `${variant}-${index + 1}`,
  }))

  const renderSkeletonItem = (id: string) => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-3" key={`skeleton-card-${id}`}>
            <Skeleton className="h-48 w-full rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="space-y-3" key={`skeleton-grid-${id}`}>
            <Skeleton className="aspect-square w-full rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center gap-4" key={`skeleton-list-${id}`}>
            <Skeleton className="h-12 w-12 rounded-sm" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>
        )
    }
  }

  return (
    <div aria-busy="true" className={className} data-slot="page-skeleton">
      {showHeader && (
        <div className="mb-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
      )}

      {showFilters && (
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}

      <div
        className={
          variant === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-6'
        }
      >
        {skeletonItems.map(item => renderSkeletonItem(item.id))}
      </div>
    </div>
  )
}
