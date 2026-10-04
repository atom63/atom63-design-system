import { summarizeTable } from '../src/app/table-summary'

describe('summarizeTable', () => {
  it('calls a file with no variables from code empty', () => {
    expect(
      summarizeTable({ collections: [], variables: 0, textStyles: 0, effectStyles: 0 })
    ).toEqual({ empty: true, line: 'This file has no token table yet.' })
  })

  it('counts variables, collections and styles', () => {
    expect(
      summarizeTable({
        collections: [
          { name: 'Base', modes: 1, variables: 300 },
          { name: 'Mode', modes: 2, variables: 87 },
        ],
        variables: 387,
        textStyles: 13,
        effectStyles: 1,
      })
    ).toEqual({
      empty: false,
      line: '387 variables in 2 collections, 13 text styles and 1 effect style.',
    })
  })
})
