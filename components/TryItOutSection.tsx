import Image from 'next/image'
import Link from 'next/link'
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

          <Link
            href={`/checkout/${product.id}`}
            className="font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white px-8 py-3 hover:bg-muted-earth transition-colors duration-300"
          >
            Try It Out
          </Link>
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

        {/* Trust badge */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <svg className="w-5 h-5 text-wool-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="font-sans text-wool-white/40 text-xs tracking-widest uppercase">
            Secure Checkout · Free Shipping · 30-Day Returns
          </span>
        </div>
      </div>
    </section>
  )
}

