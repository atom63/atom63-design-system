import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useRef } from 'react'

export interface VideoManagerContextType {
  pauseAllVideos: () => void
  pauseVideo: (id: string) => void
  playVideo: (id: string) => void
  registerIframe: (id: string, iframeElement: HTMLIFrameElement) => void
  registerVideo: (id: string, videoElement: HTMLVideoElement) => void
  resumeAllVideos: () => void
  unregisterIframe: (id: string) => void
  unregisterVideo: (id: string) => void
}

export const VideoManagerContext = createContext<VideoManagerContextType | null>(null)

export interface VideoManagerProviderProps {
  children: ReactNode
  maxConcurrentVideos?: number
}

export function VideoManagerProvider({
  children,
  maxConcurrentVideos = 3,
}: VideoManagerProviderProps) {
  const videosRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  const iframesRef = useRef<Map<string, HTMLIFrameElement>>(new Map())
  const playingVideosRef = useRef<Set<string>>(new Set())
  const playingIframesRef = useRef<Set<string>>(new Set())
  const pausedByDialogRef = useRef<Set<string>>(new Set())
  const pausedIframesByDialogRef = useRef<Set<string>>(new Set())

  const value = useMemo<VideoManagerContextType>(() => {
    const evictOldestIfNeeded = () => {
      if (playingVideosRef.current.size < maxConcurrentVideos) return
      const oldestId = playingVideosRef.current.values().next().value as string | undefined
      if (!oldestId) return
      const oldestVideo = videosRef.current.get(oldestId)
      if (oldestVideo && !oldestVideo.paused) {
        oldestVideo.pause()
      }
      playingVideosRef.current.delete(oldestId)
    }

    return {
      registerVideo(id: string, videoElement: HTMLVideoElement) {
        videosRef.current.set(id, videoElement)
        if (!videoElement.paused) {
          playingVideosRef.current.add(id)
        }
      },

      unregisterVideo(id: string) {
        videosRef.current.delete(id)
        playingVideosRef.current.delete(id)
        pausedByDialogRef.current.delete(id)
      },

      registerIframe(id: string, iframeElement: HTMLIFrameElement) {
        iframesRef.current.set(id, iframeElement)
        playingIframesRef.current.add(id)
      },

      unregisterIframe(id: string) {
        iframesRef.current.delete(id)
        playingIframesRef.current.delete(id)
        pausedIframesByDialogRef.current.delete(id)
      },

      playVideo(id: string) {
        const video = videosRef.current.get(id)
        if (!video) return

        evictOldestIfNeeded()

        video
          .play()
          .then(() => {
            playingVideosRef.current.add(id)
          })
          .catch(() => {
            // Handle autoplay restrictions silently
          })
      },

      pauseVideo(id: string) {
        const video = videosRef.current.get(id)
        if (video && !video.paused) {
          video.pause()
          playingVideosRef.current.delete(id)
        }
      },

      pauseAllVideos() {
        pausedByDialogRef.current.clear()
        pausedIframesByDialogRef.current.clear()

        for (const [id, video] of videosRef.current.entries()) {
          const wasPlaying = !video.paused
          video.pause()
          if (wasPlaying || video.autoplay) {
            pausedByDialogRef.current.add(id)
          }
          playingVideosRef.current.delete(id)
        }

        for (const [id, iframe] of iframesRef.current.entries()) {
          pausedIframesByDialogRef.current.add(id)
          try {
            iframe.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), '*')
            iframe.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo' }),
              '*'
            )
          } catch {
            // Ignore postMessage errors
          }
        }
      },

      resumeAllVideos() {
        const videosToResume = new Set(pausedByDialogRef.current)
        const iframesToResume = new Set(pausedIframesByDialogRef.current)
        pausedByDialogRef.current.clear()
        pausedIframesByDialogRef.current.clear()

        for (const [id, video] of videosRef.current.entries()) {
          if (videosToResume.has(id)) {
            video
              .play()
              .then(() => {
                playingVideosRef.current.add(id)
              })
              .catch(() => {
                // Handle autoplay restrictions silently
              })
          }
        }

        for (const [id, iframe] of iframesRef.current.entries()) {
          if (iframesToResume.has(id)) {
            setTimeout(() => {
              iframe.contentWindow?.postMessage(JSON.stringify({ method: 'play' }), '*')
              iframe.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'playVideo' }),
                '*'
              )
            }, 100)
          }
        }
      },
    }
  }, [maxConcurrentVideos])

  return <VideoManagerContext.Provider value={value}>{children}</VideoManagerContext.Provider>
}

export function useVideoManager() {
  const context = useContext(VideoManagerContext)
  if (!context) {
    throw new Error('useVideoManager must be used within a VideoManagerProvider')
  }
  return context
}
