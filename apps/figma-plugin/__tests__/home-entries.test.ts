import type { DesignSystemTable } from '../src/messages'
import { atom63Unavailable } from '../src/app/table-summary'

const table: DesignSystemTable = {
  atom63: null,
  template: null,
  blocked: null,
  components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
}

describe('atom63Unavailable', () => {
  it('leaves the Atom63 entry open in an empty file', () => {
    expect(atom63Unavailable(table)).toBeNull()
  })

  it('leaves it open when the scan could not run, so the view scans again', () => {
    expect(atom63Unavailable(null)).toBeNull()
  })

  it('says a file with another token set needs a new file', () => {
    expect(
      atom63Unavailable({
        ...table,
        template: { variables: 389, collections: ['Mode'] },
        blocked: 'This file already holds another token set (collections: Mode).',
      })
    ).toBe('Needs a new file — this file holds another token set.')
  })
})
