import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Revenue" value="$1.2M" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$1.2M')).toBeInTheDocument()
  })

  it('renders the change and colors it with the up trend recipe', () => {
    render(<StatCard label="Revenue" value="$1.2M" change="+12%" trend="up" />)
    const change = screen.getByText('+12%')
    expect(change).toHaveClass('mdx-stat-card-change-up')
  })

  it('colors the change with the down trend recipe', () => {
    render(<StatCard label="Churn" value="3.4%" change="-2%" trend="down" />)
    const change = screen.getByText('-2%')
    expect(change).toHaveClass('mdx-stat-card-change-down')
  })

  it('colors the change with the neutral trend recipe', () => {
    render(<StatCard label="Users" value="1,024" change="0%" trend="neutral" />)
    const change = screen.getByText('0%')
    expect(change).toHaveClass('mdx-stat-card-change-neutral')
  })

  it('omits the change element when no change is provided', () => {
    render(<StatCard label="Users" value="1,024" />)
    expect(screen.queryByTestId('stat-card-change')).toBeNull()
  })
})
