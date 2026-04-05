'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

interface AnimatedPriceProps {
  price: number
  discount?: number  // multiplier, default 1.3 → 30% off
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AnimatedPrice({ price, discount = 1.3 }: AnimatedPriceProps) {
  const originalPrice = Math.round(price * discount)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  // Animate displayed number from full (original) price → sale price
  const count = useMotionValue(originalPrice)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(originalPrice)

  useEffect(() => {
    if (!isInView) return

    const controls = animate(count, price, {
      duration: 2,
      ease: 'easeOut',
    })

    const unsub = rounded.on('change', (v) => setDisplayValue(v))

    return () => {
      controls.stop()
      unsub()
    }
  }, [isInView, count, rounded, price])

  const discountPct = Math.round((1 - price / originalPrice) * 100)

  return (
    <motion.div
      ref={ref}
      id="pricing"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="mb-6 pb-6 border-b border-deep-obsidian/10"
    >
      {/* Label */}
      <p className="font-sans font-bold text-forest text-[10px] tracking-[0.25em] uppercase mb-4">
        Founding Rate · Limited to 5 Homes
      </p>

      {/* Original (struck-through) price */}
      <div className="flex items-baseline gap-4 mb-1">
        <span
          className="price-strike font-sans text-deep-obsidian/35 text-lg font-medium"
          data-testid="original-price"
        >
          {formatINR(originalPrice)}
        </span>
        <span className="font-sans text-xs tracking-wider uppercase bg-forest/10 text-forest px-2 py-0.5 font-bold">
          {discountPct}% Off
        </span>
      </div>

      {/* Animated sale price */}
      <div className="flex items-baseline gap-2 mt-2">
        <span className="font-sans text-deep-obsidian/50 text-sm font-medium">Now</span>
        <motion.span
          className="font-display leading-none tracking-tighter transition-colors duration-500"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)', color: isInView ? '#01472e' : '#1a1714' }}
          data-testid="animated-price"
        >
          {formatINR(displayValue)}
        </motion.span>
      </div>

      {/* Subtext */}
      <p className="font-sans text-deep-obsidian/40 text-xs leading-relaxed mt-3">
        Free shipping · All taxes included · EMI available on qualifying orders
      </p>
    </motion.div>
  )
}
