import { clsx } from 'clsx'
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import {
  SequenceBlock,
  SequenceBody,
  SequenceSpine,
} from '../../foundations/sequence/sequence-block'

export type StepsProps = {
  children: ReactNode
  className?: string
}

export type StepsStepProps = {
  /** Bold heading for the step. */
  title: ReactNode
  children: ReactNode
  className?: string
  /** Injected by `Steps` — the 1-indexed position in document order. */
  index?: number
}

/**
 * A single step row: a numbered badge on the connector spine (left) plus the
 * title and content (right). Static/SSR-safe. `index` is injected by the parent
 * `Steps` so authors never number steps by hand.
 */
function StepsStep({ title, children, className, index = 1 }: StepsStepProps) {
  return (
    <li className={clsx('group relative grid grid-cols-[2.25rem_1fr] gap-4', className)}>
      <div className="flex flex-col items-center">
        <span
          className="mdx-steps-number z-10 flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-sm tabular-nums"
          data-testid="steps-step-number"
        >
          {index}
        </span>
        <SequenceSpine />
      </div>
      <SequenceBody title={title}>{children}</SequenceBody>
    </li>
  )
}

/**
 * MDX `Steps` block — a numbered stepper. Wraps `Steps.Step` children in an
 * ordered list with a connector spine, auto-numbering each step 1..n in
 * document order. Static/SSR-safe (no client interactivity or motion).
 */
function Steps({ children, className }: StepsProps) {
  const { nodes: numbered } = Children.toArray(children).reduce<{
    nodes: ReactNode[]
    step: number
  }>(
    (acc, child) => {
      if (!isValidElement(child) || child.type !== StepsStep) {
        return { nodes: [...acc.nodes, child], step: acc.step }
      }

      const nextStep = acc.step + 1
      return {
        nodes: [
          ...acc.nodes,
          cloneElement(child as ReactElement<StepsStepProps>, { index: nextStep }),
        ],
        step: nextStep,
      }
    },
    { nodes: [], step: 0 }
  )

  return <SequenceBlock className={className}>{numbered}</SequenceBlock>
}

Steps.Step = StepsStep

export { Steps }
