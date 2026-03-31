# Grounded Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Next.js 14 landing page for "Grounded," a premium rug & carpet brand, featuring an infinite carousel, modal deep-dive, Razorpay checkout, and Framer Motion animations.

**Architecture:** Next.js 14 App Router with Tailwind CSS (Stitch MCP tokens) and Framer Motion. The infinite carousel uses CSS keyframe animation with React state for pause-on-hover; Framer Motion handles the hero entry animation and modal transitions. Razorpay order creation is handled by a Next.js API route; the client-side checkout script is loaded via `next/script`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, Framer Motion, Razorpay SDK (`razorpay` npm), `next/image`, Google Fonts (Cormorant Garamond + Inter)

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout, font loading, metadata |
| `app/page.tsx` | Page assembly — composes all sections |
| `app/globals.css` | CSS keyframe animation for carousel, base resets |
| `app/api/razorpay/create-order/route.ts` | POST endpoint: creates Razorpay order, returns order JSON |
| `components/HeroSection.tsx` | Full-viewport hero, fade-in-up animation, CTA |
| `components/InfiniteCarousel.tsx` | Infinite loop carousel, pause-on-hover, click-to-open-modal |
| `components/ProductModal.tsx` | Studio photo + UGC + Google Review modal |
| `components/TryItOutSection.tsx` | Two featured product cards, quick-buy flow, trust badge |
| `components/RazorpayButton.tsx` | Client-side Razorpay checkout handler |
| `components/SubFooter.tsx` | Low-contrast sub-footer with text links |
| `data/products.ts` | Mock data: carousel products + featured products |
| `lib/razorpay.ts` | Razorpay SDK singleton |
| `tailwind.config.ts` | Stitch MCP design tokens (colors, fonts, spacing) |
| `next.config.ts` | Image remote patterns (Unsplash) |
| `.env.local.example` | Required env vars template |

---

## Task 1: Bootstrap Next.js Project

**Files:**
- Create: (project root — all Next.js scaffold files)

- [ ] **Step 1: Scaffold the project**

```bash
cd "C:/Users/78ath/Desktop/Grounded"
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When prompted, accept defaults. The `--app` flag selects App Router. Tailwind is included.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion razorpay
npm install -D @types/node
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000` with no errors.

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "feat: bootstrap Next.js 14 project with Tailwind and Framer Motion"
```

---

## Task 2: Tailwind Config — Stitch MCP Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-obsidian': '#1F2937',
        'wool-white':    '#F9F8F6',
        'muted-earth':   '#BDA182',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      // Base-8 spacing additions (Tailwind default is base-4; add named 8-multiples)
      spacing: {
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
        '26': '6.5rem',  // 104px
        '30': '7.5rem',  // 120px
      },
      backgroundImage: {
        'hero-rug': "url('https://images.unsplash.com/photo-1600166898405-da9535204843?w=2000&q=90&fm=webp')",
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Update app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-cormorant: 'Cormorant Garamond', serif;
    --font-inter: 'Inter', sans-serif;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-wool-white text-deep-obsidian font-sans;
  }
}

/* ─── Infinite Carousel ─────────────────────────────── */
@keyframes scroll-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.carousel-track {
  animation: scroll-left 35s linear infinite;
  will-change: transform;
}

.carousel-track.paused {
  animation-play-state: paused;
}
```

- [ ] **Step 3: Update app/layout.tsx with Google Fonts**

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Grounded — Foundation for Fine Living',
  description: 'Premium hand-crafted rugs and carpets for the discerning home.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat: apply Stitch MCP design tokens — colors, fonts, base-8 spacing, carousel keyframe"
```

---

## Task 3: Mock Product Data

**Files:**
- Create: `data/products.ts`

- [ ] **Step 1: Create data/products.ts**

```ts
export interface CarouselProduct {
  id: string
  name: string
  carouselImage: string
  studioImage: string
  ugcImage: string
  review: {
    author: string
    rating: number   // 1–5
    text: string
    date: string
  }
}

