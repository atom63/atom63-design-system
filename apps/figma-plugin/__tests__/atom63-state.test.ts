import type { DesignSystemBlocked, DesignSystemOutcome, DesignSystemTable } from '../src/messages'
import {
  type Atom63State,
  builtSummary,
  canCheckAgain,
  failureLines,
  initialAtom63State,
  nextAtom63,
  progressLabel,
  progressValue,
  retryLines,
  startAtom63,
} from '../src/app/atom63-state'

const table: DesignSystemTable = {
  atom63: null,
  template: null,
  blocked: null,
  components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
}
const built: DesignSystemTable = {
  atom63: { variables: 300, collections: [{ name: 'Primitives', variables: 300 }] },
  template: null,
  blocked: null,
  components: [{ name: 'Button', variants: 24, card: true, setOnPage: true }],
}
const totals = { create: 0, update: 0, unchanged: 300, typeConflicts: 0 }
const counts = { missingVariables: [], variables: 0, create: 0, update: 0, unchanged: 24 }

function outcome(overrides: Partial<DesignSystemOutcome> = {}): DesignSystemOutcome {
  return {
    status: 'pass',
    tokens: { planned: totals, verification: totals },
    components: [{ name: 'Button', variants: 24, planned: counts, verification: counts }],
    fontFallbacks: [],
    ...overrides,
  } as DesignSystemOutcome
}

const run = (state: Atom63State, ...events: Parameters<typeof nextAtom63>[1][]) => {
  let current = state
  let send: string | undefined
  for (const event of events) {
    const next = nextAtom63(current, event)
    current = next.state
    send = next.send
  }
  return { state: current, send }
}

describe('nextAtom63', () => {
  it('shows what the file holds once the scan replies', () => {
    const { state } = run(initialAtom63State, { type: 'scan-sent' }, { type: 'table', data: table })
    expect(state.phase).toBe('idle')
    expect(state.table).toBe(table)
  })

  it('clears an error from a refused scan when a scan reply arrives', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'scan-sent' },
      { type: 'error', message: 'A build or check is already running' },
      { type: 'table', data: table }
    )
    expect(state.error).toBeNull()
    expect(state.table).toBe(table)
  })

  it('tracks a build’s progress', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'table', data: table },
      { type: 'build-sent' },
      { type: 'progress', data: { phase: 'components', done: 0, total: 1, label: 'Button' } }
    )
    expect(state.phase).toBe('building')
    expect(state.progress?.label).toBe('Button')
  })

  it('stops at a refused build and sends nothing', () => {
    const blocked: DesignSystemBlocked = {
      status: 'blocked',
      reason: 'This file already holds another token set (collections: Mode).',
      collections: ['Mode'],
    }
    const { state, send } = run(
      initialAtom63State,
      { type: 'table', data: table },
      { type: 'build-sent' },
      { type: 'built', data: { ...blocked, table } }
    )
    expect(send).toBeUndefined()
    expect(state.phase).toBe('idle')
    expect(state.blocked).toEqual(blocked)
    expect(state.built).toBeNull()
  })

  it('checks a build in a separate message', () => {
    const { state, send } = run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'built', data: { ...outcome(), table: built } }
    )
    expect(send).toBe('atom63-check')
    expect(state.phase).toBe('checking')
    expect(state.table).toBe(built)
    expect(state.built?.status).toBe('pass')
    expect(state.checked).toBeNull()
  })

  it.each(['pass', 'pending', 'fail'] as const)('shows a %s check', status => {
    const { state } = run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'built', data: { ...outcome(), table: built } },
      { type: 'checked', data: outcome({ status }) }
    )
    expect(state.phase).toBe('idle')
    expect(state.checked?.status).toBe(status)
  })

  it('checks again after a pending check', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'checked', data: outcome({ status: 'pending' }) },
      { type: 'check-sent' }
    )
    expect(state.phase).toBe('checking')
    expect(state.checked).toBeNull()
    // The button stays in place, disabled, while the check runs.
    expect(canCheckAgain(state)).toBe(true)
  })

  it('offers Check again after a check that failed to run', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'built', data: { ...outcome(), table: built } },
      { type: 'error', message: 'Boom', for: 'atom63-check' }
    )
    expect(state.error?.during).toBe('checking')
    expect(canCheckAgain(state)).toBe(true)
    const again = run(state, { type: 'check-sent' }, { type: 'checked', data: outcome() })
    expect(again.state.error).toBeNull()
    expect(canCheckAgain(again.state)).toBe(false)
  })

  it('offers no Check again after a passing check or a build error', () => {
    expect(canCheckAgain(run(initialAtom63State, { type: 'checked', data: outcome() }).state)).toBe(
      false
    )
    const failedBuild = run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'error', message: 'Boom', for: 'atom63-build' }
    )
    expect(canCheckAgain(failedBuild.state)).toBe(false)
  })

  it('ignores an error from another message, so a build keeps running', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'table', data: table },
      { type: 'build-sent' },
      { type: 'error', message: 'Storage full', for: 'save-settings' }
    )
    expect(state.phase).toBe('building')
    expect(state.error).toBeNull()
  })

  it('takes an Atom63 error, and an untagged one, as its own', () => {
    for (const failed of ['atom63-build', undefined] as const) {
      const { state } = run(
        initialAtom63State,
        { type: 'build-sent' },
        { type: 'error', message: 'Boom', for: failed }
      )
      expect(state.phase).toBe('idle')
      expect(state.error).toEqual({ message: 'Boom', during: 'building' })
    }
  })

  it('shows an error from the main thread and stops being busy', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'table', data: table },
      { type: 'build-sent' },
      { type: 'error', message: 'Boom' }
    )
    expect(state.phase).toBe('idle')
    expect(state.error).toEqual({ message: 'Boom', during: 'building' })
    expect(state.table).toBe(table)
  })

  it('forgets an earlier result when a build starts', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'checked', data: outcome() },
      { type: 'error', message: 'Boom' },
      { type: 'build-sent' }
    )
    expect(state.checked).toBeNull()
    expect(state.error).toBeNull()
  })
})

