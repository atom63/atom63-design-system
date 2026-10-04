import type { CheckOutcome, SyncOutcome } from '@atom63/figma'

import { Alert } from '../components/ui'
import styles from './app.module.css'

/** What a plan would change, or what an apply changed and whether it verified. */
export function Outcome({ planned, applied }: { planned?: CheckOutcome; applied?: SyncOutcome }) {
  if (applied) {
    const stylesLeft =
      (applied.styles?.verification.create.length ?? 0) +
      (applied.styles?.verification.update.length ?? 0)
    const left = applied.verification.create + applied.verification.update + stylesLeft
    const fallbacks = applied.styles?.applied.fontFallbacks ?? []
    return (
      <>
        <Alert
          title={left === 0 ? 'The file matches the code' : `${left} changes did not apply`}
          variant={left === 0 ? 'success' : 'error'}
        >
          {applied.applied.created} variables created, {applied.applied.updated} updated;{' '}
          {applied.styles?.applied.created ?? 0} styles created,{' '}
          {applied.styles?.applied.updated ?? 0} updated.
        </Alert>
        {fallbacks.length > 0 && (
          <Alert title={`${fallbacks.length} text styles use another font`} variant="info">
            <ul className={styles.list}>
              {fallbacks.map(item => (
                <li key={`${item.style}-${item.wanted}`}>
                  <span>{item.style}</span>
                  <span>
                    {item.used} in place of {item.wanted}
                  </span>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </>
    )
  }
  if (!planned) return null
  const styleChanges = (planned.styles?.create.length ?? 0) + (planned.styles?.update.length ?? 0)
  return (
    <p className={styles.meta}>
      {planned.planned.create} variables to create, {planned.planned.update} to update,{' '}
      {planned.planned.unchanged} unchanged; {styleChanges} styles to create or update.
      {planned.planned.typeConflicts > 0 &&
        ` ${planned.planned.typeConflicts} variables have another type in this file and are left alone.`}
    </p>
  )
}
