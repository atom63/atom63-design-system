# Art-landing style library

Eight styles for ATOM63's ground: motion design, creative tools, an OS feel. Names, processes and
combinations are our own; none reuses a reference-page medium. Each entry gives what SKILL.md step
1–3 needs.

Fonts we ship: Brawler (serif, `--font-family-serif`), Geist (sans), Geist Mono (mono), Doto
(pixel). "Display" below means the headline role (`--a63-font-display` once P0-4 lands); UI and
body stay Geist unless a style says otherwise.

Palette lines name the three roles: **page tone / deep ink / accent**. "Dark page" means the page
tone is the deep colour and the plate scope sets dark mode.

Every plate prompt ends with the shared ban line from SKILL.md (no text, letters, logos, UI or
faces; no purple-blue gradients, glossy plastic 3D, neon glow, lens flare, bokeh balls, stock-photo
look). Entries list only the bans specific to them.

## Quick map

| Style | Temperature | Good for | Page |
| --- | --- | --- | --- |
| Light Trail | sharp, technical | motion tools, renderers, animation runtimes | dark |
| Strobe Study | sharp, playful | timeline editors, keyframe and easing tools | light |
| Schlieren Field | sharp, technical | performance, compilers, AI infra, simulation | dark |
| Phosphor Trace | technical, nocturnal | audio, signal, terminals, developer CLIs | dark |
| Moiré Screen | precise, playful | design systems, grid and layout tools, type tools | light |
| Proof Press | quiet, trustworthy | docs, writing, publishing, CLIs with craft | light |
| Maquette | quiet, spatial | OS shells, workspaces, spatial and whiteboard tools | light |
| Kinetic Mobile | bright, playful | scheduling, collaboration, balance and planning | light |

---

## 1. Light Trail

- **Craft reference:** long-exposure light painting: a handheld light drawn through a dark studio,
  shot on a tripod at 10–30 s, with faint ambient fill.
- **Product character:** something that renders, animates or moves fast but stays controlled.
- **Plate prompt:** `Long-exposure light-painting photograph in a dark matte studio, [one
  continuous ribbon of light tracing the path of SUBJECT'S MOTION], ribbon starting low left and
  sweeping across the lower half, a faint concrete floor catching the glow, deep black upper half
  with a hint of haze. Light: single warm light source, the rest near black. Material: matte
  concrete, soft haze, real photographic grain.`
- **Palette rule:** dark page. Page tone = the near-black of the studio (not pure black; sample
  the haze). Deep ink = the lightest neutral in the plate, used as text. Accent = the ribbon's
  hottest colour; keep the ribbon a single hue.
- **Type:** display Geist semibold, tight tracking; figures Geist Mono.
- **Foreground:** a second, closer ribbon crossing in front of the window's lower edge; a blurred
  tripod leg at the frame edge.
- **Avoid:** multicolour rainbow trails, sparks, fireworks, a visible person holding the light.

## 2. Strobe Study

- **Craft reference:** chronophotography: one object captured many times in a single frame by a
  strobe, on a dark seamless backdrop or a white sweep, with a measuring grid behind it.
- **Product character:** timeline, keyframe and easing tools; anything about time sliced into
  frames.
- **Plate prompt:** `Stroboscopic multiple-exposure photograph on a pale grey paper sweep, [an
  OBJECT such as a ball, a folded paper form, a pendulum] repeated 12–20 times along an arc in the
  lower half, spacing showing ease-in and ease-out, a faint printed measuring grid on the backdrop.
  Light: crisp studio strobe, soft shadow under each instance. Material: matte paper, satin object
  surface.`
- **Palette rule:** light page. Page tone = the sweep grey. Deep ink = the object's darkest shadow.
  Accent = one instance tinted in a single colour (the "current frame"); every other instance is
  neutral.
- **Type:** display Brawler; captions and figures Geist Mono, tabular.
- **Foreground:** the last, largest instance of the object, partly overlapping the window's corner.
- **Avoid:** motion blur smears instead of discrete instances, sports action shots, a human figure.

## 3. Schlieren Field

- **Craft reference:** schlieren photography: a parabolic mirror and a knife edge turn invisible
  heat and airflow into visible gradients around an object.
- **Product character:** performance, compilers, AI infrastructure, simulation; making the
  invisible measurable.
- **Plate prompt:** `Schlieren photograph, [a heated OBJECT such as a candle, a chip, a small
  turbine blade] in the lower third, plumes of refracted air rising and curling across the frame,
  smooth graded background, strong circular mirror vignette at the edges. Light: single point
  source through a knife edge. Palette: two-tone, [DEEP COLOUR] background with [ACCENT] edges on
  the plumes.`
- **Palette rule:** dark page. Page tone = the mirror's mid-dark field. Deep ink = the vignette
  edge. Accent = the brightest plume edge. Keep the plate to two hues.
- **Type:** display Geist medium; body Geist; numbers Geist Mono.
- **Foreground:** a plume edge curling over the window's lower edge (cut out with its soft falloff).
- **Avoid:** thermal-camera false colour, flames, smoke-photography clichés, rainbow gradients.

## 4. Phosphor Trace

- **Craft reference:** an analogue oscilloscope or vector display: long-persistence phosphor,
  Lissajous figures and decaying traces, photographed off the glass with the graticule visible.
