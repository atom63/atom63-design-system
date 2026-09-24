'use client'

import { createContext, useContext } from 'react'

interface ComparisonContextValue {
  durationScale: number
}

const ComparisonContext = createContext<ComparisonContextValue>({ durationScale: 1 })

function ComparisonProvider({
  children,
  durationScale,
}: {
  children: React.ReactNode
  durationScale: number
}) {
  return (
    <ComparisonContext.Provider value={{ durationScale }}>{children}</ComparisonContext.Provider>
  )
}

function useComparisonContext(): ComparisonContextValue {
  return useContext(ComparisonContext)
}

export { ComparisonProvider, useComparisonContext }
export type { ComparisonContextValue }
