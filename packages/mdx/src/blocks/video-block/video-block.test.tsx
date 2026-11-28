import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { VideoBlock } from './video-block'

vi.mock('../../primitives/use-reduced-motion', () => ({
  useMdxReducedMotion: () => mockReducedMotion,
}))

let mockReducedMotion = false

beforeEach(() => {
  mockReducedMotion = false
  // jsdom has no media playback: play() and pause() only fire their events.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement
  ) {
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement
  ) {
    this.dispatchEvent(new Event('pause'))
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('does not autoplay when the reader prefers reduced motion', () => {
    mockReducedMotion = true
    const { container } = render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        loop
        src="/loop.mp4"
        title="Background loop"
      />
    )

    expect(getVideo(container).autoplay).toBe(false)
  })

  it('gives an autoplaying video without controls a pause and play toggle', () => {
    const { container } = render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        controls={false}
        loop
        src="/loop.mp4"
        title="Background loop"
      />
    )
    const video = getVideo(container)
    fireEvent.play(video)

    fireEvent.click(screen.getByRole('button', { name: 'Pause video' }))
    expect(video.pause).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Play video' }))
    expect(video.play).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Pause video' })).toBeInTheDocument()
  })

  it('offers play on a reduced-motion autoplay video without controls', () => {
    mockReducedMotion = true
    render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        controls={false}
        loop
        src="/loop.mp4"
        title="Background loop"
      />
    )

    expect(screen.getByRole('button', { name: 'Play video' })).toBeInTheDocument()
  })

  it('takes the toggle labels from props', () => {
    render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        controls={false}
        pauseLabel="Video anhalten"
        playLabel="Video abspielen"
        src="/loop.mp4"
        title="Hintergrund"
      />
    )

    expect(screen.getByRole('button', { name: 'Video abspielen' })).toBeInTheDocument()
  })

  it('adds no toggle when the native controls are shown', () => {
    render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        loop
        src="/loop.mp4"
        title="Background loop"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('hides a decorative video without controls from assistive technology', () => {
    const { container } = render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        controls={false}
        src="/loop.mp4"
        title="Background loop"
      />
    )

    const video = getVideo(container)
    expect(video).toHaveAttribute('aria-hidden', 'true')
    expect(video).not.toHaveAttribute('aria-label')
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

  it('has no axe violations with the pause toggle', async () => {
    const { container } = render(
      <VideoBlock
        autoPlay
        captionPolicy="decorative"
        controls={false}
        loop
        src="/loop.mp4"
        title="Background loop"
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
