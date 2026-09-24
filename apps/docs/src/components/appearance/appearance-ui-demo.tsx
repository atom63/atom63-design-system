import { DocExample } from '@atom63/mdx/blocks'
import {
  AppearancePanel,
  type AppearanceSectionId,
  type PersonalizationController,
} from '@atom63/ui-react/theme'

const webAppearancePanelCode = `<AppearancePanel controller={controller} sections={WEB_SECTIONS} />`

const osAppearancePanelCode = `<AppearancePanel
  controller={controller}
  sections={[
    'mode',
    'os',
    'theme',
    'brand',
    'surface',
    'surfaceTint',
    'typeScale',
    'radius',
    'iconTheme',
  ]}
/>`

const WEB_SECTIONS: readonly AppearanceSectionId[] = [
  'mode',
  'theme',
  'brand',
  'surface',
  'surfaceTint',
  'typeScale',
  'radius',
]

const OS_SECTIONS: readonly AppearanceSectionId[] = [
  'mode',
  'os',
  'theme',
  'brand',
  'surface',
  'surfaceTint',
  'typeScale',
  'radius',
  'iconTheme',
]

/** A read-only controller: renders the panel with no live state. */
const demoController: PersonalizationController = {
  state: {
    mode: 'dark',
    theme: 'modern',
    brand: 'b1',
    surface: 'n1',
    surfaceTint: 12,
    typeScale: 'normal',
    radius: 'default',
    font: 'sans',
    os: 'macos',
    iconTheme: 'color',
    wallpaper: null,
  },
  setMode: () => undefined,
  setTheme: () => undefined,
  setBrand: () => undefined,
  setSurface: () => undefined,
  setSurfaceTint: () => undefined,
  setTypeScale: () => undefined,
  setRadius: () => undefined,
  setFont: () => undefined,
  setOs: () => undefined,
  setIconTheme: () => undefined,
  setWallpaper: () => undefined,
  update: () => undefined,
  reset: () => undefined,
}

export function AppearanceUiDemo() {
  return (
    <>
      <DocExample code={webAppearancePanelCode} title="Web appearance panel">
        <AppearancePanel controller={demoController} sections={WEB_SECTIONS} />
      </DocExample>

      <DocExample code={osAppearancePanelCode} title="OS-oriented appearance panel">
        <AppearancePanel controller={demoController} sections={OS_SECTIONS} />
      </DocExample>
    </>
  )
}
