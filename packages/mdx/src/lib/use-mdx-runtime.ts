// packages/mdx/src/lib/use-mdx-runtime.ts
import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'

export type MdxComponent = ComponentType<{ components?: Record<string, unknown> }>
type EvaluateMdx = (
  source: string,
  options: Record<string, unknown>
) => Promise<{ default: MdxComponent }>

// @mdx-js/mdx evaluate is loaded dynamically
let evaluatePromise: Promise<EvaluateMdx> | null = null
function loadEvaluate() {
  if (!evaluatePromise) {
    evaluatePromise = import('@mdx-js/mdx').then(m => m.evaluate as unknown as EvaluateMdx)
  }
  return evaluatePromise
}

/**
 * Compile an MDX string to a React component at runtime. Lazy-loads the MDX
 * compiler so it never enters the base bundle. The returned component renders
 * inside an `<MDXProvider>` (or accepts a `components` prop) for scope.
 */
export async function compileMdx(source: string): Promise<MdxComponent> {
  const [evaluate, runtime, mdxReact] = await Promise.all([
    loadEvaluate(),
    import('react/jsx-runtime'),
    import('@mdx-js/react'),
  ])
  const mod = await evaluate(source, {
    ...(runtime as Record<string, unknown>),
    useMDXComponents: mdxReact.useMDXComponents,
    baseUrl: import.meta.url,
  })
  return mod.default
}

export interface MdxRuntimeResult {
  Component: MdxComponent | null
  error: Error | null
  status: 'idle' | 'compiling' | 'ready' | 'error'
}

/**
 * Debounced runtime compile of an MDX string. Keeps the last successfully
 * compiled component while compiling and on error, so a transient typo never
 * blanks the preview.
 */
export function useMdxRuntime(source: string, debounceMs = 300): MdxRuntimeResult {
  const [state, setState] = useState<MdxRuntimeResult>({
    Component: null,
    error: null,
    status: 'idle',
  })
  const lastGood = useRef<MdxComponent | null>(null)
  const reqId = useRef(0)

  useEffect(() => {
    const trimmed = source.trim()
    if (!trimmed) {
      setState({ Component: null, error: null, status: 'idle' })
      return
    }
    const id = ++reqId.current
    setState(s => ({ ...s, status: 'compiling' }))
    const timer = setTimeout(() => {
      compileMdx(trimmed)
        .then(Component => {
          if (id !== reqId.current) return
          lastGood.current = Component
          setState({ Component, error: null, status: 'ready' })
        })
        .catch((e: unknown) => {
          if (id !== reqId.current) return
          setState({
            Component: lastGood.current,
            error: e instanceof Error ? e : new Error(String(e)),
            status: 'error',
          })
        })
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [source, debounceMs])

  return state
}
