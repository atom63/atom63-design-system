// Cross-browser project: render only. Axe runs in the Chromium `storybook`
// project; here it would read the computed `mask` shorthand, which crashes
// WebKit 26.5 on elements with more than one mask layer (the ScrollArea scroll
// fade). preview.tsx reads this flag when it sets `parameters.a11y.test`.
;(globalThis as { __A63_A11Y_TEST__?: string }).__A63_A11Y_TEST__ = 'off'
