import { Navigate } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          <a
            href="/"
            className="block w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}