import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
    expect(wrapper()).toHaveAttribute('data-size', 'default')
    expect(wrapper()).toHaveAttribute('data-variant', 'default')
    rerender(<Table size="sm" variant="plain" />)
    expect(wrapper()).toHaveAttribute('data-size', 'sm')
    expect(wrapper()).toHaveAttribute('data-variant', 'plain')
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
})
