---
'@atom63/ui-react': patch
---

Mark every client component with `'use client'` so it keeps a client boundary in React Server Components. Chart, Card, Badge, Frame, InputOTP, ScrollableList, Image, and the layout's Container, Page, GridChrome, GridGuides and GridRule called hooks without the directive, so the build shipped them unmarked and a server component that imported them failed. The layout entry now builds one file per module, as the root does, so its client components sit apart from the server-safe ones (Section, PageSkeleton, the max-width helpers).

Chart's default `formatValue` now formats with a fixed `en-US` locale instead of the runtime's, so the server and the browser print the same numbers and hydration matches. Pass `formatValue` to format for the reader's locale.
