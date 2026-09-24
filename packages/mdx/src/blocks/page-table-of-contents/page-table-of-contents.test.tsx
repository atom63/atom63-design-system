import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildTocItems, PageTableOfContents } from './page-table-of-contents'

describe('buildTocItems', () => {
  it('generates unique ids when authored ids collide with generated slugs', () => {
    document.body.innerHTML = `
      <main>
        <h2 id="intro">Overview</h2>
        <h2>Intro</h2>
        <h3>Intro</h3>
      </main>
    `

    const headings = Array.from(document.querySelectorAll('h2, h3'))
    const items = buildTocItems(headings)

    expect(items.map(item => item.id)).toEqual(['intro', 'intro-2', 'intro-3'])
    expect(headings.map(heading => heading.id)).toEqual(['intro', 'intro-2', 'intro-3'])
  })
})

describe('PageTableOfContents', () => {
  it('opens the compact menu and closes it after selecting a heading', async () => {
    render(
      <>
        <main data-mdx-scroll-root>
          <article data-mdx-content>
            <h2>Overview</h2>
            <h3>Details</h3>
          </article>
        </main>
        <PageTableOfContents variant="menu" />
      </>
    )

    const trigger = await screen.findByRole('button', { name: 'Open on this page' })
    fireEvent.click(trigger)

    const overview = await screen.findByRole('menuitem', { name: 'Overview' })
    expect(overview).toHaveAttribute('href', '#overview')
    fireEvent.click(overview)

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Overview' })).not.toBeInTheDocument()
    })
  })

  it('renders an embedded list and reports navigation', async () => {
    const onActiveLabelChange = vi.fn()
    const onNavigate = vi.fn()
    render(
      <>
        <main data-mdx-scroll-root>
          <article data-mdx-content>
            <h2>Overview</h2>
          </article>
        </main>
        <PageTableOfContents
          onActiveLabelChange={onActiveLabelChange}
          onNavigate={onNavigate}
          variant="embedded"
        />
      </>
    )

    fireEvent.click(await screen.findByRole('link', { name: 'Overview' }))
    expect(onNavigate).toHaveBeenCalledOnce()
    await waitFor(() => {
      expect(onActiveLabelChange).toHaveBeenLastCalledWith('Overview')
    })
  })
})
