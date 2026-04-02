'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import { usePathname } from 'next/navigation'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <>{children}</>
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
