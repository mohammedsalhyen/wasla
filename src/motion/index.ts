import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
export { gsap, ScrollTrigger }

export const ease = [0.22, 1, 0.36, 1] as const
export const isRtl = () => document.documentElement.dir === 'rtl'
/** +1 / -1 so horizontal motion mirrors in RTL */
export const dir = () => (isRtl() ? -1 : 1)

const mq = () => window.matchMedia('(prefers-reduced-motion: reduce)')
export const prefersReduced = () => mq().matches
export const useReducedMotion = () => {
  const [r, setR] = useState(prefersReduced)
  useEffect(() => {
    const m = mq(); const h = () => setR(m.matches)
    m.addEventListener('change', h); return () => m.removeEventListener('change', h)
  }, [])
  return r
}

/** Smooth scroll wired to ScrollTrigger. Skipped entirely for reduced motion. */
export const useLenis = () => {
  useEffect(() => {
    if (prefersReduced()) return
    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tick); lenis.destroy() }
  }, [])
}
