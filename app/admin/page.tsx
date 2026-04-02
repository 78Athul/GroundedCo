import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createServerClient()

  // Fetch counts in parallel
  const [carouselRes, featuredRes, profilesRes, lowStockRes] = await Promise.all([
    supabase.from('carousel_products').select('id', { count: 'exact', head: true }),
    supabase.from('featured_products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('featured_products').select('id, name, stock_count, low_stock_threshold').lte('stock_count', 5),
  ])

  const stats = [
    { label: 'Carousel Items',    value: carouselRes.count ?? 0, color: 'bg-sage/20 text-forest' },
    { label: 'Featured Products', value: featuredRes.count ?? 0, color: 'bg-moss/20 text-forest' },
    { label: 'Registered Users',  value: profilesRes.count ?? 0, color: 'bg-olive/40 text-forest' },
    { label: 'Low Stock Alerts',  value: lowStockRes.data?.length ?? 0, color: lowStockRes.data?.length ? 'bg-red-100 text-red-700' : 'bg-sage/20 text-forest' },
  ]

  const lowStockProducts = lowStockRes.data ?? []

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Dashboard</h1>
        <p className="font-sans text-forest/50 text-sm tracking-wide mt-1">
          Overview of your store at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl p-6 ${stat.color}`}
          >
            <p className="font-sans font-bold text-xs tracking-[0.15em] uppercase opacity-60 mb-2">{stat.label}</p>
            <p className="font-display text-4xl tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-cream rounded-2xl border border-forest/10">
          <div className="px-4 sm:px-6 py-4 border-b border-forest/10">
            <h2 className="font-display text-forest text-xl uppercase tracking-tighter">⚠ Low Stock Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest/10">
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Product</th>
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Stock</th>
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-b border-forest/5 last:border-0">
                    <td className="px-3 sm:px-6 py-3 font-sans text-forest text-sm font-bold">{p.name}</td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className={`inline-flex font-sans font-bold text-xs px-3 py-1 rounded-full ${
                        p.stock_count === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.stock_count} left
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 font-sans text-forest/50 text-sm">{p.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
