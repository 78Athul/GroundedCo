'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      return
    }

    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/admin/login?error=unauthorized')
      } else {
        setLoading(false)
      }
    }).catch(() => {
      router.replace('/admin/login?error=unauthorized')
    })
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-sans text-forest/70">Checking credentials…</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-olive">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-14 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
