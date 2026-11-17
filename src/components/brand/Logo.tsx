import { useEffect, useRef } from 'react'
import { gsap, prefersReduced } from '../../motion'
import { LOGO_ART, LOGO_VIEWBOX, LOGO_WORD } from './logoPaths'

/** Wordmark reveals with a wipe, then the gift-hand lifts in. Static when reduced motion. */
const Logo = ({ animate = false, tone = 'brand', className = '' }: { animate?: boolean; tone?: 'light' | 'brand'; className?: string }) => {
    const art = useRef<SVGGElement>(null)
    const clip = useRef<SVGRectElement>(null)
    const color = tone === 'light' ? '#fff' : '#B80662'

    useEffect(() => {
        if (!animate || prefersReduced()) return
        const tl = gsap.timeline()
        tl.fromTo(clip.current, { attr: { width: 0 } }, { attr: { width: 750 }, duration: 1.1, ease: 'power3.out' })
            .fromTo(art.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, '-=0.2')
        return () => { tl.kill() }
    }, [animate])

    return (
        <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label="Wasla" fill={color} fillRule="evenodd">
            <defs><clipPath id="wasla-wipe"><rect ref={clip} x="0" y="0" width="750" height="375" /></clipPath></defs>
            <g clipPath={animate ? 'url(#wasla-wipe)' : undefined}><path d={LOGO_WORD} /></g>
            <g ref={art}><path d={LOGO_ART} /></g>
        </svg>
    )
}
export default Logo
