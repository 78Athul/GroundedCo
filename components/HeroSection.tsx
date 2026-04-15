'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'

import ScrollIndicator from './ScrollIndicator'
import AnimatedTextCycle from './AnimatedTextCycle'
import { RevealText } from './RevealText'
import { MenuBar } from '@/components/ui/glow-menu'

const menuItems = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
    gradient:
      'radial-gradient(circle, rgba(154, 204, 98, 0.16) 0%, rgba(141, 163, 90, 0.08) 50%, rgba(74, 85, 30, 0) 100%)',
    iconColor: 'text-sage',
  },
]

export default function HeroSection() {
  const router = useRouter()

  const handleMenuClick = (label: string) => {
    const item = menuItems.find((menuItem) => menuItem.label === label)
    if (item) router.push(item.href)
  }

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-forest">
      {/* Background */}
      <Image
        src="https://images.unsplash.com/photo-1600166898405-da9535204843?w=2000&q=90&fm=webp"
        alt="Handcrafted rug with natural wool texture in a curated living space"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center mix-blend-overlay opacity-60"
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-forest/60" />

      {/* Navigation */}
      <div className="absolute inset-x-0 top-8 z-30 pointer-events-none">
        <div className="mx-auto w-full max-w-md px-4 pointer-events-auto">
          <MenuBar
            items={menuItems}
            activeItem="Home"
            onItemClick={handleMenuClick}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative text-center px-4 sm:px-6 mx-auto w-full max-h-screen flex flex-col items-center justify-center pt-20">

        <div className="font-sans text-sage text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-4 sm:mb-6 animate-hero-fade-up flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3" style={{ animationDelay: '0.1s' }}>
          <span className="font-bold whitespace-nowrap z-40">A HOME THAT IS</span>
          <div className="z-40">
            <AnimatedTextCycle
              words={["HANDCRAFTED.", "THOUGHTFULLY DESIGNED.", "PERFECTLY GROUNDED."]}
              className="text-cream"
              interval={3500}
            />
          </div>
        </div>

        {/* Text anchor */}
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

        <div className="animate-hero-fade-up" style={{ animationDelay: '0.36s' }}>
          <a
            href="#collection"
            className="inline-block border border-cream/70 text-cream font-sans font-bold text-sm sm:text-base tracking-[0.2em] uppercase px-10 sm:px-12 py-4 sm:py-5 hover:bg-cream hover:text-forest transition-all duration-300 active:bg-cream active:text-forest"
          >
            Explore the Collection
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
