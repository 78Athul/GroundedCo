import type { Metadata } from 'next'
import { Anton, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inter',
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
    <html lang="en" className={`${anton.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        {children}
        {/* Noise texture overlay — real element so pointer-events: none actually works on mobile */}
        <div className="noise-overlay" aria-hidden="true" />
        <ThemeToggle />
      </body>
    </html>
  )
}
