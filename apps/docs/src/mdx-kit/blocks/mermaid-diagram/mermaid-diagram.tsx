import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@atom63/ui-react'
import { clsx } from 'clsx'
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type { PointerEvent, ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MdxFrameChrome, MdxFrameHeader, MdxFramePanel } from '../../foundations/frame/framed-block'
import { mdxStyles } from '../../mdx-styles'
import { motionDurations } from '../../primitives/motion-tokens'
import { useMdxReducedMotion } from '../../primitives/use-reduced-motion'

export type MermaidDiagramLabels = {
  diagram: string
  zoomOut: string
  zoomOutTitle: string
  resetZoom: string
  resetZoomTitle: string
  zoomIn: string
  zoomInTitle: string
  rendering: string
  errorMessage: string
}

export const defaultMermaidDiagramLabels: MermaidDiagramLabels = {
  diagram: 'Mermaid diagram',
  zoomOut: 'Zoom diagram out',
  zoomOutTitle: 'Zoom out',
  resetZoom: 'Reset diagram zoom',
  resetZoomTitle: 'Reset zoom',
  zoomIn: 'Zoom diagram in',
  zoomInTitle: 'Zoom in',
  rendering: 'Rendering diagram...',
  errorMessage: 'Unable to render diagram.',
}

export interface MermaidDiagramProps {
  /** When true, animate the diagram's paths with a stroke draw-on-reveal. Off by default. */
  animated?: boolean
  chart: string
  labels?: Partial<MermaidDiagramLabels>
  title?: string
}

/**
 * Runs a one-shot stroke draw-in over the SVG's `<path>` elements. Each path's
 * `getTotalLength()` is read to seed `stroke-dasharray`/`stroke-dashoffset`, then
 * the offset is transitioned to `0`.
 *
 * jsdom (and non-path SVGs) have no `getTotalLength`, or it returns `0`; such
 * paths are skipped so this never throws off the render path.
 */
function drawInPaths(svg: SVGSVGElement): void {
  const durationMs = motionDurations.slow * 1000
  for (const path of svg.querySelectorAll('path')) {
    const total = path.getTotalLength?.()
    if (!total || Number.isNaN(total)) {
      continue
    }
    path.style.transition = 'none'
    path.style.strokeDasharray = String(total)
    path.style.strokeDashoffset = String(total)
    // Force layout so the starting offset is committed before we transition.
    void path.getBoundingClientRect()
    path.style.transition = `stroke-dashoffset ${durationMs}ms var(--mdx-ease-standard, ease-out)`
    path.style.strokeDashoffset = '0'
  }
}

const DEFAULT_ZOOM = 1
const MIN_ZOOM = 0.75
const MAX_ZOOM = 2
const ZOOM_STEP = 0.25

type PanPosition = {
  x: number
  y: number
}

type DragState = {
  pointerId: number
  startPan: PanPosition
  startX: number
  startY: number
}

type RenderResult =
  | {
      error: null
      svg: null
    }
  | {
      error: null
      svg: string
    }
  | {
      error: Error
      svg: null
    }

type RenderMermaidSvg = (typeof import('beautiful-mermaid'))['renderMermaidSVG']

const INITIAL_RENDER_RESULT: RenderResult = {
  error: null,
  svg: null,
}

type MermaidControlButtonProps = {
  children: ReactNode
  disabled: boolean
  label: string
  onClick: () => void
  tooltip: string
}