- **Product character:** audio, signal and stream processing, terminals, developer CLIs.
- **Plate prompt:** `Close photograph of a vintage oscilloscope screen, [a LISSAJOUS FIGURE or a
  decaying waveform that echoes the product] glowing on the phosphor in the lower half, faint
  graticule lines, slight curvature and reflections on the glass, black bezel just inside the
  frame edges. Light: the trace is the only light. Material: glass, phosphor bloom, fine dust.`
- **Palette rule:** dark page. Page tone = the off-black glass. Deep ink = the graticule's grey,
  as secondary text. Accent = the phosphor colour (choose one: green, amber or blue-white).
- **Type:** display Geist Mono or Doto for one short headline; body Geist.
- **Foreground:** the bezel edge and a knob, out of focus, crossing the window's lower corner.
- **Avoid:** fake HUD overlays, matrix rain, scanline filters on everything, retro computer props.

## 5. Moiré Screen

- **Craft reference:** two line or dot screens printed on clear film and overlaid at a slight
  angle, photographed on a light table; the interference makes large, slow waves.
- **Product character:** design systems, grid and layout tools, type tools; precision producing
  something lively.
- **Plate prompt:** `Photograph of two printed line-screen transparencies overlapping on a light
  table, rotated a few degrees, producing broad moiré waves across the lower half, crisp film edges
  and registration marks at the corners, soft even backlight, upper area plain warm white.
  Material: acetate film, printing ink, a little dust.`
- **Palette rule:** light page. Page tone = the light-table white. Deep ink = the ink of the
  screens. Accent = one screen printed in a single spot colour; the other stays ink.
- **Type:** display Brawler regular, tight tracking; UI Geist.
- **Foreground:** the curled corner of the top film sheet lifting over the window's edge.
- **Avoid:** digital op-art patterns, CMYK rosettes, more than two screens.

## 6. Proof Press

- **Craft reference:** letterpress proofing: inked metal and wood type locked in a chase, a proof
  pulled on cotton paper, ink squeeze at the letter edges, the press bed and furniture in view.
- **Product character:** docs, writing and publishing tools, CLIs that value craft; calm and
  exact.
- **Plate prompt:** `Overhead photograph of a letterpress proofing bed, [abstract wood type
  shapes and rules, no readable letters] locked in a chase in the lower half with wooden furniture
  and quoins, a freshly pulled proof sheet partly covering it, upper half plain cotton paper.
  Light: soft north-window daylight from one side. Material: inked wood and metal, deckled cotton
  paper.`
- **Palette rule:** light page. Page tone = the paper. Deep ink = the press ink. Accent = a second
  ink on one block only.
- **Type:** display Brawler; body Geist; code Geist Mono.
- **Foreground:** the edge of the pulled proof sheet lying across the window's lower edge.
- **Avoid:** readable letters or words in the type (the ban on text applies), vintage sepia,
  typewriters.

## 7. Maquette

- **Craft reference:** an architect's study model: white card, basswood and frosted acrylic,
  photographed at model scale with a shallow depth of field and raking light.
- **Product character:** OS shells, workspaces, spatial, canvas and whiteboard tools; rooms for
  work.
- **Plate prompt:** `Photograph of an architectural study model in white card and basswood,
  [stacked planes, ramps and openings that echo panes and windows of the product], seen from a low
  three-quarter angle, the model in the lower half, a seamless pale backdrop above. Light: low
  raking daylight, long soft shadows, shallow depth of field. Material: matte card, basswood
  grain, frosted acrylic.`
- **Palette rule:** light page. Page tone = the backdrop. Deep ink = the darkest shadow inside
  the model. Accent = one acrylic pane tinted a single colour.
- **Type:** display Geist medium; UI Geist.
- **Foreground:** a model wall or column in the near foreground, out of focus, crossing the
  window's side.
- **Avoid:** finished architectural renders, glossy 3D, people figurines, glass skyscrapers.

## 8. Kinetic Mobile

- **Craft reference:** a hanging kinetic sculpture: painted metal shapes balanced on wires,
  photographed in a white gallery with their shadows on the wall.
- **Product character:** scheduling, planning, collaboration; many parts in balance, friendly.
- **Plate prompt:** `Photograph of a hanging kinetic sculpture of flat painted metal shapes
  balanced on thin wires, [the shapes echoing the product's units], hanging in the lower half of a
  white gallery, crisp shadows cast on the wall. Light: one gallery spotlight plus soft fill.
  Palette: shapes mostly [DEEP INK], one shape in [ACCENT].`
- **Palette rule:** light page. Page tone = the wall. Deep ink = the dominant shape colour.
  Accent = the single coloured shape.
- **Type:** display Brawler; UI Geist.
- **Foreground:** one shape and its wire hanging in front of the window's upper corner. Keep it
  clear of the window's title and controls.
- **Avoid:** imitating any named artist, primary-colour overload, toy-like plastic.

---

## Shared rules

- One style per page. A second style only through a different shot of the same style.
- The accent appears once in each plate; the page uses it for one or two cues.
- Dark styles (Light Trail, Schlieren Field, Phosphor Trace) put the dark band in a lighter
  section instead: the band inverts, so the page still has one contrasting section.
- When a style needs a cut-out the model cannot make, skip the foreground; never fake it with a
  CSS mask over the UI.
