import { Card, CardContent, FeedbackState, Skeleton } from '@atom63/ui-react'
import { useNavigate } from '@tanstack/react-router'

/* Placeholders shaped like the content they stand in for. The wrapper is
   announced once as busy; the skeletons themselves are hidden from assistive
   technology. */
export function LoadingBlock({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-3" role="status">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton className="h-10 w-full rounded-md" key={index} />
      ))}
    </div>
  )
}

export function LoadingStats() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading metrics"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="status"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} padding="none">
          <CardContent className="flex flex-col gap-3" padding="md">
            <Skeleton className="h-4 w-20 rounded-sm" />
            <Skeleton className="h-7 w-28 rounded-sm" />
            <Skeleton className="h-4 w-24 rounded-sm" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* The error state with a way out: retrying drops the forced state. */
export function LoadError({ what }: { what: string }) {
  const navigate = useNavigate()
  return (
    <FeedbackState
      actions={[
        {
          label: 'Try again',
          onClick: () => navigate({ to: '.', search: {} }),
          variant: 'outline',
        },
      ]}
      description={`We couldn't load ${what}. Check your connection and try again; nothing you saved is lost.`}
      level={2}
      state="error"
      title={`Couldn't load ${what}`}
    />
  )
}
