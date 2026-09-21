import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LightboxStateContext, useLightboxState } from './context'

function Probe() {
  const state = useLightboxState()
  return <span>{`${state.index} of ${state.itemCount}`}</span>
}

describe('lightbox context', () => {
  it('hands state down to any depth', () => {
    render(
      <LightboxStateContext.Provider
        value={{
          close: () => {},
          goTo: () => {},
          index: 2,
          isZoomed: false,
          itemCount: 5,
          zoomIn: () => {},
          zoomOut: () => {},
        }}
      >
        <div>
          <Probe />
        </div>
      </LightboxStateContext.Provider>
    )

    expect(screen.getByText('2 of 5')).toBeTruthy()
  })

  it('explains itself when a part is used outside Root', () => {
    // 静默返回 null 会让错误在十层之外才炸；在边界上直接说清楚。
    expect(() => render(<Probe />)).toThrow(/Lightbox\.Root/)
  })
})
