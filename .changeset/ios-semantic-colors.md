---
'@atom63/styles': patch
---

Status accents (`--a63-status-info`, `--a63-status-success`, `--a63-status-warning`) now use step 600 in light mode and step 500 in dark mode. Icons drawn in these colors, such as the alert icons, the copy check and the load-more status, reach WCAG's 3:1 for graphics in both modes; success and warning on the light page were 2.3:1 and 2.0:1. The Swift tokens for Atom63UI are now generated from the same semantic tokens, so iOS picks up the web values, including the brand-600 primary action.
