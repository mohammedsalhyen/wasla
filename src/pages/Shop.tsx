import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { IoClose, IoHeart, IoHeartOutline, IoOptionsOutline, IoSearch } from 'react-icons/io5'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getCategories, getProducts, getStores, toggleFavorite } from '../features/catalog/catalogSlice'
import { useEnums } from '../features/site/hooks'
import { asItems, type Rec } from '../api/client'
import { enumOf } from '../lib/enums'
import { formatPrice } from '../lib/format'
import { Button, ErrorBox, Img, Pager } from '../components/ui'

// ------------------------------- Favorite + Card (also used by landing + favorites page) -------------------------------
export const FavButton = ({ id, on }: { id: number; on?: boolean }) => {
    const dispatch = useAppDispatch()
    const token = useAppSelector((s) => s.auth.token)
    if (!token) return null
    return (
        <motion.button whileTap={{ scale: 1.3 }} aria-label="favorite" onClick={() => dispatch(toggleFavorite({ id, on: !!on }))}
            className="flex-center absolute inset-e-3 top-3 z-10 size-9 rounded-full bg-white/95 text-lg text-brand shadow-sm backdrop-blur">
            {on ? <IoHeart /> : <IoHeartOutline />}
        </motion.button>
    )
}

export const ProductCard = ({ p, index = 0 }: { p: Rec; index?: number }) => {
    const { t } = useTranslation()
    const discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
    return (
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.04 }} className="group relative">
            <Link to={`/shop/${p.id}`} className="block">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft">
                    <Img src={p.imageUrl} alt={p.name} className="size-full transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-s-3 top-3 flex flex-col items-start gap-1.5">
                        {discount > 0 && <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}
                        {p.stockLeft != null && <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-orange-600">{t('stock-left', { n: p.stockLeft })}</span>}
                    </div>
                    <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-xl bg-ink/90 py-2.5 text-center text-sm font-semibold text-white opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">{t('view-product')}</span>
                </div>
                <div className="mt-3 space-y-1">
                    {(p.storeName || p.store?.name) && <p className="text-xs text-muted">{p.storeName ?? p.store?.name}</p>}
                    <h3 className="line-clamp-1 font-semibold">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                        <b className="text-brand">{formatPrice(p.price)}</b>
                        {discount > 0 && <s className="text-xs text-muted">{formatPrice(p.oldPrice)}</s>}
                    </div>
                </div>
            </Link>
            <FavButton id={p.id} on={p.isFavorite} />
        </motion.article>
    )
}

const CardSkeleton = () => (
    <div className="animate-pulse"><div className="aspect-4/5 rounded-2xl bg-soft" /><div className="mt-3 h-4 w-3/4 rounded bg-soft" /><div className="mt-2 h-4 w-1/3 rounded bg-soft" /></div>
)

// ------------------------------- Filters (sidebar on desktop, bottom sheet on mobile) -------------------------------
const sorts = ['Featured', 'Newest', 'PriceLowToHigh', 'PriceHighToLow', 'BestSelling']

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-line py-5 first:pt-0 last:border-0"><h4 className="mb-3 text-sm font-bold">{title}</h4>{children}</div>
)

