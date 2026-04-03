'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  const unauthorizedError = searchParams.get('error') === 'unauthorized'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-display text-cream text-5xl uppercase tracking-tighter mb-2">Grounded</h1>
          <p className="font-sans font-bold text-sage/70 text-xs tracking-[0.2em] uppercase">Admin Portal</p>
        </div>

        {/* Errors */}
        {unauthorizedError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="font-sans text-red-300 text-sm text-center">You need admin access to view that page.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="font-sans text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-cream/5 backdrop-blur-sm border border-cream/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block font-sans font-bold text-cream/50 text-xs tracking-[0.15em] uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-cream/5 border border-cream/10 text-cream rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage/50 transition-colors placeholder:text-cream/20"
              placeholder="you@grounded.co"
            />
          </div>

          <div>
            <label className="block font-sans font-bold text-cream/50 text-xs tracking-[0.15em] uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-cream/5 border border-cream/10 text-cream rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage/50 transition-colors placeholder:text-cream/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage text-forest font-sans font-bold text-xs tracking-[0.2em] uppercase py-4 rounded-xl hover:bg-cream transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center font-sans text-cream/20 text-xs mt-6">
          <Link href="/" className="hover:text-cream/50 transition-colors">← Back to store</Link>
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-forest flex items-center justify-center">
        <div className="text-sage font-sans text-sm tracking-widest uppercase animate-pulse">Loading...</div>
      </div>
    }>
      <AdminLogin />
    </Suspense>
  )
}
