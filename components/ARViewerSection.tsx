'use client'

import { useState, lazy, Suspense } from 'react'

const ARViewer = lazy(() => import('./ARViewer'))

interface ARViewerSectionProps {
  rugImage: string
  rugName: string
}

export default function ARViewerSection({ rugImage, rugName }: ARViewerSectionProps) {
  const [arOpen, setArOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setArOpen(true)}
        className="group flex items-center gap-3 mb-6 px-4 py-3.5 border border-forest/20 hover:border-forest/40 active:border-forest/50 bg-forest/[0.07] hover:bg-forest/[0.12] active:bg-forest/[0.15] rounded-lg transition-all duration-300 cursor-pointer w-full"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center ar-icon-pulse group-hover:bg-forest/15 transition-colors">
          <svg className="w-5 h-5 text-forest/70 group-hover:text-forest transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.2" />
            <circle cx="12" cy="10" r="3" strokeWidth="1.2" />
            <path d="M7 6h2M15 6h2M7 14h2M15 14h2" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 19h4" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex-1 text-left min-w-0">
          <span className="font-sans text-deep-obsidian text-xs tracking-[0.1em] uppercase font-medium group-hover:text-forest transition-colors">
            View in Your Room
          </span>
          <span className="block font-sans text-deep-obsidian/55 text-[10px] leading-snug mt-0.5">
            See {rugName} on your floor with AR
          </span>
        </div>

        <svg className="w-4 h-4 flex-shrink-0 text-forest/40 group-hover:text-forest/70 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {arOpen && (
        <Suspense fallback={
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: '#fff', fontSize: '14px' }}>Loading AR...</p>
            </div>
          </div>
        }>
          <ARViewer
            rugImage={rugImage}
            rugName={rugName}
            onClose={() => setArOpen(false)}
          />
        </Suspense>
      )}
    </>
  )
}
