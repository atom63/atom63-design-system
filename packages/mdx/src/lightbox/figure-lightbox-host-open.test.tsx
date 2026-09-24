import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FigureLightboxHost } from './figure-lightbox-host'
import { FigureLightboxTrigger } from './figure-lightbox-trigger'
import { isFigureLightboxOpen } from './open-lightbox'

function Gallery() {
  return (
    <FigureLightboxHost>
      <FigureLightboxTrigger alt="First" galleryId="g" height={80} src="/a.webp" width={100}>
        <img alt="First" src="/a.webp" />
      </FigureLightboxTrigger>
      <FigureLightboxTrigger
        alt="Second"
        caption="The second picture"
        galleryId="g"
        height={80}
        src="/b.webp"
        width={100}
      >
        <img alt="Second" src="/b.webp" />
      </FigureLightboxTrigger>
      <FigureLightboxTrigger
        alt="Elsewhere"
        galleryId="other"
        height={80}
        src="/c.webp"
        width={100}
      >
        <img alt="Elsewhere" src="/c.webp" />
      </FigureLightboxTrigger>
    </FigureLightboxHost>
  )
}

describe('FigureLightboxHost', () => {
  it('opens the clicked gallery in MediaLightbox and reports it open until closed', async () => {
    render(<Gallery />)
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'View Second in gallery' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('2 of 2')
    expect(dialog).toHaveTextContent('The second picture')
    expect(isFigureLightboxOpen()).toBe(true)

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    // The grace window covers the Escape that closed it, then lapses.
    await waitFor(() => expect(isFigureLightboxOpen()).toBe(false))
  })
})
