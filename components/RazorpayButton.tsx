'use client'

import { useState } from 'react'
import Script from 'next/script'
import type { FeaturedProduct } from '@/data/products'

// Extend Window with Razorpay checkout constructor
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

interface RazorpayButtonProps {
  product: FeaturedProduct
  className?: string
  children?: React.ReactNode
}

export default function RazorpayButton({ product, className = '', children }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:    product.price * 100,   // convert to paise
          productId: product.id,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to create order')
      }

      const order = await res.json()

      // 2. Open Razorpay checkout
      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    'INR',
        name:        'Grounded',
        description: product.name,
        order_id:    order.id,
        handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // TODO: verify signature on your server before fulfilling the order
          console.log('Payment captured:', response.razorpay_payment_id)
          alert(`Payment successful! ID: ${response.razorpay_payment_id}`)
        },
        prefill: {
          name:    '',
          email:   '',
          contact: '',
        },
        notes: {
          product_id: product.id,
        },
        theme: {
          color: '#01472e',
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Razorpay error:', err)
      alert(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Load Razorpay checkout script once */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <button
        onClick={handlePayment}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing…
          </span>
        ) : (
          children ?? 'Buy Now'
        )}
      </button>
    </>
  )
}
