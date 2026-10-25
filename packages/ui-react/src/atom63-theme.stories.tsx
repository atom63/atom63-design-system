import { Atom63Theme, Button } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Atom63Theme',
  component: Atom63Theme,
} satisfies Meta<typeof Atom63Theme>

export default meta
type Story = StoryObj<typeof meta>

/* A dark region on a light page: nest Atom63Theme with mode="dark". Every token
   inside resolves for dark, so components need no mode checks. Portals (menus,
   dialogs) opened from inside need the region as their container to stay dark. */
export const ScopedDarkRegion: Story = {
  render: () => (
    <Atom63Theme mode="light">
      <div
        style={{
          background: 'var(--a63-surface-page)',
          color: 'var(--a63-text-primary)',
          display: 'grid',
          gap: 16,
          padding: 24,
          width: 420,
        }}
      >
        <p style={{ margin: 0 }}>A light page.</p>
        <Atom63Theme mode="dark">
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-xl)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              justifyContent: 'space-between',
              padding: 16,
            }}
          >
            <span>Now playing: a dark player bar</span>
            <Button shape="round" variant="primary">
              Play
            </Button>
          </div>
        </Atom63Theme>
      </div>
    </Atom63Theme>
  ),
}
