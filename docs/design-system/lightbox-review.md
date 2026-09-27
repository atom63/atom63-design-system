# Lightbox review: MediaLightbox against the X image viewer

Status: decided, 2026-09-26. L1-B (a sliding track), L2-B (tap toggles the chrome on touch), L3 adopted with L1, and L4 deferred.

## Scope

`MediaLightbox` (`packages/ui-react/src/media/media-lightbox/`) is the design system's own image
and video viewer. It is written from scratch, with no third-party lightbox; it uses `motion` and
Base UI's `useRender`. Its main application is the atom63.io home page, where a horizontal
`ScrollableList` of wallpaper tiles opens into the lightbox (`apps/atom63.io/src/pages/components/home/media-scroller.tsx`
in atom63-vite). That pattern is a carousel plus a lightbox. The reference for how it should feel is
the image viewer in the X (Twitter) mobile app.

This review compares the two. It is based on:

- using atom63.io in a browser at 1280 × 800 and 375 × 812;
- reading the lightbox source, above all `parts/slides.tsx`, `use-swipe-intent.ts`,
  `use-pull-to-dismiss.ts`, `use-media-zoom.ts` and `use-chrome-auto-hide.ts`;
- the crossfade decision record, `docs/superpowers/specs/2026-09-12-lightbox-crossfade-stage.md`
  in atom63-vite.

The browser used here can only send mouse events, so touch gestures were checked in the source and
need a pass on a real phone.

## What already matches

| Behavior | X | Atom63 |
| --- | --- | --- |
| Open from the tapped thumbnail and close back into it | Yes | Yes. FLIP by default, View Transitions opt-in; it returns to the tile of the image on screen, not the one it opened from |
| Drag down to dismiss, with the image shrinking and the backdrop fading as it follows the finger | Yes | Yes (`use-pull-to-dismiss.ts`); a fast flick dismisses below the distance threshold |
| Double-tap to zoom, pinch, pan while zoomed | Yes | Yes (`use-media-zoom.ts`); trackpad pinch and ctrl + scroll too |
| Keyboard, screen reader and focus handling | Web only | Arrow keys, a focus trap, a live "Ribbon, 4 of 7" announcement, localized labels |
| Neighbors preloaded so a page turn never shows an empty frame | Yes | Yes (`preload`, default 1) |

## Where it differs

### 1. Page turns cross-fade instead of sliding

This is the largest difference, and it is a deliberate one. In X, the image moves 1:1 with the
finger. The next image slides in beside it with a gap, a flick carries momentum, and the edges
rubber-band. In Atom63, every slide sits in the same box and a page turn changes which one is
visible (`parts/slides.tsx`). While the finger drags, nothing moves; on release, the images
cross-fade.

The 2026-09-12 spec chose this after the page turn felt janky next to ramka. It names three
causes. The first and most likely is A1: a full-width `backdrop-filter` dock sitting over the moving
photo. The spec fixed A1, and it also removed the sliding track, so that the compositor never has
to move a photo at all. In that decision the owner accepted losing 1:1 tracking, momentum and
rubber-banding. The spec gives a rollback point in case direct manipulation later mattered more.

With X as the reference, it matters more. The blur that the spec found most likely to cause the
jank is already gone. A track driven by `transform` is a single compositor layer, which is how
native pagers do it. That combination was never measured: the spec replaced the track in the same
change that removed the blur.

### 2. Tapping the empty area closes the viewer

In X, a tap toggles the chrome (the close button, the actions and the page dots). You leave by
dragging the image away or pressing close. In Atom63, a click or tap anywhere outside the image
closes the lightbox (`SlideCloseArea`), and the chrome hides only after an idle timeout
(`use-chrome-auto-hide.ts`). On a phone, a wide image leaves most of the screen empty above and
below it. A tap meant to hide the controls, or a slightly-off tap on the image, closes the viewer.
Clicking outside to close is still right with a mouse; X on the web does the same.

### 3. Mobile presentation

X shows the image edge to edge on pure black, with square corners. Atom63 on a phone shows the
image full width with rounded corners, on the dark page surface. The controls are pill buttons at
the top, and a "Ribbon · 4 of 7" caption sits at the bottom; the thumbnail strip hides below its
breakpoint. The differences are small: corner radius, backdrop darkness, and where the counter sits.

### 4. Paging while zoomed

X turns the page when a zoomed image is panned hard past its edge. Atom63 disables the page swipe
while zoomed (`use-swipe-intent.ts`), so the user has to zoom out first. This matters less on the
home page, whose wallpapers are rarely zoomed.

### 5. Not in scope for a portfolio viewer

X also has long-press to save or share, an alt-text badge, and the post's engagement actions. None
of them serves the home page. Atom63's light/dark wallpaper toggle has no X counterpart and stays.

## Decisions

### L1. How a page turn moves

- **Options:**
  - **A. Keep the cross-fade.** No change.
  - **B. Return to a sliding track, driven by `transform`, not scroll-snap.** The photo follows the
    finger 1:1, with a gap between neighbors, a spring settle, velocity-based paging and edge
    rubber-banding. Arrow keys and thumbnail clicks animate the same track, or jump straight to a
    far index. Reduced motion keeps an instant switch. The blur fix (A1) stays.
  - **C. A partial follow:** the current photo moves a little with the finger for feedback, then
    cross-fades on release.
- **Trade-offs:**
  - A keeps the jank fix, but it will never feel like X.
  - B is the X model. It needs the jank measured again on your phone, since the most likely cause
    is already fixed; if it still judders, we know the track itself is the problem.
  - C adds feedback but feels like neither model, and a half-moving photo can read as a bug.
- **Recommendation: B.** Build it behind the same props API, compare it with the current build on
  your phone, and keep the old code until you have tried it. The swipe-intent, velocity and
  pull-to-dismiss code carries over.

### L2. What a tap does on touch

- **Options:**
  - **A. Keep "tap outside closes"** everywhere.
  - **B. Split by input.** On touch, a tap anywhere toggles the chrome, and dismissal happens by
    dragging or with Close. With a mouse, a click outside closes, as today.
- **Trade-offs:** B matches X and stops accidental closes on phones. It needs a short delay to tell
  a single tap from a double-tap, which X also has. A is simpler but closes by accident on narrow
  screens.
- **Recommendation: B.**

### L3. Mobile presentation

- **Proposal:** below the thumbnail breakpoint, show the image with square corners on the
  `--a63-media-stage` backdrop, which is already black, and keep the top controls and the bottom
  caption and counter. This is a token and recipe change only.
- **Recommendation:** adopt it together with L1.

### L4. Paging while zoomed

- **Proposal:** when a zoomed image is already at its edge, a further drag in that direction turns
  the page.
- **Recommendation:** later. It depends on L1-B's track and is rare on the home page.

## Next steps (if L1-B and L2-B are chosen)

1. A branch with the transform track and the touch tap toggle, with tests for 1:1 drag, the
   velocity and distance thresholds, RTL, reduced motion, and a tap versus a double-tap.
2. A Storybook story and a preview deploy that you try on your phone next to the current
   atom63.io.
3. If it feels right, merge. Then atom63-vite picks it up with the next ui-react beta.
