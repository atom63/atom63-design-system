---
'@atom63/ui-react': patch
---

`MediaLightbox` pages like a native photo viewer. The props API is unchanged.

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
