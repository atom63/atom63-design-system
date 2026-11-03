import { appViewContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppView } from './app-view'

const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-slot="app-view${name ? `-${name}` : ''}"]`)

describe('AppView', () => {
  it('renders a window with the contract defaults and only the regions it is given', () => {
    const { container } = render(<AppView>Content</AppView>)
    const root = slot(container, '')
    expect(root).toHaveAttribute('data-layout', appViewContract.defaultLayout)
    expect(root).toHaveAttribute('data-chrome', appViewContract.defaultChrome)
    expect(root).not.toHaveAttribute('data-a63-form-factor')
    expect(screen.getByRole('main')).toHaveTextContent('Content')
    for (const name of ['top-bar', 'panel', 'overlay', 'bottom-bar', 'tab-bar']) {
      expect(slot(container, name)).toBeNull()
    }
  })

  it('names the side panel and the docked bar as regions', () => {
    render(
      <AppView
        bottomBar="Now playing"
        bottomBarLabel="Player"
        panel="Playlists"
        panelLabel="Library"
      >
        Content
      </AppView>
    )
    expect(screen.getByRole('complementary', { name: 'Library' })).toHaveTextContent('Playlists')
    expect(screen.getByRole('region', { name: 'Player' })).toHaveTextContent('Now playing')
  })

  it('draws a phone flush, with the phone form factor and no side panel', () => {
    const { container } = render(
      <AppView chrome="inset" layout="phone" panel="Playlists">
        Content
      </AppView>
    )
    const root = slot(container, '')
    expect(root).toHaveAttribute('data-chrome', 'flush')
    expect(root).toHaveAttribute('data-a63-form-factor', 'phone')
    expect(slot(container, 'panel')).toBeNull()
  })

  it('gives the bottom inset to the tab bar, else the docked bar, else the main region', () => {
    const owner = (ui: React.ReactElement) =>
      slot(render(ui).container, '')?.getAttribute('data-bottom-inset')
    expect(
      owner(
        <AppView bottomBar="Bar" tabBar="Tabs">
          Content
        </AppView>
      )
    ).toBe('tab-bar')
    expect(owner(<AppView bottomBar="Bar">Content</AppView>)).toBe('bottom-bar')
    expect(owner(<AppView>Content</AppView>)).toBe('main')
  })

  it('sets the side panel width and keeps the caller style', () => {
    const { container } = render(
      <AppView panel="Playlists" panelWidth="12.5rem" style={{ color: 'inherit' }}>
        Content
      </AppView>
    )
    const root = slot(container, '') as HTMLElement
    expect(root.style.getPropertyValue('--a63-app-view-panel-width')).toBe('12.5rem')
    expect(root.style.color).toBe('inherit')
  })

  it('places the overlay beside the main region, not inside it', () => {
    const { container } = render(<AppView overlay="Jump">Content</AppView>)
    const overlay = slot(container, 'overlay')
    expect(overlay).toHaveTextContent('Jump')
    expect(overlay?.parentElement).toBe(slot(container, 'body'))
    expect(screen.getByRole('main')).not.toContainElement(overlay as HTMLElement)
  })
})
