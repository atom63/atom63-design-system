---
name: art-landing
description: Build a landing page or portfolio hero "plate first" with Atom63 — pick an art style, have an image model paint the main plate, derive the palette from it, then rebuild the page with Atom63 components and compare screenshots against the plate. Use when a page should look art-directed rather than templated.
---

# Art landing: plate first, then the page

Draft. Lives in `atom63-design-system/docs/skills/art-landing/` until YZ decides whether it moves to
`atom63/skills`. Style library: [styles.md](./styles.md). Research behind it:
`docs/research/art-landing/teardown.md` and `gap.md`.

The idea in one line: the picture is designed first and the page is built to serve it. Every
section changes framing; nothing changes style.

## 0. Inputs

Ask for these before anything else. Stop and ask when one is missing; do not invent a product.

| Input | Example |
| --- | --- |
| Product in one sentence | "A motion-design timeline that renders in the browser." |
| Audience | Motion designers at small studios |
| Character words (3–5) | precise, calm, nocturnal, crafted |
| UI that must appear | the timeline editor, one render-queue card |
| Pages | landing, or portfolio project hero |
| Must-avoid | competitors' colours, anything already used by the brand |

## 1. Pick a style (2–3 candidates)

Read [styles.md](./styles.md). Place the product on two axes and pick 2–3 styles that fit both:

1. **Temperature:** quiet and trustworthy ↔ sharp and technical ↔ bright and playful.
2. **Metaphor:** the product's core verb as a physical process (render → light exposing film;
   sync → two printing plates in register; schedule → tide lines).

