import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams
  let order: Record<string, string | number> | null = null

  if (ref && ref !== 'unknown') {
    try {
      const supabase = createServerClient()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_ref', ref)
        .single()
      order = data
    } catch {
      // Order not found — still show a generic success screen
    }
  }

  const addressParts = order ? [
    order.address_line1,
    order.address_line2,
    order.address_city,
    order.address_state,
    order.address_pincode,
  ].filter(Boolean) : []

  return (
    <main className="min-h-screen bg-wool-white flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-wool-white/90 backdrop-blur-md border-b border-deep-obsidian/10">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="font-sans text-deep-obsidian/50 text-xs tracking-[0.2em] uppercase hover:text-deep-obsidian transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Collection
          </Link>
          <span className="font-display text-deep-obsidian text-lg uppercase tracking-tighter">Grounded</span>
          <div className="w-32" />
        </div>
      </nav>

      <div className="flex-1 max-w-lg mx-auto px-6 py-16 w-full">
        {/* Animated checkmark */}
        <div className="flex justify-center mb-10">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <circle
                cx="50" cy="50" r="46"
                fill="none" stroke="#01472e" strokeWidth="4"
                strokeDasharray="289" strokeDashoffset="0"
                style={{ animation: 'draw-circle 0.6s ease-out forwards' }}
              />
              <path
                d="M28 52 L43 67 L72 37"
                fill="none" stroke="#01472e" strokeWidth="5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="60" strokeDashoffset="60"
                style={{ animation: 'draw-check 0.4s ease-out 0.5s forwards' }}
              />
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes draw-circle {
            from { stroke-dashoffset: 289; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes draw-check {
            from { stroke-dashoffset: 60; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-bold tracking-[0.25em] uppercase text-forest mb-2">Order Confirmed</p>
          <h1 className="font-display text-5xl uppercase tracking-tighter text-deep-obsidian mb-3">
            Thank You
          </h1>
          <p className="font-sans text-deep-obsidian/60 text-sm leading-relaxed">
            Your order has been placed and payment received.
            We&apos;ll be in touch shortly.
          </p>
        </div>

        {/* Order Reference */}
        {ref && ref !== 'unknown' && (
          <div className="bg-forest text-cream p-6 mb-6 text-center">
            <p className="font-sans text-xs font-bold tracking-[0.25em] uppercase text-sage mb-2">Order Reference</p>
            <p className="font-display text-4xl tracking-tighter">{ref}</p>
            <p className="font-sans text-cream/50 text-xs mt-2">Save this for tracking and support</p>
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="border border-deep-obsidian/10 divide-y divide-deep-obsidian/10 mb-6">
            <div className="px-5 py-4 flex justify-between items-center">
              <div>
                <p className="font-sans font-bold text-sm text-deep-obsidian">{order.product_name as string}</p>
                <p className="font-sans text-xs text-deep-obsidian/50">Qty: {order.quantity}</p>
              </div>
              <p className="font-sans font-bold text-sm text-deep-obsidian">
                {formatINR(order.amount_paise as number)}
              </p>
            </div>

            {order.customer_name && (
              <div className="px-5 py-4">
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Customer</p>
                <p className="font-sans text-sm text-deep-obsidian">{order.customer_name as string}</p>
                <p className="font-sans text-xs text-deep-obsidian/50">{order.customer_email as string}</p>
              </div>
            )}

            {addressParts.length > 0 && (
              <div className="px-5 py-4">
                <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/40 mb-2">Ships To</p>
                <p className="font-sans text-sm text-deep-obsidian">{addressParts.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {ref && ref !== 'unknown' && (
            <a
              href={`/api/admin/invoice/${ref}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center font-sans text-xs font-bold tracking-[0.2em] uppercase border border-forest text-forest px-6 py-4 hover:bg-forest hover:text-cream transition-colors duration-300"
            >
              Download Invoice
            </a>
          )}
          <Link
            href="/"
            className="flex-1 text-center font-sans text-xs font-bold tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white px-6 py-4 hover:bg-forest transition-colors duration-300"
          >
            Back to Collection
          </Link>
        </div>

        <p className="font-sans text-deep-obsidian/30 text-xs text-center mt-8 leading-relaxed">
          Questions? Reach us at{' '}
          <a href="/contact" className="underline hover:text-forest transition-colors">contact page</a>.
        </p>
      </div>
    </main>
  )
}
