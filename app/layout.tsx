import type { Metadata } from 'next'
import { Exo, Macondo, Merriweather } from 'next/font/google'
import './globals.css'

const exo = Exo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-exo',
  display: 'swap',
})

const macondo = Macondo({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-macondo',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Grounded — Foundation for Fine Living',
  description: 'Premium hand-crafted rugs and carpets for the discerning home.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${exo.variable} ${macondo.variable} ${merriweather.variable}`}>
      <body>{children}</body>
    </html>
  )
}
