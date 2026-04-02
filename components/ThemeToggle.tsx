'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const [isMaroon, setIsMaroon] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('app-theme')
    if (saved === 'maroon') {
      setIsMaroon(true)
      document.documentElement.setAttribute('data-theme', 'maroon')
    } else {
      document.documentElement.setAttribute('data-theme', 'green')
    }
  }, [])

  const toggleTheme = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault()
    const nextTheme = isMaroon ? 'green' : 'maroon'
    setIsMaroon(!isMaroon)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('app-theme', nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-24 left-6 md:bottom-8 md:left-8 z-[9999] cursor-pointer w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out shadow-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream focus-visible:ring-forest bg-forest text-cream md:hover:scale-105 active:scale-95"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isMaroon ? 'maroon' : 'green'}
          initial={{ y: 20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none"
        >
          {isMaroon ? (
            // Minimal palette / brush icon for Maroon
            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.974 0-5.749-.536-8.227-1.506" />
            </svg>
          ) : (
            // Minimal leaf icon for Green
            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}

