import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Briefcase } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { Tab, TabList, TabPanel, Tabs } from './Tabs'

const items = [
  { value: 'overview', label: 'Overview', content: <p>Overview panel</p>, icon: Briefcase },
  { value: 'members', label: 'Members', content: <p>Members panel</p> },
  { value: 'billing', label: 'Billing', content: <p>Billing panel</p>, disabled: true },
  { value: 'settings', label: 'Settings', content: <p>Settings panel</p> },
]

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Tabs', () => {
  it('should render a named tablist with the default tab selected and its panel shown', () => {
    render(<Tabs aria-label="Workspace" items={items} defaultValue="overview" />)
    expect(screen.getByRole('tablist', { name: 'Workspace' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Overview panel')).toBeVisible()
    expect(screen.queryByText('Members panel')).toBeNull()
  })

  it('should label the panel with its tab', () => {
    render(<Tabs aria-label="Workspace" items={items} defaultValue="overview" />)
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Overview')
  })

  it('should move focus with arrow keys and activate on Enter by default', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Tabs aria-label="Workspace" items={items} defaultValue="overview" onValueChange={onValueChange} />)
    await user.tab()
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true'))
    expect(onValueChange).toHaveBeenLastCalledWith('members', expect.anything())
    expect(screen.getByText('Members panel')).toBeVisible()
  })

  it('should keep a disabled tab discoverable but not activate it when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Workspace" items={items} defaultValue="members" />)
    await user.tab()
    await user.keyboard('{ArrowRight}')
    const billing = screen.getByRole('tab', { name: 'Billing' })
    expect(billing).toHaveFocus()
    expect(billing).toHaveAttribute('aria-disabled', 'true')
    await user.keyboard('{Enter}')
    expect(billing).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true')
  })

  it('should activate on arrow focus when activateOnFocus is set', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Workspace" items={items} defaultValue="overview" activateOnFocus />)
    await user.tab()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true'))
  })

  it('should follow the value when controlled', () => {
    const { rerender } = render(<Tabs aria-label="Workspace" items={items} value="overview" />)
    rerender(<Tabs aria-label="Workspace" items={items} value="settings" />)
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true')
  })

  it('should use the underline style and md height by default', () => {
    render(<Tabs aria-label="Workspace" items={items} />)
    expect(screen.getByRole('tablist')).toHaveClass('border-b', 'border-border-default')
    const tab = screen.getByRole('tab', { name: 'Overview' })
    expect(tab).toHaveClass('h-12', 'data-[active]:border-border-brand')
    expect(tab.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should use the segmented pill style and sm height when variant is pill and size is sm', () => {
    render(<Tabs aria-label="Workspace" items={items} variant="pill" size="sm" />)
    expect(screen.getByRole('tablist')).toHaveClass('bg-surface-sunken', 'rounded-control')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'h-10',
      'data-[active]:bg-surface-raised',
      'data-[active]:shadow-card',
    )
  })

  it('should warn and fall back when the variant or size is unsupported', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Tabs aria-label="Workspace" items={items} variant="boxed" size="lg" />)
    expect(screen.getByRole('tablist')).toHaveClass('border-b')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass('h-12')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Tabs: variant "boxed"/))
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Tabs: size "lg"/))
  })

  it('should work with compound parts and share the variant', () => {
    render(
      <Tabs variant="pill" defaultValue="a">
        <TabList aria-label="Range">
          <Tab value="a">Week</Tab>
          <Tab value="b">Month</Tab>
        </TabList>
        <TabPanel value="a">Week data</TabPanel>
        <TabPanel value="b">Month data</TabPanel>
      </Tabs>,
    )
    expect(screen.getByRole('tablist', { name: 'Range' })).toHaveClass('bg-surface-sunken')
    expect(screen.getByRole('tab', { name: 'Week' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Week' })).toHaveTextContent('Week data')
  })
})
