import { TooltipProvider } from '@atom63/ui-react'
import type { ReactNode } from 'react'

type DocProvidersProps = {
  children: ReactNode
}

/** Global providers required for interactive docs previews. */
export function DocProviders({ children }: DocProvidersProps) {
  return <TooltipProvider>{children}</TooltipProvider>
}
