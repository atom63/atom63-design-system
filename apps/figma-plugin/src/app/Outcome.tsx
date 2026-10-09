import type { CheckOutcome, SyncOutcome } from '@atom63/figma'

import { Alert } from '../components/ui'
import styles from './app.module.css'
import { formatCount, plural } from './format'

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
          title={
            left === 0 ? 'The file matches the code' : `${plural(left, 'change')} did not apply`
          }
          variant={left === 0 ? 'success' : 'error'}
        >
          {plural(applied.applied.created, 'variable')} created,{' '}
          {formatCount(applied.applied.updated)} updated;{' '}
          {plural(applied.styles?.applied.created ?? 0, 'style')} created,{' '}
          {formatCount(applied.styles?.applied.updated ?? 0)} updated.
        </Alert>
        {fallbacks.length > 0 && (
          <Alert
            title={`${plural(fallbacks.length, 'text style')} ${fallbacks.length === 1 ? 'uses' : 'use'} another font`}
            variant="info"
          >
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
      {plural(planned.planned.create, 'variable')} to create, {formatCount(planned.planned.update)}{' '}
      to update, {formatCount(planned.planned.unchanged)} unchanged; {plural(styleChanges, 'style')}{' '}
      to create or update.
      {planned.planned.typeConflicts > 0 &&
        ` ${plural(planned.planned.typeConflicts, 'variable')} ${planned.planned.typeConflicts === 1 ? 'has' : 'have'} another type in this file and ${planned.planned.typeConflicts === 1 ? 'is' : 'are'} left alone.`}
    </p>
  )
}
