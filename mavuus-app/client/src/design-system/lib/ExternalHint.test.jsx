import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExternalHint } from './ExternalHint'

describe('ExternalHint', () => {
  it('should render sr-only new tab text when rendered', () => {
    render(
      <a href="https://mavuus.com">
        Visit
        <ExternalHint />
      </a>,
    )
    expect(screen.getByRole('link', { name: 'Visit (opens in a new tab)' })).toBeInTheDocument()
    expect(screen.getByText('(opens in a new tab)')).toHaveClass('sr-only')
  })
})
