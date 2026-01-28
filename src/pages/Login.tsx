import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-600 mt-1">
            {showForgotPassword ? 'Reset your password' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {showForgotPassword ? (
            <ForgotPasswordForm
              onSubmit={resetPassword}
              onBack={() => setShowForgotPassword(false)}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
        </div>

        {!showForgotPassword && (
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
