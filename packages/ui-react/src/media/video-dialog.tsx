'use client'

import { Dialog } from '@base-ui/react/dialog'
import { type ReactElement, useContext, useEffect, useRef } from 'react'

import { cn } from '../lib/cn'
import { VideoManagerContext } from './video-manager-context'

/** Detect a video MIME type from its file extension. */
function detectVideoType(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'webm':
      return 'video/webm'
    case 'ogg':
    case 'ogv':
      return 'video/ogg'
    case 'mov':
      return 'video/quicktime'
    case 'avi':
      return 'video/x-msvideo'
    default:
      return 'video/mp4'
  }
}

export interface VideoSource {
  src: string
  type?: string
}

export interface VideoDialogProps {
  captionsSrc?: string
  className?: string
  isOpen: boolean
  isVimeo?: boolean
  isYouTube?: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  trigger: ReactElement
  videoSources?: VideoSource[]
  vimeoId?: string
  youtubeId?: string
}

/*
 * VideoDialog — a modal video player, the media layer's overlay.
 * Rebuilt on Base UI Dialog directly (no @atom63/ui coupling): a dark backdrop +
 * a centered black panel holding a local <video>, or a Vimeo / YouTube iframe.
 * Coordinates with an optional VideoManagerProvider so background videos pause
 * while the dialog is open.
 */
export const VideoDialog = ({
  isOpen,
  onOpenChange,
  videoSources = [],
  title = 'Video Player',
  trigger,
  className,
  captionsSrc,
  vimeoId,
  isVimeo = false,
  youtubeId,
  isYouTube = false,
}: VideoDialogProps): ReactElement => {
  const modalVideoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previousOpenRef = useRef(false)

  // Optional: coordinate with the page's video manager if one is mounted.
  const videoManager = useContext(VideoManagerContext)

  useEffect(() => {
    const wasOpen = previousOpenRef.current
    previousOpenRef.current = isOpen

    if (!wasOpen && isOpen) {
      videoManager?.pauseAllVideos()
      // Local <video> mounts with the open dialog — kick play after paint.
      const frame = requestAnimationFrame(() => {
        void modalVideoRef.current?.play().catch(() => {
          /* autoplay policy */
        })
      })
      return () => cancelAnimationFrame(frame)
    }

    if (wasOpen && !isOpen) {
      videoManager?.resumeAllVideos()
    }
  }, [isOpen, videoManager])

  const renderVideoContent = () => {
    if (isVimeo && vimeoId) {
      return (
        <iframe
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
          frameBorder="0"
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1`}
          title={title}
        />
      )
    }

    if (isYouTube && youtubeId) {
      return (
        <iframe
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="aspect-video w-full"
          frameBorder="0"
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&mute=1&controls=1&playlist=${youtubeId}`}
          title={title}
        />
      )
    }

    return (
      <video
        autoPlay
        className="aspect-video w-full"
        controls
        loop
        muted
        playsInline
        ref={modalVideoRef}
      >
        {videoSources.map(source => (
          <source
            key={`${source.src}-${source.type || detectVideoType(source.src)}`}
            src={source.src}
            type={source.type || detectVideoType(source.src)}
          />
        ))}
        <track
          default
          kind="captions"
          label="English"
          lang="en"
          src={captionsSrc || 'data:text/vtt;base64,V0VCVlRUCg=='}
        />
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={isOpen}>
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        {/*
          Stack above app modals/drawers (`--z-layer-modal`: 600). Tailwind z-40/50
          sat under the case-study detail chrome and made the player unreachable.
        */}
        <Dialog.Backdrop
          className="fixed inset-0 z-(--z-layer-overlay) bg-[var(--a63-media-scrim)] backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
          data-media-overlay="video"
        />
        <Dialog.Viewport
          className="fixed inset-0 z-(--z-layer-overlay) grid place-items-center p-4"
          data-media-overlay="video"
        >
          <Dialog.Popup
            className={cn(
              'relative w-full max-w-7xl origin-center overflow-hidden rounded-2xl bg-[var(--a63-media-stage)] transition-[opacity,scale] duration-200 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
              className
            )}
            data-media-overlay="video"
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Video player dialog for {title}
            </Dialog.Description>
            {/* Mount media only while open so iframe/video autoplay starts fresh (case-study pattern). */}
            {isOpen ? renderVideoContent() : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
