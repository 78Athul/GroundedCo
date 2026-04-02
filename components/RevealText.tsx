'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface RevealTextProps {
  text?: string
  textColor?: string
  overlayColor?: string
  fontSize?: string
  letterDelay?: number
  overlayDelay?: number
  overlayDuration?: number
  springDuration?: number
  letterImages?: string[]
}

export function RevealText({
  text = 'GROUNDED',
  textColor = 'text-cream',
  overlayColor = 'text-sage',
  fontSize = 'text-[15vw] sm:text-[18vw] md:text-[20vw]',
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = [
    // G
    '/images/yarn/yarn_green_1774982932059.png',
    // R
    '/images/yarn/yarn_red_1774982950893.png',
    // O
    '/images/yarn/yarn_blue_1774982912108.png',
    // U
    '/images/yarn/yarn_white_1774983047846.png',
    // N
    '/images/yarn/yarn_yellow_1774982969717.png',
    // D
    '/images/yarn/yarn_orange_1774982989035.png',
    // E
    '/images/yarn/yarn_pink_1774983009532.png',
    // D
    '/images/yarn/yarn_purple_1774983031343.png',
  ],
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showOverlayText, setShowOverlayText] = useState(false)

  useEffect(() => {
    const lastLetterDelay = (text.length - 1) * letterDelay
    const totalDelay = lastLetterDelay * 1000 + springDuration

    const timer = setTimeout(() => {
      setShowOverlayText(true)
    }, totalDelay)

    return () => clearTimeout(timer)
  }, [text.length, letterDelay, springDuration])

  return (
    <div className="flex items-center justify-center relative">
      <div className="flex">
        {text.split('').map((letter, index) => (
          <span
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`${fontSize} font-display font-normal tracking-tighter leading-none cursor-pointer relative uppercase animate-spring-in`}
            style={{ animationDelay: `${index * letterDelay}s` }}
          >
            {/* Base text layer */}
            <motion.span
              className={`absolute inset-0 ${textColor}`}
              animate={{
                opacity: hoveredIndex === index ? 0 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {letter}
            </motion.span>

            {/* Image text layer with background panning */}
            <motion.span
              className="text-transparent bg-clip-text bg-cover bg-no-repeat bg-center"
              animate={{
                opacity: hoveredIndex === index ? 1 : 0,
                backgroundPosition: hoveredIndex === index ? '10% center' : '50% center',
              }}
              transition={{
                opacity: { duration: 0.1 },
                backgroundPosition: {
                  duration: 3,
                  ease: 'easeInOut',
                },
              }}
              style={{
                backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {letter}
            </motion.span>

            {/* Overlay text layer that sweeps across each letter */}
            {showOverlayText && (
              <motion.span
                className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  delay: index * overlayDelay,
                  duration: overlayDuration,
                  times: [0, 0.1, 0.7, 1],
                  ease: 'easeInOut',
                }}
              >
                {letter}
              </motion.span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
