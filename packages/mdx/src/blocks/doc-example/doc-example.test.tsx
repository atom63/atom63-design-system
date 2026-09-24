import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DocExample } from './doc-example'

const CODE = 'const a = 1'

describe('DocExample i18n', () => {
  it('uses default English tab labels', () => {
    render(
      <DocExample code={CODE}>
        <div>preview content</div>
      </DocExample>
    )
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Code' })).toBeInTheDocument()
  })

  it('honors custom tab labels', () => {
    render(
      <DocExample code={CODE} codeLabel="Source" previewLabel="Aperçu">
        <div>preview content</div>
      </DocExample>
    )
    expect(screen.getByRole('tab', { name: 'Aperçu' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Source' })).toBeInTheDocument()
  })

  it('honors a custom copyCodeLabel on the copy control', () => {
    render(
      <DocExample code={CODE} copyCodeLabel="Copier">
        <div>preview content</div>
      </DocExample>
    )
    // switch to code tab so the copy button is active
    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))
    expect(screen.getByRole('button', { name: 'Copier' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull()
  })
})

describe('DocExample slots', () => {
  it('renders prop-based usage as before (back-compat)', () => {
    render(
      <DocExample code={CODE} title="My Example">
        <div>preview content</div>
      </DocExample>
    )
    expect(screen.getByText('My Example')).toBeInTheDocument()
    expect(screen.getByText('preview content')).toBeInTheDocument()
    // code tab still works
    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))
    expect(screen.getByText(CODE)).toBeInTheDocument()
  })

  it('renders Title / Preview / Code slots when provided', () => {
    render(
      <DocExample code={CODE}>
        <DocExample.Title>Slotted Title</DocExample.Title>
        <DocExample.Preview>
          <div>slotted preview</div>
        </DocExample.Preview>
        <DocExample.Code>
          <pre>slotted code display</pre>
        </DocExample.Code>
      </DocExample>
    )
    expect(screen.getByText('Slotted Title')).toBeInTheDocument()
    expect(screen.getByText('slotted preview')).toBeInTheDocument()
    // tab UX preserved: preview shown first, code on demand
    expect(screen.queryByText('slotted code display')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))
    expect(screen.getByText('slotted code display')).toBeInTheDocument()
  })

  it('derives the anchor id and tablist label from a string Title slot', () => {
    const { container } = render(
      <DocExample code={CODE}>
        <DocExample.Title>Slot Anchor</DocExample.Title>
        <DocExample.Preview>
          <div>p</div>
        </DocExample.Preview>
      </DocExample>
    )
    expect(container.querySelector('figure#slot-anchor')).not.toBeNull()
    expect(screen.getByRole('tablist', { name: 'Slot Anchor example view' })).toBeInTheDocument()
  })
})
