import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockOverflow } from '../../test/browserMocks'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './Table'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function Jobs({ density, hideCaption = false, ...props }) {
  return (
    <Table density={density} {...props}>
      <TableCaption visuallyHidden={hideCaption}>Open jobs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead align="right">Applicants</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Head of Growth</TableCell>
          <TableCell align="right">12</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

describe('Table', () => {
  it('should render column headers with scope col', () => {
    render(<Jobs />)
    const header = screen.getByRole('columnheader', { name: 'Title' })
    expect(header).toHaveAttribute('scope', 'col')
    expect(header).toHaveClass('text-caption', 'uppercase', 'text-text-muted')
    expect(screen.getByRole('columnheader', { name: 'Applicants' })).toHaveClass('text-right')
  })

  it('should name the table with its caption', () => {
    render(<Jobs />)
    expect(screen.getByRole('table', { name: 'Open jobs' })).toBeInTheDocument()
  })

  it('should keep a visually hidden caption in the accessible name', () => {
    render(<Jobs hideCaption />)
    expect(screen.getByText('Open jobs')).toHaveClass('sr-only')
    expect(screen.getByRole('table', { name: 'Open jobs' })).toBeInTheDocument()
  })

  it('should style body rows with a subtle border and a hover tint, but not header rows', () => {
    render(<Jobs />)
    const [headerRow, bodyRow] = screen.getAllByRole('row')
    expect(bodyRow).toHaveClass('border-b', 'border-border-subtle', 'hover:bg-surface-hover')
    expect(headerRow).not.toHaveClass('hover:bg-surface-hover')
  })

  it('should pad cells for the comfortable density by default and tighter when compact', () => {
    const { unmount } = render(<Jobs />)
    expect(screen.getByRole('cell', { name: 'Head of Growth' })).toHaveClass('py-ds-sm')
    unmount()
    render(<Jobs density="compact" />)
    expect(screen.getByRole('cell', { name: 'Head of Growth' })).toHaveClass('py-ds-xs')
  })

  it('should not add a scroll region when the table fits', () => {
    render(<Jobs />)
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('should wrap an overflowing table in a focusable region labelled by the caption', async () => {
    mockOverflow({ scrollWidth: 900, clientWidth: 320 })
    const user = userEvent.setup()
    render(<Jobs />)
    const region = await screen.findByRole('region', { name: 'Open jobs' })
    expect(region).toHaveAttribute('tabindex', '0')
    await user.tab()
    expect(region).toHaveFocus()
  })

  it('should label an overflowing region with aria-label when there is no caption', async () => {
    mockOverflow({ scrollWidth: 900, clientWidth: 320 })
    render(
      <Table aria-label="Vendors">
        <TableBody>
          <TableRow>
            <TableCell>Acme</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(await screen.findByRole('region', { name: 'Vendors' })).toBeInTheDocument()
  })

  it('should pass className and props to the table element', () => {
    render(<Jobs className="min-w-full" data-testid="jobs" />)
    expect(screen.getByTestId('jobs').tagName).toBe('TABLE')
    expect(screen.getByTestId('jobs')).toHaveClass('min-w-full')
  })
})
