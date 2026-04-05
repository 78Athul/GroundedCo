'use client'

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { Menu, X, Leaf } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface StaggeredMenuItemProps {
  label: string
  ariaLabel: string
  link: string
}

export interface StaggeredMenuSocialItem {
  label: string
  link: string
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right'
  colors?: string[]
  items?: StaggeredMenuItemProps[]
  socialItems?: StaggeredMenuSocialItem[]
  displaySocials?: boolean
  displayItemNumbering?: boolean
  className?: string
  logo?: React.ReactNode
  menuButtonColor?: string
  openMenuButtonColor?: string
  accentColor?: string
  isFixed?: boolean
  changeMenuColorOnOpen?: boolean
  closeOnClickAway?: boolean
  onMenuOpen?: () => void
  onMenuClose?: () => void
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#01472e', '#ccd5ae', '#fefae0'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logo,
  menuButtonColor = 'currentColor',
  openMenuButtonColor = '#01472e',
  changeMenuColorOnOpen = true,
  accentColor = '#ccd5ae',
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}) => {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const preLayersRef = useRef<HTMLDivElement | null>(null)
  const preLayerElsRef = useRef<HTMLElement[]>([])
  const plusHRef = useRef<HTMLSpanElement | null>(null)
  const plusVRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLDivElement | null>(null)
  const textInnerRef = useRef<HTMLDivElement | null>(null)
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close'])

  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null)
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null)
  const colorTweenRef = useRef<gsap.core.Tween | null>(null)
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null)
  const busyRef = useRef(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const plusH = plusHRef.current
      const plusV = plusVRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current

      if (!panel || !plusH || !plusV || !icon || !textInner) return

      let preLayers: HTMLElement[] = []
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[]
      }
      preLayerElsRef.current = preLayers

      const offscreen = position === 'left' ? -100 : 100
      gsap.set([panel, ...preLayers], { xPercent: offscreen })
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      gsap.set(textInner, { yPercent: 0 })

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor })
    })
    return () => ctx.revert()
  }, [menuButtonColor, position])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    if (closeTweenRef.current) {
      closeTweenRef.current.kill()
      closeTweenRef.current = null
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[]

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }))
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'))

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })

    const tl = gsap.timeline({ paused: true })

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07)
    })

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0)
    const panelDuration = 0.65

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    )

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' },
        },
        itemsStart
      )
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart)
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
          },
          socialsStart + 0.04
        )
      }
    }

    openTlRef.current = tl
    return tl
  }, [position])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    const tl = buildOpenTimeline()
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false
      })
      tl.play(0)
    } else {
      busyRef.current = false
    }
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    const all: HTMLElement[] = [...layers, panel]
    closeTweenRef.current?.kill()
    const offscreen = position === 'left' ? -100 : 100

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.35,
      ease: 'power3.in',
      stagger: {
        each: 0.05,
        from: 'end',
      },
      overwrite: 'auto',
      onComplete: () => {
        busyRef.current = false
      },
    })
  }, [position])

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current
    const h = plusHRef.current
    const v = plusVRef.current
    if (!icon || !h || !v) return

    spinTweenRef.current?.kill()
    if (opening) {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power4.out' } }).to(h, { rotate: 45, duration: 0.5 }, 0).to(v, { rotate: -45, duration: 0.5 }, 0)
    } else {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power3.inOut' } }).to(h, { rotate: 0, duration: 0.35 }, 0).to(v, { rotate: 90, duration: 0.35 }, 0)
    }
  }, [])

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current
      if (!btn) return
      colorTweenRef.current?.kill()

      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' })
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  )

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current
    if (!inner) return
    textCycleAnimRef.current?.kill()

    const seq = opening ? ['Menu', '...', 'Close'] : ['Close', '...', 'Menu']

    setTextLines(seq)
    gsap.set(inner, { yPercent: 0 })

    const lineCount = seq.length
    const finalShift = ((lineCount - 1) / lineCount) * 100

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5,
      ease: 'power4.out',
    })
  }, [])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)

    if (target) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }

    animateIcon(target)
    animateColor(target)
    animateText(target)
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose])

  useEffect(() => {
    if (!closeOnClickAway || !open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        toggleMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeOnClickAway, open, toggleMenu])

  return (
    <div
      className={cn(
        'sm-scope overflow-hidden select-none font-sans',
        isFixed ? 'fixed inset-0 z-[100]' : 'relative w-full h-full min-h-[600px]',
        className
      )}
    >
      <div
        className="staggered-menu-wrapper w-full h-full pointer-events-auto"
        style={{ '--sm-accent': accentColor } as React.CSSProperties}
        data-position={position}
      >
        {/* Layer Backgrounds */}
        <div
          ref={preLayersRef}
          className={cn(
            'sm-prelayers absolute top-0 bottom-0 pointer-events-none z-[5] w-[100vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw]',
            position === 'left' ? 'left-0' : 'right-0'
          )}
        >
          {colors.slice(0, -1).map((c, i) => {
            const opacities = [0.92, 0.72, 0.56]
            return (
              <div
                key={i}
                className="sm-prelayer absolute inset-0"
                style={{
                  background: c,
                  opacity: opacities[i] ?? 1,
                }}
              />
            )
          })}
        </div>

        {/* Header with Logo & Toggle */}
        <header className="absolute top-0 left-0 w-full flex items-center justify-between p-8 sm:p-12 z-[30] pointer-events-auto">
          <div className="pointer-events-auto">
            {logo || (
              <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-forest" />
              </div>
            )}
          </div>

          <button
            type="button"
            ref={toggleBtnRef}
            onClick={toggleMenu}
            className="sm-toggle pointer-events-auto cursor-pointer flex items-center gap-3 px-6 py-3 rounded-full bg-cream/95 text-deep-obsidian border border-forest/20 shadow-[0_18px_45px_rgba(1,71,46,0.08)] hover:bg-cream transition-all focus:outline-none focus:ring-2 focus:ring-forest/30"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            <div className="relative h-[1.2em] overflow-hidden min-w-[50px] text-left">
              <div ref={textInnerRef} className="flex flex-col font-medium uppercase tracking-wider text-sm">
                {textLines.map((line, i) => (
                  <span key={i} className="h-[1.2em] leading-tight flex items-center">
                    {line}
                  </span>
                ))}
              </div>
            </div>
            <div ref={iconRef} className="relative w-4 h-4">
              <span ref={plusHRef} className="absolute top-1/2 left-0 w-full h-0.5 bg-current rounded-full -translate-y-1/2" />
              <span ref={plusVRef} className="absolute top-0 left-1/2 w-0.5 h-full bg-current rounded-full -translate-x-1/2" />
            </div>
          </button>
        </header>

        {/* Menu Panel */}
        <aside
          ref={panelRef}
          className={cn(
            'staggered-menu-panel absolute top-0 bottom-0 z-10 flex flex-col pt-32 pb-12 px-8 sm:px-16 overflow-y-auto w-[100vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw]',
            position === 'left' ? 'left-0' : 'right-0',
            open ? 'pointer-events-auto' : 'pointer-events-none'
          )}
          style={{
            background: colors[colors.length - 1],
          }}
        >
          <div className="flex-1 flex flex-col">
            <nav>
              <ul className="flex flex-col gap-4 list-none p-0 m-0">
                {items.map((item, idx) => (
                  <li key={idx} className="overflow-hidden">
                    <a
                      href={item.link}
                      className="group relative flex items-baseline gap-4 no-underline"
                      aria-label={item.ariaLabel}
                    >
                      {displayItemNumbering && (
                        <span className="text-sm font-medium opacity-40 translate-y-[-0.5rem]">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      )}
                      <span
                        className={cn(
                          'sm-panel-itemLabel inline-block font-bold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter transition-colors',
                          item.label === 'Enter the Quiet'
                            ? 'text-forest drop-shadow-[0_0_36px_rgba(204,213,174,0.28)]'
                            : 'text-deep-obsidian group-hover:text-[var(--sm-accent)]'
                        )}
                        style={
                          item.label === 'Enter the Quiet'
                            ? { textShadow: '0 0 30px rgba(204,213,174,0.26)' }
                            : undefined
                        }
                      >
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {displaySocials && socialItems.length > 0 && (
              <div className="mt-auto pt-12">
                <h3 className="sm-socials-title text-xs font-bold uppercase tracking-widest mb-6 opacity-40">Socials</h3>
                <ul className="flex flex-wrap gap-x-8 gap-y-2 list-none p-0 m-0">
                  {socialItems.map((social, i) => (
                    <li key={i}>
                      <a
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link text-sm font-medium text-deep-obsidian no-underline hover:text-muted-earth transition-colors py-1 inline-block"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default StaggeredMenu
