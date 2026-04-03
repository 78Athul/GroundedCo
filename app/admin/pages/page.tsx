'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'contact' | 'privacy' | 'shipping'

interface ContactSettings {
  brand_name: string
  tagline: string
  email: string
  whatsapp: string
  location: string
  story_text: string
}

interface SitePage {
  slug: string
  title: string
  content: string
}

const CONTACT_DEFAULTS: ContactSettings = {
  brand_name: '',
  tagline: '',
  email: '',
  whatsapp: '',
  location: '',
  story_text: '',
}

const PAGE_DEFAULTS: SitePage = { slug: '', title: '', content: '' }

export default function AdminPagesPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('contact')
  const [contact, setContact] = useState<ContactSettings>(CONTACT_DEFAULTS)
  const [privacy, setPrivacy] = useState<SitePage>({ ...PAGE_DEFAULTS, slug: 'privacy', title: 'Privacy Policy' })
  const [shipping, setShipping] = useState<SitePage>({ ...PAGE_DEFAULTS, slug: 'shipping', title: 'Shipping & Delivery' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('contact_settings').select('*').limit(1).single()
      .then(({ data }) => { if (data) setContact(data) })

    supabase.from('site_pages').select('*').in('slug', ['privacy', 'shipping'])
      .then(({ data }) => {
        if (!data) return
        const p = data.find((r) => r.slug === 'privacy')
        const s = data.find((r) => r.slug === 'shipping')
        if (p) setPrivacy(p)
        if (s) setShipping(s)
      })
  }, [])

  const saveContact = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('contact_settings')
      .upsert(contact, { onConflict: 'brand_name' })
    setSaving(false)
    if (!error) flash()
  }

  const savePage = async (page: SitePage) => {
    setSaving(true)
    const { error } = await supabase
      .from('site_pages')
      .upsert({ ...page, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
    setSaving(false)
    if (!error) flash()
  }

  const flash = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contact', label: 'Contact' },
    { key: 'privacy', label: 'Privacy' },
    { key: 'shipping', label: 'Shipping' },
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tighter text-forest">Pages</h1>
        <p className="font-sans text-forest/50 text-sm mt-1">Edit content shown on the Contact, Privacy, and Shipping pages.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-forest/10 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-xs font-sans font-bold tracking-[0.15em] uppercase transition-colors duration-200 ${
              tab === t.key ? 'bg-forest text-cream' : 'text-forest/50 hover:text-forest'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contact tab */}
      {tab === 'contact' && (
        <div className="space-y-5">
          {(
            [
              { key: 'brand_name', label: 'Brand Name' },
              { key: 'tagline',    label: 'Tagline' },
              { key: 'email',      label: 'Email' },
              { key: 'whatsapp',   label: 'WhatsApp Number' },
              { key: 'location',   label: 'Location' },
            ] as { key: keyof ContactSettings; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="font-sans font-bold text-forest/60 text-xs tracking-[0.15em] uppercase">{label}</label>
              <input
                type="text"
                value={contact[key]}
                onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
                className="w-full bg-cream/70 border border-forest/20 rounded-xl px-4 py-3 text-sm font-sans text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/50 focus:bg-cream transition-colors"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="font-sans font-bold text-forest/60 text-xs tracking-[0.15em] uppercase">Our Story</label>
            <textarea
              rows={6}
              value={contact.story_text}
              onChange={(e) => setContact({ ...contact, story_text: e.target.value })}
              className="w-full bg-cream/70 border border-forest/20 rounded-xl px-4 py-3 text-sm font-sans text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/50 focus:bg-cream transition-colors resize-none"
            />
          </div>

          <SaveButton onClick={saveContact} saving={saving} saved={saved} />
        </div>
      )}

      {/* Privacy tab */}
      {tab === 'privacy' && (
        <PageEditor page={privacy} onChange={setPrivacy} saving={saving} saved={saved} onSave={() => savePage(privacy)} />
      )}

      {/* Shipping tab */}
      {tab === 'shipping' && (
        <PageEditor page={shipping} onChange={setShipping} saving={saving} saved={saved} onSave={() => savePage(shipping)} />
      )}
    </div>
  )
}

function PageEditor({
  page,
  onChange,
  saving,
  saved,
  onSave,
}: {
  page: SitePage
  onChange: (p: SitePage) => void
  saving: boolean
  saved: boolean
  onSave: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="font-sans font-bold text-forest/60 text-xs tracking-[0.15em] uppercase">Page Title</label>
        <input
          type="text"
          value={page.title}
          onChange={(e) => onChange({ ...page, title: e.target.value })}
          className="w-full bg-cream/70 border border-forest/20 rounded-xl px-4 py-3 text-sm font-sans text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/50 focus:bg-cream transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-sans font-bold text-forest/60 text-xs tracking-[0.15em] uppercase">Content</label>
        <p className="font-sans text-forest/40 text-xs">Use # or ## for headings. Leave blank lines between paragraphs.</p>
        <textarea
          rows={16}
          value={page.content}
          onChange={(e) => onChange({ ...page, content: e.target.value })}
          className="w-full bg-cream/70 border border-forest/20 rounded-xl px-4 py-3 text-sm font-sans text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/50 focus:bg-cream transition-colors resize-none font-mono"
        />
      </div>

      <SaveButton onClick={onSave} saving={saving} saved={saved} />
    </div>
  )
}

function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-6 py-2.5 rounded-xl bg-forest text-cream text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-200 hover:bg-forest/80 disabled:opacity-50"
    >
      {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
    </button>
  )
}
