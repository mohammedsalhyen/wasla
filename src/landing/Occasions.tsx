import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoArrowBack } from 'react-icons/io5'
import Reveal from '../motion/Reveal'
import { occasions } from '../constant'
import { SectionTitle } from './bits'

/** Expanding panels: desktop = hover/focus widens one panel; mobile = snap-scroll row with every panel open. */
const Occasions = () => {
    const { t } = useTranslation()
    const [active, setActive] = useState(0)

    return (
        <section className="max-container section-padding">
            <SectionTitle eyebrow={t('occ-eyebrow')} title={t('occ-title')}>{t('occ-desc')}</SectionTitle>

            <Reveal>
                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:h-104 lg:overflow-visible lg:px-0 lg:pb-0">
                    {occasions.map((o, i) => {
                        const on = active === i
                        return (
                            <Link
                                key={o.key}
                                to={`/shop?occasion=${o.param}`}
                                onMouseEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                className={`group relative flex h-80 w-[78%] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-3xl p-6 transition-[flex] duration-500 sm:w-[46%] lg:h-auto lg:w-auto lg:shrink ${o.tone} ${on ? 'lg:flex-[3.4]' : 'lg:flex-1'}`}
                            >
                                {/* decorative ribbon curves */}
                                <svg viewBox="0 0 200 200" className="pointer-events-none absolute -bottom-10 -inset-e-10 w-64 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                    <path d="M10 190 C60 120 40 60 120 40 S190 10 190 10" /><path d="M30 190 C80 130 70 80 140 60 S190 30 190 30" /><path d="M50 190 C100 140 100 100 160 80" />
                                </svg>

                                <span className="relative text-sm font-semibold opacity-60" dir="ltr">0{i + 1}</span>

                                <div className="relative">
                                    <h3 className="text-2xl md:text-3xl">{t(o.key)}</h3>
                                    <div className={`overflow-hidden transition-all duration-500 ${on ? 'lg:mt-3 lg:max-h-32 lg:opacity-100' : 'lg:max-h-0 lg:opacity-0'} mt-3 max-h-32 opacity-100`}>
                                        <p className="max-w-xs text-sm leading-7 opacity-80">{t(`${o.key}-d`)}</p>
                                        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition group-hover:bg-white/25">
                                            {t('occ-shop')}<IoArrowBack className="rtl:rotate-0 ltr:rotate-180" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </Reveal>
        </section>
    )
}
export default Occasions
