import { useTranslation } from 'react-i18next'
import Reveal from '../motion/Reveal'
import { CtaLink, Placeholder, SectionTitle } from './bits'

const Story = () => {
    const { t } = useTranslation()
    return (
        <>
            <section className="bg-soft section-padding">
                <div className="max-container">
                    <SectionTitle eyebrow={t('abroad-eyebrow')} title={t('abroad-title')}>{t('abroad-desc')}</SectionTitle>
                    <Reveal className="text-center"><CtaLink to="/shop">{t('abroad-cta')}</CtaLink></Reveal>
                </div>
            </section>

            <section className="max-container section-padding">
                <SectionTitle eyebrow={t('handmade-eyebrow')} title={t('handmade-title')} />
                <Placeholder label={t('placeholder-handmade')} />
            </section>

            <section className="bg-soft section-padding">
                <div className="max-container">
                    <SectionTitle eyebrow={t('designs-eyebrow')} title={t('designs-title')}>{t('designs-desc')}</SectionTitle>
                    <Reveal className="text-center"><CtaLink to="/designs" tone="dark">{t('designs-cta')}</CtaLink></Reveal>
                </div>
            </section>

            <section className="max-container section-padding">
                <SectionTitle eyebrow={t('reviews-eyebrow')} title={t('reviews-title')} />
                <Placeholder label={t('placeholder-reviews')} />
            </section>

            <section className="bg-brand section-padding text-white">
                <div className="max-container text-center">
                    <h2 className="text-4xl md:text-6xl">{t('final-title')}</h2>
                    <p className="mx-auto mt-4 max-w-md text-white/80">{t('final-desc')}</p>
                    <div className="mt-8"><CtaLink to="/shop" tone="light">{t('final-cta')}</CtaLink></div>
                </div>
            </section>
        </>
    )
}
export default Story
