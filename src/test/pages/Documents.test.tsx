import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Documents from '../pages/Documents'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com', role: 'student' },
    isAuthenticated: true,
    loading: false
  })
}))

vi.mock('../stores/documentStore', () => ({
  useDocumentStore: () => ({
    documents: [
      {
        id: '1',
        title: 'Offer Letter',
        type: 'offer_letter',
        fileUrl: 'https://example.com/offer.pdf',
        uploadedAt: '2024-01-01T00:00:00Z',
        size: 1024,
        mimeType: 'application/pdf'
      },
      {
        id: '2',
        title: 'Certificate',
        type: 'certificate',
        fileUrl: 'https://example.com/certificate.pdf',
        uploadedAt: '2024-01-15T00:00:00Z',
        size: 2048,
        mimeType: 'application/pdf'
      }
    ],
    loading: false,
    fetchDocuments: vi.fn(),
    uploadDocument: vi.fn(),
    downloadDocument: vi.fn(),
    deleteDocument: vi.fn()
  })
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
})

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Documents Component', () => {
  it('renders documents list', () => {
    renderWithProviders(<Documents />)
    
    expect(screen.getByText(/offer letter/i)).toBeInTheDocument()
    expect(screen.getByText(/certificate/i)).toBeInTheDocument()
  })

  it('displays document metadata', () => {
    renderWithProviders(<Documents />)
    
    expect(screen.getByText(/pdf/i)).toBeInTheDocument()
    expect(screen.getByText(/1 kb/i)).toBeInTheDocument()
    expect(screen.getByText(/2 kb/i)).toBeInTheDocument()
  })

  it('shows upload button', () => {
    renderWithProviders(<Documents />)
    
    expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument()
  })

  it('shows download buttons for each document', () => {
    renderWithProviders(<Documents />)
    
    const downloadButtons = screen.getAllByRole('button', { name: /download/i })
    expect(downloadButtons).toHaveLength(2)
  })
})