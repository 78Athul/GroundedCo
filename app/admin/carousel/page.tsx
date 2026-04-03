'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

interface CarouselRow {
  id: string
  name: string
  carousel_image: string
  studio_image: string
  ugc_image: string
  review_author: string
  review_rating: number
  review_text: string
  review_date: string
  sort_order: number
  is_visible: boolean
}

export default function AdminCarouselPage() {
  const [items, setItems] = useState<CarouselRow[]>([])
  const [editing, setEditing] = useState<CarouselRow | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchItems = async () => {
    const { data } = await supabase
      .from('carousel_products')
      .select('*')
      .order('sort_order', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      const { data } = await supabase
        .from('carousel_products')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!active) return
      setItems(data ?? [])
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [supabase])

  const toggleVisibility = async (item: CarouselRow) => {
    await supabase.from('carousel_products').update({ is_visible: !item.is_visible }).eq('id', item.id)
    fetchItems()
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    await supabase.from('carousel_products').delete().eq('id', id)
    fetchItems()
  }

  const saveItem = async (item: CarouselRow) => {
    const { id, ...rest } = item
    if (id) {
      await supabase.from('carousel_products').update(rest).eq('id', id)
    } else {
      await supabase.from('carousel_products').insert(rest)
    }
    setEditing(null)
    fetchItems()
  }

  const newItem = (): CarouselRow => ({
    id: '',
    name: '',
    carousel_image: '',
    studio_image: '',
    ugc_image: '',
    review_author: '',
    review_rating: 5,
    review_text: '',
    review_date: '',
    sort_order: items.length + 1,
    is_visible: true,
  })

  if (loading) return <div className="font-sans text-forest/50 text-sm">Loading…</div>

  // ─── Edit Modal ────────────────────────
  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="font-sans text-forest/50 text-sm mb-6 hover:text-forest transition-colors">
          ← Back to list
        </button>
        <h1 className="font-display text-forest text-3xl uppercase tracking-tighter mb-8">
          {editing.id ? 'Edit Carousel Item' : 'New Carousel Item'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-6">
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Carousel Image</label>
              <ImageUpload currentUrl={editing.carousel_image} onUpload={(url) => setEditing({ ...editing, carousel_image: url })} folder="carousel" />
            </div>
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Studio Image</label>
              <ImageUpload currentUrl={editing.studio_image} onUpload={(url) => setEditing({ ...editing, studio_image: url })} folder="carousel" />
            </div>
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Customer / UGC Image</label>
              <ImageUpload currentUrl={editing.ugc_image} onUpload={(url) => setEditing({ ...editing, ugc_image: url })} folder="carousel" />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="Review Author" value={editing.review_author} onChange={(v) => setEditing({ ...editing, review_author: v })} />
            <Field label="Review Date" value={editing.review_date} onChange={(v) => setEditing({ ...editing, review_date: v })} placeholder="e.g. March 2025" />
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Rating (1-5)</label>
              <input
                type="number" min={1} max={5}
                value={editing.review_rating}
                onChange={(e) => setEditing({ ...editing, review_rating: parseInt(e.target.value) || 5 })}
                className="w-full bg-cream border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="block font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase mb-2">Review Text</label>
              <textarea
                value={editing.review_text}
                onChange={(e) => setEditing({ ...editing, review_text: e.target.value })}
                rows={4}
                className="w-full bg-cream border border-forest/10 text-forest rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-sage transition-colors resize-none"
              />
            </div>
            <Field label="Sort Order" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })} />

            <button
              onClick={() => saveItem(editing)}
              className="w-full bg-forest text-cream font-sans font-bold text-xs tracking-[0.2em] uppercase py-4 rounded-xl hover:bg-sage hover:text-forest transition-colors duration-300"
            >
              {editing.id ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── List View ─────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Carousel</h1>
          <p className="font-sans text-forest/50 text-sm tracking-wide mt-1">
            Manage the homepage gallery. Drag to reorder, toggle visibility, or edit images.
          </p>
        </div>
        <button
          onClick={() => setEditing(newItem())}
          className="bg-forest text-cream font-sans font-bold text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-xl hover:bg-sage hover:text-forest transition-colors"
        >
          + Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className={`bg-cream rounded-2xl border border-forest/10 overflow-hidden transition-opacity ${!item.is_visible ? 'opacity-50' : ''}`}>
            <div className="relative aspect-[3/2]">
              <Image src={item.carousel_image} alt={item.name} fill className="object-cover" sizes="300px" />
              {!item.is_visible && (
                <div className="absolute top-3 left-3 bg-red-500/80 text-white font-sans font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Hidden</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-display text-forest text-xl uppercase tracking-tighter mb-1">{item.name}</h3>
              <p className="font-sans text-forest/40 text-xs mb-4">Order: {item.sort_order} · ★ {item.review_rating}</p>
              <div className="flex gap-2">
                <button onClick={() => setEditing(item)} className="flex-1 bg-forest/5 text-forest font-sans font-bold text-xs tracking-wider uppercase py-2 rounded-lg hover:bg-forest/10 transition-colors">
                  Edit
                </button>
                <button onClick={() => toggleVisibility(item)} className="flex-1 bg-forest/5 text-forest font-sans font-bold text-xs tracking-wider uppercase py-2 rounded-lg hover:bg-forest/10 transition-colors">
                  {item.is_visible ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => deleteItem(item.id)} className="bg-red-50 text-red-600 font-sans font-bold text-xs px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple field helper
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
