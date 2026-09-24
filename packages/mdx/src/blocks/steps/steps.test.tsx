import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Steps } from './steps'

describe('Steps', () => {
  it('renders each step title and content', () => {
    render(
      <Steps>
        <Steps.Step title="Install">Run the installer.</Steps.Step>
        <Steps.Step title="Configure">Edit the config file.</Steps.Step>
        <Steps.Step title="Launch">Start the app.</Steps.Step>
      </Steps>
    )
    expect(screen.getByText('Install')).toBeInTheDocument()
    expect(screen.getByText('Run the installer.')).toBeInTheDocument()
    expect(screen.getByText('Configure')).toBeInTheDocument()
    expect(screen.getByText('Edit the config file.')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
    expect(screen.getByText('Start the app.')).toBeInTheDocument()
  })

  it('auto-numbers steps 1..n in document order', () => {
    render(
      <Steps>
        <Steps.Step title="First">a</Steps.Step>
        <Steps.Step title="Second">b</Steps.Step>
        <Steps.Step title="Third">c</Steps.Step>
      </Steps>
    )
    const badges = screen.getAllByTestId('steps-step-number')
    expect(badges.map(b => b.textContent)).toEqual(['1', '2', '3'])
  })

  it('renders as an ordered list for accessibility', () => {
    const { container } = render(
      <Steps>
        <Steps.Step title="Only">x</Steps.Step>
      </Steps>
    )
    const ol = container.querySelector('ol')
    expect(ol).not.toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('applies the mdx block classes on the root', () => {
    const { container } = render(
      <Steps>
        <Steps.Step title="Only">x</Steps.Step>
      </Steps>
    )
    const root = container.querySelector('.mdx-block')
    expect(root).not.toBeNull()
    expect(root).toHaveClass('not-mdx')
  })
})
