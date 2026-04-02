'use client'

import { useState } from 'react'
import type { FeaturedProduct } from '@/data/products'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface CheckoutClientProps {
  product: FeaturedProduct
}

export default function CheckoutClient({ product }: CheckoutClientProps) {
  const [activeTab, setActiveTab] = useState<'care' | 'delivery'>('care')
  const [quantity, setQuantity] = useState(1)

  const tabs = [
    { key: 'care' as const, label: 'Care Guide' },
    { key: 'delivery' as const, label: 'Delivery' },
  ]

  return (
    <>
      {/* Tabs: Specs / Care / Delivery */}
      <div className="mb-8">
        <div className="flex border-b border-deep-obsidian/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-sans text-xs tracking-[0.15em] uppercase py-3 px-6 transition-colors duration-200 border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-deep-obsidian text-deep-obsidian'
                  : 'border-transparent text-deep-obsidian/40 hover:text-deep-obsidian/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'care' && (
            <ul className="space-y-3">
              {product.careInstructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3 font-sans text-deep-obsidian/70 text-sm">
                  <span className="text-muted-earth mt-0.5 shrink-0 text-xs">●</span>
                  {instruction}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-5">
              <div>
                <p className="font-sans text-deep-obsidian/40 text-xs tracking-wider uppercase mb-1.5">
                  Estimated Delivery
                </p>
                <p className="font-sans text-deep-obsidian text-sm">{product.delivery.estimate}</p>
              </div>
              <div>
                <p className="font-sans text-deep-obsidian/40 text-xs tracking-wider uppercase mb-1.5">
                  Shipping
                </p>
                <p className="font-sans text-deep-obsidian text-sm">{product.delivery.shippingCost}</p>
              </div>
              <div>
                <p className="font-sans text-deep-obsidian/40 text-xs tracking-wider uppercase mb-1.5">
                  Returns
                </p>
                <p className="font-sans text-deep-obsidian text-sm">{product.delivery.returnPolicy}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantity + Place Order */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-4">
          <p className="font-sans text-deep-obsidian/40 text-xs tracking-wider uppercase">Qty</p>
          <div className="flex items-center border border-deep-obsidian/20">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center font-sans text-deep-obsidian/60 hover:bg-deep-obsidian/5 transition-colors"
            >
              −
            </button>
            <span className="w-12 h-10 flex items-center justify-center font-sans text-deep-obsidian text-sm border-x border-deep-obsidian/20">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center font-sans text-deep-obsidian/60 hover:bg-deep-obsidian/5 transition-colors"
            >
              +
            </button>
          </div>
          <span className="ml-auto font-sans text-deep-obsidian text-xl font-medium">
            {formatINR(product.price * quantity)}
          </span>
        </div>

        <button className="w-full font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white py-4 hover:bg-muted-earth transition-colors duration-300">
          Place Order — {formatINR(product.price * quantity)}
        </button>

        <p className="font-sans text-deep-obsidian/30 text-xs text-center tracking-wider">
          Secure checkout · All taxes included · EMI available
        </p>
      </div>
    </>
  )
}
