import {
  Card,
  CardContent,
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from '@atom63/ui-react'
import { SectionHeader } from '@atom63/ui-react/layout'
import { Circle, CircleCheck, CircleDot } from 'lucide-react'
import type { ReactNode } from 'react'

export const template = {
  id: 'getting-started-checklist',
  kind: 'block',
  title: 'Getting started checklist',
  description:
    'A short list of first steps with a progress count: finished steps are checked, the first unfinished one is current and carries its action, and the rest wait.',
  category: 'feedback',
  tags: ['onboarding', 'getting started', 'checklist', 'steps', 'setup', 'progress', 'first run'],
  readiness: 'ready',
} as const

export interface ChecklistStep {
  /** The current step's call to action, for example a button or link. */
  action?: ReactNode
  /** One line on why the step matters. */
  description: string
  done: boolean
  id: string
  title: string
}

export interface GettingStartedChecklistProps {
  description?: string
  steps: readonly ChecklistStep[]
  title: string
}

/*
 * The current step is the first one not done, so the list cannot mark two
 * steps current or skip ahead. Each step's state is spoken before its title,
 * since the icons are decorative.
 */
export function GettingStartedChecklist({
  description,
  steps,
  title,
}: GettingStartedChecklistProps) {
  const done = steps.filter(step => step.done).length
  const current = steps.find(step => !step.done)
  const summary = (value: number | null) => `${value ?? 0} of ${steps.length} done`

  return (
    <Card className="w-full" padding="none">
      <CardContent className="flex flex-col gap-4" padding="lg">
        <SectionHeader description={description} level={2} title={title} variant="muted" />
        <Progress
          aria-label={title}
          getAriaValueText={(_, value) => summary(value)}
          max={steps.length}
          value={done}
        >
          <div className="flex justify-end">
            <ProgressValue className="text-muted-foreground text-xs">
              {(_, value) => summary(value)}
            </ProgressValue>
          </div>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <ol className="flex flex-col gap-4">
          {steps.map(step => {
            const isCurrent = step === current
            const Icon = step.done ? CircleCheck : isCurrent ? CircleDot : Circle
            return (
              <li
                aria-current={isCurrent ? 'step' : undefined}
                className="flex items-start gap-3"
                key={step.id}
              >
                <Icon
                  aria-hidden
                  className={
                    step.done || isCurrent
                      ? 'text-primary mt-0.5 size-4 shrink-0'
                      : 'text-muted-foreground mt-0.5 size-4 shrink-0'
                  }
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                  <p
                    className={step.done ? 'text-muted-foreground' : 'text-foreground font-medium'}
                  >
                    <span className="sr-only">
                      {step.done ? 'Done: ' : isCurrent ? 'Next: ' : 'To do: '}
                    </span>
                    {step.title}
                  </p>
                  <p className="text-muted-foreground">{step.description}</p>
                  {isCurrent && step.action ? <div className="pt-1">{step.action}</div> : null}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
