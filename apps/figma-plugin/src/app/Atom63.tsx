import { Progress } from '@atom63/ui-react'
import { useEffect, useRef, useState } from 'react'

import { Alert, Button, LoadingState, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import styles from './app.module.css'
import {
  type Atom63Event,
  builtSummary,
  failureLines,
  initialAtom63State,
  nextAtom63,
  progressLabel,
  progressValue,
} from './atom63-state'

const ERROR_TITLES = {
  scanning: 'The file could not be read',
  idle: 'Something went wrong',
  building: 'The build did not finish',
  checking: 'The check did not finish',
} as const

/** Build the bundled Atom63 design system into this file, then check it. */
export function Atom63({ onDone }: { onDone: () => void }) {
  const postMessage = usePostMessage()
  const [state, setState] = useState(initialAtom63State)
  const stateRef = useRef(state)
  const resultRef = useRef<HTMLDivElement>(null)

  const update = (event: Atom63Event) => {
    const next = nextAtom63(stateRef.current, event)
    stateRef.current = next.state
    setState(next.state)
    if (next.send) postMessage({ type: next.send })
  }

  useEffect(() => {
    stateRef.current = nextAtom63(stateRef.current, { type: 'scan-sent' }).state
    postMessage({ type: 'atom63-scan' })
  }, [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'atom63-table') update({ type: 'table', data: message.data })
    if (message.type === 'progress') update({ type: 'progress', data: message.data })
    if (message.type === 'atom63-built') update({ type: 'built', data: message.data })
    if (message.type === 'atom63-checked') update({ type: 'checked', data: message.data })
    if (message.type === 'error') update({ type: 'error', message: message.data.message })
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

  return (
    <div className={styles.view}>
      <SectionHeader
        description="Variables, text and effect styles, and the Atom63 components with their spec cards."
        title="Atom63 design system"
      />
      {refused && (
        <Alert title="This file holds another token set" variant="error">
          {refused}
        </Alert>
      )}
      {table && (
        <ul aria-label="What this file holds" className={styles.list}>
          <li>
            <span>Atom63 tokens</span>
            <span>
              {table.atom63
                ? `${table.atom63.variables} variables in ${table.atom63.collections.length} collections`
                : 'None yet'}
            </span>
          </li>
          {table.components.map(component => (
            <li key={component.name}>
              <span>{component.name}</span>
              <span>
                {component.setOnPage
                  ? `${component.variants} variants, ${component.card ? 'spec card' : 'no spec card'}`
                  : 'Not built yet'}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.actions}>
        <Button
          aria-describedby={refused ? 'atom63-refused' : undefined}
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
      {refused && (
        <p className={styles.meta} id="atom63-refused">
          Start the Atom63 design system in a new file.
        </p>
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
          <div className={styles.actions}>
            <Button onClick={checkAgain} variant="secondary">
              Check again
            </Button>
          </div>
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
    </div>
  )
}
