import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageCompare } from './image-compare'

const before = { alt: 'Before treatment', src: '/before.jpg' }
const after = { alt: 'After treatment', src: '/after.jpg' }

describe('ImageCompare', () => {
  it('renders the before/after images once the lazy slider resolves', async () => {
    render(<ImageCompare before={before} after={after} />)

    // The slider is code-split via React.lazy, so the images appear after the
    // dynamic import resolves — await them rather than querying synchronously.
    expect(await screen.findByAltText('Before treatment')).toBeInTheDocument()
    expect(await screen.findByAltText('After treatment')).toBeInTheDocument()
  })

  it('renders the default Before/After labels', async () => {
    render(<ImageCompare before={before} after={after} />)

    // Labels live in the outer (eager) figure, so they render immediately.
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
    // Wait for the lazy slider to settle to avoid act() warnings on unmount.
    await screen.findByAltText('Before treatment')
  })

  it('renders title, description, and caption when provided', async () => {
    render(
      <ImageCompare
        before={before}
        after={after}
        title="Retouch comparison"
        description="Drag to reveal the edit."
        caption="Shot on location."
      />
    )

    // Title/description render via the DS FrameTitle/FrameDescription slots (divs).
    expect(screen.getByText('Retouch comparison')).toBeInTheDocument()
    expect(screen.getByText('Drag to reveal the edit.')).toBeInTheDocument()
    expect(screen.getByText('Shot on location.')).toBeInTheDocument()
    await screen.findByAltText('Before treatment')
  })
})
