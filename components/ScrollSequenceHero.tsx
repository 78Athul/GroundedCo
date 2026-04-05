'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Leaf } from 'lucide-react'
import ScrollIndicator from './ScrollIndicator'
import AnimatedTextCycle from './AnimatedTextCycle'
import { RevealText } from './RevealText'
// ─── Frame config ─────────────────────────────────────────────
const FIRST_FRAME = 240
const LAST_FRAME = 1
const FRAME_COUNT = FIRST_FRAME - LAST_FRAME + 1 // 240
const SCROLL_PER_FRAME = 13 // px per frame — keeps total scroll ~3120 px
const SEQUENCE_HEIGHT = FRAME_COUNT * SCROLL_PER_FRAME

const FRAME_URLS: string[] = Array.from({ length: FRAME_COUNT }, (_, i) => {
  const n = FIRST_FRAME - i // 240, 239, … 1
  return `https://uettnudsxjyhepzlhryd.supabase.co/storage/v1/object/public/product-images/animation-frames/ezgif-frame-${String(n).padStart(3, '0')}.webp`
})


export default function ScrollSequenceHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const router = useRouter()

  // Float frame position for smooth lerping
  const currentFrameRef = useRef(0)
  // Target from scroll (float, not clamped to int)
  const targetFrameRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastDrawnRef = useRef(-1)

  // ─── Draw a single frame to canvas with −90° rotation ───────
  function drawFrame(idx: number) {
    const img = imagesRef.current[idx]
    const canvas = canvasRef.current
    if (!img?.complete || !canvas || canvas.width === 0 || canvas.height === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = Math.max(
      canvas.width / img.naturalHeight,
      canvas.height / img.naturalWidth
    )
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
    ctx.restore()
  }

  // ─── Sync canvas pixel dimensions to viewport ────────────────
  function syncCanvasSize() {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }

  // ─── Initial size sync on mount ───────────────────────────────
  useEffect(() => {
    syncCanvasSize()
  }, [])

  // ─── Progressive frame loading ────────────────────────────────
  // Load first 20 frames immediately, then the rest in idle-time chunks
  // so the network isn't saturated and the page isn't blocked.
  useEffect(() => {
    const images: HTMLImageElement[] = FRAME_URLS.map(() => new Image())
    imagesRef.current = images

    const EAGER = 20   // frames to load right away
    const CHUNK = 15   // frames per idle chunk

    function loadFrame(i: number) {
      const img = images[i]
      img.src = FRAME_URLS[i]
      if (i === 0) {
        img.onload = () => { syncCanvasSize(); drawFrame(0) }
      }
    }

    // Eager batch
    for (let i = 0; i < Math.min(EAGER, FRAME_COUNT); i++) loadFrame(i)

    // Remaining frames in idle chunks
    let next = EAGER
    function loadChunk(deadline?: IdleDeadline) {
      let scanned = 0
      while (next < FRAME_COUNT && scanned < CHUNK && (!deadline || deadline.timeRemaining() > 0)) {
        loadFrame(next++)
        scanned += 1
      }
      if (next < FRAME_COUNT) {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(loadChunk, { timeout: 2000 })
        } else {
          setTimeout(() => loadChunk(), 100)
        }
      }
    }

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(loadChunk, { timeout: 2000 })
    } else {
      setTimeout(() => loadChunk(), 200)
    }
  }, [])

  // ─── Persistent RAF loop (paused when off-screen) ────────────
  useEffect(() => {
    const LERP = 0.18
    let visible = true

    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting },
      { threshold: 0 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    function loop() {
      if (visible) {
        const section = sectionRef.current
        if (section) {
          const top = section.getBoundingClientRect().top
          const scrolled = Math.max(0, -top)
          targetFrameRef.current = Math.min(FRAME_COUNT - 1, scrolled / SCROLL_PER_FRAME)
        }

        const diff = targetFrameRef.current - currentFrameRef.current
        currentFrameRef.current += diff * LERP

        const idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrameRef.current)))
        if (idx !== lastDrawnRef.current) {
          drawFrame(idx)
          lastDrawnRef.current = idx
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      observer.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ─── Window resize → re-sync and redraw ──────────────────────
  useEffect(() => {
    function onResize() {
      syncCanvasSize()
      drawFrame(lastDrawnRef.current)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])


  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      style={{ height: `calc(${SEQUENCE_HEIGHT}px + 100vh)` }}
      className="relative"
    >
      {/* Sticky pinned viewport */}
      <div className="sticky top-0 h-screen bg-forest overflow-hidden">

        {/* Canvas — full screen cover */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ willChange: 'contents' }}
        />

        {/* Dark scrim for text legibility */}
        <div className="absolute inset-0 bg-forest/50 pointer-events-none" />

        {/* Overlay text — merged from HeroSection */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 pointer-events-none">
          <div
            className="font-sans text-sage text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-4 sm:mb-6 animate-hero-fade-up flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="font-bold whitespace-nowrap z-40">A HOME THAT IS</span>
            <div className="z-40">
              <AnimatedTextCycle
                words={['HANDCRAFTED.', 'THOUGHTFULLY DESIGNED.', 'PERFECTLY GROUNDED.']}
                className="text-cream"
                interval={3500}
              />
            </div>
          </div>

          <div className="relative w-full mb-4 sm:mb-8">
            <RevealText />
          </div>

          <p
            className="font-sans text-cream/70 text-base sm:text-lg max-w-xl mx-auto mb-10 sm:mb-14 leading-relaxed px-4 animate-hero-fade-up"
            style={{ animationDelay: '0.18s' }}
          >
            Handcrafted rugs woven by master artisans, made from natural fibres
            and rooted in generations of tradition.
          </p>

          <div
            className="animate-hero-fade-up pointer-events-auto"
            style={{ animationDelay: '0.36s' }}
          >
            <a
              href="#collection"
              className="inline-block border border-cream/70 text-cream font-sans font-bold text-sm sm:text-base tracking-[0.2em] uppercase px-10 sm:px-12 py-4 sm:py-5 hover:bg-cream hover:text-forest transition-all duration-300 active:bg-cream active:text-forest"
            >
              Explore the Collection
            </a>
          </div>
        </div>


        <ScrollIndicator />
      </div>
    </section>
  )
}
