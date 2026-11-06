import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Bookmark } from 'lucide-react'
import { MemoryRouter } from 'react-router-dom'
import { IconButton } from '../../../primitives'
import { ResourceCard, ResourceCardSkeleton } from './ResourceCard'

const resource = {
  title: 'The 2026 B2B attribution playbook',
  category: 'Analytics',
  description: 'How six CMOs moved from last touch to blended attribution without losing the board.',
  author: 'Dilya Abushayeva',
  readTime: '8 min read',
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <ResourceCard {...resource} to="/dashboard/resources/9" {...props} />
    </MemoryRouter>,
  )
}

describe('ResourceCard', () => {
  it('should link the card through the title', () => {
    renderCard()
    expect(screen.getByRole('link', { name: resource.title })).toHaveAttribute('href', '/dashboard/resources/9')
  })

  it('should open an external resource in a new tab and say so', () => {
    renderCard({ to: undefined, href: 'https://hbr.org/attribution' })
    const link = screen.getByRole('link', { name: `${resource.title} (opens in a new tab)` })
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should show the category, description, author and read time', () => {
    renderCard()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText(resource.description)).toHaveClass('line-clamp-2')
    expect(screen.getByText('Dilya Abushayeva')).toBeInTheDocument()
    expect(screen.getByText('8 min read')).toBeInTheDocument()
  })

  it('should keep actions clickable outside the card link', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderCard({ actions: <IconButton icon={Bookmark} aria-label="Save resource" onClick={onSave} /> })
    const button = screen.getByRole('button', { name: 'Save resource' })
    expect(button.closest('a')).toBeNull()
    await user.click(button)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('should leave out the footer when there is no author or read time', () => {
    const { container } = renderCard({ author: undefined, readTime: undefined })
    expect(container.querySelector('footer')).toBeNull()
  })

  it('should render a busy skeleton', () => {
    render(<ResourceCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })

  it('should name the article by its title', () => {
    renderCard()
    expect(screen.getByRole('article', { name: resource.title })).toBeInTheDocument()
  })

  it('should toggle save with the built-in bookmark like JobCard', async () => {
    const user = userEvent.setup()
    const onSavedChange = vi.fn()
    renderCard({ saved: true, onSavedChange })
    const save = screen.getByRole('button', { name: `Save ${resource.title}` })
    expect(save).toHaveAttribute('aria-pressed', 'true')
    expect(save.closest('a')).toBeNull()
    await user.click(save)
    expect(onSavedChange).toHaveBeenCalledWith(false)
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<ResourceCardSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading resource')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<ResourceCardSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
