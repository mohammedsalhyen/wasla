import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { cancelOrder, deleteRevealMessage, getOrder, getOrders, payOrder, rateOrder, uploadRevealMessage } from '../features/orders/ordersSlice'
import { useEnums } from '../features/site/hooks'
import { asItems, openFile, type Rec } from '../api/client'
import { enumOf, orderStatusStrip } from '../lib/enums'
import { formatPrice, toDate } from '../lib/format'
import { Async, Button, Card, Empty, inputCls, PageWrap } from '../components/ui'

export const StatusBadge = ({ s }: { s: number }) => { const { t } = useTranslation(); return <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{t(`status-${s}`)}</span> }

export const OrdersPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const res = useAppSelector((s) => s.orders.list)
    useEffect(() => { dispatch(getOrders()) }, [dispatch])
    return (
        <PageWrap title={t('my-orders')}>
            <Async res={res}>{(d) => asItems(d).length === 0 ? <Empty>{t('no-orders')}</Empty> : (
                <div className="space-y-3">{asItems(d).map((o) => (
                    <Link key={o.id} to={`/orders/${o.id}`}><Card className="mb-3 flex items-center justify-between transition hover:border-brand"><div><b>{t('order')} {o.code ?? `#${o.id}`}</b><p className="text-xs text-muted">{toDate(o.createdAt)}</p></div><div className="text-end"><StatusBadge s={o.status} /><p className="mt-1 font-bold">{o.totalAmount != null && formatPrice(o.totalAmount)}</p></div></Card></Link>
                ))}</div>
            )}</Async>
        </PageWrap>
    )
}

const Countdown = ({ to }: { to: string }) => {
    const [n, setN] = useState(Date.now())
    useEffect(() => { const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i) }, [])
    const ms = Math.max(0, new Date(to).getTime() - n)
    const p = (x: number) => String(x).padStart(2, '0')
    return <b className="font-mono text-brand" dir="ltr">{p(Math.floor(ms / 3.6e6))}:{p(Math.floor(ms / 6e4) % 60)}:{p(Math.floor(ms / 1e3) % 60)}</b>
}

