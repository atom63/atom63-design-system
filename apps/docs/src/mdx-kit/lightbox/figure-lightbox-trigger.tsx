import { clsx } from 'clsx'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'

export type FigureLightboxTriggerProps = {
  alt: string
  caption?: string
  children: React.ReactNode
  className?: string
  galleryId?: string
  height: number
  src: string
  width: number
}

export function FigureLightboxTrigger({
  src,
  alt,
  caption,
  width,
  height,
  galleryId = MDX_FIGURE_LIGHTBOX_GALLERY_ID,
  className,
  children,
}: FigureLightboxTriggerProps) {
  const label = alt.trim() ? `View ${alt} in gallery` : 'View image in gallery'

  return (
    <button
      aria-label={label}
      className={clsx(
        'group relative block w-full cursor-zoom-in overflow-hidden border-none bg-transparent p-0',
        className
      )}
      data-gallery-id={galleryId}
      data-pswp-caption={caption}
      data-pswp-height={height}
      data-pswp-src={src}
      data-pswp-width={width}
      type="button"
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/90 opacity-0 ring-1 ring-border transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <svg
          className="size-4 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <title>Zoom</title>
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </span>
    </button>
  )
}
