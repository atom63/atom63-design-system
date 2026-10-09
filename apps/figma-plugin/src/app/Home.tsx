import type { TokenTable } from '@atom63/figma'
import { useEffect, useState } from 'react'

import { Button, LoadingState, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import type { DesignSystemTable } from '../messages'
import styles from './app.module.css'
import { summarizeTable } from './table-summary'

const ATOM63_LINE =
  'Variables, text and effect styles, and the Atom63 components with their spec cards.'

/**
 * What the file holds: three ways in for an empty file, a summary for a file
 * with a table, and an update when that table is Atom63's.
 */
export function Home({
  onAtom63,
  onCreate,
  onImport,
}: {
  onAtom63: () => void
  onCreate: () => void
  onImport: () => void
}) {
  const postMessage = usePostMessage()
  const [table, setTable] = useState<TokenTable | null>(null)
  // undefined while the Atom63 scan runs; null when it could not run.
  const [atom63, setAtom63] = useState<DesignSystemTable | null | undefined>(undefined)

  useEffect(() => {
    postMessage({ type: 'scan' })
    postMessage({ type: 'atom63-scan' })
  }, [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'table') setTable(message.data)
    if (message.type === 'atom63-table') setAtom63(message.data)
    if (message.type === 'error') setAtom63(current => current ?? null)
  })

  if (!table || atom63 === undefined) return <LoadingState />
  const summary = summarizeTable(table)
  const isAtom63 = !!atom63?.atom63 && !atom63.template
  const atom63Entry = (
    <div className={styles.entry}>
      <Button onClick={onAtom63} variant="secondary">
        Atom63 design system
      </Button>
      <p className={styles.meta}>{ATOM63_LINE}</p>
    </div>
  )

  if (summary.empty)
    return (
      <div className={styles.view}>
        <SectionHeader
          description="Create a token system from a brand color and a few choices, or import the token CSS of a project. Either way this file gets variables, text styles and effect styles that match the code."
          title="Start a token table"
        />
        <div className={styles.actions}>
          <Button onClick={onCreate} variant="primary">
            Create a token system
          </Button>
          <Button onClick={onImport} variant="secondary">
            Import from CSS
          </Button>
        </div>
        {atom63Entry}
      </div>
    )

  if (isAtom63)
    return (
      <div className={styles.view}>
        <SectionHeader
          description={`This file holds the Atom63 design system: ${summary.line}`}
          title="Atom63 design system"
        />
        <p className={styles.meta}>{ATOM63_LINE}</p>
        <div className={styles.actions}>
          <Button onClick={onAtom63} variant="primary">
            Update Atom63 design system
          </Button>
        </div>
      </div>
    )

  return (
    <div className={styles.view}>
      <SectionHeader description={summary.line} title="Token table" />
      <ul className={styles.list}>
        {table.collections.map(collection => (
          <li key={collection.name}>
            <span>{collection.name}</span>
            <span>
              {collection.variables} variables, {collection.modes}{' '}
              {collection.modes === 1 ? 'mode' : 'modes'}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.meta}>
        Code is the source of these tokens. After the token CSS changes, ask your coding agent to
        sync this file (<span className={styles.code}>atom63-figma sync</span>), or import the CSS
        again here.
      </p>
      <div className={styles.actions}>
        <Button onClick={onImport} variant="secondary">
          Import again
        </Button>
      </div>
      {atom63Entry}
    </div>
  )
}
