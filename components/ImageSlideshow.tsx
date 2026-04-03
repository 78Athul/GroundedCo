'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageSlideshowProps {
  images: string[]
  alt: string
  badge?: string
}

export default function ImageSlideshow({ images, alt, badge }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const allImages = images.filter(Boolean)
  const count = allImages.length

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + count) % count)
  }, [count])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % count)
  }, [count])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only trigger if horizontal swipe is dominant and large enough
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        next()
      } else {
        prev()
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  if (count === 0) return null

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-deep-obsidian/5 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {badge && (
          <span className="absolute top-5 left-5 z-10 font-sans text-xs tracking-widest uppercase bg-muted-earth text-wool-white px-4 py-1.5">
            {badge}
          </span>
        )}

        {/* Images — all rendered, opacity transition */}
        {allImages.map((src, i) => (
          <div
            key={src + i}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <Image
              src={src}
              alt={`${alt} — view ${i + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Arrow buttons — only shown when multiple images */}
        {count > 1 && (
          <>
            <button
              id="slideshow-prev"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-wool-white/80 backdrop-blur-sm hover:bg-wool-white transition-colors duration-200 shadow-md"
            >
              <svg className="w-4 h-4 text-deep-obsidian" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              id="slideshow-next"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-wool-white/80 backdrop-blur-sm hover:bg-wool-white transition-colors duration-200 shadow-md"
            >
              <svg className="w-4 h-4 text-deep-obsidian" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-wool-white w-4'
                      : 'bg-wool-white/50 hover:bg-wool-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip — only shown when 2+ images */}
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((src, i) => (
            <button
              key={src + i}
              id={`slideshow-thumb-${i}`}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative flex-none w-16 h-16 overflow-hidden transition-all duration-200 ${
                i === current
                  ? 'ring-2 ring-deep-obsidian ring-offset-1'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
