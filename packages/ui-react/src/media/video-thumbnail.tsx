/**
 * VideoThumbnail — silent autoplay video with lazy loading + fade-in.
 *
 * Matches the Image component's loading behavior:
 * - Lazy: IntersectionObserver pauses when off-screen, plays when ≥25% visible
 * - Fade-in: opacity 0 → 1 transition on first play (matching Image's 400ms reveal)
 * - Reduced motion: never autoplays when prefers-reduced-motion is set
 * - Zero React state for play/pause — refs + one observer + one matchMedia listener
 *
 * The video element has no controls, loops silently, and uses playsInline
 * to prevent fullscreen on mobile (like a GIF-style preview).
 */

import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'

/** Map file extension to MIME type for <source type="...">. */
const VIDEO_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
}

/** Matches common video file extensions. */
const VIDEO_SRC_REGEX = /\.(mp4|webm|ogg|mov)$/i

/** True when the src looks like a video file. */
export function isVideoSrc(src?: string): boolean {
  if (!src) {
    return false
  }
  return VIDEO_SRC_REGEX.test(src)
}

interface VideoThumbnailProps {
  className?: string
  src: string
}

export function VideoThumbnail({ src, className }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVisibleRef = useRef(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const tryPlay = () => {
      if (isVisibleRef.current && !motionQuery.matches) {
        video.play().catch(() => {
          // Autoplay blocked by browser policy — silently no-op.
        })
      } else {
        video.pause()
      }
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries.at(0)
        isVisibleRef.current = entry?.isIntersecting ?? false
        tryPlay()
      },
      { threshold: 0.25 }
    )

    // Fade in when the video has enough data to display a frame
    const handleCanPlay = () => setRevealed(true)
    video.addEventListener('canplay', handleCanPlay)

    motionQuery.addEventListener('change', tryPlay)
    observer.observe(video)

    // If already loaded (cached), reveal immediately
    if (video.readyState >= 3) {
      setRevealed(true)
    }

    return () => {
      observer.disconnect()
      motionQuery.removeEventListener('change', tryPlay)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  return (
    <video
      className={cn(
        'transition-opacity duration-400 ease-out',
        revealed ? 'opacity-100' : 'opacity-0',
        className
      )}
      loop
      muted
      playsInline
      ref={videoRef}
    >
      <source
        src={src}
        type={VIDEO_MIME[src.split('.').pop()?.toLowerCase() ?? ''] ?? 'video/mp4'}
      />
    </video>
  )
}
