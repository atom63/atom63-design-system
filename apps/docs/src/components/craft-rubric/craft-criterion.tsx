import { Badge } from '@atom63/ui-react'
import { Fragment, type ReactNode } from 'react'
import { craftCriteria } from '../../../../../scripts/design-system/lib/craft-rubric.mjs'
import { craftExamples } from './craft-examples'

/** Renders the `code` spans of a rubric string; the rubric data is plain text with backticks. */
function RubricText({ text }: { text: string }) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]">
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  )
}

function ExamplePanel({
  caption,
  children,
  score,
}: {
  caption: string
  children: ReactNode
  score: 1 | 3
}) {
  return (
    <div
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border"
      data-craft-example={score}
    >
      <div className="flex flex-1 items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="flex items-start gap-2 border-t border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <Badge className="shrink-0" size="sm" variant={score === 3 ? 'success' : 'error'}>
          {score === 3 ? 'Scores 3' : 'Scores 1'}
        </Badge>
        <span className="min-w-0">
          <RubricText text={caption} />
        </span>
      </div>
    </div>
  )
}

/**
 * One rubric criterion: its definition, 1–3 scale, automated coverage and a
 * live good and bad example. Text comes from `scripts/design-system/lib/craft-rubric.mjs`.
 */
export function CraftCriterion({ id }: { id: string }) {
  const criterion = craftCriteria.find(entry => entry.id === id)
  const example = craftExamples[id]
  if (!criterion || !example) {
    throw new Error(`Unknown craft criterion: ${id}`)
  }

  return (
    <div className="not-prose not-mdx my-5 space-y-5 text-sm leading-relaxed text-foreground">
      <p className="text-base">
        <RubricText text={criterion.definition} />
      </p>

      <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {([3, 2, 1] as const).map(score => (
          <div key={score} className="flex gap-3 px-3 py-2.5">
            <dt className="w-6 shrink-0 font-mono font-medium text-foreground tabular-nums">
              {score}
            </dt>
            <dd className="min-w-0 text-muted-foreground">
              <RubricText text={criterion.levels[score]} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1.5 font-medium">Checked automatically</p>
          <ul className="list-disc space-y-1 ps-4 text-muted-foreground">
            {criterion.automated.map(line => (
              <li key={line}>
                <RubricText text={line} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 font-medium">Left to judgment</p>
          <p className="text-muted-foreground">
            <RubricText text={criterion.judged} />
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ExamplePanel caption={example.good.caption} score={3}>
          <example.good.Example />
        </ExamplePanel>
        <ExamplePanel caption={example.bad.caption} score={1}>
          <example.bad.Example />
        </ExamplePanel>
      </div>
    </div>
  )
}
