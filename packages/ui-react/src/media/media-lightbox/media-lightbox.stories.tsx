import { ScrollableList } from '@atom63/ui-react'
import { MediaLightbox, useMediaLightbox } from '@atom63/ui-react/media'
import { Lightbox } from '@atom63/ui-react/media/lightbox'
import type { MediaLightboxAppearance, MediaLightboxItem } from '@atom63/ui-react/media'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'

const GALLERY: MediaLightboxItem[] = [
  {
    alt: 'Rolling hills at dusk',
    href: 'https://example.com/hills',
    id: 'hills',
    src: 'https://picsum.photos/id/1015/1600/900',
    title: 'Hills',
  },
  {
    alt: 'A quiet harbour',
    id: 'harbour',
    src: 'https://picsum.photos/id/1016/1600/900',
    title: 'Harbour',
  },
  {
    alt: 'Forest canopy from below',
    id: 'canopy',
    src: 'https://picsum.photos/id/1018/1600/900',
    title: 'Canopy',
  },
]

const VARIANT_GALLERY: MediaLightboxItem[] = [
  {
    alt: 'Ribbon wallpaper',
    darkSrc: 'https://picsum.photos/id/1024/1600/900?grayscale',
    id: 'ribbon',
    lightSrc: 'https://picsum.photos/id/1024/1600/900',
    title: 'Ribbon',
  },
]

/** Seven wide wallpapers with a light and a dark source each, like the atom63.io home page. */
const WALLPAPERS: MediaLightboxItem[] = [
  ['ribbon', 'Ribbon', 1015],
  ['harbour', 'Harbour', 1016],
  ['canopy', 'Canopy', 1018],
  ['dunes', 'Dunes', 1036],
  ['summit', 'Summit', 1043],
  ['coast', 'Coast', 1044],
  ['meadow', 'Meadow', 1050],
].map(([id, title, photo]) => ({
  alt: `${String(title)} wallpaper`,
  caption: `${String(title)} — 2400 × 1350`,
  darkSrc: `https://picsum.photos/id/${String(photo)}/2400/1350?grayscale`,
  id: String(id),
  lightSrc: `https://picsum.photos/id/${String(photo)}/2400/1350`,
  thumbDarkSrc: `https://picsum.photos/id/${String(photo)}/240/135?grayscale`,
  thumbLightSrc: `https://picsum.photos/id/${String(photo)}/240/135`,
  title: String(title),
}))

/**
 * The atom63.io home page: a horizontal row of tiles that opens into the
 * lightbox with its thumbnail strip, each wallpaper switchable between light
 * and dark. This is the story to try the paging track on a phone.
 */
function WallpaperRow({ items }: { items: MediaLightboxItem[] }) {
  const tiles = useRef(new Map<string, HTMLElement>())
  // The row follows the gallery: each page turn scrolls the matching tile into
  // view behind the lightbox, and closing morphs back into it.
  const lightbox = useMediaLightbox(items.length, {
    getOrigin: index => tiles.current.get(items[index]?.id ?? '') ?? null,
  })
  const [appearance, setAppearance] = useState<Record<string, MediaLightboxAppearance>>({})

  return (
    <div className="p-6">
      <ScrollableList>
        <div className="flex gap-3 p-1">
          {items.map((item, itemIndex) => (
            <button
              aria-label={`View ${item.title}`}
              className="relative aspect-3/2 w-64 shrink-0 overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
              key={item.id}
              onClick={event => {
                lightbox.openAt(itemIndex, event.currentTarget)
              }}
              ref={element => {
                if (element) {
                  tiles.current.set(item.id, element)
                } else {
                  tiles.current.delete(item.id)
                }
              }}
              type="button"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${
                    appearance[item.id] === 'light' ? item.thumbLightSrc : item.thumbDarkSrc
                  }")`,
                }}
              />
            </button>
          ))}
        </div>
      </ScrollableList>

      <MediaLightbox
        appearance={appearance}
        index={lightbox.index}
        items={items}
        onAppearanceChange={(id, next) => {
          setAppearance(current => ({ ...current, [id]: next }))
        }}
        onIndexChange={lightbox.setIndex}
        onOpenChange={open => {
          if (!open) {
            lightbox.close()
          }
        }}
        open={lightbox.isOpen}
        origin={lightbox.origin}
        thumbnails
        transition={lightbox.transition}
      />
    </div>
  )
}

/**
 * Passing the clicked element as the zoom origin is what makes the enlarged
 * media grow out of the tile instead of appearing from nowhere.
 */
