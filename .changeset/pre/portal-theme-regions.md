---
'@atom63/ui-react': patch
---

Make Toaster and Sheet honor the nearest PortalContainerProvider so nested theme regions keep their colors and typography after portalling. Toaster now overrides Sonner's system font with the active Atom63 application font while preserving the document-body fallback when no scoped container is provided.
