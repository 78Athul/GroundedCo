import HeroSection      from '@/components/HeroSection'
import InfiniteCarousel from '@/components/InfiniteCarousel'
import TryItOutSection  from '@/components/TryItOutSection'
import SubFooter        from '@/components/SubFooter'
import { getCarouselProducts, getFeaturedProducts } from '@/data/products'

export const revalidate = 0 // Disable cache temporarily while editing

export default async function Home() {
  const [carouselProducts, featuredProducts] = await Promise.all([
    getCarouselProducts(),
    getFeaturedProducts(),
  ])

  return (
    <main className="min-h-screen">
      <HeroSection />
      <InfiniteCarousel products={carouselProducts} />
      <TryItOutSection products={featuredProducts} />
      <SubFooter />
    </main>
  )
}
