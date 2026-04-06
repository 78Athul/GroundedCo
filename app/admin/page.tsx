import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const STATUS_COLORS: Record<string, string> = {
  paid:     'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

type Order = {
  id: string
  order_ref: string
  product_name: string
  customer_name: string
  customer_email: string
  quantity: number
  amount_paise: number
  status: string
  created_at: string
}

export default async function AdminDashboard() {
  const supabase = createServerClient()

  // Fetch all data in parallel
  const [
    ordersRes,
    carouselRes,
    featuredRes,
    profilesRes,
    lowStockRes,
  ] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('carousel_products').select('id', { count: 'exact', head: true }),
    supabase.from('featured_products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('featured_products').select('id, name, stock_count, low_stock_threshold').lte('stock_count', 5),
  ])

  const allOrders: Order[] = ordersRes.data ?? []
  const paidOrders = allOrders.filter(o => o.status === 'paid')
  const pendingOrders = allOrders.filter(o => o.status === 'pending')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.amount_paise, 0)
  const monthRevenuePaise = paidOrders
    .filter(o => new Date(o.created_at) >= startOfMonth)
    .reduce((sum, o) => sum + o.amount_paise, 0)
  const todayOrders = allOrders.filter(o => new Date(o.created_at) >= startOfToday).length

  // Last 14 days revenue bar chart data
  const days14: { label: string; paise: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfToday)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const dayPaise = paidOrders
      .filter(o => {
        const t = new Date(o.created_at)
        return t >= d && t < next
      })
      .reduce((sum, o) => sum + o.amount_paise, 0)
    days14.push({
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      paise: dayPaise,
    })
  }
  const maxDayPaise = Math.max(...days14.map(d => d.paise), 1)

  const recentOrders = allOrders.slice(0, 8)
  const lowStockProducts = lowStockRes.data ?? []

  const statCards = [
    { label: 'Total Revenue', value: formatINR(totalRevenuePaise), sub: `${paidOrders.length} paid orders`, accent: 'text-forest' },
    { label: 'This Month', value: formatINR(monthRevenuePaise), sub: `${paidOrders.filter(o => new Date(o.created_at) >= startOfMonth).length} orders`, accent: 'text-forest' },
    { label: 'Orders Today', value: String(todayOrders), sub: 'all statuses', accent: 'text-deep-obsidian' },
    { label: 'Pending', value: String(pendingOrders.length), sub: 'awaiting payment', accent: pendingOrders.length ? 'text-amber-600' : 'text-deep-obsidian/40' },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Dashboard</h1>
        <p className="font-sans text-forest/50 text-sm tracking-wide mt-1">Ecommerce overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-cream rounded-2xl border border-forest/10 p-5">
            <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">{s.label}</p>
            <p className={`font-display text-3xl tracking-tighter ${s.accent}`}>{s.value}</p>
            <p className="font-sans text-xs text-deep-obsidian/30 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-cream rounded-2xl border border-forest/10 p-5">
          <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Products</p>
          <p className="font-display text-3xl tracking-tighter text-forest">{featuredRes.count ?? 0}</p>
        </div>
        <div className="bg-cream rounded-2xl border border-forest/10 p-5">
          <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Carousel</p>
          <p className="font-display text-3xl tracking-tighter text-forest">{carouselRes.count ?? 0}</p>
        </div>
        <div className="bg-cream rounded-2xl border border-forest/10 p-5">
          <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Users</p>
          <p className="font-display text-3xl tracking-tighter text-forest">{profilesRes.count ?? 0}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-cream rounded-2xl border border-forest/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-forest text-xl uppercase tracking-tighter">Revenue — Last 14 Days</h2>
          <Link href="/admin/orders" className="font-sans text-xs font-bold text-forest/50 hover:text-forest tracking-[0.15em] uppercase transition-colors">
            View All Orders →
          </Link>
        </div>
        <div className="flex items-end gap-1.5 h-36">
          {days14.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
              <div
                className="w-full bg-forest/20 hover:bg-forest/50 transition-colors duration-200 rounded-sm min-h-[2px]"
                style={{ height: `${Math.max(2, (d.paise / maxDayPaise) * 120)}px` }}
              />
              {/* Tooltip */}
              {d.paise > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-forest text-cream text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {formatINR(d.paise)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-sans text-xs text-deep-obsidian/30">{days14[0].label}</span>
          <span className="font-sans text-xs text-deep-obsidian/30">{days14[13].label}</span>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-cream rounded-2xl border border-forest/10">
        <div className="px-6 py-4 border-b border-forest/10 flex items-center justify-between">
          <h2 className="font-display text-forest text-xl uppercase tracking-tighter">Recent Orders</h2>
          <Link href="/admin/orders" className="font-sans text-xs font-bold text-forest/50 hover:text-forest tracking-[0.15em] uppercase transition-colors">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest/10">
                {['Ref', 'Product', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-sans text-sm text-deep-obsidian/30">
                    No orders yet. They&apos;ll appear here once customers check out.
                  </td>
                </tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} className="border-b border-forest/5 last:border-0 hover:bg-forest/5 transition-colors">
                  <td className="px-5 py-3 font-sans font-bold text-xs text-forest whitespace-nowrap">{o.order_ref}</td>
                  <td className="px-5 py-3 font-sans text-sm text-deep-obsidian max-w-[180px] truncate">{o.product_name}</td>
                  <td className="px-5 py-3 font-sans text-sm text-deep-obsidian/60 max-w-[160px] truncate">{o.customer_name || '—'}</td>
                  <td className="px-5 py-3 font-sans font-bold text-sm text-deep-obsidian whitespace-nowrap">{formatINR(o.amount_paise)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-sans font-bold text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-sans text-xs text-deep-obsidian/40 whitespace-nowrap">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200">
          <div className="px-6 py-4 border-b border-red-100">
            <h2 className="font-display text-red-700 text-xl uppercase tracking-tighter">⚠ Low Stock</h2>
          </div>
          <div className="divide-y divide-red-100">
            {lowStockProducts.map((p: { id: string; name: string; stock_count: number }) => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                <span className="font-sans font-bold text-sm text-red-800">{p.name}</span>
                <span className={`font-sans font-bold text-xs px-3 py-1 rounded-full ${p.stock_count === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.stock_count} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
