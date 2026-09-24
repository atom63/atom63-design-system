import { clsx } from 'clsx'
import { MediaFigure, MediaFrame, type MediaSpacing } from '../../foundations/media/media-figure'

const fitClasses = {
  contain: 'object-contain',
  cover: 'object-cover',
} as const

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
  autoPlay?: boolean
  caption?: string
  className?: string
  controls?: boolean
  fit?: keyof typeof fitClasses
  loop?: boolean
  muted?: boolean
  showCaption?: boolean
  spacing?: MediaSpacing
  src: string
  title: string
} & VideoCaptionPolicy

/** Portable video player for MDX lessons and docs. */
export function VideoBlock({
  title,
  autoPlay = false,
  caption,
  className,
  controls = true,
  fit = 'contain',
  loop = false,
  muted = false,
  showCaption = false,
  spacing = 'default',
  src,
  trackSrc,
}: VideoBlockProps) {
  const shouldMute = muted || autoPlay

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
            aria-label={title}
            autoPlay={autoPlay}
            className={clsx('h-full w-full', fitClasses[fit])}
            controls={controls}
            loop={loop}
            muted={shouldMute}
            playsInline
            preload="metadata"
          >
            <source src={src} type="video/mp4" />
            {trackSrc ? (
              <track default kind="captions" label="English captions" src={trackSrc} srcLang="en" />
            ) : null}
          </video>
        </div>
      </MediaFrame>
    </MediaFigure>
  )
}
