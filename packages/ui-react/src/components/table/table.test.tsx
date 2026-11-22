import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

describe('Table', () => {
  it('puts the selection tone on the container: neutral by default, accent on request', () => {
    const { container } = render(
      <>
        <Table>
          <TableBody>
            <TableRow data-state="selected">
              <TableCell>neutral</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table tone="accent">
          <TableBody>
            <TableRow data-state="selected">
              <TableCell>accent</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    )
    const [neutral, accent] = container.querySelectorAll('[data-slot="table-container"]')
    expect(neutral).toHaveAttribute('data-tone', 'neutral')
    expect(accent).toHaveAttribute('data-tone', 'accent')
  })

  it('renders every part with its data-slot inside a scroll container', () => {
    const { container } = render(
      <Table>
        <TableCaption>caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>F</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(container.querySelector('[data-slot="table-container"]')).not.toBeNull()
    const table = container.querySelector('[data-slot="table"]')
    expect(table?.tagName.toLowerCase()).toBe('table')
    expect(table).toHaveClass('a63-Table')
    expect(container.querySelector('[data-slot="table-header"]')?.tagName.toLowerCase()).toBe(
      'thead'
    )
    expect(container.querySelector('[data-slot="table-body"]')?.tagName.toLowerCase()).toBe('tbody')
    expect(container.querySelector('[data-slot="table-footer"]')?.tagName.toLowerCase()).toBe(
      'tfoot'
    )
    expect(container.querySelector('[data-slot="table-row"]')?.tagName.toLowerCase()).toBe('tr')
    expect(container.querySelector('[data-slot="table-head"]')?.tagName.toLowerCase()).toBe('th')
    expect(container.querySelector('[data-slot="table-cell"]')?.tagName.toLowerCase()).toBe('td')
    expect(container.querySelector('[data-slot="table-caption"]')?.tagName.toLowerCase()).toBe(
      'caption'
    )
  })

  it('merges passed classNames onto parts', () => {
    const { container } = render(
      <Table className="custom-table">
        <TableBody>
          <TableRow className="custom-row">
            <TableCell className="custom-cell">x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(container.querySelector('[data-slot="table"]')).toHaveClass('custom-table')
    expect(container.querySelector('[data-slot="table-row"]')).toHaveClass('custom-row')
    expect(container.querySelector('[data-slot="table-cell"]')).toHaveClass('custom-cell')
  })

  it('puts size and variant on the container, defaulting from the contract', () => {
    const { container, rerender } = render(<Table />)
    const wrapper = () => container.querySelector('[data-slot="table-container"]')
    expect(wrapper()).toHaveAttribute('data-size', 'md')
    expect(wrapper()).toHaveAttribute('data-variant', 'default')
    rerender(<Table size="sm" variant="plain" />)
    expect(wrapper()).toHaveAttribute('data-size', 'sm')
    expect(wrapper()).toHaveAttribute('data-variant', 'plain')
    rerender(<Table size="default" />)
    expect(wrapper()).toHaveAttribute('data-size', 'md')
  })

  it('marks sticky head and body cells, and leaves others unmarked', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sticky="start">H</TableHead>
            <TableHead>M</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>M</TableCell>
            <TableCell sticky="end">E</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const heads = container.querySelectorAll('[data-slot="table-head"]')
    const cells = container.querySelectorAll('[data-slot="table-cell"]')
    expect(heads[0]).toHaveAttribute('data-sticky', 'start')
    expect(heads[1]).not.toHaveAttribute('data-sticky')
    expect(cells[0]).not.toHaveAttribute('data-sticky')
    expect(cells[1]).toHaveAttribute('data-sticky', 'end')
  })

  it('sortable heads: a button in the cell, aria-sort on the sorted column, controlled sort', () => {
    const onSortChange = vi.fn()
    const view = (sort: { column: string; direction: 'ascending' | 'descending' } | null) => (
      <Table onSortChange={onSortChange} sort={sort}>
        <TableHeader>
          <TableRow>
            <TableHead sortKey="name">Name</TableHead>
            <TableHead firstSortDirection="descending" sortKey="mrr">
              MRR
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    const { container, getByRole, rerender } = render(
      view({ column: 'name', direction: 'ascending' })
    )
    const heads = container.querySelectorAll('th')
    expect(heads[0]).toHaveAttribute('aria-sort', 'ascending')
    expect(heads[1]).not.toHaveAttribute('aria-sort')
    expect(heads[2]).not.toHaveAttribute('aria-sort')
    expect(heads[2].querySelector('button')).toBeNull()
    expect(heads[0].querySelector('[data-trigger-slot="table-sort-button"]')).toHaveClass(
      'a63-Table-sort-button'
    )

    fireEvent.click(getByRole('button', { name: 'Name' }))
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'descending' })
    fireEvent.click(getByRole('button', { name: 'MRR' }))
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'mrr', direction: 'descending' })

    rerender(view({ column: 'mrr', direction: 'descending' }))
    expect(heads[0]).not.toHaveAttribute('aria-sort')
    expect(heads[1]).toHaveAttribute('aria-sort', 'descending')
    fireEvent.click(getByRole('button', { name: 'MRR' }))
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'mrr', direction: 'ascending' })
  })

  it('lets the caller replace the sort icon', () => {
    const { container } = render(
      <Table sort={null}>
        <TableHeader>
          <TableRow>
            <TableHead sortIcon={direction => <i data-icon={direction} />} sortKey="name">
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(container.querySelector('[data-icon="none"]')).not.toBeNull()
  })

  it('marks a selected row and opts cells into wrapping', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow selected>
            <TableCell wrap>Long</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Short</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const [selected, plain] = container.querySelectorAll('tr')
    expect(selected).toHaveAttribute('data-state', 'selected')
    expect(plain).not.toHaveAttribute('data-state')
    expect(container.querySelector('td')).toHaveAttribute('data-wrap')
    expect(plain?.querySelector('td')).not.toHaveAttribute('data-wrap')
  })

  it('makes the scroller a named, focusable region only while it overflows', () => {
    let callback: ResizeObserverCallback = () => {}
    const original = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      constructor(cb: ResizeObserverCallback) {
        callback = cb
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
    try {
      const { container } = render(
        <Table>
          <TableCaption>Invoices</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>INV001</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const scroller = container.querySelector<HTMLElement>('[data-slot="table-container"]')!
      expect(scroller).not.toHaveAttribute('tabindex')
      Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 800 })
      Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 400 })
      act(() => callback([], {} as ResizeObserver))
      expect(scroller).toHaveAttribute('tabindex', '0')
      expect(scroller).toHaveAttribute('role', 'region')
      expect(scroller).toHaveAttribute('aria-label', 'Invoices')
    } finally {
      globalThis.ResizeObserver = original
    }
  })
})
