# UI React Component Review

## Goal

Review each `@atom63/ui-react` component from the visual design point of view and align its styling, contract metadata, and Storybook pages with the intended visual archetype.

## Component Pass

1. Classify the visual archetype:
   - `action`
   - `toggle`
   - `choice`
   - `field`
   - `range`
   - `segment`
   - `trigger`
   - `menu`
   - `overlay`
   - `surface`

2. Check contract metadata:
   - Does `@atom63/ui-foundation` have a contract?
   - Does it declare slots, variants, states, and `visualArchetypes` where useful?
   - Are exports wired from `@atom63/ui-foundation`?

3. Check recipe CSS:
   - Does the component listen to the right contract tokens?
   - Is it accidentally borrowing button/control styling?
   - Are optional slots handled by root-owned layout using `data-slot` / `:has()`?
   - Are component-local layout variables named clearly?
   - Are direct legacy child selectors kept only when useful as compatibility paths?
   - Any new **shared** paint/size scale? Prefer foundation → semantic/contract alias. Theme-private gel/bevel/CRT may stay in `themes/*` ([authoring-surfaces.md](./authoring-surfaces.md)).

3b. CSS contract growth (if adding hooks in `@atom63/styles/contracts`):
   - Add/extend a family contract only when a **second** component **and** a
     **theme** (or design-language axis) need the same knob.
   - Otherwise keep the value in the recipe, or keep skin-private material in the
     theme / promote a **shared** literal into foundation.
   - Prefer extending `control` / `field` / `overlay` / `surface` / `action`
     over minting a one-off contract.

4. Check theme trait expression:
   - Does the base recipe expose enough hooks for themes to express the component's archetype?
   - Are visual traits implemented through theme token overrides in `@atom63/styles/themes/*` rather than hardcoded in the component recipe?
   - Does the component look intentionally different in `modern`, `aqua`, `retro`, and `terminal` while preserving the same anatomy?
   - Does a theme need an archetype token that does not exist yet, or can it use the current `control`, `field`, `track`, `segment`, `menu`, `overlay`, `surface`, `marker`, `action`, `toggle`, `choice`, or `trigger` contract?

   Current theme traits:
   - `modern`: quiet app-native default; subtle borders, restrained radius, soft control highlight, faint field inset.
   - `aqua`: glossy translucent gel; specular highlights, rounder controls, glassy overlays/surfaces, luminous focus/accent, recessed glass tracks/fields.
   - `retro`: Y2K/Win98 physical chrome; chunkier borders, outset/inset bevels, hard offset shadows, denser mechanical feel.
   - `terminal`: flat monochrome CRT; square-ish geometry, monospace/control text, phosphor glow instead of drop shadow, scanline textures on surfaces/overlays.

5. Check API anatomy:
   - Are slots explicit where useful?
   - Are optional slots easy to author?
   - Does the API avoid magical child selectors where a named part would be clearer?

6. Check Storybook:
   - `Playground`
   - `Variants`, when the component has visual variants or tones
   - `Anatomy` / `Slots`, when the component has meaningful parts
   - `States`, when state changes visual intent
   - `Themes`, when the component is theme-sensitive. Use this to review theme trait expression.
   - `Endpoints`, when host context matters
   - `ContractMetadata`, when the component has a foundation contract

Avoid `ContractProbe` stories except as temporary debugging tools for token coupling.

7. Validate:
   - Run the focused component test.
   - Run changed-file lint.
   - Run package typecheck when exports or types change.
