import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Avatar } from './Avatar'
import { AvatarStack } from './AvatarStack'

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

  it('should use one initial when the name is a single word', () => {
    render(<Avatar name="madonna" />)
    expect(screen.getByText('M')).toBeInTheDocument()
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
