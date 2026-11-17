import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getProducts } from '../features/catalog/catalogSlice'
import { ProductCard } from '../pages/Shop'
import { asItems, type Rec } from '../api/client'
import { CtaLink, SectionTitle } from './bits'

/** Live featured products from GET /api/catalog/products?featured=true. */
const Featured = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const res = useAppSelector((s) => s.catalog.products)
    useEffect(() => { dispatch(getProducts({ featured: true, pageSize: 8 })) }, [dispatch])
    const items = asItems(res.data).slice(0, 8)
    if (res.status === 'failed' || (res.status === 'succeeded' && items.length === 0)) return null
    return (
        <section className="max-container section-padding">
            <SectionTitle eyebrow={t('featured-eyebrow')} title={t('featured-title')} />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((p: Rec) => <ProductCard key={p.id} p={p} />)}</div>
            <div className="mt-10 text-center"><CtaLink to="/shop" tone="dark">{t('view-all')}</CtaLink></div>
        </section>
    )
}
export default Featured
