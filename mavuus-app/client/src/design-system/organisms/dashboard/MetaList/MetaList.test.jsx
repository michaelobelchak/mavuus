import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Clock, MapPin } from 'lucide-react'
import { MetaList } from './MetaList'

describe('MetaList', () => {
  it('should render each item with a decorative icon when given items', () => {
    render(
      <MetaList
        items={[
          { key: 'location', icon: MapPin, label: 'Remote, US' },
          { key: 'type', icon: Clock, label: 'Full time' },
        ]}
      />,
    )
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Remote, US')
    expect(items[0].querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should skip items without a label and render nothing when none are left', () => {
    const { container } = render(<MetaList items={[{ key: 'a', icon: MapPin, label: '' }, { key: 'b', label: null }]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
