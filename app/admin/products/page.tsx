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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from('featured_products')
      .select('*')
      .order('sort_order', { ascending: true })
    setProducts(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchProducts() }, [fetchProducts])

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
    if (id) {
      await supabase.from('featured_products').update(rest).eq('id', id)
    } else {
      await supabase.from('featured_products').insert(rest)
    }
    setEditing(null)
    fetchProducts()
  }

  const newProduct = (): ProductRow => ({
    id: '',
    name: '',
    subtitle: '',
    price: 0,
    image: '',
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
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Product Image</label>
              <ImageUpload currentUrl={editing.image} onUpload={(url) => setEditing({ ...editing, image: url })} folder="featured" />
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
                <th className="text-left px-3 sm:px-6 py-3 font-sans font-bold text-forest/40 text-xs tracking-[0.15em] uppercase">Stock</th>
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
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 font-sans text-forest text-sm font-bold whitespace-nowrap">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="px-3 sm:px-6 py-3">
                    <span className={`inline-flex font-sans font-bold text-xs px-2 py-1 rounded-full ${stockColor(p.stock_count, p.low_stock_threshold)}`}>
                      {p.stock_count}
                    </span>
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