const Radio = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start text-sm transition hover:bg-soft ${on ? 'font-semibold text-brand' : 'text-ink'}`}>
        <span className={`size-4 shrink-0 rounded-full border-2 ${on ? 'border-brand bg-brand ring-2 ring-inset ring-white' : 'border-line'}`} />{label}
    </button>
)

const FiltersPanel = ({ q, set, categories, stores }: { q: Record<string, string>; set: (k: string, v: string) => void; categories: Rec[]; stores: Rec[] }) => {
    const { t } = useTranslation()
    return (
        <div>
            <Group title={t('category')}>
                <Radio on={!q.categoryId} label={t('all-categories')} onClick={() => set('categoryId', '')} />
                {categories.map((c) => <Radio key={c.id} on={q.categoryId === String(c.id)} label={c.name} onClick={() => set('categoryId', String(c.id))} />)}
            </Group>
            <Group title={t('store')}>
                <Radio on={!q.storeId} label={t('all-stores')} onClick={() => set('storeId', '')} />
                {stores.map((s) => <Radio key={s.id} on={q.storeId === String(s.id)} label={s.name} onClick={() => set('storeId', String(s.id))} />)}
            </Group>
            <Group title={t('price')}>
                <div className="flex items-center gap-2" key={`${q.minPrice}-${q.maxPrice}`}>
                    <input type="number" min={0} placeholder={t('min-price')} defaultValue={q.minPrice} onBlur={(e) => set('minPrice', e.target.value)} className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand" />
                    <span className="text-muted">–</span>
                    <input type="number" min={0} placeholder={t('max-price')} defaultValue={q.maxPrice} onBlur={(e) => set('maxPrice', e.target.value)} className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand" />
                </div>
            </Group>
        </div>
    )
}

// ------------------------------- Page -------------------------------
const Shop = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const [sp, setSp] = useSearchParams()
    const q = Object.fromEntries(sp.entries())
    const enums = useEnums()
    const { products, categories, stores } = useAppSelector((s) => s.catalog)
    const [sheet, setSheet] = useState(false)

    const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); n.delete('page'); setSp(n) }
    const clear = () => setSp(new URLSearchParams())

    useEffect(() => { dispatch(getStores()) }, [dispatch])
    useEffect(() => { dispatch(getCategories(q.section)) }, [dispatch, q.section])
    useEffect(() => {
        dispatch(getProducts({ section: q.section, categoryId: q.categoryId, storeId: q.storeId, occasion: q.occasion, minPrice: q.minPrice, maxPrice: q.maxPrice, sort: q.sort, search: q.search, page: q.page ?? 1, pageSize: 12 }))
    }, [dispatch, sp]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { document.body.style.overflow = sheet ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [sheet])

    const cats = asItems(categories.data); const shops = asItems(stores.data)
    const sections = enumOf(enums, 'CatalogSection').length ? enumOf(enums, 'CatalogSection').map((o) => o.name) : ['Gifts', 'Handmade', 'Wedding']
    const occasions = enumOf(enums, 'Occasion').filter((o) => o.value > 0)
    const data = products.data as Rec | undefined
    const loading = products.status === 'loading' || !data

    // active filter chips
    const chips: { k: string; label: string }[] = []
    if (q.section) chips.push({ k: 'section', label: t(`enum-${q.section}`, q.section) })
    if (q.occasion) chips.push({ k: 'occasion', label: t(`enum-${q.occasion}`, q.occasion) })
    if (q.categoryId) chips.push({ k: 'categoryId', label: cats.find((c) => String(c.id) === q.categoryId)?.name ?? t('category') })
    if (q.storeId) chips.push({ k: 'storeId', label: shops.find((s) => String(s.id) === q.storeId)?.name ?? t('store') })
    if (q.minPrice) chips.push({ k: 'minPrice', label: `≥ ${formatPrice(Number(q.minPrice))}` })
    if (q.maxPrice) chips.push({ k: 'maxPrice', label: `≤ ${formatPrice(Number(q.maxPrice))}` })
    if (q.search) chips.push({ k: 'search', label: `“${q.search}”` })

    const pill = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-ink text-white' : 'bg-soft text-ink hover:bg-line'}`

    return (
        <main>
            {/* hero strip */}
            <section className="relative overflow-hidden bg-night text-white">
                <div className="pointer-events-none absolute -top-24 inset-s-1/4 size-80 rounded-full bg-brand/40 blur-3xl" aria-hidden />
                <div className="max-container relative py-12 md:py-16">
                    <h1 className="text-4xl md:text-6xl">{t('shop-title')}</h1>
                    <p className="mt-3 max-w-xl text-white/70">{t('shop-desc')}</p>
                    <div className="relative mt-7 max-w-2xl">
                        <IoSearch className="pointer-events-none absolute inset-s-5 top-1/2 -translate-y-1/2 text-xl text-muted" />
                        <input key={q.search} defaultValue={q.search} placeholder={t('search-ph')} onKeyDown={(e) => e.key === 'Enter' && set('search', e.currentTarget.value)}
                            className="w-full rounded-2xl bg-white py-4 pe-5 ps-14 text-ink shadow-xl outline-none ring-brand/40 focus:ring-4" />
                    </div>
                </div>
            </section>

            <div className="max-container py-8">
                {/* section tabs + occasion chips */}
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
                    <button className={pill(!q.section)} onClick={() => set('section', '')}>{t('all-sections')}</button>
                    {sections.map((s) => <button key={s} className={pill(q.section === s)} onClick={() => set('section', s)}>{t(`enum-${s}`, s)}</button>)}
                </div>
                {occasions.length > 0 && (
                    <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
                        {occasions.map((o) => (
                            <button key={o.name} onClick={() => set('occasion', q.occasion === o.name ? '' : o.name)}
                                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${q.occasion === o.name ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line text-muted hover:border-ink hover:text-ink'}`}>{t(`enum-${o.name}`, o.name)}</button>
                        ))}
                    </div>
                )}

                <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_1fr]">
                    {/* desktop sidebar */}
                    <aside className="hidden lg:block"><div className="sticky top-24"><FiltersPanel q={q} set={set} categories={cats} stores={shops} /></div></aside>

                    <section>
                        {/* toolbar */}
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-muted">{data ? t('results-count', { n: data.totalCount ?? data.items?.length ?? 0 }) : ' '}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" className="lg:hidden" onClick={() => setSheet(true)}><IoOptionsOutline />{t('filters')}</Button>
                                <select value={q.sort ?? ''} onChange={(e) => set('sort', e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-brand">
                                    <option value="">{t('sort')}</option>{sorts.map((s) => <option key={s} value={s}>{t(`sort-${s}`)}</option>)}
                                </select>
                            </div>
                        </div>

                        {chips.length > 0 && (
                            <div className="mb-6 flex flex-wrap items-center gap-2">
                                {chips.map((c) => <button key={c.k} onClick={() => set(c.k, '')} className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand">{c.label}<IoClose /></button>)}
                                <button onClick={clear} className="px-2 text-sm text-muted underline underline-offset-4">{t('clear-all')}</button>
                            </div>
                        )}

                        {products.status === 'failed' ? <ErrorBox error={products.error} /> : loading ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
                        ) : data.items.length === 0 ? (
                            <div className="flex-center flex-col gap-4 rounded-3xl border border-dashed border-line py-20 text-center">
                                <span className="text-5xl" aria-hidden>🔍</span><p className="text-muted">{t('no-products')}</p>
                                <Button onClick={clear}>{t('clear-all')}</Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">{data.items.map((p: Rec, i: number) => <ProductCard key={p.id} p={p} index={i} />)}</div>
                                <Pager data={data as never} onPage={(p) => { const n = new URLSearchParams(sp); n.set('page', String(p)); setSp(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
                            </>
                        )}
                    </section>
                </div>
            </div>

            {/* mobile bottom sheet */}
            {sheet && (
                <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSheet(false)}>
                    <div className="absolute inset-0 bg-black/40" />
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'tween', duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-6">
                        <div className="mb-4 flex items-center justify-between"><h3 className="text-xl">{t('filters')}</h3><button onClick={() => setSheet(false)} aria-label="close" className="text-2xl"><IoClose /></button></div>
                        <FiltersPanel q={q} set={set} categories={cats} stores={shops} />
                        <Button className="mt-4 w-full" onClick={() => setSheet(false)}>{t('show-results')}</Button>
                    </motion.div>
                </div>
            )}
        </main>
    )
}
export default Shop