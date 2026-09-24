'use client'

import { clsx } from 'clsx'
import { MoveHorizontal, MoveVertical } from 'lucide-react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { forwardRef, lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  FramedBlockHeader,
  MdxFrameChrome,
  MdxFrameFooter,
  MdxFramePanel,
} from '../../foundations/frame/framed-block'
import { mdxStyles } from '../../mdx-styles'

const CENTER = 50

type CompareSliderProps = {
  after: ImageCompareImage
  changePositionOnHover: boolean
  handle: ReactNode
  objectFit: NonNullable<ImageCompareProps['objectFit']>
  onPositionChange: (position: number) => void
  position: number
  before: ImageCompareImage
  transition: string
  vertical: boolean
}

/**
 * `react-compare-slider` (~15 KB) is the single heaviest dependency this block
 * pulls in, and most pages never render an `ImageCompare`. Code-split it so the
 * slider (and its images helper) only load when the block actually mounts.
 * `React.lazy` needs a default export, so the dynamic import is re-shaped into
 * a small inner component that wires the two named exports together.
 */
const CompareSlider = lazy(async () => {
  const { ReactCompareSlider, ReactCompareSliderImage } = await import('react-compare-slider')

  function CompareSliderImpl({
    after,
    before,
    changePositionOnHover,
    handle,
    objectFit,
    onPositionChange,
    position,
    transition,
    vertical,
  }: CompareSliderProps) {
    const imageStyle: CSSProperties = { objectFit }
    return (
      <ReactCompareSlider
        changePositionOnHover={changePositionOnHover}
        // v4 is uncontrolled (`defaultPosition` only). Remount on reset —
        // never feed live drag position back into this prop.
        defaultPosition={position}
        handle={handle}
        itemOne={<ReactCompareSliderImage alt={before.alt} src={before.src} style={imageStyle} />}
        itemTwo={<ReactCompareSliderImage alt={after.alt} src={after.src} style={imageStyle} />}
        onPositionChange={onPositionChange}
        onlyHandleDraggable={false}
        portrait={vertical}
        style={{ height: '100%', width: '100%' }}
        transition={transition}
      />
    )
  }

  return { default: CompareSliderImpl }
})

export type ImageCompareImage = {
  alt: string
  label?: string
  src: string
}

export type ImageCompareProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onPositionChange' | 'title'
> & {
  after: ImageCompareImage
  aspectRatio?: string
  before: ImageCompareImage
  bordered?: boolean
  caption?: string
  changePositionOnHover?: boolean
  description?: string
  handle?: ReactNode
  /** Idle ms before restoring to center when `resetAfterIdle` is on. @default 2500 */
  idleResetMs?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onPositionChange?: (position: number) => void
  /** Initial slider position (0-100). @default 50 */
  position?: number
  /** Restore to center after the user stops interacting. @default false */
  resetAfterIdle?: boolean
  resetDelay?: number
  resetOnLeave?: boolean
  title?: ReactNode
  transition?: string
  vertical?: boolean
}

function ImageCompareHandle({ vertical = false }: { vertical?: boolean }) {
  const Icon = vertical ? MoveVertical : MoveHorizontal

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        aria-hidden
        className={clsx(
          'mdx-image-compare-handle-bar absolute',
          vertical ? 'h-0.5 w-full' : 'h-full w-0.5'
        )}
      />
      <div
        className={clsx(
          'mdx-image-compare-handle-knob relative z-30 flex size-9 cursor-grab items-center justify-center rounded-full',
          'backdrop-blur-sm',
          'transition-colors duration-200 active:cursor-grabbing'
        )}
      >
        <Icon aria-hidden className="size-4" />
      </div>
    </div>
  )
}

