import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ShortcutsHelp from './ShortcutsHelp'

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

describe('ShortcutsHelp', () => {
  it('should close when a shortcut navigates to another page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ShortcutsHelp />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    )
    await user.keyboard('?')
    expect(await screen.findByRole('heading', { name: 'Keyboard shortcuts' })).toBeInTheDocument()
    await user.keyboard('gj')
    expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/jobs')
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument())
  })
})
