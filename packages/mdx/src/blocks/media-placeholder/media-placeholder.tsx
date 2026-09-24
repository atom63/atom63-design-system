import { clsx } from 'clsx'
import { Film, ImageIcon, LayoutTemplate } from 'lucide-react'
import type { ReactElement } from 'react'
import { MdxFrameSurface } from '../../foundations/frame/framed-block'

export type MediaPlaceholderKind = 'image' | 'video' | 'diagram'

export type MediaPlaceholderProps = {
  /** What the real asset should show — surfaced as the frame's caption. */
  label?: string
  /** Picks the icon + kind tag. Defaults to `image`. */
  kind?: MediaPlaceholderKind
  /** CSS aspect-ratio for the frame (e.g. `16 / 9`, `4 / 3`, `1 / 1`). */
  aspectRatio?: string
  className?: string
}

const KIND_ICON: Record<MediaPlaceholderKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  diagram: LayoutTemplate,
}

/**
 * A labeled dashed frame that marks where a real image, video, or diagram will
 * go. Sits in the reading column with media spacing, so it previews the content
 * rhythm before assets exist — swap it for an ImageBlock / AutoplayVideoBlock later.
 */
export function MediaPlaceholder({
  label,
  kind = 'image',
  aspectRatio = '16 / 9',
  className,
}: MediaPlaceholderProps): ReactElement {
  const Icon = KIND_ICON[kind]

  return (
    <MdxFrameSurface
      className={clsx(
        'media-placeholder mdx-media-placeholder mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-2.5 border-dashed p-6 text-center',
        className
      )}
      spacing="media"
      style={{ aspectRatio }}
    >
      <Icon aria-hidden className="mdx-media-placeholder-icon size-6" />
      <div className="flex flex-col items-center gap-1">
        <span className="mdx-media-placeholder-icon text-[0.6875rem] font-medium tracking-wide uppercase">
          {kind} placeholder
        </span>
        {label ? (
          <span className="mdx-text-secondary max-w-[85%] text-sm leading-relaxed">{label}</span>
        ) : null}
      </div>
    </MdxFrameSurface>
  )
}
