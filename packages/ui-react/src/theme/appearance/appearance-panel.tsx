'use client'

import type * as React from 'react'
import { FontPreview, ModePreview, RadiusPreview, TypeScalePreview } from './appearance-previews'
import { AppearanceSection } from './appearance-section'
import {
  BRAND_OPTIONS,
  FONT_OPTIONS,
  ICON_THEME_OPTIONS,
  MODE_OPTIONS,
  OS_OPTIONS,
  RADIUS_OPTIONS,
  SURFACE_OPTIONS,
  THEME_OPTIONS,
  TYPE_SCALE_OPTIONS,
} from '../core/options'
import { RangeTokenControl } from '../controls/range-token-control'
import { SegmentedTokenControl } from '../controls/segmented-token-control'
import { SwatchTokenControl } from '../controls/swatch-token-control'
import type { BrandId, PersonalizationController, SurfaceId } from '../core/types'
import { VisualChoiceControl } from '../controls/visual-choice-control'
import { cn } from '../../lib/cn'

export type AppearanceSectionId =
  | 'mode'
  | 'theme'
  | 'brand'
  | 'surface'
  | 'surfaceTint'
  | 'typeScale'
  | 'radius'
  | 'font'
  | 'os'
  | 'iconTheme'

const DEFAULT_SECTIONS: readonly AppearanceSectionId[] = [
  'mode',
  'theme',
  'brand',
  'surface',
  'surfaceTint',
  'typeScale',
  'radius',
  'font',
]

const brandSwatch = (id: BrandId): string =>
  id === 'auto'
    ? 'linear-gradient(135deg, var(--color-b1-500), var(--color-b4-500), var(--color-b2-500))'
    : `var(--color-${id}-500)`

const surfaceSwatch = (id: SurfaceId): string => `var(--color-${id}-light-11)`

export interface AppearancePanelProps {
  controller: PersonalizationController
  sections?: readonly AppearanceSectionId[]
  className?: string
}

/*
 * AppearancePanel — the personalization surface: one section per axis, each a DS
 * token control wired to the PersonalizationController. `sections` allow-lists
 * which axes show (a consumer mounts a subset). Reads the Phase-2 option catalogs.
 *
 * This is the BARE body only — it renders inline in normal document flow and owns
 * no container, positioning, or chrome. Mount it directly ONLY when the host
 * supplies its own surface (e.g. os63 embeds it in a Settings pane). For a
 * standalone web app, use `AppearanceMenu` instead — the floating flyout wrapper
 * (portal + fixed positioning + Frame + Cmd+, shortcut) that renders this panel as
 * its body. Reaching for AppearancePanel + `showTrigger={false}` is the trap that
 * regressed design-system/learn into a full-width, clipped inline panel.
 */
export function AppearancePanel({
  controller,
  sections = DEFAULT_SECTIONS,
  className,
}: AppearancePanelProps): React.ReactElement {
  const { state } = controller
  const has = (id: AppearanceSectionId) => sections.includes(id)
  return (
    <div className={cn('min-w-0', className)} data-slot="appearance-panel">
      <div className="grid min-w-0 gap-5">
        {has('mode') && (
          <AppearanceSection title="Mode">
            <VisualChoiceControl
              columns={3}
              label="Mode"
              onChange={controller.setMode}
              options={MODE_OPTIONS.map(o => ({
                id: o.id,
                name: o.name,
                renderVisual: s => <ModePreview mode={o.id} selected={s} />,
              }))}
              value={state.mode}
            />
          </AppearanceSection>
        )}
        {has('theme') && (
          <AppearanceSection title="Theme">
            <SegmentedTokenControl
              onChange={controller.setTheme}
              options={THEME_OPTIONS}
              value={state.theme}
            />
          </AppearanceSection>
        )}
        {has('brand') && (
          <AppearanceSection title="Primary">
            <SwatchTokenControl
              onChange={controller.setBrand}
              options={BRAND_OPTIONS}
              swatch={brandSwatch}
              value={state.brand}
            />
          </AppearanceSection>
        )}
        {has('surface') && (
          <AppearanceSection title="Surface">
            <SwatchTokenControl
              onChange={controller.setSurface}
              options={SURFACE_OPTIONS}
              swatch={surfaceSwatch}
              value={state.surface}
            />
          </AppearanceSection>
        )}
        {has('surfaceTint') && (
          <RangeTokenControl
            label="Surface tint"
            onChange={controller.setSurfaceTint}
            value={state.surfaceTint}
          />
        )}
        {has('typeScale') && (
          <AppearanceSection title="Type scale">
            <VisualChoiceControl
              columns={4}
              label="Type scale"
              onChange={controller.setTypeScale}
              options={TYPE_SCALE_OPTIONS.map(o => ({
                id: o.id,
                name: o.name,
                renderVisual: s => <TypeScalePreview scale={o.id} selected={s} />,
              }))}
              value={state.typeScale}
            />
          </AppearanceSection>
        )}
        {has('radius') && (
          <AppearanceSection title="Radius">
            <VisualChoiceControl
              columns={4}
              label="Radius"
              onChange={controller.setRadius}
              options={RADIUS_OPTIONS.map(o => ({
                id: o.id,
                name: o.name,
                renderVisual: s => <RadiusPreview radius={o.id} selected={s} />,
              }))}
              value={state.radius}
            />
          </AppearanceSection>
        )}
        {has('font') && (
          <AppearanceSection title="Font">
            <VisualChoiceControl
              columns={4}
              label="Font"
              onChange={controller.setFont}
              options={FONT_OPTIONS.map(o => ({
                id: o.id,
                name: o.name,
                renderVisual: s => <FontPreview font={o.id} selected={s} />,
              }))}
              value={state.font}
            />
          </AppearanceSection>
        )}
        {has('os') && (
          <AppearanceSection title="System">
            <SegmentedTokenControl
              onChange={controller.setOs}
              options={OS_OPTIONS}
              value={state.os}
            />
          </AppearanceSection>
        )}
        {has('iconTheme') && (
          <AppearanceSection title="Icons">
            <SegmentedTokenControl
              onChange={controller.setIconTheme}
              options={ICON_THEME_OPTIONS}
              value={state.iconTheme}
            />
          </AppearanceSection>
        )}
      </div>
    </div>
  )
}
