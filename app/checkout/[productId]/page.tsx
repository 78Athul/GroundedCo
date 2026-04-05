import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFeaturedProductById } from '@/data/products'
import CheckoutClient from '@/components/CheckoutClient'
import ImageSlideshow from '@/components/ImageSlideshow'
import AnimatedPrice from '@/components/AnimatedPrice'
import CareGuideClient from '@/components/CareGuideClient'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getFeaturedProductById(productId)

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-wool-white relative overflow-hidden">
      {/* Animated green lines background */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="checkout-line-1">
            <path d="M -80,180 C 200,130 480,260 780,210 S 1150,100 1520,200" stroke="#01472e" strokeWidth="1" opacity="0.07" />
          </g>
          <g className="checkout-line-2">
            <path d="M -80,430 C 250,380 520,500 820,440 S 1180,360 1520,450" stroke="#01472e" strokeWidth="1.2" opacity="0.06" />
          </g>
          <g className="checkout-line-3">
            <path d="M 180,-40 C 130,180 280,380 170,580 S 60,760 210,920" stroke="#01472e" strokeWidth="1" opacity="0.06" />
          </g>
          <g className="checkout-line-4">
            <path d="M -80,680 C 300,630 600,740 920,670 S 1260,600 1520,660" stroke="#01472e" strokeWidth="0.8" opacity="0.05" />
          </g>
          <g className="checkout-line-5">
            <path d="M 860,-40 C 920,160 770,340 870,540 S 1020,710 910,920" stroke="#01472e" strokeWidth="1" opacity="0.06" />
          </g>
        </svg>
      </div>
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 bg-wool-white/80 backdrop-blur-md border-b border-deep-obsidian/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-sans text-deep-obsidian/60 text-xs tracking-[0.2em] uppercase hover:text-deep-obsidian transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Collection
          </Link>
          <span className="font-serif text-deep-obsidian text-lg font-light tracking-wide">Grounded</span>
          <div className="w-[140px]" /> {/* spacer for centering */}
        </div>
      </nav>

      {/* Hero product section */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Product image slideshow + Care Guide */}
          <div className="space-y-4">
            <ImageSlideshow
              images={[product.image, ...(product.photos ?? [])]}
              alt={product.name}
              badge={product.badge}
            />

            {/* Care Guide / Delivery tabs */}
            <CareGuideClient product={product} />

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 border border-deep-obsidian/10">
              <div className="flex items-center gap-2 text-deep-obsidian/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="font-sans text-xs tracking-wider uppercase">Authentic</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-deep-obsidian/10" />
              <div className="flex items-center gap-2 text-deep-obsidian/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.078-.502 1.078-1.121a.997.997 0 00-.222-.626l-2.847-3.37a1.5 1.5 0 00-1.134-.513H13.5m-3 4.5V6.75a.75.75 0 01.75-.75h5.507a1.5 1.5 0 011.29.743l2.86 4.771A1.5 1.5 0 0121 12.115V14.25" />
                </svg>
                <span className="font-sans text-xs tracking-wider uppercase">Free Shipping</span>
              </div>
            </div>
          </div>

          {/* Right: Product details */}
          <div className="flex flex-col w-full">
            {/* Breadcrumb */}
            <p className="font-sans text-muted-earth text-xs tracking-[0.25em] uppercase mb-4">
              Checkout · {product.badge ?? 'Featured'}
            </p>

            <h1 className="font-serif text-deep-obsidian font-light leading-tight mb-2" style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
              {product.name}
            </h1>
            <p className="font-sans text-deep-obsidian/50 text-sm mb-4">{product.subtitle}</p>

            {/* Animated Price */}
            <AnimatedPrice price={product.price} />

            {/* Description */}
            <p className="font-sans text-deep-obsidian/70 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Material', value: product.material },
                { label: 'Dimensions', value: product.dimensions },
                { label: 'Weight', value: product.weight },
                { label: 'Technique', value: product.technique },
                { label: 'Pile Height', value: product.pileHeight },
                { label: 'Origin', value: product.origin },
              ].map((spec) => (
                <div key={spec.label} className="py-3 border-b border-deep-obsidian/10">
                  <p className="font-sans text-deep-obsidian/40 text-xs tracking-wider uppercase mb-1">
                    {spec.label}
                  </p>
                  <p className="font-sans text-deep-obsidian text-sm font-medium">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Interactive client component: tabs + quantity + order */}
            <CheckoutClient product={product} />
          </div>
        </div>
      </section>

      {/* Bottom trust section */}
      <section className="bg-deep-obsidian py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex justify-center">
          <div className="max-w-lg text-center">
            <div className="text-muted-earth mb-4 flex justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.078-.502 1.078-1.121a.997.997 0 00-.222-.626l-2.847-3.37a1.5 1.5 0 00-1.134-.513H13.5m-3 4.5V6.75a.75.75 0 01.75-.75h5.507a1.5 1.5 0 011.29.743l2.86 4.771A1.5 1.5 0 0121 12.115V14.25" />
              </svg>
            </div>
            <h3 className="font-serif text-wool-white text-2xl font-light mb-3">
              We Deliver It Ourselves, Across Keralam
            </h3>
            <p className="font-sans text-wool-white/60 text-sm leading-relaxed mb-4">
              If you&apos;re in Keralam, we don&apos;t hand this off to a courier. We bring it to your door ourselves, carefully rolled, personally carried, and placed exactly where you want it.
            </p>
            <p className="font-sans text-muted-earth text-xs tracking-[0.15em] uppercase">
              Complimentary · No third-party handling · Your room, your way
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
