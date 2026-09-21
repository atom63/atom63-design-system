import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar'

describe('Avatar', () => {
  it('renders the root with the avatar slot + class + default size', () => {
    const { container } = render(<Avatar />)
    const el = container.querySelector('.a63-Avatar')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'avatar')
    expect(el).toHaveAttribute('data-size', 'default')
  })

  it('forwards the size prop to data-size', () => {
    const { container } = render(<Avatar size="lg" />)
    expect(container.querySelector('.a63-Avatar')).toHaveAttribute('data-size', 'lg')
  })

  it('renders a fallback (image src is unresolved in jsdom)', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/nope.png" alt="test" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )
    const fallback = container.querySelector('.a63-Avatar-fallback')
    expect(fallback).not.toBeNull()
    expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback')
    expect(fallback).toHaveTextContent('AB')
  })

  it('renders a status badge slot', () => {
    const { container } = render(
      <Avatar>
        <AvatarBadge />
      </Avatar>
    )
    expect(container.querySelector('.a63-Avatar-badge')).toHaveAttribute(
      'data-slot',
      'avatar-badge'
    )
  })

  it('renders a group with a count', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar />
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    )
    expect(container.querySelector('.a63-Avatar-group')).toHaveAttribute(
      'data-slot',
      'avatar-group'
    )
    const count = container.querySelector('.a63-Avatar-group-count')
    expect(count).toHaveAttribute('data-slot', 'avatar-group-count')
    expect(count).toHaveTextContent('+3')
  })
})
