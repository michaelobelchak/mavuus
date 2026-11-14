import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { mockReducedMotion, mockResizeObserver } from '../../test/browserMocks'
import { BarChart } from './BarChart'
import { LineChart } from './LineChart'

// Records the props recharts' Bar and Line receive, then renders the real ones.
const received = vi.hoisted(() => ({ bar: [], line: [] }))
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal()
  const { Bar, Line } = actual
  return {
    ...actual,
    Bar: (props) => {
      received.bar.push(props)
      return <Bar {...props} />
    },
    Line: (props) => {
      received.line.push(props)
      return <Line {...props} />
    },
  }
})

afterEach(() => {
  received.bar.length = 0
  received.line.length = 0
  vi.unstubAllGlobals()
})

const data = [
  { week: 'Oct 5', signups: 12 },
  { week: 'Oct 12', signups: 18 },
]
const series = [{ key: 'signups', label: 'Signups' }]

describe.each([
  ['BarChart', BarChart, 'bar'],
  ['LineChart', LineChart, 'line'],
])('%s animation', (_name, Chart, part) => {
  it('should pass isAnimationActive false when the user prefers reduced motion', () => {
    mockResizeObserver()
    mockReducedMotion(true)
    render(<Chart data={data} xKey="week" series={series} />)
    expect(received[part].length).toBeGreaterThan(0)
    expect(received[part].every((props) => props.isAnimationActive === false)).toBe(true)
  })

  it('should pass isAnimationActive true when motion is allowed', () => {
    mockResizeObserver()
    mockReducedMotion(false)
    render(<Chart data={data} xKey="week" series={series} />)
    expect(received[part].length).toBeGreaterThan(0)
    expect(received[part].every((props) => props.isAnimationActive === true)).toBe(true)
  })
})
