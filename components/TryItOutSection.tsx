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
