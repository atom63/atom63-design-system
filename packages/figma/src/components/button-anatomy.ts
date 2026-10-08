import type { FigmaProperty, LayerKind } from './model'

export interface AnatomyLayer {
  name: string
  kind: LayerKind
  /**
   * Figma property → the CSS property or custom property it reads, in cascade
   * terms. `visible` may read a `*-style` property: drawn unless `none`/`hidden`.
   */
  reads: Partial<Record<FigmaProperty, string>>
  /** Values fixed by state, applied after the cascade (C6). */
  byState?: Partial<Record<string, Partial<Record<FigmaProperty, number | boolean>>>>
}

export const buttonAnatomy: {
  component: 'Button'
  rootClass: '.a63-Button'
  layers: AnatomyLayer[]
} = {
  component: 'Button',
  rootClass: '.a63-Button',
  layers: [
    {
      name: 'Button',
      kind: 'frame',
      reads: {
        fill: 'background-color',
        stroke: 'border-color',
        strokeWeight: '--button-border-width',
        cornerRadius: '--button-radius',
        height: '--button-height',
        paddingInline: '--button-padding-inline',
        itemSpacing: '--button-gap',
      },
    },
    { name: 'Icon', kind: 'frame', reads: { size: '--button-icon-size' } },
    {
      name: 'Label',
      kind: 'text',
      reads: {
        fill: '--button-foreground',
        fontSize: 'font-size',
        lineHeight: 'line-height',
        fontFamily: 'font-family',
        fontWeight: 'font-weight',
      },
      byState: { disabled: { opacity: 0.56 }, loading: { opacity: 0 } },
    },
    {
      name: 'Spinner',
      kind: 'frame',
      reads: { size: '--button-icon-size', stroke: '--button-loading-foreground' },
      byState: {
        rest: { visible: false },
        hover: { visible: false },
        pressed: { visible: false },
        focusVisible: { visible: false },
        disabled: { visible: false },
        loading: { visible: true },
      },
    },
    {
      // The root's `outline` (C6): drawn only where the recipe draws it, on :focus-visible.
      name: 'Focus ring',
      kind: 'outline',
      reads: {
        visible: 'outline-style',
        stroke: 'outline-color',
        strokeWeight: 'outline-width',
        outlineOffset: 'outline-offset',
        cornerRadius: '--button-radius',
      },
    },
  ],
}