export interface FeaturedProduct {
  id: string
  name: string
  subtitle: string
  price: number        // INR, full rupees
  image: string
  badge?: string
}

export const carouselProducts: CarouselProduct[] = [
  {
    id: 'cp-01',
    name: 'Sahara Wool Blend',
    carouselImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80&fm=webp',
    studioImage:   'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=900&q=90&fm=webp',
    ugcImage:      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=90&fm=webp',
    review: {
      author:  'Priya S.',
      rating:  5,
      text:    'Absolutely divine texture — my living room feels like a different world. The wool quality is exceptional and it arrived perfectly rolled.',
      date:    'January 2025',
    },
  },
  {
    id: 'cp-02',
    name: 'Atlas Hand-Knotted',
    carouselImage: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80&fm=webp',
    studioImage:   'https://images.unsplash.com/photo-1600166898405-da9535204843?w=900&q=90&fm=webp',
    ugcImage:      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=90&fm=webp',
    review: {
      author:  'Rahul M.',
      rating:  5,
      text:    'Worth every rupee. The hand-knotted detail is visible and the colours are exactly as shown. My guests always ask where it\'s from.',
      date:    'February 2025',
    },
  },
  {
    id: 'cp-03',
    name: 'Ember Flatweave',
    carouselImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&fm=webp',
    studioImage:   'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=90&fm=webp',
    ugcImage:      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=90&fm=webp',
    review: {
      author:  'Ananya K.',
      rating:  5,
      text:    'Perfect for our modern apartment. The flatweave is easy to maintain and the earthy tones tie the whole room together beautifully.',
      date:    'March 2025',
    },
  },
  {
    id: 'cp-04',
    name: 'Loom & Lattice',
    carouselImage: 'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=600&q=80&fm=webp',
    studioImage:   'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=900&q=90&fm=webp',
    ugcImage:      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=90&fm=webp',
    review: {
      author:  'Vikram T.',
      rating:  4,
      text:    'The geometric pattern is subtle and elegant. Shipping was fast and it came with a great anti-slip pad too.',
      date:    'March 2025',
    },
  },
  {
    id: 'cp-05',
    name: 'Dune Hand-Tufted',
    carouselImage: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80&fm=webp',
    studioImage:   'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=90&fm=webp',
    ugcImage:      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=90&fm=webp',
    review: {
      author:  'Meera J.',
      rating:  5,
      text:    'I was nervous ordering a rug online but the quality exceeded expectations. The tufted pile is thick and luxurious.',
      date:    'February 2025',
    },
  },
  {
    id: 'cp-06',
    name: 'Coastal Kilim',
    carouselImage: 'https://images.unsplash.com/photo-1572385207598-4eb1fc1e5f80?w=600&q=80&fm=webp',
    studioImage:   'https://images.unsplash.com/photo-1572385207598-4eb1fc1e5f80?w=900&q=90&fm=webp',
    ugcImage:      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=900&q=90&fm=webp',
    review: {
      author:  'Siddharth R.',
      rating:  5,
      text:    'The Kilim pattern is authentic and the colours are vibrant but not garish. Highly recommend for a boho-modern look.',
      date:    'January 2025',
    },
  },
]

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 'fp-atlas',
    name: 'Atlas Hand-Knotted',
    subtitle: '200 × 300 cm · Pure New Wool',
    price: 24999,
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=90&fm=webp',
    badge: 'Best Seller',
  },
  {
    id: 'fp-ember',
    name: 'Ember Flatweave',
    subtitle: '160 × 230 cm · Cotton-Jute Blend',
    price: 12499,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90&fm=webp',
    badge: 'New Arrival',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add data/products.ts
git commit -m "feat: add mock product data for carousel and featured products"
```

---

## Task 4: HeroSection Component

**Files:**
- Create: `components/HeroSection.tsx`

- [ ] **Step 1: Create components/HeroSection.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeInUp = {
  hidden:  { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.18 } },
}

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <Image
        src="https://images.unsplash.com/photo-1600166898405-da9535204843?w=2000&q=90&fm=webp"
        alt="High-texture premium rug background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-deep-obsidian/50" />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={fadeInUp}
          className="font-sans text-muted-earth text-sm tracking-[0.25em] uppercase mb-6"
        >
          Premium Rugs &amp; Carpets
        </motion.p>

        <motion.h1
          variants={fadeInUp}
          className="font-serif text-wool-white text-5xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-8"
        >
          Foundation for
          <br />
          <em>Fine Living.</em>
        </motion.h1>

        <motion.div variants={fadeInUp}>
          <a
            href="#collection"
            className="inline-block border border-wool-white/70 text-wool-white font-sans text-sm tracking-[0.2em] uppercase px-10 py-4 hover:bg-wool-white hover:text-deep-obsidian transition-all duration-300"
          >
            Explore Collection
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <span className="font-sans text-wool-white/50 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-12 bg-wool-white/40"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "feat: add HeroSection with full-viewport hero and fade-in-up Framer Motion animation"
```

---

## Task 5: ProductModal Component

**Files:**
- Create: `components/ProductModal.tsx`

- [ ] **Step 1: Create components/ProductModal.tsx**

```tsx
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
          className={`w-4 h-4 ${i < rating ? 'text-muted-earth' : 'text-deep-obsidian/20'}`}
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
            className="fixed inset-0 z-40 bg-deep-obsidian/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{   opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative bg-wool-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-deep-obsidian/50 hover:text-deep-obsidian transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Product name header */}
              <div className="px-8 pt-8 pb-6 border-b border-deep-obsidian/10">
                <p className="font-sans text-muted-earth text-xs tracking-[0.2em] uppercase mb-1">Product Preview</p>
                <h2 className="font-serif text-deep-obsidian text-3xl font-light">{product.name}</h2>
              </div>

              {/* Three-panel content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-deep-obsidian/10">

                {/* Panel 1: Studio Photo */}
                <div className="p-6 flex flex-col gap-4">
                  <p className="font-sans text-deep-obsidian/40 text-xs tracking-[0.18em] uppercase">Studio Shot</p>
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
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
                <div className="p-6 flex flex-col gap-4">
                  <p className="font-sans text-deep-obsidian/40 text-xs tracking-[0.18em] uppercase">In Their Home</p>
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
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
                <div className="p-6 flex flex-col gap-4">
                  <p className="font-sans text-deep-obsidian/40 text-xs tracking-[0.18em] uppercase">Verified Review</p>

                  <div className="flex flex-col gap-4 mt-2">
                    {/* Google branding */}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="font-sans text-xs text-deep-obsidian/50">Google Review</span>
                      {/* Verified badge */}
                      <span className="ml-auto flex items-center gap-1 bg-green-50 text-green-700 text-xs font-sans px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    </div>

                    <StarRating rating={product.review.rating} />

                    <blockquote className="font-serif text-deep-obsidian text-lg font-light leading-relaxed italic">
                      &ldquo;{product.review.text}&rdquo;
                    </blockquote>

                    <div className="mt-auto pt-4 border-t border-deep-obsidian/10">
                      <p className="font-sans text-deep-obsidian font-medium text-sm">{product.review.author}</p>
                      <p className="font-sans text-deep-obsidian/40 text-xs">{product.review.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProductModal.tsx
git commit -m "feat: add ProductModal with studio photo, UGC, and Google Review panels"
```

---

## Task 6: InfiniteCarousel Component

**Files:**
- Create: `components/InfiniteCarousel.tsx`

- [ ] **Step 1: Create components/InfiniteCarousel.tsx**

```tsx
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
  const [paused, setPaused]       = useState(false)
  const [selected, setSelected]   = useState<CarouselProduct | null>(null)

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
```

- [ ] **Step 2: Commit**

```bash
git add components/InfiniteCarousel.tsx
git commit -m "feat: add InfiniteCarousel with CSS scroll-loop, pause-on-hover, and modal integration"
```

---

## Task 7: Razorpay API Route & Lib

**Files:**
- Create: `lib/razorpay.ts`
- Create: `app/api/razorpay/create-order/route.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Create lib/razorpay.ts**

```ts
import Razorpay from 'razorpay'

// Singleton to avoid re-instantiation on every request
let instance: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!instance) {
    const keyId     = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      throw new Error(
        'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables. ' +
        'Copy .env.local.example to .env.local and fill in your Razorpay test credentials.'
      )
    }

    instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }
  return instance
}
```

- [ ] **Step 2: Create app/api/razorpay/create-order/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, productId } = (await req.json()) as {
      amount: number      // in paise (rupees × 100)
      productId: string
    }

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${productId}_${Date.now()}`,
      notes: { productId },
    })

    return NextResponse.json(order)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create .env.local.example**

