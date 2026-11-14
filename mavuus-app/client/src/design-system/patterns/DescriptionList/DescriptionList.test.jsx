import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DescriptionList } from './DescriptionList'

describe('DescriptionList', () => {
  it('should pair each label with its value in a definition list', () => {
    const { container } = render(
      <DescriptionList
        items={[
          { key: 'type', label: 'Type', value: 'Live' },
          { key: 'duration', label: 'Duration', value: '60 min' },
        ]}
      />,
    )
    expect(container.querySelector('dl')).toBeInTheDocument()
    expect(screen.getByText('Type').tagName).toBe('DT')
    expect(screen.getByText('60 min').tagName).toBe('DD')
  })

  it('should skip empty values and render nothing when none are left', () => {
    const { container, rerender } = render(
      <DescriptionList items={[{ key: 'a', label: 'Author', value: '' }, { key: 'b', label: 'Type', value: 'Guide' }]} />,
    )
    expect(screen.queryByText('Author')).not.toBeInTheDocument()
    rerender(<DescriptionList items={[{ key: 'a', label: 'Author', value: null }]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
