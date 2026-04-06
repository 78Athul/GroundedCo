'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

interface ProductRow {
  id: string
  name: string
  subtitle: string
  price: number
  image: string
  photos: string[]
  badge: string
  description: string
  material: string
  dimensions: string
  weight: string
  origin: string
  technique: string
  pile_height: string
  care_instructions: string[]
  features: string[]
  delivery_estimate: string
  delivery_shipping: string
  delivery_return: string
  stock_count: number
  low_stock_threshold: number
  is_visible: boolean
  sort_order: number
}

interface StockEntry {
  id: string
  product_id: string
  admin_email: string
  change_type: 'restock' | 'adjustment' | 'damage' | 'return' | 'sale'
  delta: number
  new_total: number
  notes: string
  created_at: string
}

const CHANGE_TYPE_CONFIG = {
  restock:    { label: 'Restock',    color: 'bg-green-100 text-green-700',  sign: '+' },
  adjustment: { label: 'Adjustment', color: 'bg-blue-100 text-blue-700',    sign: '±' },
  damage:     { label: 'Damage',     color: 'bg-red-100 text-red-700',      sign: '−' },
  return:     { label: 'Return',     color: 'bg-purple-100 text-purple-700',sign: '+' },
  sale:       { label: 'Sale',       color: 'bg-amber-100 text-amber-700',  sign: '−' },
}

