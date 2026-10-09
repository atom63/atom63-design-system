import type { DesignSystemBlocked, DesignSystemOutcome, DesignSystemTable } from '../src/messages'
import {
  type Atom63State,
  builtSummary,
  checkAction,
  componentStatus,
  failureLines,
  initialAtom63State,
  nextAtom63,
  progressLabel,
  progressValue,
  retryLines,
  scheduleAutoRecheck,
  shouldAutoRecheck,
  AUTO_RECHECK_MS,
  fontNote,
  startAtom63,
  tokensStatus,
} from '../src/app/atom63-state'
import { formatCount, plural } from '../src/app/format'

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
    // Verifying takes the result's place; no action while it runs.
    expect(checkAction(state)).toBeNull()
  })

  it('offers Check again with a pending result', () => {
    const { state } = run(initialAtom63State, {
      type: 'checked',
      data: outcome({ status: 'pending' }),
    })
    expect(checkAction(state)).toBe('Check again')
  })

  it('offers Check again after a check that failed to run', () => {
    const { state } = run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'built', data: { ...outcome(), table: built } },
      { type: 'error', message: 'Boom', for: 'atom63-check' }
    )
    expect(state.error?.during).toBe('checking')
    expect(checkAction(state)).toBe('Check again')
    const again = run(state, { type: 'check-sent' }, { type: 'checked', data: outcome() })
    expect(again.state.error).toBeNull()
    expect(checkAction(again.state)).toBeNull()
  })

  it('offers Check the file after a build that did not finish', () => {
    const failedBuild = run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'error', message: 'Boom', for: 'atom63-build' }
    )
    expect(checkAction(failedBuild.state)).toBe('Check the file')
    const checking = nextAtom63(failedBuild.state, { type: 'check-sent' })
    expect(checking.state.phase).toBe('checking')
    expect(checking.state.error).toBeNull()
  })

  it('offers no check after a passing or failing check, or a scan error', () => {
    for (const status of ['pass', 'fail'] as const)
      expect(
        checkAction(run(initialAtom63State, { type: 'checked', data: outcome({ status }) }).state)
      ).toBeNull()
    expect(
      checkAction(run(initialAtom63State, { type: 'error', message: 'Boom' }).state)
    ).toBeNull()
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

describe('what the file holds', () => {
  const component = { name: 'Button', variants: 300, card: true, setOnPage: false }

  it('shows a component built inside its spec card as built', () => {
    expect(componentStatus(component)).toBe('300 variants, spec card')
  })

  it('says a set on the page has no spec card yet', () => {
    expect(componentStatus({ ...component, card: false, setOnPage: true })).toBe(
      '300 variants on the page, no spec card yet'
    )
    expect(componentStatus({ ...component, card: false })).toBe('300 variants, no spec card')
  })

  it('shows a component with no variants as not built', () => {
    expect(componentStatus({ ...component, variants: 0, card: false })).toBe('Not built yet')
    expect(componentStatus({ ...component, variants: 1 })).toBe('1 variant, spec card')
  })

  it('counts Atom63 tokens with thousands separators', () => {
    expect(tokensStatus(null)).toBe('None yet')
    expect(
      tokensStatus({
        variables: 1009,
        collections: [
          { name: 'Theme', variables: 1008 },
          { name: 'Font', variables: 1 },
        ],
      })
    ).toBe('1,009 variables in 2 collections')
  })
})

describe('counts', () => {
  it('groups thousands and picks the singular for one', () => {
    expect(formatCount(1009)).toBe('1,009')
    expect(plural(1, 'variable')).toBe('1 variable')
    expect(plural(12345, 'mode')).toBe('12,345 modes')
    expect(plural(0, 'style')).toBe('0 styles')
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
    expect(retryLines(build)).toEqual(['Button · Small could not be written: locked'])
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
      'Button: 24 variants, spec card (30 items created, 0 updated).',
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
      'Button · Small — padding: 4 → 6',
      'Button · Large — Label property',
      'Button spec card: 1 item to create or update',
      'Button · Small could not be written: locked',
    ])
  })
})

describe('automatic re-check', () => {
  const pending = () =>
    run(
      initialAtom63State,
      { type: 'build-sent' },
      { type: 'built', data: { ...outcome(), table: built } },
      { type: 'checked', data: outcome({ status: 'pending' }) }
    ).state

  afterEach(() => {
    vi.useRealTimers()
  })

  it('checks a pending result again once per build', () => {
    const first = pending()
    expect(shouldAutoRecheck(first)).toBe(true)
    const again = run(
      first,
      { type: 'check-sent', auto: true },
      { type: 'checked', data: outcome({ status: 'pending' }) }
    ).state
    expect(again.autoRechecked).toBe(true)
    expect(shouldAutoRecheck(again)).toBe(false)
    // Check again by hand does not count; a new build allows one more.
    expect(run(again, { type: 'build-sent' }).state.autoRechecked).toBe(false)
  })

  it('does not re-check a passing or failing result', () => {
    for (const status of ['pass', 'fail'] as const)
      expect(
        shouldAutoRecheck(
          run(initialAtom63State, { type: 'checked', data: outcome({ status }) }).state
        )
      ).toBe(false)
  })

  it('runs the re-check after the delay, and not when cancelled first', () => {
    vi.useFakeTimers()
    const recheck = vi.fn()
    const cancel = scheduleAutoRecheck(pending(), recheck)
    expect(cancel).toBeTypeOf('function')
    vi.advanceTimersByTime(AUTO_RECHECK_MS - 1)
    expect(recheck).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(recheck).toHaveBeenCalledTimes(1)

    const cancelled = vi.fn()
    scheduleAutoRecheck(pending(), cancelled)?.()
    vi.advanceTimersByTime(AUTO_RECHECK_MS * 2)
    expect(cancelled).not.toHaveBeenCalled()
  })

  it('schedules nothing when no re-check is due', () => {
    expect(scheduleAutoRecheck(initialAtom63State, vi.fn())).toBeUndefined()
  })
})

describe('fontNote', () => {
  it('says which font stands in, in one sentence, and keeps the lines', () => {
    const lines = [
      '13 text styles: --a63-font-app not bound in every mode; used Geist',
      'Label: --a63-control-font-family not bound in every mode; used Geist',
    ]
    expect(fontNote(outcome({ fontFallbacks: lines }))).toEqual({
      sentence: "Fonts: Geist is used where Figma can't bind a CSS font stack.",
      lines,
    })
  })

  it('names every font, and has no note without fallbacks', () => {
    expect(
      fontNote(outcome({ fontFallbacks: ['A: used Geist', 'B: used Inter', 'C: odd line'] }))
        ?.sentence
    ).toBe("Fonts: Geist and Inter are used where Figma can't bind a CSS font stack.")
    expect(fontNote(outcome())).toBeNull()
    expect(fontNote(null)).toBeNull()
  })
})