export const ImageCompare = forwardRef<HTMLDivElement, ImageCompareProps>(
  (
    {
      after,
      aspectRatio = '16/9',
      before,
      bordered = true,
      caption,
      changePositionOnHover = false,
      className,
      description,
      handle,
      idleResetMs = 2500,
      objectFit = 'cover',
      onPositionChange,
      position: initialPosition = CENTER,
      resetAfterIdle = false,
      resetDelay = 500,
      resetOnLeave = false,
      title,
      transition = '0.25s cubic-bezier(.17,.67,.83,.67)',
      vertical = false,
      ...props
    },
    ref
  ) => {
    const [defaultPosition, setDefaultPosition] = useState(initialPosition)
    const [sliderKey, setSliderKey] = useState(0)
    const leaveTimerRef = useRef<number | null>(null)
    const idleTimerRef = useRef<number | null>(null)
    const isPointerDownRef = useRef(false)
    const currentPositionRef = useRef(initialPosition)
    const beforeLabel = before.label ?? 'Before'
    const afterLabel = after.label ?? 'After'
    // With text above/below, wrap in the panel frame; otherwise render the
    // comparison as a plain rounded image block (no frame chrome).
    const framed = Boolean(title || description || caption)

    const clearLeaveTimer = () => {
      if (leaveTimerRef.current !== null) {
        window.clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
    }

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    useEffect(() => {
      return () => {
        clearLeaveTimer()
        clearIdleTimer()
      }
    }, [])

    const resetToCenter = () => {
      if (Math.abs(currentPositionRef.current - CENTER) < 0.5) return
      currentPositionRef.current = CENTER
      setDefaultPosition(CENTER)
      setSliderKey(key => key + 1)
      onPositionChange?.(CENTER)
    }

    const scheduleIdleReset = () => {
      if (!resetAfterIdle) return
      clearIdleTimer()
      idleTimerRef.current = window.setTimeout(() => {
        idleTimerRef.current = null
        if (isPointerDownRef.current) return
        resetToCenter()
      }, idleResetMs)
    }

    const handlePositionChange = (nextPosition: number) => {
      currentPositionRef.current = nextPosition
      onPositionChange?.(nextPosition)
      if (!isPointerDownRef.current) {
        scheduleIdleReset()
      }
    }

    const handlePointerEnter = () => {
      clearLeaveTimer()
    }

    const handlePointerDown = () => {
      isPointerDownRef.current = true
      clearLeaveTimer()
      clearIdleTimer()
    }

    const handlePointerUp = () => {
      isPointerDownRef.current = false
      scheduleIdleReset()
    }

    const handlePointerLeave = () => {
      isPointerDownRef.current = false
      scheduleIdleReset()

      if (!resetOnLeave) {
        return
      }

      clearLeaveTimer()
      leaveTimerRef.current = window.setTimeout(() => {
        leaveTimerRef.current = null
        if (isPointerDownRef.current) return
        resetToCenter()
      }, resetDelay)
    }

    const stage = (
      <div
        className="mdx-image-compare-stage relative w-full overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
        ref={ref}
        style={{ aspectRatio }}
        {...props}
      >
        <Suspense
          fallback={
            <div
              aria-hidden
              className="mdx-image-compare-skeleton h-full w-full animate-pulse"
              data-testid="image-compare-fallback"
            />
          }
        >
          <CompareSlider
            after={after}
            before={before}
            changePositionOnHover={changePositionOnHover}
            handle={handle ?? <ImageCompareHandle vertical={vertical} />}
            key={sliderKey}
            objectFit={objectFit}
            onPositionChange={handlePositionChange}
            position={defaultPosition}
            transition={transition}
            vertical={vertical}
          />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-3 top-3 z-40 flex items-start justify-between gap-3">
          <span className="mdx-image-compare-label max-w-[45%] min-w-0 truncate px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {beforeLabel}
          </span>
          <span className="mdx-image-compare-label max-w-[45%] min-w-0 truncate px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {afterLabel}
          </span>
        </div>
      </div>
    )

    // No text → render the comparison as a plain rounded image block.
    if (!framed) {
      return (
        <figure
          className={clsx(
            'mdx-image-compare not-mdx mdx-block',
            mdxStyles.spacing.media,
            className
          )}
        >
          {stage}
        </figure>
      )
    }

    // Text above/below → compose the DS Frame: header (title/description),
    // panel (the comparison), footer (caption).
    return (
      <MdxFrameChrome
        className={clsx('mdx-image-compare not-mdx mdx-block', mdxStyles.spacing.media, className)}
        data-framed=""
      >
        <FramedBlockHeader description={description} title={title} />
        <MdxFramePanel className="overflow-hidden p-0" border={bordered ? undefined : 'off'}>
          {stage}
        </MdxFramePanel>
        {caption ? <MdxFrameFooter>{caption}</MdxFrameFooter> : null}
      </MdxFrameChrome>
    )
  }
)

ImageCompare.displayName = 'ImageCompare'
