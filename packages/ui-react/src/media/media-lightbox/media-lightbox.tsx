'use client'

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { motion } from 'motion/react'
import type { CSSProperties, FocusEvent, ReactElement, RefObject } from 'react'
import { cn } from '../../lib/cn'
import { CHROME_EXIT_OFFSET, CHROME_IN, CHROME_OUT } from './motion'
import { Lightbox, useLightboxConfig, useLightboxRefs, useLightboxState } from './parts'
import { useChromeAutoHide, type ChromeAutoHide } from './use-chrome-auto-hide'
import { SM_BREAKPOINT_PX, useMinWidth } from './use-min-width'
import type { MediaLightboxProps } from './types'

/**
 * Whether a chrome control's `focus` came from elsewhere *inside* the
 * lightbox — a `Tab` move between chrome controls — rather than from
 * outside it. `LightboxContent` auto-focuses `Close` on every open
 * regardless of input modality, and that focus's `relatedTarget` is always
 * something outside the lightbox (whatever the host page had focused, or
 * nothing). A later `Tab` between chrome controls always reports a
 * `relatedTarget` that is itself inside the lightbox. See
 * `useChromeAutoHide`'s own doc comment for why this — not
 * `:focus-visible` — is what gates `holdFocus`.
 */
function isInternalFocusMove(event: FocusEvent, rootRef: RefObject<HTMLElement | null>): boolean {
  const related = event.relatedTarget
  return related instanceof Node && Boolean(rootRef.current?.contains(related))
}

/**
 * The combined opacity every piece of chrome carries: the pull-to-dismiss
 * fade (`--a63-media-lightbox-pull`, written imperatively by
 * `usePullToDismiss`) and the auto-hide fade multiply rather than one
 * replacing the other, so a chrome already faded down by an in-progress pull
 * does not jump back to full strength the moment the idle timer also wants
 * it gone.
 */
function chromeOpacityClassName(): string {
  return cn(
    'opacity-[calc((1-var(--a63-media-lightbox-chrome-hidden,0))*(1-var(--a63-media-lightbox-pull,0)))]',
    'transition-opacity duration-[var(--a63-control-feedback-duration,200ms)] motion-reduce:transition-none'
  )
}

function chromeOpacityStyle(chrome: ChromeAutoHide): CSSProperties {
  return { '--a63-media-lightbox-chrome-hidden': chrome.visible ? '0' : '1' } as CSSProperties
}

/**
 * The preset-private button look every floating and dock control shares.
 *
 * Each control is now a headless `Lightbox.*` part (mechanism and
 * accessibility only, no color, no layout), so this is a className, not a
 * component: `glass` floats on the photo *or* the backdrop margin around it
 * (a non-full-bleed photo leaves that margin exposed), so it carries its own
 * opaque-enough backplate (`.a63-media-lightbox-on-media`) rather than
 * tinting whatever is behind it. `ghost` sits inside the dock, a surface that
 * owns its own background, so it follows the theme like the rest of the
 * dock's text.
 */
function lightboxIconButtonClassName(tone: 'glass' | 'ghost' | 'capsule' = 'glass'): string {
  return cn(
    'flex size-11 items-center justify-center outline-none',
    'transition-colors duration-[var(--a63-control-feedback-duration,200ms)]',
    'disabled:pointer-events-none disabled:opacity-30',
    // The capsule's own surface is drawn by its wrapper, so its buttons carry
    // no border, no background and no radius of their own — two glass pills
    // inside a third would read as a seam rather than one control.
    tone !== 'capsule' && 'rounded-full',
    tone === 'glass' &&
      cn(
        'a63-media-lightbox-on-media',
        'focus-visible:ring-2 focus-visible:ring-[var(--a63-lightbox-on-media-ring)]'
      ),
    tone === 'capsule' &&
      cn(
        'text-[var(--a63-lightbox-on-media-fg)]',
        'hover:bg-[var(--a63-lightbox-on-media-surface-hover)]',
        'focus-visible:ring-2 focus-visible:ring-inset',
        'focus-visible:ring-[var(--a63-lightbox-on-media-ring)]'
      ),
    tone === 'ghost' &&
      cn(
        'rounded-full text-[var(--a63-text-primary)] hover:bg-[var(--a63-surface-control-hover)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--a63-focus-ring)]'
      )
  )
}

