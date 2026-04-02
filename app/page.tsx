import HeroSection      from '@/components/HeroSection'
import InfiniteCarousel from '@/components/InfiniteCarousel'
import TryItOutSection  from '@/components/TryItOutSection'
import SubFooter        from '@/components/SubFooter'
import { getCarouselProducts, getFeaturedProducts } from '@/data/products'

export const revalidate = 60 // Rebuild page every 60 seconds if data changes

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
