import { describe, expect, it } from 'vitest'

import * as api from './index'

describe('@atom63/ui-react public barrel', () => {
  it('exports the component renderers and provider', () => {
    expect(api.Button).toBeTypeOf('function')
    expect(api.Input).toBeTypeOf('function')
    expect(api.Switch).toBeTypeOf('function')
    expect(api.InputGroup).toBeTypeOf('function')
    expect(api.InputGroupAddon).toBeTypeOf('function')
    expect(api.InputGroupButton).toBeTypeOf('function')
    expect(api.InputGroupInput).toBeTypeOf('function')
    expect(api.InputGroupText).toBeTypeOf('function')
    expect(api.UIProvider).toBeTypeOf('function')
    expect(api.useUIEnvironment).toBeTypeOf('function')
    expect(api.Kbd).toBeTypeOf('function')
    expect(api.KbdGroup).toBeTypeOf('function')
    expect(api.Toggle).toBeTypeOf('function')
    expect(api.SegmentedControl).toBeTypeOf('function')
    expect(api.ToggleGroup).toBeTypeOf('function')
    expect(api.ToggleGroupItem).toBeTypeOf('function')
    expect(api.ToggleGroupSeparator).toBeTypeOf('function')
    expect(api.Select).toBeDefined()
    expect(api.SelectTrigger).toBeTypeOf('function')
    expect(api.SelectValue).toBeTypeOf('function')
    expect(api.SelectPopup).toBeTypeOf('function')
    expect(api.SelectItem).toBeTypeOf('function')
  })
})
