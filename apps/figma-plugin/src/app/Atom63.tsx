import { Progress } from '@atom63/ui-react'
import { useEffect, useId, useRef, useState } from 'react'

import { Alert, Button, LoadingState, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import type { DesignSystemTable } from '../messages'
import styles from './app.module.css'
import {
  type Atom63Event,
  builtSummary,
  canCheckAgain,
  componentStatus,
  failureLines,
  nextAtom63,
  progressLabel,
  progressValue,
  retryLines,
  startAtom63,
  tokensStatus,
} from './atom63-state'

const ERROR_TITLES = {
  scanning: 'The file could not be read',
  idle: 'Something went wrong',
  building: 'The build did not finish',
  checking: 'The check did not finish',
} as const

/**
 * Build the bundled Atom63 design system into this file, then check it.
 * `initialTable` is what Home already scanned; without it the view scans.
 */
export function Atom63({
  initialTable,
  onDone,
}: {
  initialTable?: DesignSystemTable | null
  onDone: () => void
}) {
  const postMessage = usePostMessage()
  const [start] = useState(() => startAtom63(initialTable))
  const [state, setState] = useState(start.state)
  const stateRef = useRef(state)
  const resultRef = useRef<HTMLDivElement>(null)
  const refusedId = useId()

  const update = (event: Atom63Event) => {
    const next = nextAtom63(stateRef.current, event)
    stateRef.current = next.state
    setState(next.state)
    if (next.send) postMessage({ type: next.send })
  }

  useEffect(() => {
    if (start.send) postMessage({ type: start.send })
  }, [postMessage, start])
  useFigmaMessage(message => {
    if (message.type === 'atom63-table') update({ type: 'table', data: message.data })
    if (message.type === 'progress') update({ type: 'progress', data: message.data })
    if (message.type === 'atom63-built') update({ type: 'built', data: message.data })
    if (message.type === 'atom63-checked') update({ type: 'checked', data: message.data })
    if (message.type === 'error')
      update({ type: 'error', message: message.data.message, for: message.data.for })
  })

  const { phase, table, progress, blocked, built, checked, error } = state
  const result = blocked ?? checked ?? error
  useEffect(() => {
    if (result) resultRef.current?.focus()
  }, [result])

  if (!table && phase === 'scanning') return <LoadingState />
  const busy = phase === 'building' || phase === 'checking'
  const refused = table?.blocked ?? null
  const build = () => {
    update({ type: 'build-sent' })
    postMessage({ type: 'atom63-build' })
  }
  const checkAgain = () => {
    update({ type: 'check-sent' })
    postMessage({ type: 'atom63-check' })
  }
  const failures = checked?.status === 'fail' ? failureLines(checked, built) : []
  // A failed check lists them already.
  const retries = checked && checked.status !== 'fail' ? retryLines(built) : []

  return (
    <div className={styles.view}>
      <SectionHeader
        description="Variables, text and effect styles, and the Atom63 components with their spec cards."
        level={1}
        title="Atom63 design system"
      />
      {refused && (
        <Alert descriptionId={refusedId} title="This file holds another token set" variant="error">
          {refused}
        </Alert>
      )}
      {table && (
        <ul aria-label="What this file holds" className={styles.list}>
          <li>
            <span>Atom63 tokens</span>
            <span>{tokensStatus(table.atom63)}</span>
          </li>
          {table.components.map(component => (
            <li key={component.name}>
              <span>{component.name}</span>
              <span>{componentStatus(component)}</span>
            </li>
          ))}
        </ul>
      )}
      <div aria-live="polite" className={styles.progress}>
        {phase === 'building' && (
          <>
            <p className={styles.meta}>{progressLabel(progress)}</p>
            <Progress
              aria-label="Build progress"
              value={progressValue(progress, table?.components.length ?? 1)}
            />
          </>
        )}
        {phase === 'checking' && <p className={styles.meta}>Verifying…</p>}
      </div>
      {blocked && (
        <Alert title="Nothing was written" titleRef={resultRef} variant="error">
          {blocked.reason}
        </Alert>
      )}
      {checked?.status === 'pass' && (
        <Alert title="The file matches Atom63" titleRef={resultRef} variant="success">
          {builtSummary(built, checked).join(' ')}
        </Alert>
      )}
      {checked?.status === 'pending' && (
        <Alert
          title="Figma is still settling a component property — check again"
          titleRef={resultRef}
          variant="info"
        >
          Figma reconciles component properties after a build; a second check reads them settled.
        </Alert>
      )}
      {checked?.status === 'fail' && (
        <Alert title="The file does not match Atom63" titleRef={resultRef} variant="error">
          <ul className={styles.lines}>
            {failures.map((line, index) => (
              <li key={`${index}-${line}`}>{line}</li>
            ))}
          </ul>
        </Alert>
      )}
      {retries.length > 0 && (
        <Alert title="Some variants could not be written on retry" variant="info">
          <ul className={styles.lines}>
            {retries.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Alert>
      )}
      {built && built.fontFallbacks.length > 0 && (
        <Alert title={`${built.fontFallbacks.length} fonts fell back`} variant="info">
          <ul className={styles.lines}>
            {built.fontFallbacks.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Alert>
      )}
      {error && (
        <Alert
          title={ERROR_TITLES[error.during]}
          titleRef={blocked || checked ? undefined : resultRef}
          variant="error"
        >
          {error.message}
        </Alert>
      )}
      {canCheckAgain(state) && (
        <div className={styles.actions}>
          <Button disabled={busy} onClick={checkAgain} variant="secondary">
            Check again
          </Button>
        </div>
      )}
      <div className={styles.bar}>
        <Button
          aria-describedby={refused ? refusedId : undefined}
          disabled={busy || !!refused}
          loading={phase === 'building'}
          onClick={build}
          variant="primary"
        >
          {table?.atom63 ? 'Update' : 'Build'}
        </Button>
        <Button disabled={busy} onClick={onDone} variant="ghost">
          Back
        </Button>
      </div>
    </div>
  )
}