/**
 * Close, top right, and — from `md` up, and only while there is more than one
 * item and nothing is zoomed — the side chevrons. Three layers, each owning
 * one opacity: Motion writes its open/close enter/exit fade to
 * `style.opacity`, which beats any class, so the pull-to-dismiss and
 * auto-hide fades (the outer layer's own combined opacity) have to live on a
 * separate element or they never land at all.
 */
function PresetFloatingChrome({ chrome }: { chrome: ChromeAutoHide }): ReactElement {
  const { transition } = useLightboxConfig()
  const { rootRef } = useLightboxRefs()
  const viewTransition = transition === 'view-transition'
  // Hidden chrome stays in the tab order — a keyboard user reveals it with
  // the same `keydown` this component's own controls would receive — so only
  // pointer hit-testing is switched off, never focusability.
  const pointerEventsClassName = chrome.visible ? 'pointer-events-auto' : 'pointer-events-none'

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-20', chromeOpacityClassName())}
      style={chromeOpacityStyle(chrome)}
    >
      <motion.div
        animate={viewTransition ? undefined : { opacity: 1 }}
        className={cn(
          'pointer-events-none absolute inset-0',
          'pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)]',
          'pl-[env(safe-area-inset-left)]'
        )}
        exit={viewTransition ? undefined : { opacity: 0, transition: CHROME_OUT }}
        initial={viewTransition ? undefined : { opacity: 0 }}
        onBlur={chrome.releaseFocus}
        onFocus={event => {
          if (isInternalFocusMove(event, rootRef)) {
            chrome.holdFocus()
          }
        }}
        transition={CHROME_IN}
      >
        {/*
          One cluster, top right. Everything that acts on the photo lives
          here rather than being split between a corner and a bottom bar —
          two separated control groups make the viewer look twice to find
          anything. Zoom's pair shares a capsule, since they are one control
          with two directions.
        */}
        <div
          className={cn('absolute top-4 right-4 flex items-center gap-1.5', pointerEventsClassName)}
        >
          <Lightbox.AppearanceToggle className={lightboxIconButtonClassName('glass')} />
          <Lightbox.Destination className={lightboxIconButtonClassName('glass')} />
          {/* Zoom's pair shares one capsule — see the divider below. */}
          <div
            className={cn(
              'a63-media-lightbox-on-media flex items-center overflow-hidden',
              'rounded-full'
            )}
          >
            <Lightbox.ZoomOut className={lightboxIconButtonClassName('capsule')}>
              <ZoomOut aria-hidden className="size-5" />
            </Lightbox.ZoomOut>
            {/* Hairline, not a gap: the two are one control. */}
            <span
              aria-hidden
              className="h-5 w-px shrink-0 bg-[var(--a63-lightbox-on-media-border)]"
            />
            <Lightbox.ZoomIn className={lightboxIconButtonClassName('capsule')}>
              <ZoomIn aria-hidden className="size-5" />
            </Lightbox.ZoomIn>
          </div>
          <Lightbox.Close className={lightboxIconButtonClassName('glass')}>
            <X aria-hidden className="size-5" />
          </Lightbox.Close>
        </div>
        {/*
          Side chevrons, in the gutter beside the picture. Swipe, the strip,
          and the arrow keys all turn the page already, but none of them says
          so: a pointer user arriving at a photograph has nothing telling them
          there is a next one, and a trackpad swipe is a guess until it works.
          The chevrons are the only affordance that is visible before you try
          it.

          Held back below `md`, where they would have to sit on the picture
          instead of beside it — a phone leaves no side gutter, and swipe is
          the native gesture there anyway.
        */}
        <div
          className={cn(
            'absolute top-1/2 left-4 hidden -translate-y-1/2 md:block',
            pointerEventsClassName
          )}
        >
          <Lightbox.Previous className={lightboxIconButtonClassName('glass')}>
            <ChevronLeft aria-hidden className="size-5" />
          </Lightbox.Previous>
        </div>
        <div
          className={cn(
            'absolute top-1/2 right-4 hidden -translate-y-1/2 md:block',
            pointerEventsClassName
          )}
        >
          <Lightbox.Next className={lightboxIconButtonClassName('glass')}>
            <ChevronRight aria-hidden className="size-5" />
          </Lightbox.Next>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * The bottom dock: caption, counter, thumbnails, zoom, appearance, and
 * destination controls in one overlay rather than a permanent flex-flow
 * band. Bottom-anchored and out of the layout flow — the photo underneath is
 * free to fill the whole stage, and the dock floats over its lower edge only
 * while the chrome is up.
 */
function Dock({
  chrome,
  thumbnails,
}: {
  chrome: ChromeAutoHide
  thumbnails: boolean
}): ReactElement {
  const { items, reducedMotion, transition } = useLightboxConfig()
  const { index, itemCount } = useLightboxState()
  const { rootRef } = useLightboxRefs()
  const item = items[index]
  const viewTransition = transition === 'view-transition'
  // Below `sm` the strip stacks above a 44px control row and costs real
  // photo area; at `sm` and up it sits beside that row for free. Gated here
  // — not in CSS — so `Lightbox.Thumbnails` never mounts at all below `sm`,
  // and `Slide` falls back to its standalone `role="group"` instead of a
  // `tabpanel` naming tabs that were never rendered.
  const isAboveSm = useMinWidth(SM_BREAKPOINT_PX)
  const showThumbnails = thumbnails && itemCount > 1 && isAboveSm
  const pointerEventsClassName = chrome.visible ? 'pointer-events-auto' : 'pointer-events-none'

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 z-20',
        chromeOpacityClassName(),
        pointerEventsClassName
      )}
      onBlur={chrome.releaseFocus}
      onFocus={event => {
        if (isInternalFocusMove(event, rootRef)) {
          chrome.holdFocus()
        }
      }}
      onPointerDown={chrome.holdDrag}
      onPointerEnter={chrome.holdHover}
      onPointerLeave={chrome.releaseHover}
      style={chromeOpacityStyle(chrome)}
    >
      <motion.div
        animate={viewTransition ? undefined : { opacity: 1, y: 0 }}
        exit={
          viewTransition
            ? undefined
            : {
                opacity: 0,
                transition: CHROME_OUT,
                y: reducedMotion ? 0 : CHROME_EXIT_OFFSET,
              }
        }
        initial={
          viewTransition ? undefined : { opacity: 0, y: reducedMotion ? 0 : CHROME_EXIT_OFFSET }
        }
        transition={CHROME_IN}
      >
        {/*
          No surface of its own. A framed photo and a bar underneath read as
          two containers competing for the eye; the photo is the subject, so
          it is the only thing with an edge. Caption and strip sit directly
          on the backdrop, centred under the picture.
        */}
        <div
          className={cn(
            'flex w-full flex-col items-center gap-2.5',
            'px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
            'text-[var(--a63-text-primary)]'
          )}
          data-slot="media-lightbox-dock"
        >
          <div className="flex w-full max-w-[min(92vw,1400px)] flex-col items-center gap-2.5">
            {/*
            `dir="auto"` on the counter only. "3 of 7" is a run of digits
            either side of a word, which a right-to-left paragraph reorders
            into "of 7 3"; taking the direction from the text itself keeps an
            English counter readable inside an RTL gallery and lets a
            translated one read right to left. The caption is left alone: it
            is one run of prose, so it never reorders, and `auto` would drag
            its alignment away from the paragraph it belongs to.
          */}
            <div className="flex max-w-full items-baseline justify-center gap-3">
              {item?.caption ? (
                <Lightbox.Caption className="min-w-0 truncate text-center text-sm text-[var(--a63-text-secondary)]" />
              ) : null}
              {/*
                The strip already shows position, and `Lightbox.Status`
                already announces it — so where there is a strip the counter
                is redundant twice over and simply does not render. Below
                `sm` there is no strip, and it becomes the only visible
                answer to "where am I"; `aria-hidden` because Status is
                still the one announcing.
              */}
              {itemCount > 1 && !showThumbnails ? (
                <Lightbox.Counter
                  aria-hidden
                  className={cn(
                    'shrink-0 font-mono text-xs text-[var(--a63-text-secondary)]',
                    'tabular-nums opacity-70'
                  )}
                />
              ) : null}
            </div>

            {showThumbnails ? (
              <Lightbox.Thumbnails className="max-w-full min-w-0 justify-start sm:justify-center">
                {thumbnail => (
                  <Lightbox.Thumbnail
                    className={cn(
                      'relative h-11 w-14 shrink-0 snap-center overflow-hidden rounded-md outline-none',
                      'bg-[var(--a63-lightbox-on-media-surface)]',
                      'focus-visible:ring-2 focus-visible:ring-[var(--a63-lightbox-on-media-ring)]',
                      // Opacity alone. The thumbs used to scale between
                      // states as well, which put a size change next to the
                      // photo's own dissolve and read as the picture being
                      // zoomed rather than crossfaded.
                      'transition-opacity duration-[var(--a63-control-feedback-duration,200ms)]',
                      'ease-[var(--a63-motion-ease-emphasized,ease-out)] motion-reduce:transition-none',
                      thumbnail.isActive
                        ? 'opacity-100 ring-2 ring-[var(--a63-lightbox-on-media-fg)]'
                        : 'opacity-50 hover:opacity-80'
                    )}
                    key={thumbnail.item.id}
                  />
                )}
              </Lightbox.Thumbnails>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * A full-bleed, invisible hit area behind the media so clicking the empty
 * space around the photo — not just the backdrop's own margins — dismisses
 * the lightbox too. `aria-hidden` and untabbable: it duplicates `Close`'s
 * action rather than adding a second stop to the accessibility tree.
 */
function SlideCloseArea(): ReactElement {
  const { labels } = useLightboxConfig()
  const { close } = useLightboxState()

  return (
    <button
      aria-hidden
      aria-label={labels.close}
      className="absolute inset-0 cursor-default outline-none"
      onClick={close}
      tabIndex={-1}
      type="button"
    />
  )
}

/**
 * Enlarges media in place: pass the clicked element as `origin` and the media
 * grows out of it instead of appearing somewhere else.
 *
 * Controlled by design — the caller owns `open`, `index`, `origin`, and the
 * light/dark map so the thumbnail and the enlarged view never disagree.
 *
 * This is the default preset: a composition of the headless `Lightbox.*`
 * parts under `./parts`, which carry mechanism and accessibility only. Every
 * pixel of appearance — the glass buttons, the dock, the safe-area padding,
 * the responsive reveal of the side chevrons — lives here.
 */
export function MediaLightbox({
  appearance,
  className,
  index,
  items,
  labels,
  onAppearanceChange,
  onExitComplete,
  onIndexChange,
  onOpenChange,
  open,
  origin,
  preload,
  thumbnails,
  transition = 'flip',
}: MediaLightboxProps): ReactElement | null {
  // All chrome — the dock and the floating controls alike — hides and shows
  // together, so one hook drives both from here rather than each managing
  // its own idle clock and drifting out of sync.
  const chrome = useChromeAutoHide(open)

  return (
    <Lightbox.Root
      appearance={appearance}
      index={index}
      items={items}
      labels={labels}
      onAppearanceChange={onAppearanceChange}
      onIndexChange={onIndexChange}
      onOpenChange={onOpenChange}
      open={open}
      origin={origin}
      preload={preload}
      transition={transition}
    >
      <Lightbox.Portal onExitComplete={onExitComplete}>
        <Lightbox.Backdrop className="bg-[var(--a63-surface-page)]" />
        <Lightbox.Content
          className={className}
          onKeyDownCapture={chrome.reveal}
          onPointerMove={chrome.reveal}
        >
          <Lightbox.Status />
          <Lightbox.Viewport className="relative z-10 min-h-0 flex-1" onPointerDown={chrome.reveal}>
            <Lightbox.Slides>
              {slide => (
                <Lightbox.Slide key={slide.item.id}>
                  <SlideCloseArea />
                  {/*
                    No gutter and no width ceiling: the screen is the frame.
                    A cap at the photo's own resolution reads as principled —
                    upscaling past it only magnifies compression — but it also
                    left a 900px photo floating in the middle of a 1920px
                    display, which is a worse answer to "show me this picture"
                    than a few soft pixels. The corner radius stays for the
                    morph to land on, and lifts with the clip under zoom.
                  */}
                  <Lightbox.Frame className="rounded-2xl">
                    <Lightbox.Zoom>
                      <Lightbox.Media />
                    </Lightbox.Zoom>
                  </Lightbox.Frame>
                </Lightbox.Slide>
              )}
            </Lightbox.Slides>
            <PresetFloatingChrome chrome={chrome} />
          </Lightbox.Viewport>
          <Dock chrome={chrome} thumbnails={Boolean(thumbnails)} />
        </Lightbox.Content>
      </Lightbox.Portal>
    </Lightbox.Root>
  )
}
