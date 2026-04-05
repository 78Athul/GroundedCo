import ScrollSequenceHero from '@/components/ScrollSequenceHero'
import InfiniteCarousel from '@/components/InfiniteCarousel'
import TryItOutSection  from '@/components/TryItOutSection'
import SubFooter        from '@/components/SubFooter'
import {
  getCarouselProducts,
  getFeaturedProducts,
  type CarouselProduct,
  type FeaturedProduct,
} from '@/data/products'

export const revalidate = 0 // Disable cache temporarily while editing

export default async function Home() {
  let carouselProducts: CarouselProduct[] = []
  let featuredProducts: FeaturedProduct[] = []

  try {
    ;[carouselProducts, featuredProducts] = await Promise.all([
      getCarouselProducts(),
      getFeaturedProducts(),
    ])
  } catch (err) {
    console.error('Home(): product fetch failed', err)
    // Continue with fallback data (functions already use fallback). On failure set empty arrays.
    carouselProducts = []
    featuredProducts = []
  }

  return (
    <main className="min-h-screen">
      <ScrollSequenceHero />
      <InfiniteCarousel products={carouselProducts} />
      <TryItOutSection products={featuredProducts} />
      <SubFooter />
    </main>
  )
}
