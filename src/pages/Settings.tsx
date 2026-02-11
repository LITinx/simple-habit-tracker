import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'
import { DeleteAccountModal } from '../components/auth/DeleteAccountModal'
import { AchievementsList } from '../components/gamification/AchievementsList'
import { supabase } from '../lib/supabase'

export function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { totalPoints, achievements, loading: loadingGamification } = useGamification()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user_account')

    if (error) {
      throw new Error(error.message)
    }

    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen habit-scene">
      <header className="border-b border-black/10 px-4 py-4 sticky top-0 z-10 bg-[#f7f7f8]/90 backdrop-blur-sm">
        <div className="max-w-[430px] md:max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-[#666a73] hover:text-[#111319]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#111319]">Settings</h1>
        </div>
      </header>

      <main className="max-w-[430px] md:max-w-3xl mx-auto px-3 sm:px-4 py-5 pb-32 space-y-5 sm:space-y-6">
        <section className="bg-white rounded-2xl border border-black/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/10">
            <h2 className="font-semibold text-[#111319]">Account</h2>
          </div>

          <div className="divide-y divide-black/5">
            <div className="px-4 py-3">
              <div className="text-sm text-[#7c818a]">Email</div>
              <div className="text-[#111319]">{user?.email}</div>
            </div>

            <div className="px-4 py-3">
              <div className="text-sm text-[#7c818a]">Points</div>
              <div className="text-[#111319]">{totalPoints.toLocaleString()}</div>
            </div>

            <button
              onClick={signOut}
              className="w-full px-4 py-3 text-left text-[#111319] hover:bg-[#f7f7f8] flex items-center justify-between"
            >
              <span>Sign out</span>
              <svg className="w-5 h-5 text-[#9aa0aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-black/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <h2 className="font-semibold text-[#111319]">Achievements</h2>
            <span className="text-sm text-[#7c818a]">{achievements.length}/8</span>
          </div>

          <div className="p-4">
            {loadingGamification ? (
              <div className="text-sm text-[#7c818a]">Loading achievements...</div>
            ) : (
              <AchievementsList achievements={achievements} />
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-red-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-200 bg-red-50">
            <h2 className="font-semibold text-red-800">Danger Zone</h2>
          </div>

          <div className="p-4">
            <p className="text-sm text-[#5f646d] mb-3">
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

        <div className="text-center text-sm text-[#9ba1ab]">
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
