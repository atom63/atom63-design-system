# @atom63/brand

The ATOM63 logo as React components. Every mark is an inline SVG drawn in `currentColor`, so it
takes the color of the text around it; `colored` paints the symbol with `--a63-action-primary`,
which follows the active brand and mode.

```tsx
import { AppLogo, Atom63Logo } from '@atom63/brand'

<AppLogo variant="symbol" height={24} />
<AppLogo variant="horizontal" height={32} colored />
<Atom63Logo height={32} />
```

| Export | Use |
| --- | --- |
| `AppLogo` | The symbol, the wordmark, or both in a `horizontal` or `vertical` lockup. `height` sets the symbol size; the wordmark and gap scale from it. |
| `Atom63Logo` | The monogram mark (40 × 48). |
| `SYMBOL_SVG`, `WORDMARK_SVG` | Raw path data and view boxes, for favicons, canvases or other renderers. |

Each logo is an image named "ATOM63" (`title` changes it on `Atom63Logo`). A lockup names the
whole group once instead of each part.

The package needs no stylesheet and no Tailwind: layout and color come from inline styles and
design tokens.
