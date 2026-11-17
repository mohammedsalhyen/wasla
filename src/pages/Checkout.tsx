import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearCart, getQuote, quoteItems } from '../features/cart/cartSlice'
import { createOrder } from '../features/orders/ordersSlice'
import { useEnums, useSite } from '../features/site/hooks'
import { enumOf } from '../lib/enums'
import { formatPrice } from '../lib/format'
import type { Rec } from '../api/client'
import { Button, Card, Empty, Field, inputCls, PageWrap, Spinner } from '../components/ui'

const STEPS = ['step-recipient', 'step-delivery', 'step-wrap', 'step-payment']
const initial = { recipientName: '', recipientPhone: '', addressLine: '', landmark: '', deliveryZoneId: '', deliveryDate: '', deliverySlot: '', isSurprise: false, hideSender: false, giftWrap: false, withReveal: false, cardMessage: '', senderName: '', customerNote: '', paymentMethod: '' }
const egPhone = /^(\+?20|0)?1[0125]\d{8}$/

const Checkout = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const nav = useNavigate()
    const items = useAppSelector((s) => s.cart.items)
    const quote = useAppSelector((s) => s.cart.quote)
    const site = useSite(); const enums = useEnums()
    const [step, setStep] = useState(0)
    const [v, setV] = useState(initial)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const set = (k: keyof typeof initial, x: string | boolean) => setV((p) => ({ ...p, [k]: x }))
    const bind = (k: keyof typeof initial) => ({ value: v[k] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value) })

    const zone: Rec | undefined = (site?.deliveryZones ?? []).find((z: Rec) => z.id === Number(v.deliveryZoneId))
    const slots = enumOf(enums, 'DeliverySlot').filter((o) => zone?.supportsMidnight || !/midnight/i.test(o.name))
    const methods = enumOf(enums, 'PaymentMethod').filter((o) => o.name !== 'CashOnDelivery' || site?.cashOnDeliveryEnabled !== false)
    const method = methods.find((m) => String(m.value) === v.paymentMethod)
    const account = (site?.paymentAccounts ?? []).find((a: Rec) => a.method === method?.name || a.method === method?.value)
    const earliest: string | undefined = quote.data?.earliestDeliveryDate

    useEffect(() => {
        if (!items.length) return
        dispatch(getQuote({ deliveryZoneId: v.deliveryZoneId ? Number(v.deliveryZoneId) : undefined, deliverySlot: v.deliverySlot ? Number(v.deliverySlot) : undefined, giftWrap: v.giftWrap, withReveal: v.withReveal }))
    }, [items, v.deliveryZoneId, v.deliverySlot, v.giftWrap, v.withReveal, dispatch])

    if (!items.length) return <PageWrap title={t('checkout')}><Empty>{t('cart-empty')}</Empty></PageWrap>
    if (!site || !enums) return <Spinner />

    const validate = (): string => {
        if (step === 0) { if (v.recipientName.length < 2) return 'val-recipient'; if (!egPhone.test(v.recipientPhone)) return 'val-recipient-phone'; if (v.addressLine.length < 5) return 'val-address' }
        if (step === 1) { if (!v.deliveryZoneId) return 'val-zone'; if (!v.deliveryDate) return 'val-date'; if (earliest && v.deliveryDate < earliest) return 'val-date-early'; if (!v.deliverySlot) return 'val-slot' }
        if (step === 3 && !v.paymentMethod) return 'val-payment'
        return ''
    }
    const next = () => { const e = validate(); setError(e); if (!e) setStep(step + 1) }

    const submit = async () => {
        const e = validate(); setError(e); if (e) return
        setLoading(true)
        try {
            const o = await dispatch(createOrder({
                items: quoteItems(items), deliveryZoneId: Number(v.deliveryZoneId), recipientName: v.recipientName, recipientPhone: v.recipientPhone, addressLine: v.addressLine,
                landmark: v.landmark || undefined, deliveryDate: v.deliveryDate, deliverySlot: Number(v.deliverySlot), isSurprise: v.isSurprise, cardMessage: v.cardMessage || undefined,
                senderName: v.senderName || undefined, hideSender: v.hideSender, giftWrap: v.giftWrap, withReveal: v.withReveal, paymentMethod: Number(v.paymentMethod), customerNote: v.customerNote || undefined,
            })).unwrap()
            dispatch(clearCart()); nav(`/orders/${o.id ?? o.orderId}`, { replace: true })
        } catch (err) { setError(err as string) } finally { setLoading(false) }
    }

    const Check = ({ k, label }: { k: 'isSurprise' | 'hideSender' | 'giftWrap' | 'withReveal'; label: string }) => (
        <label className="flex items-center gap-3 rounded-xl border border-line p-3.5"><input type="checkbox" className="size-5 accent-brand" checked={v[k]} onChange={(e) => set(k, e.target.checked)} />{label}</label>
    )

    return (
        <PageWrap title={t('checkout')}>
            <div className="mb-8 flex gap-2">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-line"><motion.div className="h-full origin-right bg-brand" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.45 }} /></div>
                        <span className={`mt-1 block text-xs ${i === step ? 'font-bold text-brand' : 'text-muted'}`}>{t(s)}</span>
                    </div>
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} className="space-y-4">
                            {step === 0 && <>
                                <Field label={t('recipient-name')}><input className={inputCls} {...bind('recipientName')} /></Field>
                                <Field label={t('recipient-phone')}><input className={inputCls} dir="ltr" {...bind('recipientPhone')} /></Field>
                                <Field label={t('address')}><input className={inputCls} {...bind('addressLine')} /></Field>
                                <Field label={t('landmark')}><input className={inputCls} {...bind('landmark')} /></Field>
                            </>}
                            {step === 1 && <>
                                <Field label={t('zone')}><select className={inputCls} {...bind('deliveryZoneId')}><option value="">{t('choose')}</option>{(site.deliveryZones ?? []).map((z: Rec) => <option key={z.id} value={z.id}>{z.name} — {formatPrice(z.fee)}</option>)}</select></Field>
                                <Field label={`${t('delivery-date')}${earliest ? ` (${t('from')} ${earliest})` : ''}`}><input type="date" className={inputCls} min={earliest} {...bind('deliveryDate')} /></Field>
                                <Field label={t('slot')}><select className={inputCls} {...bind('deliverySlot')}><option value="">{t('choose')}</option>{slots.map((o) => <option key={o.name} value={o.value}>{t(`enum-${o.name}`, o.name)}</option>)}</select></Field>
                            </>}
                            {step === 2 && <>
                                <Check k="isSurprise" label={t('surprise')} />
                                <Check k="giftWrap" label={`${t('gift-wrap')}${site.giftWrapFee ? ` (+${formatPrice(site.giftWrapFee)})` : ''}`} />
                                <Check k="withReveal" label={`${t('qr-gift')}${site.revealFee ? ` (+${formatPrice(site.revealFee)})` : ''}`} />
                                <Check k="hideSender" label={t('hide-sender')} />
                                <Field label={t('card-message')}><textarea rows={3} className={inputCls} {...bind('cardMessage')} /></Field>
                                <Field label={t('sender-name')}><input className={inputCls} {...bind('senderName')} /></Field>
                                <Field label={t('note-optional')}><input className={inputCls} {...bind('customerNote')} /></Field>
                            </>}
                            {step === 3 && <>
                                <Field label={t('payment-method')}><select className={inputCls} {...bind('paymentMethod')}><option value="">{t('choose')}</option>{methods.map((m) => <option key={m.name} value={m.value}>{t(`enum-${m.name}`, m.name)}</option>)}</select></Field>
                                {account && <Card className="text-sm"><b>{account.accountName}</b><p dir="ltr" className="text-start font-mono">{account.accountIdentifier}</p>{account.instructions && <p className="mt-1 text-muted">{account.instructions}</p>}<p className="mt-2 text-xs text-muted">{t('transfer-hint')}</p></Card>}
                            </>}
                        </motion.div>
                    </AnimatePresence>
                    {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    <div className="flex gap-3">
                        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>{t('back')}</Button>}
                        {step < 3 ? <Button onClick={next}>{t('next')}</Button> : <Button disabled={loading} onClick={submit}>{t('place-order')}</Button>}
                    </div>
                </div>
                <Card className="h-fit space-y-2 text-sm">
                    <h2 className="text-xl">{t('summary')}</h2>
                    {items.map((i) => <div key={i.key} className="flex justify-between"><span>{i.name} ×{i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span></div>)}
                    {quote.data?.totalAmount != null && <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><span>{t('total')}</span><span>{formatPrice(quote.data.totalAmount)}</span></div>}
                </Card>
            </div>
        </PageWrap>
    )
}
export default Checkout