```
# Razorpay — get your test keys from https://dashboard.razorpay.com/app/keys
# Use TEST mode keys during development (prefix rzp_test_)
RAZORPAY_KEY_ID=rzp_test_REPLACE_ME
RAZORPAY_KEY_SECRET=REPLACE_ME_SECRET

# Public key exposed to browser (must match RAZORPAY_KEY_ID)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_REPLACE_ME
```

- [ ] **Step 4: Commit**

```bash
git add lib/razorpay.ts app/api/razorpay/create-order/route.ts .env.local.example
git commit -m "feat: add Razorpay order creation API route and singleton lib"
```

---

## Task 8: RazorpayButton Component

**Files:**
- Create: `components/RazorpayButton.tsx`

- [ ] **Step 1: Create components/RazorpayButton.tsx**

```tsx
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
          color: '#BDA182',
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
```

- [ ] **Step 2: Commit**

```bash
git add components/RazorpayButton.tsx
git commit -m "feat: add RazorpayButton client component with INR checkout flow"
```

---

## Task 9: TryItOutSection Component

**Files:**
- Create: `components/TryItOutSection.tsx`

- [ ] **Step 1: Create components/TryItOutSection.tsx**

```tsx
import Image from 'next/image'
import RazorpayButton from './RazorpayButton'
import { featuredProducts } from '@/data/products'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function ProductCard({ product }: { product: (typeof featuredProducts)[number] }) {
  return (
    <div className="group relative bg-wool-white flex flex-col overflow-hidden border border-deep-obsidian/10 hover:border-muted-earth transition-colors duration-300">
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-4 left-4 z-10 font-sans text-xs tracking-widest uppercase bg-muted-earth text-wool-white px-3 py-1">
          {product.badge}
        </span>
      )}

      {/* Product image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="p-8 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-serif text-deep-obsidian text-2xl font-light mb-1">{product.name}</h3>
          <p className="font-sans text-deep-obsidian/50 text-sm">{product.subtitle}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-deep-obsidian/10">
          <span className="font-sans text-deep-obsidian text-xl font-medium">
            {formatINR(product.price)}
          </span>

          <RazorpayButton
            product={product}
            className="font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white px-8 py-3 hover:bg-muted-earth transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try It Out
          </RazorpayButton>
        </div>
      </div>
    </div>
  )
}

export default function TryItOutSection() {
  return (
    <section className="py-24 bg-deep-obsidian" id="try-it-out">
      <div className="max-w-6xl mx-auto px-6 md:px-16">

        {/* Heading */}
        <div className="mb-16">
          <p className="font-sans text-muted-earth text-xs tracking-[0.25em] uppercase mb-3">Quick Buy</p>
          <h2 className="font-serif text-wool-white text-4xl md:text-5xl font-light">
            Try It Out
          </h2>
          <p className="font-sans text-wool-white/50 text-sm mt-3 max-w-md">
            Love it in 30 days or return it — no questions asked.
          </p>
        </div>

        {/* Two product cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Razorpay trust badge */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <svg className="w-5 h-5 text-wool-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-sans text-wool-white/40 text-xs tracking-widest uppercase">
            Secure Payments by Razorpay
          </span>
          {/* Razorpay wordmark (text fallback — replace with official SVG if needed) */}
          <span className="font-sans text-[#3395FF] text-xs font-semibold tracking-tight">Razorpay</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TryItOutSection.tsx
git commit -m "feat: add TryItOutSection with product cards, INR formatting, and Razorpay quick-buy"
```

