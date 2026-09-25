import { Button } from '@atom63/ui-react'
import type { ReactElement } from 'react'

import type { InformAction } from '../core/types'
import { cn } from '../lib/cn'

export type InformActionsProps = {
  actions: readonly InformAction[]
  className?: string
}

export function InformActions({ actions, className }: InformActionsProps): ReactElement | null {
  if (actions.length === 0) return null

  return (
    <div className={cn('a63-InformActions', className)}>
      {actions.map(action => (
        <Button
          key={action.id}
          onClick={action.onSelect}
          size="sm"
          type="button"
          variant={action.variant === 'primary' ? 'primary' : 'outline'}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}
