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

  it('names the rail and the aside as regions, in reading order around the main region', () => {
    render(
      <AppView aside="Thread" panel="Channels" rail="Workspaces">
        Content
      </AppView>
    )
    const regions = screen.getAllByRole('complementary').map(r => r.getAttribute('aria-label'))
    expect(regions).toEqual(['Navigation', 'Library', 'Details'])
    const main = screen.getByRole('main')
    expect(
      main.compareDocumentPosition(screen.getByRole('complementary', { name: 'Details' }))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('spans the top bar across the window by default', () => {
    const { container } = render(
      <AppView panel="Channels" topBar="Search">
        Content
      </AppView>
    )
    expect(slot(container, '')).toHaveAttribute('data-top-bar-span', 'window')
    expect(slot(container, 'top-bar')?.parentElement).toBe(slot(container, ''))
    expect(slot(container, 'content')).toBeNull()
  })

  it('puts the top bar over the main region and the aside when it spans main', () => {
    const { container } = render(
      <AppView aside="Thread" panel="Channels" rail="Workspaces" topBar="Search" topBarSpan="main">
        Content
      </AppView>
    )
    const content = slot(container, 'content') as HTMLElement
    expect(slot(container, 'top-bar')?.parentElement).toBe(content)
    expect(content).toContainElement(screen.getByRole('main'))
    expect(content).toContainElement(screen.getByRole('complementary', { name: 'Details' }))
    expect(content).not.toContainElement(slot(container, 'panel') as HTMLElement)
    expect(content).not.toContainElement(slot(container, 'rail') as HTMLElement)
  })

  it('leaves the rail, the aside and the span out of a phone', () => {
    const { container } = render(
      <AppView aside="Thread" layout="phone" rail="Workspaces" topBar="Title" topBarSpan="main">
        Content
      </AppView>
    )
    for (const name of ['rail', 'aside', 'content']) {
      expect(slot(container, name)).toBeNull()
    }
    expect(slot(container, '')).not.toHaveAttribute('data-top-bar-span')
    expect(slot(container, '')).not.toHaveAttribute('data-aside')
  })

  it('sets the rail and aside widths', () => {
    const { container } = render(
      <AppView aside="Thread" asideWidth="20rem" rail="Workspaces" railWidth="3.5rem">
        Content
      </AppView>
    )
    const root = slot(container, '') as HTMLElement
    expect(root.style.getPropertyValue('--a63-app-view-rail-width')).toBe('3.5rem')
    expect(root.style.getPropertyValue('--a63-app-view-aside-width')).toBe('20rem')
  })
})
