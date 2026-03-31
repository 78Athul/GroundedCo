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
  // Extended details for checkout
  description: string
  material: string
  dimensions: string
  weight: string
  origin: string
  technique: string
  pileHeight: string
  careInstructions: string[]
  features: string[]
  delivery: {
    estimate: string
    shippingCost: string
    returnPolicy: string
  }
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
    description: 'A masterpiece of traditional craftsmanship, the Atlas Hand-Knotted rug is woven by skilled artisans using time-honoured techniques passed down through generations. Each knot is tied by hand, resulting in a rug of extraordinary durability and beauty that will last for decades.',
    material: 'Pure New Zealand Wool',
    dimensions: '200 × 300 cm (6.6 × 9.8 ft)',
    weight: '12.5 kg',
    origin: 'Handcrafted in Rajasthan, India',
    technique: 'Hand-Knotted (120 knots per sq. inch)',
    pileHeight: '12 mm',
    careInstructions: [
      'Professional dry cleaning recommended',
      'Vacuum regularly without beater bar',
      'Blot spills immediately with a dry cloth',
      'Rotate every 6 months for even wear',
      'Avoid direct sunlight to preserve colour',
    ],
    features: [
      'GoodWeave® certified — no child labour',
      'Natural, undyed wool with vegetable-dyed accents',
      'Anti-slip backing included',
      'Moth and stain resistant treatment',
      'Comes with complimentary rug pad',
    ],
    delivery: {
      estimate: '5–7 business days (Metro cities) · 8–12 business days (Rest of India)',
      shippingCost: 'Free shipping across India',
      returnPolicy: '30-day no-questions-asked return policy. Free reverse pickup.',
    },
  },
  {
    id: 'fp-ember',
    name: 'Ember Flatweave',
    subtitle: '160 × 230 cm · Cotton-Jute Blend',
    price: 12499,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90&fm=webp',
    badge: 'New Arrival',
    description: 'The Ember Flatweave brings a contemporary edge to any room with its clean lines and earthy palette. Woven on traditional handlooms using a blend of cotton and jute, it offers a lightweight yet durable foundation perfect for modern living spaces.',
    material: '60% Cotton, 40% Natural Jute',
    dimensions: '160 × 230 cm (5.2 × 7.5 ft)',
    weight: '6.8 kg',
    origin: 'Handwoven in Varanasi, India',
    technique: 'Flatweave (Dhurrie style)',
    pileHeight: '4 mm (Low pile)',
    careInstructions: [
      'Machine washable on gentle cycle (cold water)',
      'Air dry flat — do not tumble dry',
      'Vacuum both sides regularly',
      'Spot clean with mild detergent',
      'Can be dry cleaned if preferred',
    ],
    features: [
      'Reversible design — two looks in one',
      'Eco-friendly natural fibres',
      'Hypoallergenic and pet friendly',
      'Lightweight and easy to move',
      'Non-toxic AZO-free dyes',
    ],
    delivery: {
      estimate: '3–5 business days (Metro cities) · 6–10 business days (Rest of India)',
      shippingCost: 'Free shipping across India',
      returnPolicy: '30-day no-questions-asked return policy. Free reverse pickup.',
    },
  },
]