describe('startAtom63', () => {
  it('uses the table Home scanned and sends no scan', () => {
    const { state, send } = startAtom63(table)
    expect(send).toBeUndefined()
    expect(state.phase).toBe('idle')
    expect(state.table).toBe(table)
  })

  it('scans when Home has no table', () => {
    for (const missing of [null, undefined]) {
      const { state, send } = startAtom63(missing)
      expect(send).toBe('atom63-scan')
      expect(state.phase).toBe('scanning')
      expect(state.table).toBeNull()
    }
  })
})

describe('progress', () => {
  it('names the phase and counts components', () => {
    expect(progressLabel(null)).toBe('Starting…')
    expect(progressLabel({ phase: 'tokens', done: 0, total: 1 })).toBe('Writing variables')
    expect(progressLabel({ phase: 'components', done: 0, total: 2, label: 'Button' })).toBe(
      'Building Button (0 of 2 components)'
    )
  })

  it('runs from 0 to 100 across variables, styles and components', () => {
    expect(progressValue(null, 1)).toBe(0)
    expect(progressValue({ phase: 'tokens', done: 1, total: 1 }, 2)).toBe(25)
    expect(progressValue({ phase: 'card', done: 2, total: 2 }, 2)).toBe(100)
    expect(progressValue({ phase: 'done', done: 1, total: 1 }, 2)).toBe(100)
  })
})

describe('results', () => {
  it('lists the variants a retry could not write, by component', () => {
    const build = outcome({
      components: [
        {
          name: 'Button',
          variants: 24,
          planned: counts,
          verification: counts,
          retryErrors: [{ variant: 'Size=Small', error: 'locked' }],
        },
      ],
    })
    expect(retryLines(build)).toEqual(['Button · Size=Small could not be written: locked'])
    expect(retryLines(null)).toEqual([])
  })

  it('sums up a passing build', () => {
    const build = outcome({
      tokens: {
        planned: totals,
        applied: { created: 300, updated: 2 } as never,
        verification: totals,
      },
      styles: {
        planned: { create: [], update: [], unchanged: 0, skipped: [] },
        applied: { created: 10, updated: 0, fontFallbacks: [] },
        verification: { create: [], update: [], unchanged: 10, skipped: [] },
      },
      components: [
        {
          name: 'Button',
          variants: 24,
          planned: counts,
          applied: {
            variables: 0,
            created: 24,
            updated: 0,
            fontFallbacks: [],
            card: { created: 30, updated: 0 },
          },
          verification: counts,
        },
      ],
    })
    expect(builtSummary(build, outcome())).toEqual([
      '300 variables created, 2 updated; 10 styles created, 0 updated.',
      'Button: 24 variants, spec card (30 parts created, 0 updated).',
    ])
  })

  it('names every difference a failed check reports', () => {
    const checked = outcome({
      status: 'fail',
      tokens: { planned: totals, verification: { ...totals, update: 1, typeConflicts: 2 } },
      styles: {
        planned: { create: [], update: [], unchanged: 0, skipped: [] },
        verification: { create: [], update: ['Body'], unchanged: 9, skipped: [] },
      },
      components: [
        {
          name: 'Button',
          variants: 24,
          planned: counts,
          verification: {
            ...counts,
            update: 1,
            differences: [
              { variant: 'Size=Small', what: 'padding', actual: '4', expected: '6' },
              { variant: 'Size=Large', what: 'Label property' },
            ],
            card: { create: 1, update: 0, unchanged: 29 },
          },
        },
      ],
    })
    const build = outcome({
      components: [
        {
          name: 'Button',
          variants: 24,
          planned: counts,
          verification: counts,
          retryErrors: [{ variant: 'Size=Small', error: 'locked' }],
        },
      ],
    })
    expect(failureLines(checked, build)).toEqual([
      '1 variable to create or update',
      '2 variables with another type in this file, left alone',
      'Styles to create or update: Body',
      'Button · Size=Small — padding: 4 → 6',
      'Button · Size=Large — Label property',
      'Button spec card: 1 part to create or update',
      'Button · Size=Small could not be written: locked',
    ])
  })
})
