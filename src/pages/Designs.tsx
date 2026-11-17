import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createDesign, designAction, getDesign, getDesigns, payDesign } from '../features/designs/designsSlice'
import { useEnums, useSite } from '../features/site/hooks'
import { asItems, openFile, type Rec } from '../api/client'
import { enumOf } from '../lib/enums'
import { formatPrice, toDate } from '../lib/format'
import { Async, Button, Card, Empty, Field, inputCls, PageWrap } from '../components/ui'

export const DesignsPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const site = useSite()
    const token = useAppSelector((s) => s.auth.token)
    const mine = useAppSelector((s) => s.designs.list)
    useEffect(() => { if (token) dispatch(getDesigns()) }, [token, dispatch])
    return (
        <PageWrap title={t('nav-designs')}>
            <p className="-mt-4 mb-8 max-w-2xl text-muted">{t('designs-intro')}</p>
            <div className="grid gap-4 md:grid-cols-3">{(site?.designPackages ?? []).map((p: Rec) => (
                <Card key={p.id} className="space-y-3"><h3 className="text-xl">{p.name}</h3><p className="text-sm text-muted">{p.description}</p>
                    <ul className="space-y-1 text-sm"><li>{t('designs-count', { n: p.designsCount })}</li><li>{t('revisions-count', { n: p.revisionsIncluded })}</li>{p.includesVideo && <li>{t('includes-video')}</li>}<li>{t('delivery-days', { n: p.deliveryDays })}</li></ul>
                    <b className="block text-xl text-brand">{formatPrice(p.price)}</b>
                    <Link to={`/designs/new?package=${p.id}`} className="inline-flex rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">{t('order-package')}</Link></Card>
            ))}</div>
            {token && <>
                <h2 className="mb-4 mt-12 text-2xl">{t('my-requests')}</h2>
                <Async res={mine}>{(d) => asItems(d).length === 0 ? <Empty>{t('no-requests')}</Empty> : <div className="space-y-3">{asItems(d).map((r) => <Link key={r.id} to={`/designs/${r.id}`}><Card className="mb-3 flex justify-between hover:border-brand"><b>{r.names ?? `#${r.id}`}</b><span className="text-sm text-muted">{toDate(r.createdAt)}</span></Card></Link>)}</div>}</Async>
            </>}
        </PageWrap>
    )
}

export const NewDesign = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const nav = useNavigate()
    const site = useSite(); const enums = useEnums()
    const [v, setV] = useState<Rec>({ packageId: new URLSearchParams(location.search).get('package') ?? '' })
    const [img, setImg] = useState<File | null>(null)
    const [error, setError] = useState('')
    const set = (k: string) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value })

    const submit = async () => {
        const form = new FormData(); form.append('packageId', v.packageId); form.append('type', v.type)
        for (const k of ['names', 'eventDate', 'eventTime', 'venue', 'preferredColors', 'details']) if (v[k]) form.append(k, v[k])
        if (img) form.append('referenceImage', img)
        try { const r = await dispatch(createDesign(form)).unwrap() as unknown as { id: string | number }; nav(`/designs/${r.id}`) } catch (e) { setError(e as string) }
    }
    return (
        <PageWrap title={t('design-request')}>
            <Card className="mx-auto max-w-xl space-y-4 p-7">
                <Field label={t('package')}><select className={inputCls} value={v.packageId} onChange={set('packageId')}><option value="">{t('choose')}</option>{(site?.designPackages ?? []).map((p: Rec) => <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>)}</select></Field>
                <Field label={t('design-type')}><select className={inputCls} onChange={set('type')}><option value="">{t('choose')}</option>{enumOf(enums, 'DesignType').map((o) => <option key={o.name} value={o.value}>{t(`enum-${o.name}`, o.name)}</option>)}</select></Field>
                <Field label={t('names')}><input className={inputCls} onChange={set('names')} /></Field>
                <div className="grid grid-cols-2 gap-3"><Field label={t('event-date')}><input type="date" className={inputCls} onChange={set('eventDate')} /></Field><Field label={t('event-time')}><input type="time" className={inputCls} onChange={set('eventTime')} /></Field></div>
                <Field label={t('venue')}><input className={inputCls} onChange={set('venue')} /></Field>
                <Field label={t('preferred-colors')}><input className={inputCls} onChange={set('preferredColors')} /></Field>
                <Field label={t('details')}><textarea rows={3} className={inputCls} onChange={set('details')} /></Field>
                <Field label={t('reference-image')}><input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] ?? null)} /></Field>
                {error && <p className="text-sm text-red-600">{t(error)}</p>}
                <Button disabled={!v.packageId || !v.type || !v.names} onClick={submit}>{t('send-request')}</Button>
            </Card>
        </PageWrap>
    )
}

