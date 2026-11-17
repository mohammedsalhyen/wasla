import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getProduct } from '../features/catalog/catalogSlice'
import { addItem } from '../features/cart/cartSlice'
import { Async, Button, Field, Img, inputCls } from '../components/ui'
import { formatPrice } from '../lib/format'
import type { Rec } from '../api/client'
import { FavButton } from './Shop'

const Product = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { id } = useParams()
    const res = useAppSelector((s) => s.catalog.product)
    const [img, setImg] = useState(0)
    const [color, setColor] = useState<number>()
    const [text, setText] = useState('')
    const [qty, setQty] = useState(1)
    const [fly, setFly] = useState(0)

    useEffect(() => { if (id) dispatch(getProduct(id)) }, [id, dispatch])

    return (
        <main className="max-container py-10">
            <Async res={res}>{(p: Rec) => {
                const images: string[] = (p.images ?? []).map((i: Rec | string) => (typeof i === 'string' ? i : i.url ?? i.imageUrl))
                if (!images.length && p.imageUrl) images.push(p.imageUrl)
                const colors: Rec[] = (p.colors ?? []).filter((c: Rec) => c.isAvailable !== false)
                const add = () => {
                    const c = colors.find((x) => x.id === color)
                    dispatch(addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: images[0], quantity: qty, colorId: color, colorName: c?.name, customText: text || undefined }))
                    setFly((n) => n + 1)
                }
                return (
                    <div className="grid gap-10 md:grid-cols-2">
                        <div>
                            <div className="relative overflow-hidden rounded-3xl border border-line">
                                <AnimatePresence mode="wait"><motion.div key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Img src={images[img]} alt={p.name} className="aspect-square w-full" /></motion.div></AnimatePresence>
                                <FavButton id={p.id} on={p.isFavorite} />
                            </div>
                            <div className="mt-3 flex gap-2 overflow-x-auto">{images.map((u, i) => <button key={u} onClick={() => setImg(i)} className={`size-16 shrink-0 overflow-hidden rounded-xl ring-2 ${i === img ? 'ring-brand' : 'ring-transparent'}`}><Img src={u} className="size-full" /></button>)}</div>
                        </div>
                        <div className="space-y-5">
                            <h1 className="text-3xl md:text-4xl">{p.name}</h1>
                            <div className="flex items-baseline gap-3"><b className="text-2xl text-brand">{formatPrice(p.price)}</b>{p.oldPrice > p.price && <s className="text-muted">{formatPrice(p.oldPrice)}</s>}</div>
                            {p.stockLeft != null && <p className="font-semibold text-orange-600">{t('stock-left', { n: p.stockLeft })}</p>}
                            {p.description && <p className="leading-8 text-muted">{p.description}</p>}
                            {p.preparationDays != null && <p className="text-sm text-muted">{t('prep-days', { n: p.preparationDays })}</p>}
                            {colors.length > 0 && (
                                <div><span className="mb-2 block text-sm font-medium">{t('color')}</span>
                                    <div className="flex gap-3">{colors.map((c) => <button key={c.id} aria-label={c.name} title={c.name} onClick={() => setColor(c.id)} className={`size-9 rounded-full ring-2 ring-offset-2 ${color === c.id ? 'ring-brand' : 'ring-line'}`} style={{ background: c.hexCode }} />)}</div>
                                </div>
                            )}
                            {p.allowsCustomText && <Field label={p.customTextLabel || t('custom-text')}><input className={inputCls} maxLength={p.customTextMaxLength || 40} value={text} onChange={(e) => setText(e.target.value)} /></Field>}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center rounded-xl border border-line"><button className="size-11" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="w-8 text-center">{qty}</span><button className="size-11" onClick={() => setQty(qty + 1)}>+</button></div>
                                <Button className="relative flex-1 overflow-visible py-3.5" disabled={colors.length > 0 && !color} onClick={add}>
                                    {t('add-to-cart')}
                                    <AnimatePresence>{fly > 0 && <motion.span key={fly} className="pointer-events-none absolute -top-2 start-1/2 text-2xl" initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -130, x: 90, opacity: 0, scale: 0.3 }} transition={{ duration: 0.8 }}>🎁</motion.span>}</AnimatePresence>
                                </Button>
                            </div>
                            {colors.length > 0 && !color && <p className="text-sm text-muted">{t('pick-color')}</p>}
                        </div>
                    </div>
                )
            }}</Async>
        </main>
    )
}
export default Product