---

## Task 10: SubFooter Component

**Files:**
- Create: `components/SubFooter.tsx`

- [ ] **Step 1: Create components/SubFooter.tsx**

```tsx
export default function SubFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 px-6 bg-deep-obsidian border-t border-wool-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <span className="font-serif text-wool-white/30 text-sm tracking-widest uppercase">
          Grounded
        </span>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {['Contact', 'Privacy', 'Shipping'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-sans text-wool-white/30 text-xs tracking-widest uppercase hover:text-wool-white/60 transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <span className="font-sans text-wool-white/20 text-xs">
          © {year} Grounded. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SubFooter.tsx
git commit -m "feat: add minimal sub-footer with Contact, Privacy, Shipping links"
```

---

## Task 11: Page Assembly & next.config.ts

**Files:**
- Modify: `app/page.tsx`
- Modify (or Create): `next.config.ts`

- [ ] **Step 1: Update next.config.ts**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Replace app/page.tsx**

```tsx
import HeroSection        from '@/components/HeroSection'
import InfiniteCarousel   from '@/components/InfiniteCarousel'
import TryItOutSection    from '@/components/TryItOutSection'
import SubFooter          from '@/components/SubFooter'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <InfiniteCarousel />
      <TryItOutSection />
      <SubFooter />
    </main>
  )
}
```

