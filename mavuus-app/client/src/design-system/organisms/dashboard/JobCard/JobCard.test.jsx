import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Badge } from '../../../primitives'
import { JobCard, JobCardSkeleton } from './JobCard'

const job = {
  title: 'VP of Demand Generation',
  company: 'Northwind Growth',
  description: 'Own pipeline targets across paid, partner and field programs for a Series C B2B SaaS team.',
  location: 'Remote, US',
  type: 'Full time',
  salary: '$190k - $230k',
  category: 'Demand Gen',
  seniority: 'Lead',
  postedLabel: '2d ago',
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <JobCard {...job} to="/dashboard/jobs/42" {...props} />
    </MemoryRouter>,
  )
}

describe('JobCard', () => {
  it('should link the whole card through the title when given to', () => {
    renderCard()
    const link = screen.getByRole('link', { name: 'VP of Demand Generation' })
    expect(link).toHaveAttribute('href', '/dashboard/jobs/42')
    expect(link).toHaveAttribute('data-card-link')
    expect(screen.getByRole('heading', { level: 3, name: 'VP of Demand Generation' })).toBeInTheDocument()
  })

  it('should render the company, meta, category, seniority and posted label', () => {
    renderCard()
    expect(screen.getByText('Northwind Growth')).toBeInTheDocument()
    expect(screen.getByText('Remote, US')).toBeInTheDocument()
    expect(screen.getByText('$190k - $230k')).toBeInTheDocument()
    expect(screen.getByText('Demand Gen')).toBeInTheDocument()
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.getByText('2d ago')).toBeInTheDocument()
  })

  it('should toggle save without following the card link', async () => {
    const user = userEvent.setup()
    const onSavedChange = vi.fn()
    renderCard({ saved: false, onSavedChange })
    const save = screen.getByRole('button', { name: 'Save VP of Demand Generation' })
    expect(save).toHaveAttribute('aria-pressed', 'false')
    expect(save.closest('a')).toBeNull()
    expect(save.closest('.z-\\(--ds-z-raised\\)')).not.toBeNull()
    await user.click(save)
    expect(onSavedChange).toHaveBeenCalledWith(true)
  })

  it('should show a pressed save button when saved', () => {
    renderCard({ saved: true, onSavedChange: () => {} })
    expect(screen.getByRole('button', { name: 'Save VP of Demand Generation' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('should call onRemove from the remove button when given onRemove', () => {
    const onRemove = vi.fn()
    renderCard({ onRemove })
    fireEvent.click(screen.getByRole('button', { name: 'Remove VP of Demand Generation from saved jobs' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('should show the status slot and the applicant count when given them', () => {
    renderCard({ status: <Badge tone="success">Open</Badge>, applicantCount: 1 })
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('1 applicant')).toBeInTheDocument()
  })

  it('should render a plain title, initials and no empty rows when optional fields are missing', () => {
    render(<JobCard title="Content Lead" company="TechFlow" />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Content Lead' })).toBeInTheDocument()
    expect(screen.getByText('TE')).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('should clamp a long title and description', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'VP of Demand Generation' })).toHaveClass('line-clamp-2')
    expect(screen.getByText(job.description)).toHaveClass('line-clamp-2')
  })

  it('should use headingLevel for the title', () => {
    renderCard({ headingLevel: 2 })
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render a busy skeleton with a loading label', () => {
    render(<JobCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Loading job')).toHaveClass('sr-only')
  })
})