export const Timeline = ({ history, status }: { history: Rec[]; status: number }) => {
    const { t } = useTranslation()
    const reached = new Set(history.map((h) => h.status ?? h.toStatus)); reached.add(status)
    const idx = Math.max(...orderStatusStrip.map((s, i) => (reached.has(s) ? i : -1)))
    return (
        <ol className="relative space-y-5 ps-8">
            <span className="absolute inset-y-1 inset-s-3 w-0.5 bg-line" />
            <motion.span className="absolute inset-s-3 top-1 w-0.5 origin-top bg-brand" style={{ bottom: 4 }} initial={{ scaleY: 0 }} animate={{ scaleY: idx < 0 ? 0 : (idx + 0.5) / orderStatusStrip.length }} transition={{ duration: 1.2 }} />
            {orderStatusStrip.map((s, i) => {
                const h = history.find((x) => (x.status ?? x.toStatus) === s)
                return (
                    <li key={s} className="relative">
                        <motion.span className={`absolute inset-s-[-1.65rem] top-1.5 size-3 rounded-full ${i <= idx ? 'bg-brand' : 'bg-line'}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }} />
                        <b className={i <= idx ? '' : 'text-muted'}>{t(`status-${s}`)}</b>{h && <span className="ms-2 text-xs text-muted">{toDate(h.createdAt ?? h.changedAt)}</span>}
                    </li>
                )
            })}
        </ol>
    )
}

const Recorder = ({ onFile }: { onFile: (f: File) => void }) => {
    const { t } = useTranslation()
    const [rec, setRec] = useState(false)
    const mr = useRef<MediaRecorder | null>(null)
    const start = async () => {
        const st = await navigator.mediaDevices.getUserMedia({ audio: true }); const chunks: Blob[] = []
        const r = new MediaRecorder(st); mr.current = r
        r.ondataavailable = (e) => chunks.push(e.data)
        r.onstop = () => { st.getTracks().forEach((x) => x.stop()); const mp4 = r.mimeType.includes('mp4'); onFile(new File(chunks, `voice.${mp4 ? 'm4a' : 'webm'}`, { type: mp4 ? 'audio/mp4' : 'audio/webm' })) }
        r.start(); setRec(true)
    }
    return <Button variant="ghost" onClick={rec ? () => { mr.current?.stop(); setRec(false) } : start}>{rec ? t('stop-recording') : t('record-voice')}</Button>
}

export const OrderDetail = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { id = '' } = useParams()
    const res = useAppSelector((s) => s.orders.order)
    const enums = useEnums()
    const [error, setError] = useState('')
    const [rating, setRating] = useState(5); const [comment, setComment] = useState('')
    const [pay, setPay] = useState<Rec>({}); const [receipt, setReceipt] = useState<File | null>(null); const [media, setMedia] = useState<File | null>(null)

    useEffect(() => {
        dispatch(getOrder(id))
        const h = () => dispatch(getOrder(id))
        window.addEventListener('wasla:notification', h)
        return () => window.removeEventListener('wasla:notification', h)
    }, [id, dispatch])

    const run = async (p: Promise<unknown> & { unwrap?: () => Promise<unknown> }) => { setError(''); try { await (p.unwrap ? p.unwrap() : p); dispatch(getOrder(id)) } catch (e) { setError(e as string) } }
    const methods = enumOf(enums, 'PaymentMethod').filter((m) => m.name !== 'CashOnDelivery')

    return (
        <PageWrap title={t('order-details')}>
            <Async res={res}>{(o: Rec) => (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="space-y-4">
                        <div className="flex items-center justify-between"><b>{o.code ?? `#${o.id}`}</b><StatusBadge s={o.status} /></div>
                        <Timeline history={o.history ?? []} status={o.status} />
                        {o.paymentDueAt && o.canPay && <p className="text-sm">{t('payment-deadline')}: <Countdown to={o.paymentDueAt} /></p>}
                    </Card>
                    <div className="space-y-4">
                        <Card className="space-y-1 text-sm">
                            {(o.items ?? []).map((i: Rec, k: number) => <div key={k} className="flex justify-between"><span>{i.productName ?? i.name} ×{i.quantity}</span><span>{i.lineTotal != null && formatPrice(i.lineTotal)}</span></div>)}
                            {o.totalAmount != null && <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><span>{t('total')}</span><span>{formatPrice(o.totalAmount)}</span></div>}
                        </Card>
                        {o.canPay && (
                            <Card className="space-y-3"><h3 className="text-lg">{t('upload-receipt')}</h3>
                                <select className={inputCls} onChange={(e) => setPay({ ...pay, method: e.target.value })}><option value="">{t('payment-method')}</option>{methods.map((m) => <option key={m.name} value={m.value}>{t(`enum-${m.name}`, m.name)}</option>)}</select>
                                <input className={inputCls} placeholder={t('transaction-ref')} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
                                <input className={inputCls} placeholder={t('payer-name')} onChange={(e) => setPay({ ...pay, senderName: e.target.value })} />
                                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
                                <Button disabled={!receipt || !pay.method || !pay.reference} onClick={() => {
                                    const form = new FormData(); form.append('method', pay.method); form.append('reference', pay.reference); if (pay.senderName) form.append('senderName', pay.senderName); form.append('receipt', receipt!)
                                    run(dispatch(payOrder({ id, form })))
                                }}>{t('send-receipt')}</Button>
                            </Card>
                        )}
                        {o.reveal && (
                            <Card className="space-y-3"><h3 className="text-lg">{t('qr-gift')}</h3>
                                <p className="text-sm text-muted">{t('reveal-hint')}</p>
                                <input type="file" accept="video/mp4,video/quicktime,video/webm,audio/mp4,audio/mpeg,.m4a,.mp3" onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
                                <div className="flex flex-wrap gap-2">
                                    <Recorder onFile={setMedia} />
                                    <Button disabled={!media} onClick={() => run(dispatch(uploadRevealMessage({ id, media: media! })))}>{t('upload')}</Button>
                                    <Button variant="ghost" onClick={() => run(dispatch(deleteRevealMessage(id)))}>{t('delete')}</Button>
                                    <Button variant="ghost" onClick={() => openFile(`/api/files/orders/${id}/sender-message`)}>{t('play-message')}</Button>
                                </div>
                            </Card>
                        )}
                        {o.canRate && (
                            <Card className="space-y-3"><h3 className="text-lg">{t('rate-experience')}</h3>
                                <div className="flex gap-1 text-3xl">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} aria-label={String(n)}>{n <= rating ? '★' : '☆'}</button>)}</div>
                                <textarea className={inputCls} rows={2} placeholder={t('comment-optional')} onChange={(e) => setComment(e.target.value)} />
                                <Button onClick={() => run(dispatch(rateOrder({ id, rating, comment: comment || undefined })))}>{t('send')}</Button>
                            </Card>
                        )}
                        {o.canCancel && <Button variant="danger" onClick={() => confirm(t('confirm-cancel')) && run(dispatch(cancelOrder(id)))}>{t('cancel-order')}</Button>}
                        {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    </div>
                </div>
            )}</Async>
        </PageWrap>
    )
}
