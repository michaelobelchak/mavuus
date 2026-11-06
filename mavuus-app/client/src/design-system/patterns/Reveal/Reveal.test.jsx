import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { resetWarnings } from '../../lib/warnOnce'
import { mockIntersectionObserver } from '../../test/browserMocks'
import { MAX_REVEAL_STEP } from './revealOptions'
import { Reveal } from './Reveal'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Reveal', () => {
  it('should arm the content and mark it in view after it intersects', () => {
    const io = mockIntersectionObserver()
    render(<Reveal data-testid="reveal">Hello</Reveal>)
    const el = screen.getByTestId('reveal')
    expect(el).toHaveAttribute('data-reveal', 'rise')
    expect(el).toHaveAttribute('data-armed')
    expect(el).not.toHaveAttribute('data-in')
    act(() => io.intersect(el))
    expect(el).toHaveAttribute('data-in')
  })

  it('should render the tag and variant it is given', () => {
    mockIntersectionObserver()
    render(
      <ul>
        <Reveal as="li" variant="clip">
          Item
        </Reveal>
      </ul>,
    )
    expect(screen.getByRole('listitem')).toHaveAttribute('data-reveal', 'clip')
  })

  it('should cap the stagger step at 6 when the index is large', () => {
    mockIntersectionObserver()
    render(
      <>
        <Reveal data-testid="third" index={2} />
        <Reveal data-testid="late" index={40} />
      </>,
    )
    expect(screen.getByTestId('third')).toHaveAttribute('data-reveal-step', '2')
    expect(screen.getByTestId('late')).toHaveAttribute('data-reveal-step', '6')
  })

  it('should warn and fall back to rise when the variant is unknown', () => {
    mockIntersectionObserver()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Reveal data-testid="reveal" variant="spin" />)
    expect(screen.getByTestId('reveal')).toHaveAttribute('data-reveal', 'rise')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Reveal: variant "spin"/))
  })

  it('should have one stagger rule per step in motion.css, 70ms apart', () => {
    const css = readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '../../styles/motion.css'), 'utf8')
    const rules = [...css.matchAll(/\[data-reveal-step='(\d+)'\]\s*\{\s*--reveal-delay:\s*(\d+)ms;\s*\}/g)]
    expect(rules).toHaveLength(MAX_REVEAL_STEP + 1)
    for (const [, step, delay] of rules) expect(Number(delay)).toBe(Number(step) * 70)
    expect(rules.map(([, step]) => Number(step))).toEqual(Array.from({ length: MAX_REVEAL_STEP + 1 }, (_, i) => i))
  })
})
