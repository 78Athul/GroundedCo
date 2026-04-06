import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice {{order_ref}} — Grounded</title>
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
  @media print {
    body { padding: 24px; }
    @page { margin: 16mm; }
  }
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

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  // Simple conditional blocks {{#key}}...{{/key}} — show only if value is non-empty
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => {
    return vars[key] ? inner : ''
  })
  return result
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params

  const supabase = createServerClient()

  const [orderRes, settingsRes] = await Promise.all([
    supabase.from('orders').select('*').eq('order_ref', orderRef).maybeSingle(),
    supabase.from('invoice_settings').select('*').limit(1).maybeSingle(),
  ])

  if (orderRes.error) {
    console.error(`Invoice route — DB error for ref "${orderRef}":`, orderRes.error)
    return new NextResponse(
      `Order lookup failed: ${orderRes.error.message}`,
      { status: 500 }
    )
  }

  if (!orderRes.data) {
    return new NextResponse(`Order not found: ${orderRef}`, { status: 404 })
  }


  const order = orderRes.data
  const settings = settingsRes.data

  const template = settings?.template_html?.trim() || DEFAULT_TEMPLATE

  const addressParts = [
    order.address_line1,
    order.address_line2,
    order.address_city,
    order.address_state,
    order.address_pincode,
  ].filter(Boolean)

  const unitPrice = formatINR(Math.round(order.amount_paise / (order.quantity || 1)))
  const total = formatINR(order.amount_paise)

  const vars: Record<string, string> = {
    order_ref: order.order_ref,
    date: formatDate(order.created_at),
    customer_name: order.customer_name || '—',
    customer_email: order.customer_email || '—',
    customer_phone: order.customer_phone || '—',
    address: addressParts.join(', ') || '—',
    product_name: order.product_name,
    quantity: String(order.quantity),
    unit_price: unitPrice,
    amount: total,
    business_name: settings?.business_name || 'Grounded',
    business_address: settings?.business_address || '',
    gstin: settings?.gstin || '',
    footer_note: settings?.footer_note || 'Thank you for your purchase.',
  }

  const html = renderTemplate(template, vars)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
