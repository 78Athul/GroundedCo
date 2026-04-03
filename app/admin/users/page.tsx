'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!active) return
      setUsers(data ?? [])
      setLoading(false)
    }

    load()

    return () => { active = false }
  }, [supabase])

  const toggleRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (newRole === 'user' && !confirm(`Remove admin access from ${user.email}?`)) return
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    fetchUsers()
  }

  if (loading) return <div className="font-sans text-forest/50 text-sm">Loading…</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Users</h1>
        <p className="font-sans text-forest/50 text-sm tracking-wide mt-1">
          {users.length} registered {users.length === 1 ? 'user' : 'users'}. Manage roles below.
        </p>
      </div>

      <div className="bg-cream rounded-2xl border border-forest/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest/10">
                <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">User</th>
                <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Phone</th>
                <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Role</th>
                <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Joined</th>
                <th className="text-right px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-forest/5 last:border-0">
                  <td className="px-3 sm:px-6 py-3">
                    <p className="font-sans text-forest text-sm font-bold">{user.full_name || '—'}</p>
                    <p className="font-sans text-forest/40 text-xs">{user.email}</p>
                  </td>
                  <td className="px-3 sm:px-6 py-3 font-sans text-forest/60 text-sm whitespace-nowrap">{user.phone || '—'}</td>
                  <td className="px-3 sm:px-6 py-3">
                    <span className={`inline-flex font-sans font-bold text-xs px-2 py-1 rounded-full uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-sage/30 text-forest' : 'bg-forest/5 text-forest/40'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 font-sans text-forest/40 text-xs whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-right">
                    <button
                      onClick={() => toggleRole(user)}
                      className={`font-sans font-bold text-xs px-2 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                        user.role === 'admin'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-sage/20 text-forest hover:bg-sage/40'
                      }`}
                    >
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
