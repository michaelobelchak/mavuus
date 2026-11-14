import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Briefcase, BookmarkCheck, MessageCircle } from 'lucide-react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SidebarNavItem } from './SidebarNavItem'

const jobs = {
  label: 'Jobs',
  icon: Briefcase,
  to: '/dashboard/jobs',
  children: [{ label: 'My Jobs', icon: BookmarkCheck, to: '/dashboard/my-jobs' }],
}
const messages = { label: 'Messages', icon: MessageCircle, to: '/dashboard/messages', badge: 'messages' }

function renderItem(item, { path = '/dashboard', ...props } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ul>
        <SidebarNavItem item={item} {...props} />
      </ul>
    </MemoryRouter>,
  )
}

describe('SidebarNavItem', () => {
  it('should mark the link as the current page when the route matches', () => {
    renderItem(jobs, { path: '/dashboard/jobs/42' })
    expect(screen.getByRole('link', { name: 'Jobs' })).toHaveAttribute('aria-current', 'page')
  })

  it('should leave aria-current off when another route is active', () => {
    renderItem(messages, { path: '/dashboard/jobs' })
    expect(screen.getByRole('link', { name: 'Messages' })).not.toHaveAttribute('aria-current')
  })

  it('should follow activeTo from the sidebar instead of its own match when given', () => {
    renderItem(messages, { path: '/dashboard/messages', activeTo: '/dashboard/jobs' })
    expect(screen.getByRole('link', { name: 'Messages' })).not.toHaveAttribute('aria-current')
  })

  it('should expand and collapse a group with aria-expanded and aria-controls when the chevron is pressed', async () => {
    const user = userEvent.setup()
    renderItem(jobs)
    const toggle = screen.getByRole('button', { name: 'Jobs pages' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'My Jobs' })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const list = document.getElementById(toggle.getAttribute('aria-controls'))
    expect(list).toContainElement(screen.getByRole('link', { name: 'My Jobs' }))

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'My Jobs' })).not.toBeInTheDocument()
  })

  it('should open the group and mark the child current when a child route is active', () => {
    renderItem(jobs, { path: '/dashboard/my-jobs' })
    expect(screen.getByRole('button', { name: 'Jobs pages' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'My Jobs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Jobs' })).not.toHaveAttribute('aria-current')
  })

  it('should announce the badge count with the label when a badge is set', () => {
    renderItem(messages, { badges: { messages: 3 } })
    expect(screen.getByRole('link', { name: 'Messages, 3 new' })).toBeInTheDocument()
  })

  it('should hide the badge when the count is zero', () => {
    renderItem(messages, { badges: { messages: 0 } })
    expect(screen.getByRole('link', { name: 'Messages' })).toBeInTheDocument()
  })

  it('should render icon-only links that keep their names and get the label as a tooltip when collapsed', () => {
    renderItem(jobs, { collapsed: true, path: '/dashboard/my-jobs' })
    const link = screen.getByRole('link', { name: 'Jobs' })
    expect(link).toHaveAccessibleDescription('Jobs')
    expect(link).not.toHaveTextContent('Jobs')
    expect(screen.getByRole('link', { name: 'My Jobs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('button', { name: /Jobs pages/ })).not.toBeInTheDocument()
  })

  it('should call onNavigate when a link is followed', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderItem(messages, { onNavigate })
    await user.click(screen.getByRole('link', { name: 'Messages' }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
