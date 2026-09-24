// packages/mdx/src/mdx-live-preview.tsx
import { MDXProvider } from '@mdx-js/react'
import type { ComponentType, ReactNode } from 'react'
import { Component as ReactComponent, useEffect } from 'react'
import { useMdxRuntime } from './lib/use-mdx-runtime'

class MdxErrorBoundary extends ReactComponent<
  { children: ReactNode; resetKey: string; fallback: (e: Error) => ReactNode },
  { err: Error | null }
> {
  state: { err: Error | null } = { err: null }
  static getDerivedStateFromError(err: Error) {
    return { err }
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.err) {
      this.setState({ err: null })
    }
  }
  render() {
    return this.state.err ? this.props.fallback(this.state.err) : this.props.children
  }
}

export interface MdxLivePreviewProps {
  source: string
  components: Record<string, ComponentType<unknown>>
  onError?: (error: Error | null) => void
}

/**
 * Renders runtime-compiled MDX inside the given component scope, isolating
 * runtime throws in an error boundary. Compile errors are surfaced via onError
 * while the last good render stays on screen.
 */
export function MdxLivePreview({ source, components, onError }: MdxLivePreviewProps) {
  const { Component, error } = useMdxRuntime(source)

  useEffect(() => {
    onError?.(error)
  }, [error, onError])

  if (!Component) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center p-8 text-sm">
        Start typing MDX…
      </div>
    )
  }

  return (
    <MdxErrorBoundary
      fallback={e => <div className="text-destructive p-4 text-sm">Runtime error: {e.message}</div>}
      resetKey={source}
    >
      <MDXProvider components={components}>
        <Component />
      </MDXProvider>
    </MdxErrorBoundary>
  )
}
