'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { CarouselProduct } from '@/data/products'
import ProductModal from './ProductModal'
import { MagneticText } from './MagneticText'

function CarouselCard({
  product,
  onClick,
  mobile,
}: {
  product: CarouselProduct
  onClick: (p: CarouselProduct) => void
  mobile?: boolean
}) {
  const handleClick = useCallback(() => {
    onClick(product)
  }, [product, onClick])

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ touchAction: 'manipulation' }}
      className={`relative flex-none overflow-hidden cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-[2.5rem] shadow-2xl ${
        mobile ? 'w-60 h-80' : 'w-72 h-96'
      }`}
      aria-label={`View ${product.name}`}
    >
      <Image
        src={product.carouselImage}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 240px, 288px"
        className="object-cover transition-transform duration-700 group-active:scale-105 md:group-hover:scale-105"
      />

      {/* Overlay — desktop hover only */}
      <div className="absolute inset-0 bg-maroon/80 flex items-end p-6 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100">
        <div>
          <p className="font-sans font-bold text-sage text-xs tracking-[0.2em] uppercase mb-1">Tap to explore</p>
          <h3 className="font-display text-cream text-4xl uppercase tracking-tighter leading-none">{product.name}</h3>
        </div>
      </div>
    </button>
  )
}

interface InfiniteCarouselProps {
  products: CarouselProduct[]
}

export default function InfiniteCarousel({ products }: InfiniteCarouselProps) {
  const [selected, setSelected] = useState<CarouselProduct | null>(null)

  const handleSelect = useCallback((product: CarouselProduct) => {
    setSelected(product)
  }, [])

  const mobileX = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let started = false

    function startAnim() {
      const half = track!.scrollWidth / 2
      if (half < 200) return // not rendered yet
      if (started) return
      started = true
      mobileX.set(0)
      const controls = animate(mobileX, -half, {
        duration: 22,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      })
      animRef.current = controls
    }

    // Use ResizeObserver to wait until the track has real width (images loaded)
    const ro = new ResizeObserver(() => startAnim())
    ro.observe(track)
    // Also try immediately in case it's already ready
    startAnim()

    return () => {
      ro.disconnect()
      animRef.current?.stop()
    }
  }, [mobileX])

  const pauseMobile  = useCallback(() => { animRef.current?.pause() }, [])
  const resumeMobile = useCallback(() => { animRef.current?.play()  }, [])

  // Duplicate for seamless infinite loop
  const doubled = [...products, ...products]

  return (
    <section id="collection" data-nav-theme="light" className="py-16 sm:py-24 bg-cream overflow-hidden">
      {/* Section heading */}
      <div className="px-6 md:px-16 mb-8 sm:mb-12">
        <p className="font-sans font-bold text-moss text-xs tracking-[0.2em] uppercase mb-3 text-center md:text-left">Woven Into Real Life</p>
        <div className="flex justify-center md:justify-start">
          <MagneticText text="Real Homes" hoverText="Real Homes" className="mix-blend-multiply opacity-90" />
        </div>
      </div>

      {/* ── Mobile carousel: Framer Motion ticker ── */}
      <div className="md:hidden relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-cream to-transparent" />
        <motion.div
          ref={trackRef}
          className="flex gap-4 py-6"
          style={{ x: mobileX, width: 'max-content' }}
          onTouchStart={pauseMobile}
          onTouchEnd={resumeMobile}
          onTouchCancel={resumeMobile}
        >
          {doubled.map((product, idx) => (
            <CarouselCard
              key={`${product.id}-m${idx}`}
              product={product}
              onClick={handleSelect}
              mobile
            />
          ))}
        </motion.div>
      </div>

      {/* ── Desktop carousel: infinite CSS animation ── */}
      <div className="hidden md:block relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-cream to-transparent" />
        <div
          className="flex gap-5 carousel-track py-8"
          style={{ width: 'max-content' }}
        >
          {doubled.map((product, idx) => (
            <CarouselCard
              key={`${product.id}-${idx}`}
              product={product}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Hint text */}
      <p className="text-center font-sans font-bold text-forest/40 text-xs tracking-widest uppercase mt-6 sm:mt-8 px-4">
        <span className="md:hidden">Hold to pause · </span>
        <span className="hidden md:inline">Hover to pause · </span>Tap to explore
      </p>

      {/* Modal */}
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
