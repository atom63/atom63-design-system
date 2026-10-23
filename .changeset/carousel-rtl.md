---
'@atom63/ui-react': patch
---

`Carousel` works in right-to-left layouts: it reads the content direction once it mounts and passes it to Embla (an explicit `opts.direction` wins), the arrow keys and the cursor indicator's halves follow the reading direction, and the previous and next buttons sit on logical edges with mirrored icons.
