'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin',          label: 'Dashboard', icon: '◈' },
  { href: '/admin/carousel', label: 'Carousel',  icon: '◎' },
  { href: '/admin/products', label: 'Products',  icon: '▣' },
  { href: '/admin/pages',    label: 'Pages',     icon: '◧' },
  { href: '/admin/users',    label: 'Users',     icon: '◉' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Brand */}
      <div className="px-6 py-8 border-b border-cream/10">
        <Link href="/admin" className="font-display text-2xl uppercase tracking-tighter" onClick={onNavigate}>
          Grounded
        </Link>
        <p className="font-sans text-sage/70 text-xs tracking-[0.2em] uppercase mt-1">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-bold tracking-wide transition-colors duration-200 ${
                isActive
                  ? 'bg-sage/20 text-cream'
                  : 'text-cream/50 hover:text-cream hover:bg-cream/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

    </>
  )
}

function TopRightBar() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans font-bold tracking-wide text-cream/60 bg-forest/80 hover:text-cream hover:bg-forest border border-cream/10 transition-colors"
      >
        ← View Store
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans font-bold tracking-wide text-cream/60 bg-forest/80 hover:text-red-300 hover:bg-red-500/20 border border-cream/10 transition-colors"
      >
        Sign Out
      </button>
    </div>
  )
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Top-right action bar */}
      <TopRightBar />

      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-forest text-cream flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-forest text-cream border-b border-cream/10">
        <Link href="/admin" className="font-display text-xl uppercase tracking-tighter">
          Grounded
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center text-cream/70 hover:text-cream"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-forest text-cream flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-cream/50 hover:text-cream"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>
    </>
  )
}
