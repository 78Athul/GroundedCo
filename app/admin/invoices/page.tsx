'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice {{order_ref}} — {{business_name}}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; color: #1a1714; background: #fff; padding: 48px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #01472e; padding-bottom: 32px; }
  .brand { font-size: 28px; font-weight: 700; color: #01472e; letter-spacing: -0.04em; text-transform: uppercase; }
  .brand-sub { font-size: 11px; color: #7d5a3c; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 4px; }
  .invoice-meta { text-align: right; }
  .invoice-title { font-size: 13px; font-weight: 700; color: #01472e; text-transform: uppercase; letter-spacing: 0.15em; }
  .invoice-ref { font-size: 22px; font-weight: 700; color: #1a1714; margin-top: 4px; }
  .invoice-date { font-size: 12px; color: #7d5a3c; margin-top: 4px; }
  .section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
  .box-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #7d5a3c; margin-bottom: 12px; }
  .box-content p { font-size: 13px; line-height: 1.7; color: #1a1714; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .items-table th { text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #7d5a3c; padding: 12px 16px; border-bottom: 1px solid #e9edc9; }
  .items-table td { padding: 16px; font-size: 13px; border-bottom: 1px solid #f7f3ec; }
  .total-row td { font-weight: 700; font-size: 15px; color: #01472e; border-top: 2px solid #01472e; border-bottom: none; padding-top: 20px; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e9edc9; text-align: center; font-size: 12px; color: #7d5a3c; }
  @media print { body { padding: 24px; } @page { margin: 16mm; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">{{business_name}}</div>
      <div class="brand-sub">Tax Invoice</div>
      {{#gstin}}<div style="font-size:11px;color:#7d5a3c;margin-top:4px;">GSTIN: {{gstin}}</div>{{/gstin}}
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-ref">{{order_ref}}</div>
      <div class="invoice-date">{{date}}</div>
    </div>
  </div>
  <div class="section">
    <div class="box-content">
      <div class="box-label">Billed To</div>
      <p><strong>{{customer_name}}</strong></p>
      <p>{{customer_email}}</p>
      <p>{{customer_phone}}</p>
    </div>
    <div class="box-content">
      <div class="box-label">Shipping Address</div>
      <p>{{address}}</p>
    </div>
  </div>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:50%">Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{product_name}}</td>
        <td style="text-align:center">{{quantity}}</td>
        <td style="text-align:right">{{unit_price}}</td>
        <td style="text-align:right">{{amount}}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">Amount Paid</td>
        <td style="text-align:right">{{amount}}</td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">
    <p>{{footer_note}}</p>
    {{#business_address}}<p style="margin-top:8px;font-size:11px;">{{business_address}}</p>{{/business_address}}
  </div>
</body>
</html>`

const SAMPLE_DATA: Record<string, string> = {
  order_ref: 'GRD-K4X7MN',
  date: '6 April 2025',
  customer_name: 'Arjun Kumar',
  customer_email: 'arjun@example.com',
  customer_phone: '+91 98765 43210',
  address: '12, MG Road, Kozhikode, Kerala — 673001',
  product_name: 'Atlas Hand-Knotted Rug',
  quantity: '1',
  unit_price: '₹24,999',
  amount: '₹24,999',
}

function renderPreview(template: string, settings: { business_name: string; business_address: string; gstin: string; footer_note: string }) {
  const vars = { ...SAMPLE_DATA, ...settings }
  let result = template
  for (const [k, v] of Object.entries(vars)) {
    result = result.replaceAll(`{{${k}}}`, v)
  }
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => vars[key as keyof typeof vars] ? inner : '')
  return result
}

const TOKEN_LIST = [
  '{{order_ref}}','{{date}}','{{customer_name}}','{{customer_email}}','{{customer_phone}}',
  '{{address}}','{{product_name}}','{{quantity}}','{{unit_price}}','{{amount}}',
  '{{business_name}}','{{business_address}}','{{gstin}}','{{footer_note}}',
  '{{#gstin}}…{{/gstin}} (conditional)','{{#business_address}}…{{/business_address}} (conditional)',
]

export default function AdminInvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [templateHtml, setTemplateHtml] = useState(DEFAULT_TEMPLATE)
  const [businessName, setBusinessName] = useState('Grounded')
  const [businessAddress, setBusinessAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [footerNote, setFooterNote] = useState('Thank you for your purchase.')
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('invoice_settings').select('*').limit(1).single()
      if (data) {
        setSettingsId(data.id)
        if (data.template_html) setTemplateHtml(data.template_html)
        if (data.business_name) setBusinessName(data.business_name)
        if (data.business_address) setBusinessAddress(data.business_address)
        if (data.gstin) setGstin(data.gstin)
        if (data.footer_note) setFooterNote(data.footer_note)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const payload = {
      template_html: templateHtml,
      business_name: businessName,
      business_address: businessAddress,
      gstin,
      footer_note: footerNote,
    }
    if (settingsId) {
      await supabase.from('invoice_settings').update(payload).eq('id', settingsId)
    } else {
      const { data } = await supabase.from('invoice_settings').insert(payload).select('id').single()
      if (data) setSettingsId(data.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const previewHtml = renderPreview(templateHtml, { business_name: businessName, business_address: businessAddress, gstin, footer_note: footerNote })

  if (loading) return <div className="py-20 text-center font-sans text-sm text-deep-obsidian/30">Loading…</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-forest text-4xl uppercase tracking-tighter">Invoices</h1>
          <p className="font-sans text-forest/50 text-sm mt-1">Customise the invoice template sent to customers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="font-sans text-xs font-bold tracking-[0.15em] uppercase px-4 py-2 border border-forest/20 text-forest hover:bg-forest/5 transition-colors rounded-lg"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-sans text-xs font-bold tracking-[0.15em] uppercase px-5 py-2 bg-forest text-cream hover:bg-deep-obsidian transition-colors rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-cream rounded-2xl border border-forest/10 p-6">
        <h2 className="font-display text-forest text-xl uppercase tracking-tighter mb-5">Business Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Business Name', value: businessName, set: setBusinessName, placeholder: 'Grounded' },
            { label: 'GSTIN', value: gstin, set: setGstin, placeholder: '29AABCU9603R1ZM (optional)' },
            { label: 'Footer Note', value: footerNote, set: setFooterNote, placeholder: 'Thank you for your purchase.' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40">{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="font-sans text-sm px-4 py-2.5 border border-forest/20 rounded-lg focus:outline-none focus:border-forest bg-wool-white text-deep-obsidian"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40">Business Address</label>
            <input
              value={businessAddress}
              onChange={e => setBusinessAddress(e.target.value)}
              placeholder="123 Street, City, State — Pincode"
              className="font-sans text-sm px-4 py-2.5 border border-forest/20 rounded-lg focus:outline-none focus:border-forest bg-wool-white text-deep-obsidian"
            />
          </div>
        </div>
      </div>

      {/* Token reference */}
      <div className="bg-cream rounded-2xl border border-forest/10 p-6">
        <h2 className="font-display text-forest text-xl uppercase tracking-tighter mb-3">Available Tokens</h2>
        <p className="font-sans text-xs text-deep-obsidian/50 mb-4">Use these in your HTML template — they&apos;ll be replaced with real order data when an invoice is generated.</p>
        <div className="flex flex-wrap gap-2">
          {TOKEN_LIST.map(t => (
            <code key={t} className="font-mono text-xs bg-forest/10 text-forest px-2 py-1 rounded">{t}</code>
          ))}
        </div>
      </div>

      {/* HTML editor */}
      <div className="bg-cream rounded-2xl border border-forest/10 p-6">
        <h2 className="font-display text-forest text-xl uppercase tracking-tighter mb-2">HTML Template</h2>
        <p className="font-sans text-xs text-deep-obsidian/40 mb-4">
          Full HTML with inline CSS. Use the tokens above where you want dynamic data. The invoice will render in the browser and customers can print/save as PDF.
        </p>
        <textarea
          value={templateHtml}
          onChange={e => setTemplateHtml(e.target.value)}
          rows={30}
          className="w-full font-mono text-xs bg-deep-obsidian text-sage p-4 rounded-xl border border-forest/20 focus:outline-none focus:border-forest resize-y leading-relaxed"
          spellCheck={false}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setTemplateHtml(DEFAULT_TEMPLATE)}
            className="font-sans text-xs font-bold tracking-[0.15em] uppercase px-4 py-2 border border-deep-obsidian/15 text-deep-obsidian/50 hover:border-red-400 hover:text-red-500 transition-colors rounded-lg"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <p className="font-sans font-bold text-sm text-deep-obsidian">Invoice Preview — sample data</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const win = window.open('', '_blank')
                    if (win) { win.document.write(previewHtml); win.document.close(); win.print() }
                  }}
                  className="font-sans text-xs font-bold text-forest border border-forest px-3 py-1.5 rounded-lg hover:bg-forest hover:text-cream transition-colors"
                >
                  Print Sample
                </button>
                <button onClick={() => setShowPreview(false)} className="text-deep-obsidian/40 hover:text-deep-obsidian">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full min-h-[600px] border-0 rounded-lg"
                title="Invoice Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
