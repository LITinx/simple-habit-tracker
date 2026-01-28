import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DeleteAccountModal } from '../components/auth/DeleteAccountModal'
import { supabase } from '../lib/supabase'

export function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteAccount = async () => {
    // Call the delete_user_account RPC function
    const { error } = await supabase.rpc('delete_user_account')

    if (error) {
      throw new Error(error.message)
    }

    // Sign out and redirect
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Account Section */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Account</h2>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-4 py-3">
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-gray-900">{user?.email}</div>
            </div>

            <button
              onClick={signOut}
              className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Sign out</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-6 bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-200 bg-red-50">
            <h2 className="font-semibold text-red-800">Danger Zone</h2>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Habit Tracker v1.0</p>
        </div>
      </main>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}
