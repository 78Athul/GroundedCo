'use client'

import { useState } from 'react'
import Image from 'next/image'
import { carouselProducts, type CarouselProduct } from '@/data/products'
import ProductModal from './ProductModal'

function CarouselCard({
  product,
  onClick,
}: {
  product: CarouselProduct
  onClick: (p: CarouselProduct) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-none w-72 h-96 overflow-hidden cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-earth"
      aria-label={`View ${product.name}`}
    >
      <Image
        src={product.carouselImage}
        alt={product.name}
        fill
        sizes="288px"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay on hover */}
      <div
        className={`absolute inset-0 bg-deep-obsidian/60 flex items-end p-6 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <div>
          <p className="font-sans text-muted-earth text-xs tracking-[0.2em] uppercase mb-1">Tap to explore</p>
          <h3 className="font-serif text-wool-white text-2xl font-light">{product.name}</h3>
        </div>
      </div>
    </button>
  )
}

export default function InfiniteCarousel() {
  const [paused, setPaused]     = useState(false)
  const [selected, setSelected] = useState<CarouselProduct | null>(null)

  // Duplicate for seamless infinite loop
  const doubled = [...carouselProducts, ...carouselProducts]

  return (
    <section id="collection" className="py-24 bg-wool-white overflow-hidden">
      {/* Section heading */}
      <div className="px-6 md:px-16 mb-12">
        <p className="font-sans text-muted-earth text-xs tracking-[0.25em] uppercase mb-3">Customer Gallery</p>
        <h2 className="font-serif text-deep-obsidian text-4xl md:text-5xl font-light">
          Loved by Real Homes
        </h2>
      </div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left/right edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-wool-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-wool-white to-transparent" />

        <div
          className={`flex gap-5 carousel-track ${paused ? 'paused' : ''}`}
          style={{ width: 'max-content' }}
        >
          {doubled.map((product, idx) => (
            <CarouselCard
              key={`${product.id}-${idx}`}
              product={product}
              onClick={setSelected}
            />
          ))}
        </div>
      </div>

      {/* Hint text */}
      <p className="text-center font-sans text-deep-obsidian/30 text-xs tracking-widest uppercase mt-8">
        Hover to pause · Click to explore
      </p>

      {/* Modal */}
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