- [ ] **Step 3: Verify build compiles clean**

```bash
npm run build
```

Expected: No TypeScript errors, no missing module errors. May see a warning about `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID` being undefined — this is expected until `.env.local` is populated.

- [ ] **Step 4: Smoke-test in dev**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Hero renders with background image and "Foundation for Fine Living" heading
- Carousel scrolls infinitely and pauses on hover
- Clicking a carousel card opens the three-panel modal
- Try It Out section shows two product cards with prices in INR
- Footer renders with sub-footer links

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx next.config.ts
git commit -m "feat: assemble full landing page — hero, carousel, try-it-out, footer"
```

---

## Task 12: Environment Setup Documentation

**Files:**
- Create: `.gitignore` additions (if not already present)

- [ ] **Step 1: Ensure .env.local is gitignored**

Check `.gitignore` (created by create-next-app) includes:
```
.env*.local
```

If missing, add it:
```bash
echo ".env*.local" >> .gitignore
```

- [ ] **Step 2: Copy env template and document next steps**

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder values with your Razorpay test keys from https://dashboard.razorpay.com/app/keys

- [ ] **Step 3: Final commit**

```bash
git add .gitignore
git commit -m "chore: ensure .env.local is gitignored, add env setup docs"
```

---

## Self-Review Checklist

- [x] **Hero** — full-viewport, fade-in-up, "Foundation for Fine Living", "Explore Collection" CTA ✓
- [x] **Carousel** — infinite loop, pause-on-hover, product name overlay, click-to-modal ✓
- [x] **Modal** — Studio photo + UGC + Google Review with star rating + verified badge ✓
- [x] **Try It Out** — 2 featured cards, Quick-Buy, Razorpay INR integration ✓
- [x] **Razorpay trust badge** — "Secure Payments by Razorpay" in footer of TryItOut section ✓
- [x] **Sub-Footer** — Contact, Privacy, Shipping — low contrast, no heavy forms ✓
- [x] **Stitch MCP tokens** — `#1F2937`, `#F9F8F6`, `#BDA182` applied via Tailwind config ✓
- [x] **Typography** — Cormorant Garamond (headings) + Inter (UI) ✓
- [x] **Framer Motion** — hero stagger + modal AnimatePresence ✓
- [x] **next/image** — all images use `<Image>` with `fill`, `sizes`, `priority` where appropriate ✓
- [x] **Responsiveness** — all components use responsive Tailwind classes ✓
- [x] **Razorpay API route** — POST `/api/razorpay/create-order`, validates amount, returns order JSON ✓
- [x] **INR formatting** — `Intl.NumberFormat('en-IN', { currency: 'INR' })` ✓
