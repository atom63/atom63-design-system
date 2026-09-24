'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { MdxFramePanel } from '../../foundations/frame/framed-block'
import { mdxStyles } from '../../mdx-styles'
import { motionDurations, motionEasings } from '../../primitives/motion-tokens'
import { useMdxReducedMotion } from '../../primitives/use-reduced-motion'

export type ScrollStageStepProps = {
  /**
   * The visual (image, diagram, JSX) shown for this step. Keep it cheap — in the
   * pinned path it re-renders whenever the active step changes, so prefer static
   * images/JSX over heavy live components. Avoid putting anchor `id`s inside
   * `media` or the prose: both the pinned (`lg+`) and stacked (below `lg`) copies
   * render into the DOM, so an `id` would be duplicated.
   */
  media: ReactNode
  children: ReactNode
  className?: string
}

export type ScrollStageProps = {
  children: ReactNode
  className?: string
}

/**
 * Pure selection helper for the pinned path: given the current visibility of
 * each step, return the index of the step with the greatest intersection
 * ratio. Ties resolve to the lowest index; an empty list resolves to 0.
 * Extracted so the active-step logic is unit-testable without a viewport.
 */
export function resolveActiveStepIndex(entries: { index: number; ratio: number }[]): number {
  let best = 0
  let bestRatio = -1
  for (const entry of entries) {
    if (entry.ratio > bestRatio || (entry.ratio === bestRatio && entry.index < best)) {
      best = entry.index
      bestRatio = entry.ratio
    }
  }
  return best
}

/**
 * A single scrollytelling step. Renders as a real subcomponent so the parent
 * `ScrollStage` can read its `media` and `children` (Compare.Item precedent).
 * The visual rendering is handled by `ScrollStage`; this component is only a
 * data carrier when used inside the stage.
 */
function ScrollStageStep(_props: ScrollStageStepProps) {
  return null
}

type ResolvedStep = {
  media: ReactNode
  children: ReactNode
  className?: string
  key: string
}

function resolveSteps(children: ReactNode): ResolvedStep[] {
  const steps: ResolvedStep[] = []
  Children.forEach(children, (child, i) => {
    if (!isValidElement(child) || child.type !== ScrollStageStep) return
    const {
      media,
      children: prose,
      className,
    } = (child as ReactElement<ScrollStageStepProps>).props
    steps.push({ media, children: prose, className, key: String(child.key ?? i) })
  })
  return steps
}

// Color/surface/border/radius live in the `.mdx-scroll-stage-*` recipes
// (mdx-blocks.css); only geometry stays inline here.
const proseClassName =
  'mdx-scroll-stage-prose text-pretty leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'

const mediaWrapperClassName = 'mdx-scroll-stage-media overflow-hidden p-0'

/** Static stacked layout: media inline above prose, everything visible. */
function StackedStage({ steps, className }: { steps: ResolvedStep[]; className?: string }) {
  return (
    <div className={clsx('not-mdx mdx-block', mdxStyles.spacing.block, className)}>
      <div className="flex flex-col gap-10">
        {steps.map(step => (
          <div className={step.className} key={step.key}>
            <MdxFramePanel className={mediaWrapperClassName}>{step.media}</MdxFramePanel>
            <div className={clsx('mt-4', proseClassName)}>{step.children}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Pinned two-column layout (lg+, motion allowed): the reading column scrolls
 * on the left while a sticky media pane on the right crossfades to the active
 * step's media. Below lg it collapses to the stacked layout.
 */
function PinnedStage({ steps, className }: { steps: ResolvedStep[]; className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const nodes = stepRefs.current.filter((node): node is HTMLDivElement => node !== null)
    if (nodes.length === 0) return

    const ratios = new Map<number, number>()
    const observer = new IntersectionObserver(
      observed => {
        for (const entry of observed) {
          const index = Number(entry.target.getAttribute('data-step-index'))
          ratios.set(index, entry.intersectionRatio)
        }
        const entries = Array.from(ratios, ([index, ratio]) => ({ index, ratio }))
        setActiveIndex(resolveActiveStepIndex(entries))
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const activeStep = steps[activeIndex] ?? steps[0]

  return (
    <div className={clsx('not-mdx mdx-block', mdxStyles.spacing.block, className)}>
      {/* Below lg: stacked media inline above prose. */}
      <div className="flex flex-col gap-10 lg:hidden">
        {steps.map(step => (
          <div className={step.className} key={step.key}>
            <MdxFramePanel className={mediaWrapperClassName}>{step.media}</MdxFramePanel>
            <div className={clsx('mt-4', proseClassName)}>{step.children}</div>
          </div>
        ))}
      </div>

      {/* lg+: two-column pinned layout. */}
      <div className="hidden gap-10 lg:grid lg:grid-cols-2">
        <div className="flex flex-col">
          {steps.map((step, index) => (
            <div
              className={clsx('flex min-h-[70vh] flex-col justify-center', step.className)}
              data-step-index={index}
              key={step.key}
              ref={node => {
                stepRefs.current[index] = node
              }}
            >
              <div className={proseClassName}>{step.children}</div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24 flex h-[70vh] items-center">
            <MdxFramePanel className={clsx('relative w-full', mediaWrapperClassName)}>
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  animate={{ opacity: 1 }}
                  className="w-full"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key={activeStep?.key}
                  transition={{
                    duration: motionDurations.base,
                    ease: motionEasings.standard,
                  }}
                >
                  {activeStep?.media}
                </motion.div>
              </AnimatePresence>
            </MdxFramePanel>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * MDX `ScrollStage` block — a scrollytelling section. On `lg+` with motion
 * allowed, the reading column scrolls while a sticky media pane crossfades to
 * the step centered in the viewport. Reduced-motion and mobile render a static
 * stacked layout (media inline above prose). SSR-safe: no window access during
 * render; the IntersectionObserver is set up in `useEffect`.
 */
function ScrollStage({ children, className }: ScrollStageProps) {
  const reduced = useMdxReducedMotion()
  const steps = resolveSteps(children)

  if (reduced) {
    return <StackedStage className={className} steps={steps} />
  }
  return <PinnedStage className={className} steps={steps} />
}

ScrollStage.Step = ScrollStageStep

export { ScrollStage }
