import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockReducedMotion } from '../../test/browserMocks'
import { NumberedTabs } from './NumberedTabs'

const items = [
  { num: '01', title: 'Strategy', tag: 'Plan the year', body: 'Strategy body' },
  { num: '02', title: 'Execution', tag: 'Ship the plan', body: 'Execution body' },
  { num: '03', title: 'Leadership', body: 'Leadership body' },
]

function renderTabs(props) {
  return render(
    <NumberedTabs
      label="Ways to work together"
      items={items}
      scaleStart="Strategy"
      scaleEnd="Leadership"
      renderPanel={(item) => <p>{item.body}</p>}
      {...props}
    />,
  )
}

const selected = () => screen.getAllByRole('tab').find((tab) => tab.getAttribute('aria-selected') === 'true')

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('NumberedTabs', () => {
  it('should render a vertical named tablist with the first tab selected and a labelled panel', () => {
    mockReducedMotion(true)
    renderTabs()
    const list = screen.getByRole('tablist', { name: 'Ways to work together' })
    expect(list).toHaveAttribute('aria-orientation', 'vertical')
    expect(selected()).toHaveAccessibleName(/Strategy/)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Strategy body')
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/Strategy/)
  })

  it('should advance to the next tab on its own when motion is allowed', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    renderTabs()
    act(() => vi.advanceTimersByTime(6000))
    expect(selected()).toHaveAccessibleName(/Execution/)
    act(() => vi.advanceTimersByTime(12000))
    expect(selected()).toHaveAccessibleName(/Strategy/)
  })

  it('should never autoplay or show the pause control when the user prefers reduced motion', () => {
    vi.useFakeTimers()
    mockReducedMotion(true)
    renderTabs()
    act(() => vi.advanceTimersByTime(18000))
    expect(selected()).toHaveAccessibleName(/Strategy/)
    expect(screen.queryByRole('button', { name: /automatic tab rotation/ })).toBeNull()
  })

  it('should pause and resume autoplay with the pause control', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    renderTabs()
    fireEvent.click(screen.getByRole('button', { name: 'Pause automatic tab rotation' }))
    act(() => vi.advanceTimersByTime(12000))
    expect(selected()).toHaveAccessibleName(/Strategy/)
    fireEvent.click(screen.getByRole('button', { name: 'Resume automatic tab rotation' }))
    act(() => vi.advanceTimersByTime(6000))
    expect(selected()).toHaveAccessibleName(/Execution/)
  })

  it('should pause while a mouse hovers and resume when it leaves', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    const { container } = renderTabs()
    fireEvent.pointerEnter(container.firstElementChild, { pointerType: 'mouse' })
    act(() => vi.advanceTimersByTime(12000))
    expect(selected()).toHaveAccessibleName(/Strategy/)
    fireEvent.pointerLeave(container.firstElementChild, { pointerType: 'mouse' })
    act(() => vi.advanceTimersByTime(6000))
    expect(selected()).toHaveAccessibleName(/Execution/)
  })

  it('should keep autoplay running when a touch pointer enters', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    const { container } = renderTabs()
    fireEvent.pointerEnter(container.firstElementChild, { pointerType: 'touch' })
    act(() => vi.advanceTimersByTime(6000))
    expect(selected()).toHaveAccessibleName(/Execution/)
  })

  it('should call consumer pointer and focus handlers and still pause', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    const onPointerEnter = vi.fn()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const onPointerLeave = vi.fn()
    const { container } = renderTabs({ onPointerEnter, onPointerLeave, onFocus, onBlur })
    const root = container.firstElementChild
    fireEvent.pointerEnter(root, { pointerType: 'mouse' })
    fireEvent.focus(screen.getByRole('tab', { name: /Strategy/ }))
    act(() => vi.advanceTimersByTime(12000))
    expect(selected()).toHaveAccessibleName(/Strategy/)
    fireEvent.pointerLeave(root, { pointerType: 'mouse' })
    fireEvent.blur(screen.getByRole('tab', { name: /Strategy/ }))
    expect(onPointerEnter).toHaveBeenCalledTimes(1)
    expect(onPointerLeave).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalled()
    expect(onBlur).toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(6000))
    expect(selected()).toHaveAccessibleName(/Execution/)
  })

  it('should clamp initial to the items it has', () => {
    mockReducedMotion(true)
    const { unmount } = renderTabs({ initial: 9 })
    expect(selected()).toHaveAccessibleName(/Leadership/)
    unmount()
    renderTabs({ initial: -2 })
    expect(selected()).toHaveAccessibleName(/Strategy/)
  })

  it('should move to the last remaining tab when the items shrink below the active one', () => {
    mockReducedMotion(true)
    const { rerender } = renderTabs({ initial: 2 })
    expect(selected()).toHaveAccessibleName(/Leadership/)
    rerender(
      <NumberedTabs
        label="Ways to work together"
        items={items.slice(0, 2)}
        scaleStart="Strategy"
        scaleEnd="Leadership"
        renderPanel={(item) => <p>{item.body}</p>}
      />,
    )
    expect(selected()).toHaveAccessibleName(/Execution/)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Execution body')
  })

  it('should stop autoplay for good and hide the pause control once the user picks a tab', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    renderTabs()
    fireEvent.click(screen.getByRole('tab', { name: /Leadership/ }))
    expect(selected()).toHaveAccessibleName(/Leadership/)
    act(() => vi.advanceTimersByTime(18000))
    expect(selected()).toHaveAccessibleName(/Leadership/)
    expect(screen.queryByRole('button', { name: /automatic tab rotation/ })).toBeNull()
  })

  it('should move and activate with arrow keys, Home and End', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    renderTabs()
    await user.tab()
    expect(screen.getByRole('tab', { name: /Strategy/ })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Execution/))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Execution body')
    await user.keyboard('{End}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Leadership/))
    await user.keyboard('{Home}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Strategy/))
    await user.keyboard('{ArrowUp}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Leadership/))
  })

  it('should mark the active row with the pink rule and hide the big number from screen readers', () => {
    mockReducedMotion(true)
    renderTabs()
    expect(selected()).toHaveClass('data-[active]:border-border-brand')
    const bigNumber = screen.getByRole('tabpanel').querySelector('[data-numbered-tabs-number]')
    expect(bigNumber).toHaveAttribute('aria-hidden', 'true')
    expect(bigNumber).toHaveTextContent('01')
  })

  it('should treat ArrowRight and ArrowLeft as next and previous', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    renderTabs()
    await user.tab()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Execution/))
    expect(screen.getByRole('tab', { name: /Execution/ })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Strategy/))
    await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Leadership/))
    expect(screen.getByRole('tab', { name: /Leadership/ })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Strategy/))
  })

  it('should stop autoplay when the user moves with ArrowRight', async () => {
    mockReducedMotion(false)
    const user = userEvent.setup()
    renderTabs()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Pause automatic tab rotation' })).toHaveFocus()
    await user.tab()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(selected()).toHaveAccessibleName(/Execution/))
    expect(screen.queryByRole('button', { name: /automatic tab rotation/ })).toBeNull()
  })
})
