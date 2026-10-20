---
'@atom63/figma': minor
---

Each component `Difference` now carries `nodeId`: the id of the node its check reads (the variant, one of its layers, or the spec card part), or, for a missing layer or part, the node it belongs in. A UI can select and zoom to it with `figma.getNodeByIdAsync`.
