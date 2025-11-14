import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '../pages/NotFound'

describe('NotFound Component', () => {
  it('renders 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/404/i)).toBeInTheDocument()
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('shows go home button', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument()
  })
})