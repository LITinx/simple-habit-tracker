import { useState } from 'react'

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  onBack: () => void
}

export function ForgotPasswordForm({ onSubmit, onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center">
          <div className="text-green-600 text-lg font-medium mb-2">
            Check your email!
          </div>
          <p className="text-gray-600 text-sm">
            We sent a password reset link to {email}.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-blue-600 hover:text-blue-700"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-blue-600 hover:text-blue-700"
      >
        Back to login
      </button>
    </form>
  )
}
