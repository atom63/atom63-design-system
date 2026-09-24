import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { createSlot, hasSlot, pickRest, pickSlot } from './slots'

const Title = createSlot('title')
const Body = createSlot('body')

describe('slots', () => {
  it('tags a slot component with its name', () => {
    expect(Title.slotName).toBe('title')
  })

  it('picks the children of a matching slot', () => {
    const tree = (
      <>
        <Title>Heading</Title>
        <Body>Paragraph</Body>
      </>
    )
    expect(pickSlot(tree.props.children, Title)).toBe('Heading')
    expect(pickSlot(tree.props.children, Body)).toBe('Paragraph')
  })

  it('returns null when a slot is absent', () => {
    expect(pickSlot(<Body>x</Body>, Title)).toBeNull()
  })

  it('returns the non-slot children as rest', () => {
    const tree = (
      <>
        <Title>H</Title>
        loose text
      </>
    )
    const rest = pickRest(tree.props.children, [Title, Body])
    expect(rest).toContain('loose text')
    expect(rest).toHaveLength(1)
  })

  it('detects a present-but-empty slot distinctly from an absent one', () => {
    expect(hasSlot(<Title />, Title)).toBe(true)
    expect(pickSlot(<Title />, Title)).toBeNull()
    expect(hasSlot(<Body>x</Body>, Title)).toBe(false)
  })

  it('preserves stable keys for multiple loose elements in rest', () => {
    const tree = (
      <>
        <Title>H</Title>
        <span>a</span>
        <span>b</span>
      </>
    )
    const rest = pickRest(tree.props.children, [Title]) as ReactElement[]
    expect(rest).toHaveLength(2)
    expect(rest.every(el => el.key != null)).toBe(true)
  })
})
