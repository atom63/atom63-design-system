'use client'

import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Button, type ButtonProps } from '../button'

/*
 * PanelSettingButton — a square, icon-over-label settings "tile" toggle. Faithful
 * port of prod @atom63/ui panel-setting-button.tsx: same API (active / icon /
 * label + a Button pass-through minus children/size/variant), same active-tile
 * treatment. Prod drove the look with a `size="tile"` Button + inline
 * `--theme-button-*` CSS-var overrides; the DS Button has neither a `tile` size
 * nor a `withMotion` prop, so we render an `outline` Button and move the tile
 * layout + the (in)active surface tints into the `.a63-PanelSettingButton`
 * recipe, toggled by `data-active`.
 */

export interface PanelSettingButtonProps extends Omit<
  ButtonProps,
  'children' | 'size' | 'variant'
> {
  active?: boolean
  /** Tile icon — pass with `aria-hidden` when decorative. */
  icon: React.ReactNode
  /** Visible tile label under the icon. */
  label: string
}

export function PanelSettingButton({
  active = false,
  className,
  icon,
  label,
  ...props
}: PanelSettingButtonProps): React.ReactElement {
  return (
    <Button
      aria-pressed={active}
      className={cn('a63-PanelSettingButton', className)}
      data-active={active ? '' : undefined}
      data-slot="panel-setting-button"
      data-state={active ? 'on' : 'off'}
      type="button"
      variant="outline"
      {...props}
    >
      {icon}
      <span className="a63-PanelSettingButton-label" data-slot="panel-setting-button-label">
        {label}
      </span>
    </Button>
  )
}
