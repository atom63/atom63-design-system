import { LoaderCircle, Maximize, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import { Image } from './image'
import { Video } from './video'
import { VideoDialog } from './video-dialog'

export type VideoModalInteractionMode = 'autoplay' | 'lightbox'

export interface VideoModalProps {
  /** Alt text for accessibility */
  alt?: string
  /** Aspect ratio for the video container */
  aspectRatio?: string
  /** Additional CSS classes */
  className?: string
  /** Whether to use Vimeo instead of local video */
  isVimeo?: boolean
  /** Interaction mode - autoplay starts playing immediately */
  mode?: VideoModalInteractionMode
  /** Title for modal dialog */
  title: string
  /** Video sources for both preview and modal */
  videoSources?: Array<{
    src: string
    type?: string // Make type optional for auto-detection
  }>
  /** Vimeo video ID for external hosting */
  vimeoId?: string
  /** Vimeo thumbnail URL */
  vimeoThumbnail?: string
}

const IconButton = ({
  icon,
  className,
  'aria-label': ariaLabel,
  ...props
}: {
  icon: string
  className?: string
  'aria-label'?: string
  [key: string]: unknown
}) => {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        'rounded-full bg-black/70 p-2 transition-transform duration-300 group-hover:scale-110',
        className
      )}
      type="button"
      {...props}
    >
      <div className="rounded-full bg-gradient-to-b from-white/10 to-white/5 p-3 transition-transform duration-300 group-hover:scale-110">
        <div className="flex h-8 w-8 items-center justify-center text-white">
          {icon === 'play' && <Play className="ml-1 h-8 w-8" />}
          {icon === 'maximize' && <Maximize className="h-8 w-8" />}
        </div>
      </div>
    </button>
  )
}

export const VideoModal = ({
  videoSources = [],
  title,
  className,
  mode = 'autoplay',
  aspectRatio = 'aspect-[21/9]',
  alt,
  vimeoId,
  isVimeo = false,
  vimeoThumbnail,
}: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewIframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(mode === 'autoplay' && !isVimeo)
  const [isHovering, setIsHovering] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  const handleVideoError = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleVideoLoad = useCallback(() => {
    const video = videoRef.current
    if (!video || hasInitialized || isVimeo) {
      return
    }

    if (mode === 'autoplay') {
      // Set preview time to 10 seconds for interesting content
      video.currentTime = 10
      setHasInitialized(true)
    }
  }, [mode, hasInitialized, isVimeo])

  useEffect(() => {
    const video = videoRef.current
    if (!video || isVimeo) {
      return
    }

    video.addEventListener('loadeddata', handleVideoLoad)
    video.addEventListener('error', handleVideoError)

    return () => {
      video.removeEventListener('loadeddata', handleVideoLoad)
      video.removeEventListener('error', handleVideoError)
    }
  }, [handleVideoLoad, handleVideoError, isVimeo])

  useEffect(() => {
    const video = videoRef.current
    if (!video || isVimeo) {
      return
    }

    // Cleanup previous play promise
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {
        // Ignore errors from cancelled play promises
      })
    }

    // Pause background video when modal is open
    if (isModalOpen) {
      video.pause()
      return
    }

    if (isPlaying && hasInitialized) {
      playPromiseRef.current = video.play().catch(() => {
        setIsPlaying(false)
      })
    } else {
      video.pause()
    }

    // Cleanup on unmount
    return () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {
          // Ignore errors from cancelled play promises
        })
      }
    }
  }, [isPlaying, isModalOpen, hasInitialized, isVimeo])

  // Handle Vimeo preview play/pause when modal opens/closes
  useEffect(() => {
    if (isVimeo && previewIframeRef.current && mode === 'autoplay') {
      const iframe = previewIframeRef.current

      if (isModalOpen) {
        // Pause video using postMessage API
        iframe.contentWindow?.postMessage('{"method":"pause"}', '*')
      } else {
        // Resume video using postMessage API
        iframe.contentWindow?.postMessage('{"method":"play"}', '*')
      }
    }
  }, [isModalOpen, isVimeo, mode])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open)
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsModalOpen(true)
    }
  }, [])

  const getButtonOpacity = () => {
    return isHovering ? 'opacity-100' : 'opacity-0'
  }

  const renderPreviewContent = () => {
    if (isVimeo && vimeoId) {
      // For autoplay mode, show embedded Vimeo player with skeleton background
      if (mode === 'autoplay') {
        return (
          <div className="relative h-full w-full scale-[1.02] overflow-hidden transition-transform duration-300 group-hover:scale-[1.04]">
            <iframe
              allow="autoplay; fullscreen; picture-in-picture"
              className="absolute inset-0 h-full w-full"
              frameBorder="0"
              ref={previewIframeRef}
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&controls=0&background=1&quality=auto&transparent=0&api=1`}
              style={{
                pointerEvents: 'none',
                width: '100vw',
                height: '56.25vw', // 16:9 aspect ratio
                minHeight: '100%',
                minWidth: '177.78vh', // 16:9 aspect ratio
                transform: 'translate(-50%, -50%)',
                position: 'absolute',
                top: '50%',
                left: '50%',
              }}
              title={`${title} preview`}
            />
          </div>
        )
      }
      if (vimeoThumbnail) {
        // For lightbox mode, show thumbnail
        return (
          <Image
            alt={alt || `${title} video thumbnail`}
            className="h-full w-full"
            imageClassName="scale-[1.02] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            src={vimeoThumbnail}
          />
        )
      }
    }

    if (!isVimeo && videoSources.length > 0) {
      return (
        <Video
          className="h-full w-full scale-[1.02] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          fallbackText="Your browser does not support the video tag."
          ref={videoRef}
          sources={videoSources}
          style={{ display: 'block' }}
        />
      )
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
        No video available
      </div>
    )
  }

  return (
    <div className={cn('group relative h-full w-full overflow-hidden', aspectRatio, className)}>
      {/* Preview Content */}
      {renderPreviewContent()}

      {/* Video Dialog */}
      <VideoDialog
        isOpen={isModalOpen}
        isVimeo={isVimeo}
        onOpenChange={handleModalOpenChange}
        title={title}
        trigger={
          <button
            aria-label={`Watch full ${title.toLowerCase()}`}
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center',
              'bg-black/20 transition-opacity duration-300',
              getButtonOpacity()
            )}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            type="button"
          >
            <IconButton aria-label={`Open ${title} in full screen`} icon="maximize" />
          </button>
        }
        videoSources={videoSources}
        vimeoId={vimeoId}
      />

      {/* Loading indicator */}
      {isPlaying && videoRef.current?.readyState === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
          <LoaderCircle className="size-6 animate-spin" />
        </div>
      )}
    </div>
  )
}
