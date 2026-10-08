import { buttonAnatomy } from '../../src/components/button-anatomy'
import { readRecipe } from '../../src/components/recipe'
import type { SyncModel } from '../../src/plan'

/** A trimmed Button recipe: two variants, two sizes, a composed fill and a disabled fade. */
export const buttonCss = `
.a63-Button {
  --button-background: var(--a63-action-neutral);
  --button-border-color: var(--button-background);
  --button-state-hover-background: var(--a63-action-neutral-hover);
  --button-padding-inline: var(--a63-control-padding-inline-md);
  background-color: var(--button-background);
  border-color: var(--button-border-color);
}
.a63-Button:where(:not(:disabled, [data-disabled])):hover {
  background-color: var(--button-state-hover-background);
}
.a63-Button[data-variant='secondary'] {
  --button-background: color-mix(in oklch, var(--a63-action-neutral) 10%, transparent);
  --button-border-color: transparent;
}
.a63-Button[data-size='sm'] { --button-padding-inline: var(--a63-control-padding-inline-sm); }
.a63-Button::after { content: ''; }
.a63-Button:disabled .a63-Button-label { opacity: 0.56; }
`

const variable = (token: string, type: 'COLOR' | 'FLOAT', value: unknown) =>
  ({ name: token.slice(6), token, type, values: { default: { value } } }) as never

/** The tokens the trimmed recipe binds, in one single-mode collection. */
export const syncFixture: SyncModel = {
  schemaVersion: 1,
  summary: { collections: 1, variables: 4, aliasValues: 0, skipped: 0 },
  skipped: [],
  collections: [
    {
      name: 'Base',
      modes: ['default'],
      variables: [
        variable('--a63-action-neutral', 'COLOR', { r: 0, g: 0, b: 0, a: 1 }),
        variable('--a63-action-neutral-hover', 'COLOR', { r: 0.1, g: 0.1, b: 0.1, a: 1 }),
        variable('--a63-control-padding-inline-md', 'FLOAT', 12),
        variable('--a63-control-padding-inline-sm', 'FLOAT', 8),
      ],
    },
  ],
}

/** 2 variants × 2 sizes × 3 states = 12 variants. */
export const buttonModelFixture = readRecipe({
  css: buttonCss,
  sync: syncFixture,
  anatomy: buttonAnatomy,
  sizes: ['sm', 'md'],
  contract: {
    variants: ['default', 'secondary'],
    sizes: ['sm', 'md', 'icon'],
    states: ['rest', 'hover', 'disabled'],
    defaultVariant: 'default',
    defaultSize: 'md',
  },
})
