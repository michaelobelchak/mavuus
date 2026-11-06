import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Button } from '../../primitives'
import { PageHeader } from './PageHeader'

function renderHeader(props) {
  return render(
    <MemoryRouter>
      <PageHeader title="Jobs" {...props} />
    </MemoryRouter>,
  )
}

describe('PageHeader', () => {
  it('should render the title as an h1 at h1 size', () => {
    renderHeader()
    const heading = screen.getByRole('heading', { level: 1, name: 'Jobs' })
    expect(heading).toHaveClass('text-h1')
  })

  it('should render the eyebrow, description and actions when given', () => {
    renderHeader({
      eyebrow: 'Community',
      description: 'Roles shared by members and partners.',
      actions: <Button>Post a job</Button>,
    })
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText('Roles shared by members and partners.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Post a job' })).toBeInTheDocument()
  })

  it('should put the eyebrow before the heading', () => {
    renderHeader({ eyebrow: 'Community' })
    const eyebrow = screen.getByText('Community')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(eyebrow.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('should render breadcrumbs from items above the title', () => {
    renderHeader({ breadcrumbs: [{ label: 'Home', to: '/dashboard' }, { label: 'Jobs', to: '/dashboard/jobs' }] })
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/dashboard')
  })

  it('should stack the actions under the title on mobile and align them right from sm up', () => {
    const { container } = renderHeader({ actions: <Button>Post a job</Button> })
    const row = screen.getByRole('button', { name: 'Post a job' }).parentElement.parentElement
    expect(row).toHaveClass('flex-col', 'sm:flex-row', 'sm:justify-between')
    expect(container.querySelector('[data-page-header-actions]')).toHaveClass('flex-wrap')
  })
})
