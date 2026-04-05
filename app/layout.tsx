import type { Metadata } from 'next'
import { Anton, Heebo, Hind_Siliguri, Geist } from 'next/font/google'
import './globals.css'
import StaggeredMenu from '@/components/ui/staggered-menu'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
  display: 'swap',
})

const heebo = Heebo({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heebo',
  display: 'swap',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Grounded — Handcrafted Rugs Rooted in Tradition',
  description: 'Handcrafted rugs and carpets woven by master artisans across India. Natural fibres, time-honoured techniques, and designs that ground your home in warmth and character.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(anton.variable, heebo.variable, hindSiliguri.variable, "font-sans", geist.variable)} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <StaggeredMenu
          isFixed
          items={[
            { label: 'Home', ariaLabel: 'Return home', link: '/' },
            { label: 'Enter the Quiet', ariaLabel: 'Enter the Quiet experience', link: '/#enter-the-quiet' }
          ]}
          socialItems={[
            { label: 'Instagram', link: 'https://instagram.com/grounded' },
            { label: 'Twitter', link: 'https://twitter.com/grounded' },
            { label: 'LinkedIn', link: 'https://linkedin.com/company/grounded' }
          ]}
          colors={['#01472e', '#a3b18a', '#fefae0']}
          accentColor="#ccd5ae"
          position="right"
        />
        {children}
        {/* Noise texture overlay — real element so pointer-events: none actually works on mobile */}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  )
}
