import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedProductById } from '@/data/products'
import CheckoutClient from '@/components/CheckoutClient'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

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
    <main className="min-h-screen bg-wool-white">
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
          {/* Left: Product image */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden bg-deep-obsidian/5">
              {product.badge && (
                <span className="absolute top-5 left-5 z-10 font-sans text-xs tracking-widest uppercase bg-muted-earth text-wool-white px-4 py-1.5">
                  {product.badge}
                </span>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

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
              <div className="hidden sm:block w-px h-4 bg-deep-obsidian/10" />
              <div className="flex items-center gap-2 text-deep-obsidian/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                <span className="font-sans text-xs tracking-wider uppercase">30-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Right: Product details */}
          <div className="flex flex-col">
            {/* Breadcrumb */}
            <p className="font-sans text-muted-earth text-xs tracking-[0.25em] uppercase mb-4">
              Checkout · {product.badge ?? 'Featured'}
            </p>

            <h1 className="font-serif text-deep-obsidian text-4xl md:text-5xl font-light leading-tight mb-2">
              {product.name}
            </h1>
            <p className="font-sans text-deep-obsidian/50 text-sm mb-6">{product.subtitle}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-deep-obsidian/10">
              <span className="font-sans text-deep-obsidian text-3xl font-medium">
                {formatINR(product.price)}
              </span>
              <span className="font-sans text-deep-obsidian/30 text-sm line-through">
                {formatINR(Math.round(product.price * 1.3))}
              </span>
              <span className="font-sans text-xs tracking-wider uppercase bg-green-100 text-green-700 px-2 py-0.5 ml-2">
                30% Off
              </span>
            </div>

            {/* Description */}
            <p className="font-sans text-deep-obsidian/70 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
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
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: 'Authenticity Guaranteed',
                desc: 'Every rug comes with a certificate of authenticity and a unique serial number traceable to its artisan.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.078-.502 1.078-1.121a.997.997 0 00-.222-.626l-2.847-3.37a1.5 1.5 0 00-1.134-.513H13.5m-3 4.5V6.75a.75.75 0 01.75-.75h5.507a1.5 1.5 0 011.29.743l2.86 4.771A1.5 1.5 0 0121 12.115V14.25" />
                  </svg>
                ),
                title: 'Free White-Glove Delivery',
                desc: 'Professional unrolling and placement in your room of choice. We even take the packaging away.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                ),
                title: '30-Day Free Returns',
                desc: 'Live with it for a month. If it doesn\'t feel right, we\'ll pick it up at no cost — no questions asked.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-muted-earth mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-serif text-wool-white text-xl font-light mb-2">{item.title}</h3>
                <p className="font-sans text-wool-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
