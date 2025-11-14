import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VerifyDocument from '../pages/VerifyDocument'

describe('VerifyDocument Component', () => {
  it('renders verification form', () => {
    render(
      <MemoryRouter>
        <VerifyDocument />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/verify document/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
  })

  it('shows QR code scanner option', () => {
    render(
      <MemoryRouter>
        <VerifyDocument />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/scan qr code/i)).toBeInTheDocument()
  })

  it('shows instructions for verification', () => {
    render(
      <MemoryRouter>
        <VerifyDocument />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/enter the verification code/i)).toBeInTheDocument()
  })
})