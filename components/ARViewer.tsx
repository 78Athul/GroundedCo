'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import Image from 'next/image'

interface ARViewerProps {
  rugImage: string
  rugName: string
  onClose: () => void
}

export default function ARViewer({ rugImage, rugName, onClose }: ARViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  // Rug transform state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(0.5)
  const [rotation, setRotation] = useState(0)

  // Refs for gesture tracking
  const dragRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const pinchRef = useRef({ active: false, startDist: 0, startScale: 0, startAngle: 0, startRotation: 0 })
  const posRef = useRef(position)
  const scaleRef = useRef(scale)
  const rotRef = useRef(rotation)

  // Sync state to refs for gesture handlers
  useEffect(() => {
    posRef.current = position
    scaleRef.current = scale
    rotRef.current = rotation
  }, [position, scale, rotation])

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      setCameraError(null)
      setCameraReady(false)

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera not available. Make sure you are using HTTPS or localhost.')
        return
      }

      // Stop existing stream
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
        videoRef.current.srcObject = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      const video = videoRef.current
      if (!video) return

      video.srcObject = stream
      video.onloadedmetadata = async () => {
        try {
          await video.play()
          setCameraReady(true)
        } catch {
          setCameraError('Could not start video playback. Please try again.')
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings and try again.')
      } else {
        setCameraError('Could not access camera. Please check permissions and try again.')
      }
    }
  }, [])

  // Center rug + start camera on mount
  useLayoutEffect(() => {
    setPosition({ x: window.innerWidth / 2, y: window.innerHeight * 0.55 })
  }, [])

  useEffect(() => {
    startCamera(facingMode)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const video = videoRef.current
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
    }
  }, [facingMode, startCamera])

  // Lock body scroll
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  // ─── Touch handlers ───
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.touches.length === 1) {
      const t = e.touches[0]
      dragRef.current = { active: true, startX: t.clientX, startY: t.clientY, origX: posRef.current.x, origY: posRef.current.y }
    } else if (e.touches.length === 2) {
      dragRef.current.active = false
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX)
      pinchRef.current = { active: true, startDist: dist, startScale: scaleRef.current, startAngle: angle, startRotation: rotRef.current }
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.touches.length === 1 && dragRef.current.active) {
      const t = e.touches[0]
      setPosition({
        x: dragRef.current.origX + (t.clientX - dragRef.current.startX),
        y: dragRef.current.origY + (t.clientY - dragRef.current.startY),
      })
    } else if (e.touches.length === 2 && pinchRef.current.active) {
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX)
      setScale(Math.max(0.15, Math.min(2, pinchRef.current.startScale * (dist / pinchRef.current.startDist))))
      setRotation(pinchRef.current.startRotation + (angle - pinchRef.current.startAngle) * (180 / Math.PI))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    dragRef.current.active = false
    pinchRef.current.active = false
  }, [])

  // ─── Mouse handlers ───
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: posRef.current.x, origY: posRef.current.y }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.active) return
    setPosition({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(prev => Math.max(0.15, Math.min(2, prev - e.deltaY * 0.001)))
  }, [])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000' }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Camera feed — always in DOM so ref is available */}
      <video
        ref={videoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        playsInline
        muted
      />

      {/* Loading */}
      {!cameraReady && !cameraError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.92)', zIndex: 10 }}>
          <div style={{ textAlign: 'center', padding: '0 2rem' }}>
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p style={{ color: '#fff', fontSize: '14px', letterSpacing: '0.05em' }}>Opening camera...</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '8px' }}>Allow camera access when prompted</p>
          </div>
        </div>
      )}

      {/* Error */}
      {cameraError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 10, padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <svg style={{ width: 56, height: 56, color: 'rgba(255,255,255,0.4)', margin: '0 auto 20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>{cameraError}</p>
            <button
              onClick={onClose}
              style={{ color: '#fff', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '9999px', background: 'transparent', cursor: 'pointer' }}
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Rug overlay */}
      {cameraReady && (
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: '65vmin',
            aspectRatio: '4 / 3',
            transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg) perspective(600px) rotateX(35deg)`,
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))',
            touchAction: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <Image
            src={rugImage}
            alt={`${rugName} — AR Preview`}
            fill
            className="object-contain pointer-events-none select-none"
            sizes="65vmin"
            draggable={false}
            priority
          />
        </div>
      )}

      {/* Top bar — always visible */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 16px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#fff', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' as const,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
              padding: '10px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>

          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', letterSpacing: '0.05em' }}>{rugName}</span>

          <button
            onClick={flipCamera}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            <svg style={{ width: 20, height: 20, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      {cameraReady && (
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding: '40px 20px 0',
            paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', paddingBottom: '16px' }}>
            <button
              onClick={() => setScale(s => Math.max(0.15, s - 0.1))}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#fff' }}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12h-15" />
              </svg>
            </button>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textAlign: 'center', lineHeight: 1.6 }}>
              Drag to move<br />Pinch to resize
            </p>

            <button
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#fff' }}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', paddingBottom: '8px' }}>
            <button
              onClick={() => setRotation(r => r - 15)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' as const, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: '8px 14px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
            >
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Rotate
            </button>
            <button
              onClick={() => { setRotation(0); setScale(0.5) }}
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' as const, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', padding: '8px 14px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
            >
              Reset
            </button>
            <button
              onClick={() => setRotation(r => r + 15)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' as const, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: '8px 14px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
            >
              Rotate
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
