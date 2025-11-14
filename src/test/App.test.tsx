import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

vi.mock('../pages/Login', () => ({
  default: () => <div>Login Page</div>
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>
}))

vi.mock('../pages/Internships', () => ({
  default: () => <div>Internships Page</div>
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})