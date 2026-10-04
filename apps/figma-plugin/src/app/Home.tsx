import type { TokenTable } from '@atom63/figma'
import { useEffect, useState } from 'react'

import { Button, LoadingState, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import styles from './app.module.css'
import { summarizeTable } from './table-summary'

/** What the file holds: two ways in for an empty file, a summary for a file with a table. */
export function Home({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) {
  const postMessage = usePostMessage()
  const [table, setTable] = useState<TokenTable | null>(null)

  useEffect(() => postMessage({ type: 'scan' }), [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'table') setTable(message.data)
  })

  if (!table) return <LoadingState />
  const summary = summarizeTable(table)

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
    </div>
  )
}
