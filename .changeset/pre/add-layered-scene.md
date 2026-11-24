---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add LayeredScene: a plate (`LayeredScenePlate`, an ArtPlate), the copy (`LayeredSceneContent`) and live product UI (`LayeredSceneStage`) in a two-row grid, with an optional inert foreground cut-out of the plate in front (`LayeredSceneForeground`, aria-hidden, no pointer events, hidden on phones unless `showOnPhone`). `placement` (center-bottom, end-bottom, start-bottom) and `width` (wide, half) place the stage. Layers use the in-context z band.
