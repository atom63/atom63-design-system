import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { checkContracts, countFindings } from './contract-consistency.mjs'

const lines = found =>
  found.map(({ rule, component, list, match }) => `${rule} ${component}.${list} ${match}`)

describe('checkContracts', () => {
  it('flags camelCase values, synonyms and physical sides', () => {
    const found = checkContracts([
      { component: 'a', lists: { states: ['rest', 'focusVisible'], sizes: ['sm', 'md'] } },
      {
        component: 'b',
        lists: { states: ['resting'], sizes: ['sm', 'default'], directions: ['left', 'start'] },
      },
      { component: 'c', lists: { slots: ['rootSlot'], states: ['focus-visible'] } },
    ])
    assert.deepEqual(lines(found), [
      'value-case a.states focusVisible',
      'synonym b.states resting -> rest',
      'synonym b.sizes default -> md',
      'physical-value b.directions left',
    ])
  })

  it('flags a status list whose danger member differs from the usual one', () => {
    const status = danger => ['default', 'info', 'success', 'warning', danger]
    const found = checkContracts([
      { component: 'alert', lists: { variants: status('error') } },
      { component: 'toast', lists: { variants: status('error') } },
      { component: 'dialog', lists: { variants: status('destructive') } },
      { component: 'button', lists: { variants: ['default', 'destructive'] } },
    ])
    assert.deepEqual(lines(found), ['status-set dialog.variants destructive -> error'])
  })

  it('counts findings by rule, component list and match', () => {
    const found = checkContracts([
      { component: 'a', lists: { sizes: ['default'], states: ['resting'] } },
    ])
    assert.deepEqual(countFindings(found), {
      'synonym | a.sizes | default -> md': 1,
      'synonym | a.states | resting -> rest': 1,
    })
  })
})
