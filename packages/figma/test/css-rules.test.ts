import { readRules } from '../src/components/css-rules'

it('reads selectors and declarations, ignoring comments and at-rules', () => {
  const css = `
    /* note */
    .a63-Button { --button-background: var(--a63-action-neutral); color: red; }
    .a63-Button:active,
    .a63-Button[data-pressed] { background-color: var(--button-state-active-background); }
    @media (forced-colors: active) { .a63-Button { border-color: ButtonText; } }
    .a63-Button[data-size='xs'] {
      --button-height: max(
        calc(var(--a63-control-height-xs) * var(--a63-density-scale, 1)),
        var(--a63-control-min-size)
      );
    }`
  expect(readRules(css)).toEqual([
    {
      selectors: ['.a63-Button'],
      declarations: { '--button-background': 'var(--a63-action-neutral)', color: 'red' },
    },
    {
      selectors: ['.a63-Button:active', '.a63-Button[data-pressed]'],
      declarations: { 'background-color': 'var(--button-state-active-background)' },
    },
    {
      selectors: [".a63-Button[data-size='xs']"],
      declarations: {
        '--button-height':
          'max( calc(var(--a63-control-height-xs) * var(--a63-density-scale, 1)), var(--a63-control-min-size) )',
      },
    },
  ])
})