// ─── Stock Ledger Modal ──────────────────────────────────────────────────────
function StockModal({
  product,
  onClose,
  onUpdated,
}: {
  product: ProductRow
  onClose: () => void
  onUpdated: () => void
}) {
  const supabase = createClient()
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [saving, setSaving] = useState(false)

  // form state
  const [changeType, setChangeType] = useState<StockEntry['change_type']>('restock')
  const [direction, setDirection] = useState<'add' | 'remove'>('add')
  const [delta, setDelta] = useState(1)
  const [notes, setNotes] = useState('')

  // auto-set sensible direction when type changes
  const handleTypeChange = (t: StockEntry['change_type']) => {
    setChangeType(t)
    if (t === 'damage' || t === 'sale') setDirection('remove')
    else if (t === 'restock' || t === 'return') setDirection('add')
    // adjustment keeps current direction
  }

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase
      .from('stock_entries')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setEntries((data as StockEntry[]) ?? [])
    setLoadingEntries(false)
  }, [supabase, product.id])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = async () => {
    if (delta === 0) return
    setSaving(true)

    const signedDelta = direction === 'remove' ? -Math.abs(delta) : Math.abs(delta)
    const newTotal = Math.max(0, product.stock_count + signedDelta)

    // Get current admin email
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = user?.email ?? 'unknown'

    // Insert stock entry
    const { error: entryErr } = await supabase.from('stock_entries').insert({
      product_id: product.id,
      admin_email: adminEmail,
      change_type: changeType,
      delta: signedDelta,
      new_total: newTotal,
      notes: notes.trim(),
    })

    if (entryErr) {
      alert('Failed to save entry: ' + entryErr.message)
      setSaving(false)
      return
    }

    // Update product stock_count
    await supabase
      .from('featured_products')
      .update({ stock_count: newTotal })
      .eq('id', product.id)

    // Update local product so the modal header reflects immediately
    product.stock_count = newTotal

    setNotes('')
    setDelta(1)
    setSaving(false)
    fetchEntries()
    onUpdated() // refresh parent list
  }

  const cfg = CHANGE_TYPE_CONFIG[changeType]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-cream shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-forest/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-forest/10">
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-forest text-xl uppercase tracking-tighter truncate">{product.name}</h2>
              <p className="font-sans text-forest/40 text-xs">Stock Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-forest/5 text-forest/50 hover:bg-forest/10 transition-colors font-sans text-sm"
          >
            ✕
          </button>
        </div>

        {/* Current stock bar */}
        <div className="flex items-center gap-6 px-6 py-4 bg-forest/5 border-b border-forest/10">
          <div>
            <p className="font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase mb-0.5">Current Stock</p>
            <p className={`font-display text-3xl uppercase tracking-tighter ${product.stock_count === 0 ? 'text-red-600' : product.stock_count <= product.low_stock_threshold ? 'text-amber-600' : 'text-forest'}`}>
              {product.stock_count}
            </p>
          </div>
          <div className="h-10 w-px bg-forest/10" />
          <div>
            <p className="font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase mb-0.5">Low Stock Alert</p>
            <p className="font-display text-forest text-2xl uppercase tracking-tighter">{product.low_stock_threshold}</p>
          </div>
          <div className="h-10 w-px bg-forest/10" />
          <div>
            <p className="font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase mb-0.5">Total Entries</p>
            <p className="font-display text-forest text-2xl uppercase tracking-tighter">{entries.length}</p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Add Entry Form ── */}
          <div className="px-6 py-5 border-b border-forest/10">
            <h3 className="font-display text-forest text-base uppercase tracking-tighter mb-4">Add Stock Entry</h3>

            {/* Direction toggle */}
            <div className="flex rounded-xl overflow-hidden border border-forest/15 mb-4">
              <button
                onClick={() => setDirection('add')}
                className={`flex-1 py-2.5 font-sans font-bold text-xs tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-1.5 ${
                  direction === 'add'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-forest/40 hover:text-forest/60'
                }`}
              >
                <span className="text-base leading-none">+</span> Add Stock
              </button>
              <button
                onClick={() => setDirection('remove')}
                className={`flex-1 py-2.5 font-sans font-bold text-xs tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-1.5 ${
                  direction === 'remove'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-forest/40 hover:text-forest/60'
                }`}
              >
                <span className="text-base leading-none">−</span> Remove Stock
              </button>
            </div>

            {/* Reason pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(CHANGE_TYPE_CONFIG) as StockEntry['change_type'][]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`font-sans font-bold text-xs px-3 py-1.5 rounded-full border transition-all ${
                    changeType === t
                      ? `${CHANGE_TYPE_CONFIG[t].color} border-transparent`
                      : 'bg-white border-forest/15 text-forest/50 hover:border-forest/30'
                  }`}
                >
                  {CHANGE_TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Quantity */}
              <div>
                <label className="block font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase mb-1.5">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDelta(Math.max(1, delta - 1))}
                    className="w-8 h-9 bg-forest/10 text-forest rounded-lg font-bold text-lg flex items-center justify-center hover:bg-forest/20 transition-colors shrink-0"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    value={delta}
                    onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center bg-white border border-forest/15 text-forest rounded-lg px-2 py-2 font-sans font-bold text-sm focus:outline-none focus:border-sage transition-colors"
                  />
                  <button
                    onClick={() => setDelta(delta + 1)}
                    className="w-8 h-9 bg-forest/10 text-forest rounded-lg font-bold text-lg flex items-center justify-center hover:bg-forest/20 transition-colors shrink-0"
                  >+</button>
                </div>
              </div>

              {/* Preview new total */}
              <div>
                <label className="block font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase mb-1.5">New Total</label>
                <div className={`h-9 flex items-center px-3 rounded-lg border ${
                  direction === 'remove' ? 'bg-red-50 border-red-200' : 'bg-white border-forest/10'
                }`}>
                  <span className={`font-sans font-bold text-sm ${
                    direction === 'remove' ? 'text-red-600' : 'text-forest'
                  }`}>
                    {direction === 'remove'
                      ? Math.max(0, product.stock_count - delta)
                      : product.stock_count + delta}
                  </span>
                  <span className="font-sans text-forest/30 text-xs ml-1">units</span>
                  {direction === 'remove' && product.stock_count - delta < 0 && (
                    <span className="ml-auto font-sans text-red-400 text-xs">floors at 0</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="block font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase mb-1.5">Notes</label>
              <input
                type="text"
                placeholder="e.g. Supplier delivery, damaged in transit…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-forest/15 text-forest rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:border-sage transition-colors placeholder:text-forest/25"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || delta === 0}
              className={`w-full font-sans font-bold text-xs tracking-[0.2em] uppercase py-3 rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                direction === 'remove'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-forest text-cream hover:bg-sage hover:text-forest'
              }`}
            >
              {saving
                ? 'Saving…'
                : direction === 'remove'
                  ? `Remove ${delta} — ${CHANGE_TYPE_CONFIG[changeType].label}`
                  : `Add ${delta} — ${CHANGE_TYPE_CONFIG[changeType].label}`
              }
            </button>
          </div>

          {/* ── History ── */}
          <div className="px-6 py-5">
            <h3 className="font-display text-forest text-base uppercase tracking-tighter mb-4">History</h3>
            {loadingEntries ? (
              <p className="font-sans text-forest/40 text-sm">Loading…</p>
            ) : entries.length === 0 ? (
              <p className="font-sans text-forest/30 text-sm italic">No entries yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {entries.map((e) => {
                  const typeCfg = CHANGE_TYPE_CONFIG[e.change_type]
                  const dateStr = new Date(e.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true,
                  })
                  return (
                    <div key={e.id} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-forest/8">
                      {/* Delta badge */}
                      <div className={`shrink-0 inline-flex font-sans font-bold text-xs px-2 py-1 rounded-full mt-0.5 ${typeCfg.color}`}>
                        {e.delta > 0 ? `+${e.delta}` : e.delta}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-sans font-bold text-xs px-2 py-0.5 rounded-md ${typeCfg.color}`}>
                            {typeCfg.label}
                          </span>
                          <span className="font-sans text-forest text-xs font-bold">→ {e.new_total} units</span>
                        </div>
                        {e.notes && (
                          <p className="font-sans text-forest/60 text-xs mt-1 truncate">{e.notes}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-sans text-forest/30 text-xs">👤 {e.admin_email}</span>
                          <span className="font-sans text-forest/20 text-xs">·</span>
                          <span className="font-sans text-forest/30 text-xs">{dateStr}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [stockProduct, setStockProduct] = useState<ProductRow | null>(null)
  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from('featured_products')
      .select('*')
      .order('sort_order', { ascending: true })
    setProducts(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const toggleVisibility = async (p: ProductRow) => {
    await supabase.from('featured_products').update({ is_visible: !p.is_visible }).eq('id', p.id)
    fetchProducts()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Remove this product permanently?')) return
    await supabase.from('featured_products').delete().eq('id', id)
    fetchProducts()
  }

  const saveProduct = async (p: ProductRow) => {
    const { id, ...rest } = p
    try {
      if (id) {
        const { error } = await supabase.from('featured_products').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('featured_products').insert(rest)
        if (error) throw error
      }
      setEditing(null)
      fetchProducts()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      console.error('Save failed:', error)
      alert('Failed to save product: ' + error.message)
    }
  }

  const newProduct = (): ProductRow => ({
    id: '',
    name: '',
    subtitle: '',
    price: 0,
    image: '',
    photos: [],
    badge: '',
    description: '',
    material: '',
    dimensions: '',
    weight: '',
    origin: '',
    technique: '',
    pile_height: '',
    care_instructions: [],
    features: [],
    delivery_estimate: '',
    delivery_shipping: '',
    delivery_return: '',
    stock_count: 0,
    low_stock_threshold: 5,
    is_visible: true,
    sort_order: products.length + 1,
  })

  const stockColor = (count: number, threshold: number) => {
    if (count === 0) return 'bg-red-100 text-red-700'
    if (count <= threshold) return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  if (loading) return <div className="font-sans text-forest/50 text-sm">Loading…</div>

  // ─── Edit View ─────────────────────────
  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="font-sans text-forest/50 text-sm mb-6 hover:text-forest transition-colors">
          ← Back to list
        </button>
        <h1 className="font-display text-forest text-3xl uppercase tracking-tighter mb-8">
          {editing.id ? 'Edit Product' : 'New Product'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: image + inventory */}
          <div className="space-y-6">
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Product Image (4:3)</label>
              <ImageUpload currentUrl={editing.image} onUpload={(url) => setEditing({ ...editing, image: url })} folder="featured" aspect={4/3} />
            </div>

            {/* Gallery Photos */}
            <div className="bg-cream rounded-2xl border border-forest/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-forest text-lg uppercase tracking-tighter">Gallery Photos</h3>
                <span className="font-sans text-forest/30 text-xs">{editing.photos.length} photo{editing.photos.length !== 1 ? 's' : ''}</span>
              </div>

              {editing.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {editing.photos.map((url, i) => (
                    <div key={url + i} className="relative group aspect-square overflow-hidden rounded-lg border border-forest/10">
                      <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="120px" />
                      <button
                        onClick={() => setEditing({ ...editing, photos: editing.photos.filter((_, idx) => idx !== i) })}
                        className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center font-sans font-bold text-xs"
                        aria-label={`Remove photo ${i + 1}`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">+ Add Photo (1:1)</label>
                <ImageUpload
                  currentUrl=""
                  onUpload={(url) => setEditing({ ...editing, photos: [...editing.photos, url] })}
                  folder="featured"
                  resetAfterUpload
                  aspect={1}
                />
              </div>
            </div>

            <div className="bg-cream rounded-2xl border border-forest/10 p-6 space-y-4">
              <h3 className="font-display text-forest text-lg uppercase tracking-tighter">Inventory</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Stock Count</label>
                  <input
                    type="number" min={0}
                    value={editing.stock_count}
                    onChange={(e) => setEditing({ ...editing, stock_count: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Low Stock Alert</label>
                  <input
                    type="number" min={0}
                    value={editing.low_stock_threshold}
                    onChange={(e) => setEditing({ ...editing, low_stock_threshold: parseInt(e.target.value) || 5 })}
                    className="w-full bg-white border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: fields */}
          <div className="space-y-5">
            {/* Product ID */}
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Product ID</label>
              {editing.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editing.id}
                    readOnly
                    className="flex-1 bg-forest/5 border border-forest/10 text-forest/60 rounded-xl px-4 py-3 font-mono text-xs focus:outline-none cursor-default"
                  />
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(editing.id); }}
                    className="shrink-0 bg-forest/5 border border-forest/10 text-forest/50 rounded-xl px-3 py-3 font-sans text-xs hover:bg-forest/10 transition-colors"
                    title="Copy ID"
                  >📋</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={editing.id}
                    onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                    placeholder="Leave blank for auto-generated UUID"
                    className="w-full bg-cream border border-forest/10 text-forest rounded-xl px-4 py-3 font-mono text-xs focus:outline-none focus:border-sage transition-colors placeholder:text-forest/25"
                  />
                  <p className="font-sans text-forest/30 text-xs mt-1">Custom IDs create clean checkout URLs, e.g. <code className="text-forest/50">fp-maya</code> → <code className="text-forest/50">/checkout/fp-maya</code></p>
                </>
              )}
            </div>
            <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="Subtitle" value={editing.subtitle} onChange={(v) => setEditing({ ...editing, subtitle: v })} placeholder="e.g. 200 × 300 cm · Pure New Wool" />
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Price (₹)</label>
              <input
                type="number" min={0}
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: parseInt(e.target.value) || 0 })}
                className="w-full bg-cream border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors"
              />
            </div>
            <Field label="Badge" value={editing.badge} onChange={(v) => setEditing({ ...editing, badge: v })} placeholder="e.g. Best Seller, New Arrival" />
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Description</label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={4}
                className="w-full bg-cream border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors resize-none"
              />
            </div>
            <Field label="Material" value={editing.material} onChange={(v) => setEditing({ ...editing, material: v })} />
            <Field label="Dimensions" value={editing.dimensions} onChange={(v) => setEditing({ ...editing, dimensions: v })} />
            <Field label="Weight" value={editing.weight} onChange={(v) => setEditing({ ...editing, weight: v })} />
            <Field label="Origin" value={editing.origin} onChange={(v) => setEditing({ ...editing, origin: v })} />
            <Field label="Technique" value={editing.technique} onChange={(v) => setEditing({ ...editing, technique: v })} />
            <Field label="Pile Height" value={editing.pile_height} onChange={(v) => setEditing({ ...editing, pile_height: v })} />
            <Field label="Delivery Estimate" value={editing.delivery_estimate} onChange={(v) => setEditing({ ...editing, delivery_estimate: v })} />
            <Field label="Shipping" value={editing.delivery_shipping} onChange={(v) => setEditing({ ...editing, delivery_shipping: v })} />
            <Field label="Return Policy" value={editing.delivery_return} onChange={(v) => setEditing({ ...editing, delivery_return: v })} />
            <Field label="Sort Order" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })} />

            <button
              onClick={() => saveProduct(editing)}
              className="w-full bg-forest text-cream font-sans font-bold text-xs tracking-[0.2em] uppercase py-4 rounded-xl hover:bg-sage hover:text-forest transition-colors duration-300 mt-4"
            >
              {editing.id ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── List View ─────────────────────────
  return (
    <>
      {/* Stock ledger modal */}
      {stockProduct && (
        <StockModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
          onUpdated={fetchProducts}
        />
      )}

      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Products</h1>
            <p className="font-sans text-forest/50 text-sm tracking-wide mt-1">Manage featured products, pricing, and inventory.</p>
          </div>
          <button
            onClick={() => setEditing(newProduct())}
            className="bg-forest text-cream font-sans font-bold text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-xl hover:bg-sage hover:text-forest transition-colors shrink-0"
          >
            + Add New
          </button>
        </div>

        <div className="bg-cream rounded-2xl border border-forest/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest/10">
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Product</th>
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Price</th>
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">
                    Stock
                    <span className="ml-1 font-normal text-forest/25 normal-case tracking-normal">click to manage</span>
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Status</th>
                  <th className="text-right px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-forest/5 last:border-0">
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans text-forest text-sm font-bold truncate">{p.name}</p>
                          <p className="font-sans text-forest/40 text-xs truncate">{p.subtitle}</p>
                          <p className="font-mono text-forest/25 text-[10px] truncate mt-0.5">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 font-sans text-forest text-sm font-bold whitespace-nowrap">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-3 sm:px-6 py-3">
                      <button
                        onClick={() => setStockProduct(p)}
                        title="Click to manage stock & view history"
                        className={`inline-flex items-center gap-1.5 font-sans font-bold text-xs px-2.5 py-1.5 rounded-full transition-all hover:ring-2 hover:ring-forest/30 cursor-pointer ${stockColor(p.stock_count, p.low_stock_threshold)}`}
                      >
                        {p.stock_count}
                        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className={`inline-flex font-sans font-bold text-xs px-2 py-1 rounded-full ${p.is_visible ? 'bg-green-100 text-green-700' : 'bg-forest/10 text-forest/40'}`}>
                        {p.is_visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button onClick={() => setEditing(p)} className="bg-forest/5 text-forest font-sans font-bold text-xs px-2 sm:px-3 py-2 rounded-lg hover:bg-forest/10 transition-colors">Edit</button>
                        <button onClick={() => toggleVisibility(p)} className="bg-forest/5 text-forest font-sans font-bold text-xs px-2 sm:px-3 py-2 rounded-lg hover:bg-forest/10 transition-colors">
                          {p.is_visible ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="bg-red-50 text-red-600 font-sans font-bold text-xs px-2 sm:px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-cream border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors"
      />
    </div>
  )
}
