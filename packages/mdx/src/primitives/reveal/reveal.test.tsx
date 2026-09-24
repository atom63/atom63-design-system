import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getRevealMotionProps, Reveal } from './reveal'

describe('getRevealMotionProps', () => {
  it('returns static props when reduced motion is requested', () => {
    expect(getRevealMotionProps(true)).toEqual({ initial: false })
  })

  it('returns an in-view animation when motion is allowed', () => {
    const props = getRevealMotionProps(false, 0.1)
    expect(props.initial).toMatchObject({ opacity: 0 })
    expect(props.whileInView).toMatchObject({ opacity: 1 })
    expect(props.transition).toMatchObject({ delay: 0.1 })
    expect(props.viewport).toMatchObject({ once: true })
  })
})

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal>shown</Reveal>)
    expect(screen.getByText('shown')).toBeInTheDocument()
  })
})