function MermaidControlButton({
  children,
  disabled,
  label,
  onClick,
  tooltip,
}: MermaidControlButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function renderDiagram(chart: string, renderMermaidSVG: RenderMermaidSvg): RenderResult {
  try {
    return {
      error: null,
      svg: renderMermaidSVG(chart, {
        accent: 'color-mix(in oklch, var(--a63-action-primary) 34%, var(--a63-text-primary) 66%)',
        bg: 'var(--a63-surface-page)',
        border: 'color-mix(in oklch, var(--a63-border-subtle) 78%, var(--a63-text-primary) 22%)',
        fg: 'var(--a63-text-primary)',
        font: 'var(--font-mono, ui-monospace, monospace)',
        componentSpacing: 32,
        layerSpacing: 44,
        line: 'color-mix(in oklch, var(--a63-text-secondary) 74%, var(--a63-text-primary) 26%)',
        muted: 'color-mix(in oklch, var(--a63-text-secondary) 82%, var(--a63-text-primary) 18%)',
        nodeSpacing: 32,
        padding: 16,
        surface: 'color-mix(in oklch, var(--a63-surface-panel) 88%, var(--a63-text-primary) 12%)',
        transparent: true,
      }),
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unable to render Mermaid diagram.'),
      svg: null,
    }
  }
}

export function MermaidDiagram({ animated = false, chart, labels, title }: MermaidDiagramProps) {
  const resolvedLabels = { ...defaultMermaidDiagramLabels, ...labels }
  const reducedMotion = useMdxReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)
  const dragStateRef = useRef<DragState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 })
  const [renderResult, setRenderResult] = useState<RenderResult>(INITIAL_RENDER_RESULT)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const zoomPercent = Math.round(zoom * 100)
  const canZoomOut = zoom > MIN_ZOOM
  const canZoomIn = zoom < MAX_ZOOM
  const isRendered = Boolean(renderResult.svg)
  const canPan = zoom > DEFAULT_ZOOM && isRendered

  const updateZoom = useCallback((direction: -1 | 1) => {
    setZoom(currentZoom => {
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + direction * ZOOM_STEP))
      if (nextZoom <= DEFAULT_ZOOM) {
        setPan({ x: 0, y: 0 })
      }
      return nextZoom
    })
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
    setPan({ x: 0, y: 0 })
  }, [])

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!canPan) {
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      dragStateRef.current = {
        pointerId: event.pointerId,
        startPan: pan,
        startX: event.clientX,
        startY: event.clientY,
      }
      setIsDragging(true)
    },
    [canPan, pan]
  )

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    setPan({
      x: dragState.startPan.x + event.clientX - dragState.startX,
      y: dragState.startPan.y + event.clientY - dragState.startY,
    })
  }, [])

  const stopDragging = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    dragStateRef.current = null
    setIsDragging(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    setRenderResult(INITIAL_RENDER_RESULT)

    const render = async () => {
      try {
        const { renderMermaidSVG } = await import('beautiful-mermaid')
        if (!cancelled) {
          setRenderResult(renderDiagram(chart, renderMermaidSVG))
        }
      } catch (error) {
        if (!cancelled) {
          setRenderResult({
            error: error instanceof Error ? error : new Error('Unable to load Mermaid renderer.'),
            svg: null,
          })
        }
      }
    }

    // render() try/catches its own body and surfaces failures through
    // setRenderResult, so this promise can never reject.
    void render()

    return () => {
      cancelled = true
    }
  }, [chart])

  useLayoutEffect(() => {
    if (!containerRef.current) {
      return
    }

    if (!renderResult.svg) {
      containerRef.current.innerHTML = ''
      return
    }

    containerRef.current.innerHTML = renderResult.svg
    const svgElement = containerRef.current.querySelector('svg')
    svgElement?.setAttribute('aria-label', title ?? resolvedLabels.diagram)
    svgElement?.setAttribute('role', 'img')
    svgElement?.style.setProperty('height', 'auto')
    svgElement?.style.setProperty('max-width', 'none')
    svgElement?.style.setProperty('width', '100%')
    // A fresh SVG was mounted; allow the draw-in to run again for it.
    hasAnimatedRef.current = false
  }, [renderResult.svg, title, resolvedLabels.diagram])

  // Draw-on-reveal: additive, gated by `animated` + reduced-motion, runs once
  // per mounted SVG when the diagram first enters the viewport. Never touches
  // the pan/zoom transform or the labels.
  useEffect(() => {
    if (!animated || reducedMotion || !renderResult.svg) {
      return
    }

    const container = containerRef.current
    const svgElement = container?.querySelector('svg')
    if (!container || !svgElement) {
      return
    }

    const run = () => {
      if (hasAnimatedRef.current) {
        return
      }
      hasAnimatedRef.current = true
      drawInPaths(svgElement)
    }

    if (typeof IntersectionObserver === 'undefined') {
      run()
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run()
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [animated, reducedMotion, renderResult.svg])

  return (
    <MdxFrameChrome
      className={clsx('mermaid-diagram not-mdx mdx-block min-w-0', mdxStyles.spacing.block)}
    >
      <MdxFrameHeader className="flex-row items-center justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          {title ? (
            <p className="mdx-mermaid-title truncate text-sm font-medium">{title}</p>
          ) : (
            <p className="mdx-mermaid-diagram-label text-sm font-medium">
              {resolvedLabels.diagram}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="mdx-mermaid-zoom w-11 text-center font-mono text-xs tabular-nums">
            {zoomPercent}%
          </span>
          <MermaidControlButton
            disabled={!canZoomOut || !isRendered}
            label={resolvedLabels.zoomOut}
            onClick={() => updateZoom(-1)}
            tooltip={resolvedLabels.zoomOutTitle}
          >
            <ZoomOut aria-hidden />
          </MermaidControlButton>
          <MermaidControlButton
            disabled={zoom === DEFAULT_ZOOM || !isRendered}
            label={resolvedLabels.resetZoom}
            onClick={resetZoom}
            tooltip={resolvedLabels.resetZoomTitle}
          >
            <RotateCcw aria-hidden />
          </MermaidControlButton>
          <MermaidControlButton
            disabled={!canZoomIn || !isRendered}
            label={resolvedLabels.zoomIn}
            onClick={() => updateZoom(1)}
            tooltip={resolvedLabels.zoomInTitle}
          >
            <ZoomIn aria-hidden />
          </MermaidControlButton>
        </div>
      </MdxFrameHeader>
      <MdxFramePanel className="mdx-mermaid-panel overflow-hidden p-0">
        <div className="mdx-mermaid-scroll scrollbar-reveal overflow-x-auto">
          <div
            className={`mdx-mermaid-stage relative min-h-80 overflow-hidden outline-none select-none ${
              canPan ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
            }`}
            onPointerCancel={stopDragging}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
          >
            <div
              className="mdx-mermaid-canvas flex min-h-80 items-center justify-center transition-transform duration-150 ease-out motion-reduce:transition-none [&_svg]:h-auto [&_svg]:max-w-none [&_svg_*]:select-none"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <div className="w-full max-w-[44rem]" ref={containerRef} />
            </div>
          </div>
          {renderResult.error ? (
            <div className="mdx-mermaid-error space-y-3 p-4">
              <p className="mdx-mermaid-error-text text-sm">{resolvedLabels.errorMessage}</p>
              <pre className="mdx-mermaid-error-pre overflow-x-auto p-4 text-sm">
                <code>{chart}</code>
              </pre>
            </div>
          ) : null}
          {renderResult.svg || renderResult.error ? null : (
            <output className="mdx-mermaid-rendering block p-4 text-sm">
              {resolvedLabels.rendering}
            </output>
          )}
        </div>
      </MdxFramePanel>
    </MdxFrameChrome>
  )
}
