import { describe, expect, it } from 'vitest'

import { declarations, readStylesheet, STYLESHEETS } from './test/css'

describe('@atom63/inform/styles.css', () => {
  it('imports every surface stylesheet into the components layer', () => {
    const entry = readStylesheet('styles.css')

    for (const name of STYLESHEETS) {
      expect(entry).toContain(`@import './surfaces/${name}.css' layer(components);`)
    }
  })

  /*
   * The package must not rely on the consumer's Tailwind, so the stylesheet
   * resets what Tailwind's preflight used to: paragraph margins and the
   * dismiss control's native button chrome.
   */
  it('resets the margins and button chrome it cannot inherit from a preflight', () => {
    expect(declarations('.a63-Inform-title').margin).toBe('0')
    expect(declarations('.a63-Inform-body').margin).toBe('0')
    expect(declarations('.a63-InformDismissButton')).toMatchObject({
      border: '0',
      padding: '0',
      background: 'transparent',
    })
  })

  it('draws focus rings on :focus-visible only', () => {
    for (const sheet of STYLESHEETS) {
      expect(readStylesheet(`surfaces/${sheet}.css`)).not.toMatch(/:focus(?![-\w])/)
    }
    expect(declarations('.a63-InformDismissButton:focus-visible').outline).toContain(
      'var(--a63-focus-ring)'
    )
  })
})
