import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CreditsBlock } from './credits-block'

const credits = [{ role: 'Director', credits: 'Ada Lovelace' }]

describe('CreditsBlock', () => {
  it('renders the default "Credits" label', () => {
    render(<CreditsBlock credits={credits} />)
    expect(screen.getByText('Credits')).toBeInTheDocument()
  })

  it('renders a custom label when provided (locale override)', () => {
    render(<CreditsBlock credits={credits} label="制作人员" />)
    expect(screen.getByText('制作人员')).toBeInTheDocument()
    expect(screen.queryByText('Credits')).not.toBeInTheDocument()
  })
})
