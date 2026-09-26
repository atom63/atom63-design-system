import { useEffect, useRef, useState } from 'react'
import type { AgentRuntime } from '../runtime'

/**
 * Creates a runtime the calling component owns: built once on mount and
 * disposed on unmount, so an in-flight run cannot outlive its host.
 */
export function useOwnedAgentRuntime(factory: () => AgentRuntime): AgentRuntime {
  const factoryRef = useRef(factory)
  factoryRef.current = factory

  const [runtime, setRuntime] = useState(() => factoryRef.current())

  useEffect(() => {
    if (runtime.getState().status === 'disposed') {
      setRuntime(factoryRef.current())
      return
    }

    return () => {
      runtime.dispose()
    }
  }, [runtime])

  return runtime
}
