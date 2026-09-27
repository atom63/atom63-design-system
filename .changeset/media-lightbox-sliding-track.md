---
'@atom63/ui-react': patch
---

`MediaLightbox` pages like a native photo viewer. The `MediaLightbox` props API is unchanged;
`useMediaLightbox` gains an optional `getOrigin`.

- Page turns slide instead of crossfading. Once a drag locks horizontal, the photo follows the
  pointer 1:1, and its neighbours sit beside it with a gap (`--a63-media-lightbox-gap`, default
  `--a63-space-4`). On release it pages by distance or velocity and settles on a spring. Past the
  first and last item the drag meets rubber-band resistance. A flick that reverses before release
  springs back, and a press during a settle catches the photo. Arrow keys, the previous and next
  buttons and an adjacent thumbnail animate the same track; a jump of more than one item cuts. A
  two-finger trackpad swipe follows the fingers too and turns at most one page per gesture.
  Right-to-left galleries mirror, and `prefers-reduced-motion` lands every turn instantly.
- On touch, a single tap on the photo or around it shows or hides the controls instead of
  closing the viewer. A double-tap still zooms and does not toggle. Chrome hidden by a tap stays
  hidden until the next tap; keyboard focus entering the chrome shows it. With a mouse, a click
  outside the photo still closes, and the chrome still hides after idling.
- Below the `sm` breakpoint the photo has square corners on the black `--a63-media-stage`
  backdrop, and the caption and counter use the on-media foreground.
- `Lightbox.Slides` now renders a `data-slot="media-lightbox-strip"` element inside the track,
  and the track sets `touch-action: none`. Slides no longer carry an inline `opacity`.
- Closing into a thumbnail no longer flickers when the gallery was paged past it. Right before the
  closing morph measures, the lightbox scrolls the return thumbnail into view instantly (the
  overlay still covers the page), and it counts a thumbnail cut off by a scrolling ancestor as not
  visible, so a still-clipped one cross-fades instead of morphing into a hidden box.
- `useMediaLightbox(count, { getOrigin })` takes the thumbnail for an item. With it, each page turn
  scrolls that thumbnail into view behind the lightbox, so a row of tiles follows the gallery, and
  `close()` without an argument morphs back into the thumbnail of the item on screen.
- Closing after a page turn morphs the photo on screen. The morph used to run on the slide the
  gallery opened on, so the visible photo stayed full size and vanished with the overlay. Closing
  also no longer restarts the opening zoom when it is handed a new origin, which drew the photo
  full size for a frame just before the overlay left.
