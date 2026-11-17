import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, prefersReduced, dir } from '../motion'
import { qrSteps } from '../constant'
import { SectionTitle } from './bits'

/** Pinned, scrubbed story of the QR gift. Reduced motion = plain grid. */
const QrJourney = () => {
    const { t } = useTranslation()
    const root = useRef<HTMLElement>(null)
    const reduced = prefersReduced()

    useEffect(() => {
        if (reduced) return
        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>('.qr-step')
            gsap.set(items, { opacity: 0, x: 60 * dir() })
            gsap.set(items[0], { opacity: 1, x: 0 })
            const tl = gsap.timeline({ scrollTrigger: { trigger: '.qr-pin', start: 'top top', end: () => `+=${qrSteps.length * 70}%`, pin: true, scrub: 0.6 } })
            items.forEach((el, i) => {
                if (i > 0) tl.to(items[i - 1], { opacity: 0, x: -60 * dir(), duration: 0.5 }).to(el, { opacity: 1, x: 0, duration: 0.5 }, '<')
                tl.to('.qr-progress', { scaleX: (i + 1) / qrSteps.length, duration: 0.5, ease: 'none' }, '<')
                tl.to({}, { duration: 0.6 })
            })
        }, root)
        return () => { ctx.revert(); ScrollTrigger.refresh() }
    }, [reduced])

    if (reduced) {
        return (
            <section id="qr-journey" className="bg-night section-padding text-white">
                <div className="max-container">
                    <SectionTitle light eyebrow={t('qr-eyebrow')} title={t('qr-title')} />
                    <ol className="grid gap-4 md:grid-cols-5">{qrSteps.map((k, i) => <li key={k} className="rounded-2xl bg-white/5 p-5"><b>{i + 1}. {t(`${k}-t`)}</b><p className="mt-2 text-sm text-white/70">{t(`${k}-d`)}</p></li>)}</ol>
                </div>
            </section>
        )
    }

    return (
        <section id="qr-journey" ref={root} className="bg-night text-white">
            <div className="qr-pin flex min-h-dvh flex-col justify-center overflow-hidden">
                <div className="max-container w-full">
                    <SectionTitle light eyebrow={t('qr-eyebrow')} title={t('qr-title')} />
                    <div className="relative mx-auto h-48 max-w-xl">
                        {qrSteps.map((k, i) => (
                            <div key={k} className="qr-step flex-center absolute inset-0 flex-col gap-3 text-center">
                                <span className="text-7xl font-bold text-brand">{i + 1}</span>
                                <h3 className="text-3xl">{t(`${k}-t`)}</h3>
                                <p className="text-white/70">{t(`${k}-d`)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mx-auto mt-6 h-1 max-w-xl overflow-hidden rounded-full bg-white/10"><div className="qr-progress h-full origin-right bg-brand" style={{ transform: 'scaleX(0)' }} /></div>
                </div>
            </div>
        </section>
    )
}
export default QrJourney
