'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
  razorpay_order_id: string
  razorpay_payment_id: string
  product_name: string
  quantity: number
  amount_paise: number
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  address_line1: string
  address_line2: string
  address_city: string
  address_state: string
  address_pincode: string
  notes: string
  created_at: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || [
      o.order_ref, o.customer_name, o.customer_email, o.product_name
    ].some(f => f?.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  async function updateStatus(order: Order, status: string) {
    setUpdating(order.id)
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', order.id)
    await fetchOrders()
    if (selected?.id === order.id) setSelected({ ...order, status })
    setUpdating(null)
  }

  const addressParts = (o: Order) => [
    o.address_line1, o.address_line2, o.address_city, o.address_state, o.address_pincode
  ].filter(Boolean).join(', ')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Orders</h1>
          <p className="font-sans text-forest/50 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="font-sans text-xs font-bold tracking-[0.15em] uppercase px-4 py-2 border border-forest/20 text-forest hover:bg-forest hover:text-cream transition-colors rounded-lg"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, order ref…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 font-sans text-sm px-4 py-2.5 border border-forest/20 rounded-xl focus:outline-none focus:border-forest bg-cream text-deep-obsidian placeholder:text-deep-obsidian/30"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="font-sans text-sm px-4 py-2.5 border border-forest/20 rounded-xl focus:outline-none focus:border-forest bg-cream text-deep-obsidian"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-cream rounded-2xl border border-forest/10 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center font-sans text-sm text-deep-obsidian/30">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center font-sans text-sm text-deep-obsidian/30">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest/10">
                  {['Ref', 'Product', 'Customer', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-forest/5 last:border-0 hover:bg-forest/5 transition-colors">
                    <td className="px-5 py-3 font-sans font-bold text-xs text-forest whitespace-nowrap">{o.order_ref}</td>
                    <td className="px-5 py-3 font-sans text-sm text-deep-obsidian max-w-[160px] truncate">{o.product_name}</td>
                    <td className="px-5 py-3 max-w-[160px]">
                      <p className="font-sans text-sm text-deep-obsidian truncate">{o.customer_name || '—'}</p>
                      <p className="font-sans text-xs text-deep-obsidian/40 truncate">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 font-sans font-bold text-sm text-deep-obsidian whitespace-nowrap">{formatINR(o.amount_paise)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-sans font-bold text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-sans text-xs text-deep-obsidian/40 whitespace-nowrap">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="font-sans text-xs font-bold text-forest hover:underline whitespace-nowrap"
                        >
                          Details
                        </button>
                        <a
                          href={`/api/admin/invoice/${o.order_ref}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-xs font-bold text-muted-earth hover:underline whitespace-nowrap"
                        >
                          Invoice
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="w-full max-w-md bg-wool-white h-full overflow-y-auto shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="sticky top-0 bg-wool-white border-b border-deep-obsidian/10 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-forest">{selected.order_ref}</p>
                <p className="font-display text-2xl uppercase tracking-tighter text-deep-obsidian mt-0.5">Order Detail</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center text-deep-obsidian/40 hover:text-deep-obsidian">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Status + change */}
              <div>
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Status</p>
                <div className="flex items-center gap-3">
                  <span className={`font-sans font-bold text-xs px-3 py-1.5 rounded-full ${STATUS_COLORS[selected.status] ?? ''}`}>
                    {selected.status}
                  </span>
                  {selected.status === 'paid' && (
                    <button
                      disabled={!!updating}
                      onClick={() => updateStatus(selected, 'refunded')}
                      className="font-sans text-xs font-bold text-red-500 hover:underline disabled:opacity-40"
                    >
                      Mark Refunded
                    </button>
                  )}
                  {selected.status === 'pending' && (
                    <button
                      disabled={!!updating}
                      onClick={() => updateStatus(selected, 'failed')}
                      className="font-sans text-xs font-bold text-red-500 hover:underline disabled:opacity-40"
                    >
                      Mark Failed
                    </button>
                  )}
                </div>
              </div>

              {/* Product */}
              <div className="bg-cream rounded-xl p-4 border border-forest/10 space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40">Product</p>
                <p className="font-sans font-bold text-sm text-deep-obsidian">{selected.product_name}</p>
                <p className="font-sans text-xs text-deep-obsidian/50">Qty: {selected.quantity}</p>
                <p className="font-sans font-bold text-sm text-forest">{formatINR(selected.amount_paise)}</p>
              </div>

              {/* Customer */}
              <div className="bg-cream rounded-xl p-4 border border-forest/10 space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Customer</p>
                <p className="font-sans font-bold text-sm text-deep-obsidian">{selected.customer_name || '—'}</p>
                <p className="font-sans text-sm text-deep-obsidian/70">{selected.customer_email}</p>
                <p className="font-sans text-sm text-deep-obsidian/70">{selected.customer_phone}</p>
              </div>

              {/* Address */}
              <div className="bg-cream rounded-xl p-4 border border-forest/10">
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Shipping Address</p>
                <p className="font-sans text-sm text-deep-obsidian">{addressParts(selected) || '—'}</p>
                {selected.notes && (
                  <p className="font-sans text-xs text-muted-earth mt-2 italic">Note: {selected.notes}</p>
                )}
              </div>

              {/* Payment IDs */}
              <div className="bg-cream rounded-xl p-4 border border-forest/10 space-y-2">
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40">Payment Info</p>
                <div>
                  <p className="font-sans text-xs text-deep-obsidian/40">Razorpay Order ID</p>
                  <p className="font-mono text-xs text-deep-obsidian break-all">{selected.razorpay_order_id}</p>
                </div>
                {selected.razorpay_payment_id && (
                  <div>
                    <p className="font-sans text-xs text-deep-obsidian/40">Razorpay Payment ID</p>
                    <p className="font-mono text-xs text-deep-obsidian break-all">{selected.razorpay_payment_id}</p>
                  </div>
                )}
                <p className="font-sans text-xs text-deep-obsidian/30">{formatDate(selected.created_at)}</p>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="sticky bottom-0 bg-wool-white border-t border-deep-obsidian/10 px-6 py-4">
              <a
                href={`/api/admin/invoice/${selected.order_ref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center font-sans text-xs font-bold tracking-[0.2em] uppercase bg-forest text-cream px-6 py-3 hover:bg-deep-obsidian transition-colors duration-200"
              >
                Download / Print Invoice
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
