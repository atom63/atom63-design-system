import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { VideoBlock } from './video-block'

function getVideo(container: HTMLElement): HTMLVideoElement {
  const video = container.querySelector('video')
  if (video === null) throw new Error('no <video> rendered')
  return video
}

describe('VideoBlock', () => {
  it('names the video and renders its source', () => {
    const { container } = render(
      <VideoBlock src="/clip.mp4" title="Product tour" trackSrc="/clip.vtt" />
    )

    expect(screen.getByLabelText('Product tour')).toBe(getVideo(container))
    expect(container.querySelector('source')).toHaveAttribute('src', '/clip.mp4')
  })

  it('renders the caption track in English by default', () => {
    const { container } = render(
      <VideoBlock src="/clip.mp4" title="Product tour" trackSrc="/clip.vtt" />
    )

    const track = container.querySelector('track')
    expect(track).toHaveAttribute('kind', 'captions')
    expect(track).toHaveAttribute('src', '/clip.vtt')
    expect(track).toHaveAttribute('srclang', 'en')
    expect(track).toHaveAttribute('label', 'English')
  })

  it('labels the track in its own language when only the language is given', () => {
    const { container } = render(
      <VideoBlock src="/clip.mp4" title="Produkttour" trackLang="de" trackSrc="/clip.de.vtt" />
    )

    const track = container.querySelector('track')
    expect(track).toHaveAttribute('srclang', 'de')
    expect(track).toHaveAttribute('label', 'Deutsch')
  })

  it('uses an explicit track label', () => {
    const { container } = render(
      <VideoBlock
        src="/clip.mp4"
        title="Product tour"
        trackLabel="English (SDH)"
        trackLang="en-GB"
        trackSrc="/clip.vtt"
      />
    )

    const track = container.querySelector('track')
    expect(track).toHaveAttribute('srclang', 'en-GB')
    expect(track).toHaveAttribute('label', 'English (SDH)')
  })

  it('renders no track for a decorative video without one', () => {
    const { container } = render(
      <VideoBlock captionPolicy="decorative" src="/loop.mp4" title="Background loop" />
    )

    expect(container.querySelector('track')).toBeNull()
  })

  it('mutes an autoplaying video even when muted is not set', () => {
    const { container } = render(
      <VideoBlock autoPlay captionPolicy="decorative" src="/loop.mp4" title="Background loop" />
    )

    const video = getVideo(container)
    expect(video.muted).toBe(true)
    expect(video.autoplay).toBe(true)
  })

  it('shows the caption only when asked', () => {
    const { rerender } = render(
      <VideoBlock
        caption="Figure 2: the tour"
        src="/clip.mp4"
        title="Product tour"
        trackSrc="/clip.vtt"
      />
    )
    expect(screen.queryByText('Figure 2: the tour')).not.toBeInTheDocument()

    rerender(
      <VideoBlock
        caption="Figure 2: the tour"
        showCaption
        src="/clip.mp4"
        title="Product tour"
        trackSrc="/clip.vtt"
      />
    )
    expect(screen.getByText('Figure 2: the tour')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <VideoBlock src="/clip.mp4" title="Product tour" trackSrc="/clip.vtt" />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
