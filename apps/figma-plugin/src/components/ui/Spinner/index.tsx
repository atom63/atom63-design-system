import { Spinner } from '@atom63/ui-react'
import type { ReactNode } from 'react'

import styles from './Spinner.module.css'

export { Spinner }

export interface LoadingStateProps {
  children?: ReactNode
  hint?: string
  message?: string
}

/** A centered Atom63 Spinner with an optional message and hint. */
export function LoadingState({ message, hint, children }: LoadingStateProps) {
  return (
    <div aria-live="polite" className={styles.loadingState} role="status">
      {children ?? <Spinner aria-hidden className={styles.spinner} />}
      {message && <p className={styles.message}>{message}</p>}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
