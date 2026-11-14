import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Avatar } from './Avatar'
import { AvatarStack } from './AvatarStack'
import { initialsOf } from './avatarUtils'

describe('Avatar', () => {
  it('should render an image with the name as alt text when given src', () => {
    render(<Avatar src="/dilya.jpg" name="Dilya Abushayeva" />)
    expect(screen.getByRole('img', { name: 'Dilya Abushayeva' })).toHaveAttribute('src', '/dilya.jpg')
  })

  it('should show initials when src is missing', () => {
    render(<Avatar name="Elmira Abushayeva" />)
    expect(screen.getByRole('img', { name: 'Elmira Abushayeva' }).tagName).toBe('SPAN')
    expect(screen.getByText('EA')).toBeInTheDocument()
  })

  it('should fall back to initials when the image fails to load', () => {
    render(<Avatar src="/broken.jpg" name="Dilya Abushayeva" />)
    fireEvent.error(screen.getByRole('img', { name: 'Dilya Abushayeva' }))
    expect(screen.getByText('DA')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Dilya Abushayeva' }).tagName).toBe('SPAN')
  })

  it('should call the consumer onError and still fall back when the image fails', () => {
    const onError = vi.fn()
    render(<Avatar src="/broken.jpg" name="Dilya Abushayeva" onError={onError} />)
    fireEvent.error(screen.getByRole('img', { name: 'Dilya Abushayeva' }))
    expect(onError).toHaveBeenCalledTimes(1)
    expect(screen.getByText('DA')).toBeInTheDocument()
  })

  it('should hide the fallback from assistive tech when there is no name', () => {
    const { container } = render(<Avatar />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('should use one initial when the name is a single word', () => {
    render(<Avatar name="madonna" />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })
})

describe('initialsOf', () => {
  it('should keep characters outside the basic plane whole when taking initials', () => {
    expect(initialsOf('\u{1D400}da \u{1D401}yron')).toBe('\u{1D400}\u{1D401}')
    expect(initialsOf('  ')).toBe('')
  })
})

describe('AvatarStack', () => {
  const people = [
    { name: 'Ava Stone' },
    { name: 'Ben Ortiz' },
    { name: 'Cara Lim' },
    { name: 'Dan Park' },
    { name: 'Eve Moss' },
  ]

  it('should show max avatars and a +N chip when there are more people than max', () => {
    render(<AvatarStack people={people} max={3} />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByText('and 2 more')).toHaveClass('sr-only')
  })

  it('should not show a +N chip when everyone fits', () => {
    render(<AvatarStack people={people.slice(0, 2)} max={3} />)
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })
})