export const DesignDetail = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { id = '' } = useParams()
    const res = useAppSelector((s) => s.designs.current)
    const enums = useEnums()
    const [pay, setPay] = useState<Rec>({}); const [file, setFile] = useState<File | null>(null); const [note, setNote] = useState(''); const [error, setError] = useState('')

    useEffect(() => {
        dispatch(getDesign(id))
        const h = () => dispatch(getDesign(id))
        window.addEventListener('wasla:notification', h)
        return () => window.removeEventListener('wasla:notification', h)
    }, [id, dispatch])

    const run = async (p: { unwrap: () => Promise<unknown> }) => { setError(''); try { await p.unwrap(); dispatch(getDesign(id)) } catch (e) { setError(e as string) } }
    return (
        <PageWrap title={t('design-request')}>
            <Async res={res}>{(r: Rec) => (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="space-y-2 text-sm"><b className="text-lg">{r.names}</b><p>{r.venue}</p><p>{r.eventDate}</p></Card>
                    <div className="space-y-4">
                        {(r.files ?? []).length > 0 && <Card className="space-y-2"><h3 className="text-lg">{t('files')}</h3>{r.files.map((f: Rec) => <div key={f.id} className="flex items-center justify-between text-sm"><span>{t('round', { n: f.round })} — {f.fileName ?? f.id}</span><Button variant="ghost" onClick={() => openFile(`/api/files/design-requests/${id}/files/${f.id}`)}>{t('open')}</Button></div>)}</Card>}
                        {r.canPay && <Card className="space-y-3"><h3 className="text-lg">{t('payment')}</h3>
                            <select className={inputCls} onChange={(e) => setPay({ ...pay, method: e.target.value })}><option value="">{t('payment-method')}</option>{enumOf(enums, 'PaymentMethod').filter((m) => m.name !== 'CashOnDelivery').map((m) => <option key={m.name} value={m.value}>{t(`enum-${m.name}`, m.name)}</option>)}</select>
                            <input className={inputCls} placeholder={t('transaction-ref')} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
                            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                            <Button disabled={!file || !pay.method || !pay.reference} onClick={() => { const form = new FormData(); form.append('method', pay.method); form.append('reference', pay.reference); form.append('receipt', file!); run(dispatch(payDesign({ id, form }))) }}>{t('send-receipt')}</Button></Card>}
                        {r.canRequestRevision && <Card className="space-y-2"><textarea className={inputCls} rows={3} placeholder={t('revision-note')} onChange={(e) => setNote(e.target.value)} /><Button disabled={!note} onClick={() => run(dispatch(designAction({ id, action: 'revision', note })))}>{t('request-revision')}</Button></Card>}
                        <div className="flex gap-3">{r.canComplete && <Button onClick={() => run(dispatch(designAction({ id, action: 'complete' })))}>{t('accept-design')}</Button>}{r.canCancel && <Button variant="danger" onClick={() => run(dispatch(designAction({ id, action: 'cancel' })))}>{t('cancel')}</Button>}</div>
                        {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    </div>
                </div>
            )}</Async>
        </PageWrap>
    )
}
