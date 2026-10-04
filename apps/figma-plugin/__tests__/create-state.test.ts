import { TEMPLATE_DEFAULTS } from '@atom63/figma'

import { createdNote } from '../src/app/create-state'

describe('createdNote', () => {
  it('says nothing before Create runs', () => {
    expect(createdNote(null, TEMPLATE_DEFAULTS)).toBeNull()
  })

  it('says the file holds the system once Create ran with these choices', () => {
    expect(createdNote(TEMPLATE_DEFAULTS, TEMPLATE_DEFAULTS)).toBe(
      'This file now holds this token system. To start from other choices, create in a new file.'
    )
  })

  it('warns that the file and the export differ after the choices change', () => {
    expect(createdNote(TEMPLATE_DEFAULTS, { ...TEMPLATE_DEFAULTS, radius: 'round' })).toBe(
      'This file holds the system created with your earlier choices; a plugin cannot change a collection’s default mode afterwards. Export now gives CSS for your current choices, which this file does not match. Create in a new file to use them.'
    )
  })
})
