'use client'

import { Button } from '@atom63/ui-react'
import { clsx } from 'clsx'
import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { MediaFigure, MediaFrame, type MediaSpacing } from '../../foundations/media/media-figure'
import { useMdxReducedMotion } from '../../primitives/use-reduced-motion'

const fitClasses = {
  contain: 'object-contain',
  cover: 'object-cover',
} as const

/**
 * The language's own name for itself ("English", "Deutsch", "日本語"), which is
 * how a player's caption menu should list it. Falls back to the tag itself.
 */
function trackLabelFor(lang: string): string {
  try {
    return new Intl.DisplayNames([lang], { type: 'language' }).of(lang) ?? lang
  } catch {
    return lang
  }
}

type VideoCaptionPolicy =
  | {
      /** Video has spoken or meaningful audio and must provide captions. */
      captionPolicy?: 'required'
      trackSrc: string
    }
  | {
      /** Video is decorative or purely visual; no caption track is required. */
      captionPolicy: 'decorative'
      trackSrc?: string
    }

export type VideoBlockProps = {
  /**
   * Start playing, muted, on load. Ignored when the reader prefers reduced
   * motion. Without `controls`, a pause and play toggle sits over the video.
   */
  autoPlay?: boolean
  caption?: string
  className?: string
  controls?: boolean
  fit?: keyof typeof fitClasses
  loop?: boolean
  muted?: boolean
  /** Name of the toggle while the video plays. Defaults to "Pause video". */
  pauseLabel?: string
  /** Name of the toggle while the video is paused. Defaults to "Play video". */
  playLabel?: string
  showCaption?: boolean
  spacing?: MediaSpacing
  src: string
  title: string
  /** BCP 47 language of the caption track (`srclang`). Defaults to `en`. */
  trackLang?: string
  /**
   * Name of the caption track in the player's caption menu. Defaults to the
   * track language's own name, such as "English" or "Deutsch".
   */
  trackLabel?: string
} & VideoCaptionPolicy

/** Portable video player for MDX lessons and docs. */
export function VideoBlock({
  title,
  autoPlay = false,
  caption,
  captionPolicy,
  className,
  controls = true,
  fit = 'contain',
  loop = false,
  muted = false,
  pauseLabel = 'Pause video',
  playLabel = 'Play video',
  showCaption = false,
  spacing = 'default',
  src,
  trackLabel,
  trackLang = 'en',
  trackSrc,
}: VideoBlockProps) {
  const reducedMotion = useMdxReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const shouldMute = muted || autoPlay
  // WCAG 2.2.2: moving content that starts by itself can be paused. Native
  // controls already offer that; without them the block draws its own toggle.
  const showToggle = autoPlay && !controls
  const hidden = captionPolicy === 'decorative' && !controls

  return (
    <MediaFigure
      caption={showCaption ? caption : undefined}
      className={className}
      spacing={spacing}
    >
      <MediaFrame className="mdx-video-block">
        <div className="mdx-video-stage relative aspect-video overflow-hidden">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- VideoCaptionPolicy requires captions unless the author marks the video decorative. */}
          <video
            aria-hidden={hidden || undefined}
            aria-label={hidden ? undefined : title}
            autoPlay={autoPlay && !reducedMotion}
            className={clsx('h-full w-full', fitClasses[fit])}
            controls={controls}
            loop={loop}
            muted={shouldMute}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            playsInline
            preload="metadata"
            ref={videoRef}
          >
            <source src={src} type="video/mp4" />
            {trackSrc ? (
              <track
                default
                kind="captions"
                label={trackLabel ?? trackLabelFor(trackLang)}
                src={trackSrc}
                srcLang={trackLang}
              />
            ) : null}
          </video>
          {showToggle ? (
            <Button
              aria-label={playing ? pauseLabel : playLabel}
              className="mdx-video-toggle"
              onClick={() => {
                const video = videoRef.current
                if (!video) return
                if (playing) video.pause()
                else video.play().catch(() => undefined)
              }}
              shape="round"
              size="icon-sm"
              type="button"
              variant="overlay"
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            </Button>
          ) : null}
        </div>
      </MediaFrame>
    </MediaFigure>
  )
}
