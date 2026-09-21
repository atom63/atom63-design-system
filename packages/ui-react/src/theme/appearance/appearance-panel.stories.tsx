import { Button } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import { AppearancePanel, createPersonalizationController } from '@atom63/ui-react/theme'
import type { Meta, StoryObj } from '@storybook/react-vite'

/*
 * A live theme panel. The controller's applyPersonalization writes data-a63-*
 * on the document root, so changing Theme / Brand / Mode / Surface here restyles
 * the whole card + every control in real time — a good way to see each theme's
 * character (aqua gel, retro bevel, terminal phosphor) on the DS controls.
 */
const { PersonalizationProvider, usePersonalization } = createPersonalizationController({
  storageKey: 'sb-personalization',
  defaultState: {
    mode: 'dark',
    theme: 'modern',
    brand: 'b1',
    surface: 'n1',
    surfaceTint: 0,
    typeScale: 'normal',
    radius: 'default',
    font: 'sans',
    os: 'macos',
    iconTheme: 'realistic',
    wallpaper: null,
  },
})

function ThemePanelCard() {
  const controller = usePersonalization()
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'var(--a63-surface-page)',
        fontFamily: 'var(--a63-font-app, var(--font-family-sans))',
      }}
    >
      <div
        style={{
          alignSelf: 'flex-start',
          width: 'min(24rem, 100%)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--a63-border-subtle)',
          background: 'var(--a63-surface-panel)',
          boxShadow: 'var(--a63-overlay-shadow)',
        }}
      >
        <header
          style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--a63-border-subtle)' }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--a63-text-primary)',
            }}
          >
            Preferences
          </h2>
          <p
            style={{
              margin: '0.125rem 0 0',
              fontSize: '0.75rem',
              color: 'var(--a63-text-secondary)',
            }}
          >
            Adjust the surface, accent, type, and interaction feel.
          </p>
        </header>

        <div style={{ padding: '1rem' }}>
          <AppearancePanel controller={controller} />
        </div>

        <footer
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--a63-border-subtle)',
          }}
        >
          <Button onClick={controller.reset} size="sm" type="button" variant="secondary">
            Reset all
          </Button>
        </footer>
      </div>
    </div>
  )
}

const meta = {
  title: 'UI React/AppearancePanel',
  component: AppearancePanel,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppearancePanel>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <PersonalizationProvider>
      <ThemePanelCard />
    </PersonalizationProvider>
  ),
}