function Gallery({ items }: { items: MediaLightboxItem[] }) {
  const lightbox = useMediaLightbox(items.length)
  const [appearance, setAppearance] = useState<Record<string, MediaLightboxAppearance>>({})

  return (
    <div className="max-w-3xl p-6">
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, itemIndex) => (
          <button
            aria-label={`View ${item.title}`}
            className="relative aspect-3/2 overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={item.id}
            onClick={event => {
              lightbox.openAt(itemIndex, event.currentTarget)
            }}
            type="button"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${
                  appearance[item.id] === 'light' ? item.lightSrc : (item.src ?? item.darkSrc)
                }")`,
              }}
            />
          </button>
        ))}
      </div>

      <MediaLightbox
        appearance={appearance}
        index={lightbox.index}
        items={items}
        onAppearanceChange={(id, next) => {
          setAppearance(current => ({ ...current, [id]: next }))
        }}
        onIndexChange={lightbox.setIndex}
        onOpenChange={open => {
          if (!open) {
            lightbox.close()
          }
        }}
        open={lightbox.isOpen}
        origin={lightbox.origin}
        transition={lightbox.transition}
      />
    </div>
  )
}

function ComposedGallery({ items }: { items: MediaLightboxItem[] }) {
  const lightbox = useMediaLightbox(items.length)

  return (
    <div className="max-w-4xl p-6">
      <div className="grid grid-cols-3 gap-4">
        {items.map((item, itemIndex) => (
          <button
            aria-label={`View ${item.title}`}
            className="group flex aspect-4/3 flex-col justify-end overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-left text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={item.id}
            onClick={event => {
              lightbox.openAt(itemIndex, event.currentTarget)
            }}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.58)), url("${item.src ?? item.darkSrc}")`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
            type="button"
          >
            <span className="text-xs tracking-[0.24em] text-white/70 uppercase">Custom chrome</span>
            <span className="mt-2 text-lg font-medium text-white transition group-hover:translate-x-0.5">
              {item.title}
            </span>
          </button>
        ))}
      </div>

      <Lightbox.Root
        index={lightbox.index}
        items={items}
        onIndexChange={lightbox.setIndex}
        onOpenChange={open => {
          if (!open) {
            lightbox.close()
          }
        }}
        open={lightbox.isOpen}
        origin={lightbox.origin}
        transition={lightbox.transition}
      >
        <Lightbox.Portal>
          <Lightbox.Backdrop className="bg-black/92 backdrop-blur-md" />
          <Lightbox.Content className="px-4 pt-4 pb-6 text-white sm:px-6">
            <Lightbox.Status />
            <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Lightbox.Close
                  render={
                    <button
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                      type="button"
                    >
                      Close
                    </button>
                  }
                />
                <Lightbox.Counter className="text-sm text-white/70" />
              </div>

              <div className="flex items-center gap-2">
                <Lightbox.Previous
                  render={
                    <button
                      className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                    >
                      Previous
                    </button>
                  }
                />
                <Lightbox.Next
                  render={
                    <button
                      className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                    >
                      Next
                    </button>
                  }
                />
              </div>
            </div>

            <Lightbox.Viewport className="relative z-10 min-h-0 flex-1 pt-6">
              <Lightbox.Slides>
                {slide => (
                  <Lightbox.Slide key={slide.item.id}>
                    <Lightbox.Frame className="shadow-[0_32px_80px_rgba(0,0,0,0.55)]">
                      <Lightbox.Zoom>
                        <Lightbox.Media />
                      </Lightbox.Zoom>
                    </Lightbox.Frame>
                  </Lightbox.Slide>
                )}
              </Lightbox.Slides>
            </Lightbox.Viewport>

            <div className="relative z-20 mx-auto flex w-full max-w-3xl justify-center px-4 pt-2">
              <Lightbox.Caption className="max-w-2xl text-center text-sm leading-6 text-white/72" />
            </div>
          </Lightbox.Content>
        </Lightbox.Portal>
      </Lightbox.Root>
    </div>
  )
}

const meta = {
  title: 'UI React/MediaLightbox',
  component: MediaLightbox,
} satisfies Meta<typeof MediaLightbox>

export default meta

// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

export const GalleryOfThree: Story = {
  render: () => <Gallery items={GALLERY} />,
}

export const SingleItem: Story = {
  render: () => <Gallery items={[GALLERY[0] as MediaLightboxItem]} />,
}

export const LightAndDarkVariants: Story = {
  render: () => <Gallery items={VARIANT_GALLERY} />,
}

/**
 * Mirrors the atom63.io home page: seven wide light/dark wallpapers opened from
 * a horizontal row, with the thumbnail strip. Drag, flick, or use the arrow
 * keys to page; on a phone, tap to show or hide the controls.
 */
export const HomePageRow: Story = {
  // Full width, so the row scrolls inside the page as it does on the site
  // instead of widening a centred story past a phone's viewport.
  parameters: { layout: 'fullscreen' },
  render: () => <WallpaperRow items={WALLPAPERS} />,
}

export const Composition: Story = {
  render: () => <ComposedGallery items={GALLERY} />,
}

/* GalleryOfThree in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...GalleryOfThree, globals: { mode: 'dark' } }
