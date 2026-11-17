import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, prefersReduced } from '../motion'
import { CtaLink } from './bits'

/** Gift box: ribbon unties, lid lifts, sparks float out. Copy rises in after. */
const HeroUnwrap = () => {
    const { t } = useTranslation()
    const root = useRef<HTMLElement>(null)

    useEffect(() => {
        if (prefersReduced()) return
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            tl.from('.hero-copy > *', { y: 28, opacity: 0, stagger: 0.1, duration: 0.7 })
                .from('.box-body', { y: 40, opacity: 0, duration: 0.6 }, 0.2)
                .to('.rib-l', { xPercent: -130, rotate: -25, opacity: 0, duration: 0.7 }, '+=0.2')
                .to('.rib-r', { xPercent: 130, rotate: 25, opacity: 0, duration: 0.7 }, '<')
                .to('.lid', { y: -80, rotate: -7, transformOrigin: '0% 100%', duration: 0.8, ease: 'back.out(1.6)' }, '-=0.3')
                .from('.spark', { scale: 0, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(3)' }, '-=0.5')
            gsap.to('.spark', { y: -10, repeat: -1, yoyo: true, duration: 1.6, ease: 'sine.inOut', stagger: 0.2 })
        }, root)
        return () => ctx.revert()
    }, [])

    return (
        <section ref={root} className="overflow-hidden bg-linear-to-b from-brand-soft/60 to-white">
            <div className="max-container grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-12 md:grid-cols-2">
                <div className="hero-copy flex flex-col items-center gap-6 text-center md:items-start md:text-start">
                    <span className="rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-medium text-brand">{t('hero-eyebrow')}</span>
                    <h1 className="text-4xl leading-[1.25] md:text-6xl md:leading-[1.2]">{t('hero-title')}</h1>
                    <p className="max-w-lg leading-8 text-muted md:text-lg">{t('hero-subtitle')}</p>
                    <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                        <CtaLink to="/shop">{t('hero-cta')}</CtaLink>
                        <a href="#qr-journey" className="rounded-xl border border-line bg-white px-7 py-3.5 font-semibold hover:bg-soft">{t('hero-cta-2')}</a>
                    </div>
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
                    {['top-4 start-6', 'top-20 end-2', 'top-0 end-24', 'top-32 start-0'].map((p, i) => <span key={i} className={`spark absolute ${p} text-2xl text-brand`}>✦</span>)}
                    <svg viewBox="0 0 200 180" className="absolute inset-0 m-auto w-full">
                        <ellipse cx="100" cy="168" rx="70" ry="7" fill="#111114" opacity=".08" />
                        <rect className="box-body" x="30" y="78" width="140" height="88" rx="8" fill="#B80662" />
                        <rect className="box-body" x="92" y="78" width="16" height="88" fill="#FCEAF3" />
                        <g className="lid">
                            <rect x="22" y="54" width="156" height="28" rx="8" fill="#94054F" />
                            <rect x="92" y="54" width="16" height="28" fill="#FCEAF3" />
                        </g>
                        <path className="rib-l" d="M100 54 C70 22 48 34 62 52 C72 62 90 56 100 54Z" fill="#FCEAF3" />
                        <path className="rib-r" d="M100 54 C130 22 152 34 138 52 C128 62 110 56 100 54Z" fill="#FCEAF3" />
                    </svg>
                </div>
            </div>
        </section>
    )
}
export default HeroUnwrap
