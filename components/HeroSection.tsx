import Image from 'next/image'
import { RevealText } from './RevealText'
import ScrollIndicator from './ScrollIndicator'

export default function HeroSection() {
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

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 mx-auto w-full overflow-hidden">
        <p className="font-sans font-bold text-sage text-sm sm:text-base md:text-lg tracking-[0.2em] uppercase mb-6 sm:mb-8 animate-hero-fade-up">
          Rooted in Craft
        </p>

        {/* RevealText replaces the static h1 */}
        <div className="mb-8 sm:mb-12">
          <RevealText
            text="GROUNDED"
            textColor="text-cream"
            overlayColor="text-sage"
            fontSize="text-[19vw] sm:text-[20vw] md:text-[22vw]"
          />
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
