import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { KeyedById } from './KeyedById'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <>
      <button onClick={() => setCount((n) => n + 1)}>{`Count ${count}`}</button>
      <Link to="/items/2">Next item</Link>
    </>
  )
}

describe('KeyedById', () => {
  it('should start the page fresh when only the :id changes', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/items/1']}>
        <Routes>
          <Route
            path="/items/:id"
            element={
              <KeyedById>
                <Counter />
              </KeyedById>
            }
          />
        </Routes>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Count 0' }))
    expect(screen.getByRole('button', { name: 'Count 1' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Next item' }))
    expect(screen.getByRole('button', { name: 'Count 0' })).toBeInTheDocument()
  })
})
