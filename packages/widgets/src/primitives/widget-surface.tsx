import { createContext, type HTMLAttributes, type ReactNode, useContext } from 'react'
import type { WidgetSize } from '../types'
import { cn } from '../utils'
import { WIDGET_CARD_SURFACE_CLASS, WIDGET_RIM_SHELL_CLASS } from './widget-surface-classes'

const WidgetSurfaceSizeContext = createContext<WidgetSize | undefined>(undefined)

/**
 * The partition reads Tailwind utility names, because that is what consumer
 * call sites write. The package's own classes stay on the face.
 *
 * Classes that size the widget's OUTER box, so they belong on the shell and must
 * NOT stay on the face. A consumer writing `w-80` means "this widget is 320px
 * wide" — left on the face it constrains the material while the shell still
 * stretches to its parent, which shows up as dead space along one edge.
 *
 * Deliberately excludes bare `flex` and `flex-col`/`flex-row`: those set display
 * and direction for the CHILDREN, so they stay on the face.
 */
const SHELL_BOX_CLASS_PATTERN = /(^|:)(w|h|size|max-w|max-h|basis|aspect)-\[?[a-z0-9./%[\]-]+\]?$/

/**
 * Classes that must apply to BOTH boxes. `overflow-*` because the shell owns the
 * outer clip, so a view asking for `overflow-visible` has to escape both. Flex
 * item + min-size because each box is a flex item of the one above it, and
 * `min-h-0` on the face is separately load-bearing for internal scrolling.
 */
const SHARED_CLASS_PATTERN =
  /(^|:)(overflow(-[xy])?-[a-z]+|min-[wh]-[a-z0-9.[\]/-]+|flex-(1|auto|initial|none)|grow(-0)?|shrink(-0)?)$/

function partitionSurfaceClasses(className: string | undefined) {
  if (!className) return { face: undefined, shell: undefined }
  const face: string[] = []
  const shell: string[] = []
  for (const token of className.split(/\s+/).filter(Boolean)) {
    if (SHELL_BOX_CLASS_PATTERN.test(token)) {
      shell.push(token)
      continue
    }
    face.push(token)
    if (SHARED_CLASS_PATTERN.test(token)) shell.push(token)
  }
  return {
    face: face.length > 0 ? face.join(' ') : undefined,
    shell: shell.length > 0 ? shell.join(' ') : undefined,
  }
}

/** Read the size of the nearest enclosing WidgetSurface (undefined outside one). */
export function useWidgetSurfaceSize(): WidgetSize | undefined {
  return useContext(WidgetSurfaceSizeContext)
}

/**
 * Publish a surface size WITHOUT any chrome.
 *
 * Use this inside a widget when an inner region only needs content blocks to
 * read `useWidgetSurfaceSize()` for density. Reaching for `WidgetSurface` and
 * switching its chrome off with `rounded-none border-0 bg-transparent
 * before:hidden` no longer works: `className` lands on the face, so the rim
 * shell still paints padding, background and radius — which renders as a
 * nested card inside the widget.
 */
export function WidgetSurfaceSizeProvider({
  children,
  size,
}: {
  children: ReactNode
  size: WidgetSize
}) {
  return (
    <WidgetSurfaceSizeContext.Provider value={size}>{children}</WidgetSurfaceSizeContext.Provider>
  )
}

export interface WidgetSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Grid footprint: 1×1, 2×1 or 2×2. Every widget is designed at all three. */
  size: WidgetSize
}

/**
 * The sized surface primitive: themed chrome + size semantics. `size` is a
 * signal (data attribute + context), not dimensions — the box comes from the
 * consumption context (a grid tile). Content blocks read the size via
 * useWidgetSurfaceSize() to adapt density.
 *
 * It nests two layers: an outer SHELL carrying the rim (real padded geometry,
 * so it can hold a gradient across the whole frame) and an inner FACE carrying
 * today's background, border, and the ::before backdrop.
 * The shell is the surface root — `{...rest}` and the `data-widget-surface*`
 * attributes live there, because measurement tooling queries them and the tile
 * edge is the outer box.
 *
 * Consumer `className` is PARTITIONED between the two boxes, because real call
 * sites mix both concerns in one string (`flex size-full min-h-0 flex-col`):
 *
 * - box classes (`w-80`, `size-full`, `aspect-[2/1]`) size the widget itself, so
 *   they move to the shell. Left on the face they constrain the material while
 *   the shell still stretches to its parent, leaving dead space along one edge.
 * - flex-item and `overflow-*` classes apply to BOTH, since each box is a flex
 *   item of the one above and the shell owns the outer clip.
 * - everything else stays on the face: inner layout (`flex-col`, `gap-3`,
 *   `p-4`) and the chrome escape hatches (`before:hidden`, `border-0`) that need
 *   to reach the element actually painting the material.
 */
export function WidgetSurface({ children, className, size, ...rest }: WidgetSurfaceProps) {
  const partitioned = partitionSurfaceClasses(className)

  return (
    <WidgetSurfaceSizeContext.Provider value={size}>
      <div
        {...rest}
        className={cn(WIDGET_RIM_SHELL_CLASS, partitioned.shell)}
        data-widget-surface=""
        data-widget-surface-size={size}
      >
        {/* `a63-WidgetSurface-body` positions the face, which anchors its
            absolutely-positioned ::before material to the face rather than
            letting it escape to the shell. */}
        <div className={cn(WIDGET_CARD_SURFACE_CLASS, 'a63-WidgetSurface-body', partitioned.face)}>
          {children}
        </div>
      </div>
    </WidgetSurfaceSizeContext.Provider>
  )
}