For each candidate write: name, why it fits the temperature, what the metaphor is, the risk
(for example "dark plates make the UI window the brightest thing on the page — good for a tool,
wrong for a consumer app"). YZ picks one. Do not continue on your own pick when YZ is reachable.

## 2. Plate prompts

Hand the prompts to an image model; **YZ chooses the model**. Put what comes back here:

```
examples/art-landing/public/assets/art-landing/<plate-id>/
  hero.webp           desktop hero, 2400×1500 or larger, landscape
  hero-mobile.webp    phone crop, 1080×1920, portrait (optional; else crop hero)
  hero-fg.webp        foreground cut-out of hero, transparent, same size (optional)
  s-close.webp        close crop, 4:5
  s-vertical.webp     tall crop, 3:4
  s-band.webp         dark band, 21:9, the deepest tones of the style
  s-reprise.webp      the hero scene again, other light (dusk, night, overcast), 16:9
```

`<plate-id>` is `plate-01`, `plate-02`, … . The page refers to `/assets/art-landing/<plate-id>/…`.

### Hero template

```
[STYLE MEDIUM from styles.md], [SUBJECT that embodies the metaphor].
Composition: wide landscape. Upper 40% is calm and nearly empty ([sky / mist / paper / still
water]) so a two-line headline can sit on it. The main subject sits in the lower 45%, with its
busiest detail near the bottom edge. Leave a clear horizontal band from 48% to 85% height,
centred, about 65% of the width, quieter than its surroundings, where a product window will float.
Light: [LIGHT from styles.md]. Material: [MATERIAL from styles.md].
Palette: mostly [PAGE TONE] and [DEEP INK], with one small saturated [ACCENT] element.
No text, no letters, no logos, no UI, no people's faces.
Not: purple-blue gradients, glossy plastic 3D, neon glow, lens flare, bokeh balls, stock-photo look.
```

### Section shots

Same style line, light and palette as the hero; change only the shot:

| File | Shot line |
| --- | --- |
| `s-close` | close-up of one element of the hero subject, filling the frame, quiet lower third for a caption |
| `s-vertical` | tall view of the subject, strong vertical, subject in the upper two thirds |
| `s-band` | aerial or macro view, darkest tones of the style, the accent appearing once, left 45% calm for copy |
| `s-reprise` | the hero scene from the same viewpoint under [other light], centre calm for a call to action |

### Foreground cut-out

Ask for the hero's nearest foreground element (a ridge, a wave crest, a branch) on a transparent
background, aligned pixel for pixel with `hero.webp`. If the model cannot, cut it out by hand or
skip it: the page works without it.

### Image budget

Export WebP. Hero desktop ≤ 300 KB at 1920 wide, phone ≤ 150 KB; section images ≤ 150 KB at their
display size ×2. Provide widths 640, 960, 1440, 1920 for the hero.

## 3. Palette from the plate

Until `atom63 plate palette` exists (gap.md P0-3), do it by hand:

1. Sample 5–7 colours from the plate: the calm band, the deepest shadow, the one saturated
   element, two mid neutrals.
2. Map them to three roles; everything else stays the theme's neutrals.

| Plate colour | Role | Atom63 target |
| --- | --- | --- |
| Calm band | page tone | page surface (`--a63-surface-page`) |
| Deepest shadow | deep ink | primary text and the dark band surface |
| Small saturated element | accent | brand ramp → `--a63-action-primary*`, used for one or two cues |
| Mid neutrals | borders, secondary text | leave to the theme unless contrast fails |

3. Check WCAG AA: body text on page tone and on deep ink ≥ 4.5:1; large text and UI ≥ 3:1; the
   accent's foreground on the accent ≥ 4.5:1. If the accent fails as text, use it only as a fill
   with its foreground token, never as text colour.
4. Write the result into the plate scope (PlateScope, once it exists), never as literal colours in
   components.

## 4. Low-fidelity section list

Write the list first and get YZ's nod before building. The default skeleton, from the teardown:

1. Nav
2. Hero — LayeredScene: `hero.webp`, headline, one-line subhead, two buttons, live product window,
   optional `hero-fg.webp`, a row of partner marks on the bottom edge
3. Capabilities — two image cards at 1:2 (`s-close`, plus a crop of `hero` or `s-band`)
4. Split — tabs, short copy, two or three figures | `s-vertical`
5. Three features — three small cards with UI chips
6. Dark band — `s-band` full bleed, copy left, a telemetry window right (the only dark section)
7. Proof — a quote or pricing
8. FAQ — questions | image
9. Closing call to action — rounded card on `s-reprise`
10. Footer

Drop sections the product cannot fill honestly. Do not add new section types without asking.

## 5. Rebuild with Atom63 only

- Start from `atom63 build "<the page in your own words>"`, then `atom63 component <slug>` for each
  part.
- Allowed parts: `Page`, `Container`, `Section`, `SectionHeader`, `ArtPlate`, `LayeredScene`,
  `Card` (with `CardMedia*` overlays), `Frame`, `Button`, `Badge`, `Tabs`, `SegmentedControl`,
  `Accordion`, `Table`, `Marquee`, `Kbd`, the widgets. Ask before adding a component.
- Colours, spacing, radius, shadow, motion: `--a63-*` tokens only. No literal values, no one-off
  magic numbers; if a value is missing, it is a gap to report, not a number to type.
- Headlines: the display roles; serif through `--a63-font-display` (Brawler) when the style asks
  for it, UI stays sans.
- Over a plate: `--a63-on-media-*` tokens for chips and controls.
- The product window shows real, working UI built from components, not a screenshot.
- Motion: one hero entrance, slow parallax (≤ 8% of scroll, off under reduced motion),
  shadow-only hover, at most two ambient pulses.

## 6. Compare and iterate (max 3 rounds)

Each round:

1. Screenshot the page with Playwright at 1440×900 (fold and full page) and 390×844.
2. Put each fold next to `hero.webp` and the section list (a two-up image or side-by-side in the
   browser).
3. Write the differences as a list: what, where, which file and line to change. Typical: palette
   drift, the headline covering the subject, the window covering the plate's focal point, a
   section whose image style drifts, the dark band in the wrong place.
4. Fix, then go again.

Stop after three rounds and show YZ the result and the remaining differences. Do not keep
polishing silently.

## 7. Acceptance checklist

- [ ] The style was chosen by YZ from 2–3 written candidates.
- [ ] Every image on the page comes from the same style prompt; only the shot changes.
- [ ] Palette: three roles from the plate, accent used for one or two cues, AA contrast passes.
- [ ] No text, focusable element or figure sits under the foreground cut-out (1440 and 390).
- [ ] The headline sits on the calm band at 390, 768, 1440 and 1920; the focal point stays in
      frame.
- [ ] One dark band, in the middle third; the closing section reprises the hero scene.
- [ ] Only Atom63 components and `--a63-*` tokens; `check:craft` is clean on the page.
- [ ] Hero image loads eagerly and is the LCP element; all others lazy; budgets in step 2 met.
- [ ] Lighthouse performance ≥ 90 on mobile; no layout shift from images (CLS < 0.1).
- [ ] Reduced motion: no parallax, no ambient loops.
- [ ] Screenshots of desktop and phone, plus the round-by-round difference list, are in the PR.
