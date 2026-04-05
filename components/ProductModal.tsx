'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { CarouselProduct } from '@/data/products'

interface ProductModalProps {
  product: CarouselProduct | null
  onClose: () => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-sage' : 'text-forest/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll when modal open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [product])

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="fixed inset-0 z-[51] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div className="relative bg-cream w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center text-forest/50 hover:text-forest bg-forest/5 hover:bg-forest/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Product name header */}
              <div className="px-8 pt-10 pb-6 border-b border-forest/10">
                <p className="font-sans font-bold text-sage text-xs tracking-[0.2em] uppercase mb-2">From the Collection</p>
                <h2 className="font-display text-forest text-5xl md:text-6xl uppercase tracking-tighter opacity-90">{product.name}</h2>
              </div>

              {/* Three-panel content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-forest/10 pb-20 md:pb-0">

                {/* Panel 1: Studio Photo */}
                <div className="p-8 flex flex-col gap-4">
                  <p className="font-sans font-bold text-forest/50 text-xs tracking-[0.2em] uppercase">Cad Design</p>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl mix-blend-darken">
                    <Image
                      src={product.studioImage}
                      alt={`${product.name} studio photo`}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Panel 2: UGC Photo */}
                <div className="p-8 flex flex-col gap-4">
                  <p className="font-sans font-bold text-forest/50 text-xs tracking-[0.2em] uppercase">Grounded in Living Spaces</p>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
                    <Image
                      src={product.ugcImage}
                      alt={`${product.name} customer photo`}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Panel 3: Google Review */}
                <div className="p-8 flex flex-col gap-4">
                  <p className="font-sans font-bold text-forest/50 text-xs tracking-[0.2em] uppercase">Verified Review</p>

                  <div className="flex flex-col gap-4 mt-2">
                    {/* Google branding */}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="font-sans font-bold text-xs text-forest/50">Google Review</span>
                      {/* Verified badge */}
                      <span className="ml-auto flex items-center gap-1 bg-sage/20 text-forest text-xs font-sans font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    </div>

                    <StarRating rating={product.review.rating} />

                    <blockquote className="font-display text-forest text-2xl uppercase tracking-tighter leading-snug mt-2 opacity-90">
                      &ldquo;{product.review.text}&rdquo;
                    </blockquote>

                    <div className="mt-auto pt-6 border-t border-forest/10">
                      <p className="font-sans font-bold text-forest text-sm uppercase tracking-wider">{product.review.author}</p>
                      <p className="font-sans font-bold text-forest/40 text-xs mt-1">{product.review.date}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Sticky purchase CTA */}
              <div className="sticky bottom-0 bg-cream border-t border-forest/10 px-8 py-5 flex justify-end">
                <Link
                  href={`/checkout/${product.id}`}
                  className="font-sans font-bold text-xs tracking-[0.2em] uppercase bg-forest text-cream px-10 py-4 rounded-[2.5rem] hover:bg-sage hover:text-forest transition-colors duration-300"
                >
                  Bring It Home
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
