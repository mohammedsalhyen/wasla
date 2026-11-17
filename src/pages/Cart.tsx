import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearCart, getQuote, removeItem, setQty } from '../features/cart/cartSlice'
import { Button, Card, Empty, Img, LinkButton, PageWrap, Spinner } from '../components/ui'
import { formatPrice } from '../lib/format'

const Cart = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { items, quote } = useAppSelector((s) => s.cart)

    useEffect(() => { if (items.length) dispatch(getQuote({})) }, [items, dispatch])

    if (!items.length) return <PageWrap title={t('cart')}><Empty>{t('cart-empty')} <Link to="/shop" className="font-semibold text-brand">{t('browse-gifts')}</Link></Empty></PageWrap>
    return (
        <PageWrap title={t('cart')}>
            <div className="grid gap-6 md:grid-cols-[1fr_22rem]">
                <div className="space-y-3">
                    {items.map((i) => (
                        <Card key={i.key} className="flex gap-4">
                            <Img src={i.imageUrl} className="size-20 rounded-xl" />
                            <div className="flex-1">
                                <b>{i.name}</b>
                                <p className="text-xs text-muted">{[i.colorName, i.customText && `«${i.customText}»`].filter(Boolean).join(' · ')}</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <button className="size-8 rounded-lg border border-line" onClick={() => dispatch(setQty({ key: i.key, qty: i.quantity - 1 }))}>−</button>{i.quantity}
                                    <button className="size-8 rounded-lg border border-line" onClick={() => dispatch(setQty({ key: i.key, qty: i.quantity + 1 }))}>+</button>
                                    <button className="ms-auto text-xs text-red-600" onClick={() => dispatch(removeItem(i.key))}>{t('remove')}</button>
                                </div>
                            </div>
                            <b>{formatPrice(i.price * i.quantity)}</b>
                        </Card>
                    ))}
                </div>
                <Card className="h-fit space-y-3">
                    <h2 className="text-xl">{t('summary')}</h2>
                    {quote.status === 'loading' && !quote.data ? <Spinner /> : quote.status === 'failed' ? <p className="text-sm text-red-600">{t('quote-error')}</p> : (
                        <>
                            {quote.data?.totalAmount != null && <div className="flex justify-between"><span>{t('total')}</span><b>{formatPrice(quote.data.totalAmount)}</b></div>}
                            {quote.data?.earliestDeliveryDate && <p className="text-xs text-muted">{t('earliest-delivery')}: {quote.data.earliestDeliveryDate}</p>}
                        </>
                    )}
                    <LinkButton to="/checkout">{t('continue-order')}</LinkButton>
                    <Button variant="ghost" onClick={() => dispatch(clearCart())}>{t('clear-cart')}</Button>
                </Card>
            </div>
        </PageWrap>
    )
}
export default Cart
