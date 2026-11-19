import { clsx } from 'clsx'
import { MediaFigure, MediaFrame, type MediaSpacing } from '../../foundations/media/media-figure'

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
  className,
  controls = true,
  fit = 'contain',
  loop = false,
  muted = false,
  showCaption = false,
  spacing = 'default',
  src,
  trackLabel,
  trackLang = 'en',
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
              <track
                default
                kind="captions"
                label={trackLabel ?? trackLabelFor(trackLang)}
                src={trackSrc}
                srcLang={trackLang}
              />
            ) : null}
          </video>
        </div>
      </MediaFrame>
    </MediaFigure>
  )
}
