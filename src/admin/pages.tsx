import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { asItems, fetchBlobUrl, openFile, type Rec } from '../api/client'
import { Async, Button, Card, Field, inputCls, Modal, PageWrap } from '../components/ui'
import { formatPrice, toDate } from '../lib/format'
import { enumOf } from '../lib/enums'
import { useEnums } from '../features/site/hooks'
import { Filters, PagedList, Table } from './crud'
import { useAdminList, useAdminSend } from './hooks'
import { StatusBadge, Timeline } from '../pages/Orders'
import { TicketDetail } from '../pages/Account'

const Json = ({ rows }: { rows: Rec[] }) => rows.length ? <Table rows={rows} cols={Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== 'object').map((k) => ({ key: k, label: k }))} /> : null

// ------------------------------- Overview -------------------------------
export const Overview = () => {
    const { t } = useTranslation()
    const { res } = useAdminList('overview', '/api/admin/reports/overview')
    return (
        <PageWrap title={t('adm-overview')}>
            <Async res={res}>{(d: Rec) => {
                const live = (d.live ?? d.counters ?? {}) as Rec
                const nums = [...Object.entries(d), ...Object.entries(live)].filter(([, v]) => typeof v === 'number')
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{nums.map(([k, v]) => <Card key={k}><p className="text-xs text-muted">{t(`kpi-${k}`, k)}</p><b className="text-2xl">{/revenue|cost/i.test(k) ? formatPrice(v as number) : String(v)}</b></Card>)}</div>
                        {(['daily', 'topProducts', 'stores'] as const).map((k) => Array.isArray(d[k]) && <div key={k}><h2 className="mb-3 text-xl">{t(`rep-${k}`)}</h2><Json rows={d[k]} /></div>)}
                    </div>
                )
            }}</Async>
        </PageWrap>
    )
}

// ------------------------------- Orders -------------------------------
export const AdminOrders = () => {
    const { t } = useTranslation()
    const nav = useNavigate()
    const [f, setF] = useState<Rec>({})
    return (
        <PageWrap title={t('adm-orders')}>
            <Filters>
                <select className={inputCls} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">{t('all-statuses')}</option>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => <option key={s} value={s}>{t(`status-${s}`)}</option>)}</select>
                <input className={inputCls} placeholder={t('order-search')} onKeyDown={(e) => e.key === 'Enter' && setF({ ...f, search: e.currentTarget.value })} />
                <input type="date" className={inputCls} onChange={(e) => setF({ ...f, deliveryFrom: e.target.value })} />
                <input type="date" className={inputCls} onChange={(e) => setF({ ...f, deliveryTo: e.target.value })} />
            </Filters>
            <PagedList k="orders" path="/api/admin/orders" query={f}>{(rows) => (
                <Table rows={rows} onRow={(r) => nav(`/admin/orders/${r.id}`)} cols={[
                    { key: 'code', label: t('code'), render: (r) => r.code ?? r.id }, { key: 'recipientName', label: t('recipient-name') },
                    { key: 'status', label: t('status'), render: (r) => <StatusBadge s={r.status} /> }, { key: 'deliveryDate', label: t('delivery-date') },
                    { key: 'totalAmount', label: t('total'), render: (r) => (r.totalAmount != null ? formatPrice(r.totalAmount) : '') },
                ]} />
            )}</PagedList>
        </PageWrap>
    )
}

export const AdminOrderDetail = () => {
    const { t } = useTranslation()
    const { id } = useParams()
    const send = useAdminSend()
    const { res, reload } = useAdminList('order', `/api/admin/orders/${id}`)
    const [reason, setReason] = useState(''); const [refund, setRefund] = useState(''); const [note, setNote] = useState<string>(); const [vid, setVid] = useState<File | null>(null); const [error, setError] = useState('')
    const run = (fn: () => Promise<unknown>) => async () => { setError(''); try { await fn(); reload() } catch (e) { setError(e as string) } }
    const post = (p: string, body?: unknown) => () => send({ path: `/api/admin/orders/${id}/${p}`, body })
    const qr = async () => { const u = await fetchBlobUrl(`/api/admin/orders/${id}/reveal/qr`); const w = window.open('', '_blank'); w?.document.write(`<img src="${u}" style="width:320px" onload="print()">`) }

    return (
        <PageWrap title={t('adm-order')}>
            <Async res={res}>{(o: Rec) => {
                const s = o.status
                return (
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card className="space-y-3">
                            <div className="flex justify-between"><b>{o.code ?? o.id}</b><StatusBadge s={s} /></div>
                            <Timeline history={o.history ?? []} status={s} />
                            <div className="text-sm"><p>{o.recipientName} — <span dir="ltr">{o.recipientPhone}</span></p><p>{o.addressLine}</p><p>{t('delivery-date')}: {o.deliveryDate}</p>{o.totalAmount != null && <b>{formatPrice(o.totalAmount)}</b>}</div>
                            {o.reveal && <div className="rounded-xl bg-soft p-3 text-sm"><p>{t('link')}: <a className="text-brand underline" href={o.reveal.link} target="_blank" rel="noreferrer">{o.reveal.link}</a></p><p>{t('lock-code')}: <b dir="ltr">{o.reveal.unlockCode}</b></p></div>}
                        </Card>
                        <div className="space-y-3">
                            <Card className="flex flex-wrap gap-2">
                                <Button variant="ghost" onClick={() => openFile(`/api/files/orders/${id}/receipt`)}>{t('receipt')}</Button>
                                {s === 2 && <Button onClick={run(post('verify-payment'))}>{t('verify-payment')}</Button>}
                                {s === 4 && <Button onClick={run(post('confirm'))}>{t('confirm-cash')}</Button>}
                                {s === 5 && <Button onClick={run(post('prepare'))}>{t('prepare')}</Button>}
                                {s === 6 && <Button onClick={run(post('send-out'))}>{t('send-out')}</Button>}
                                {s === 7 && <Button onClick={run(post('delivered'))}>{t('mark-delivered')}</Button>}
                            </Card>
                            {(s === 2 || s < 8) && <Card className="space-y-2">
                                <input className={inputCls} placeholder={t('reason')} onChange={(e) => setReason(e.target.value)} />
                                {s === 2 && <Button variant="danger" disabled={!reason} onClick={run(post('reject-payment', { reason }))}>{t('reject-payment')}</Button>}
                                {s < 8 && <><input className={inputCls} placeholder={t('refund-ref')} onChange={(e) => setRefund(e.target.value)} /><Button variant="danger" disabled={!reason} onClick={run(post('cancel', { reason, refundReference: refund || undefined }))}>{t('cancel-order')}</Button></>}
                            </Card>}
                            {o.reveal && <Card className="space-y-2"><h3 className="text-lg">{t('journey-video')}</h3><input type="file" accept="video/*" onChange={(e) => setVid(e.target.files?.[0] ?? null)} />
                                <div className="flex gap-2"><Button disabled={!vid} onClick={run(() => { const form = new FormData(); form.append('video', vid!); return send({ path: `/api/admin/orders/${id}/reveal/video`, form }) })}>{t('upload')}</Button><Button variant="ghost" onClick={qr}>{t('print-qr')}</Button></div></Card>}
                            <Card className="space-y-2"><textarea className={inputCls} rows={2} defaultValue={o.note ?? o.adminNote} placeholder={t('internal-note')} onChange={(e) => setNote(e.target.value)} /><Button variant="ghost" onClick={run(() => send({ path: `/api/admin/orders/${id}/note`, method: 'PUT', body: { note } }))}>{t('save')}</Button></Card>
                            {error && <p className="text-sm text-red-600">{t(error)}</p>}
                        </div>
                    </div>
                )
            }}</Async>
        </PageWrap>
    )
}

// ------------------------------- Products -------------------------------
export const AdminProducts = () => {
    const { t } = useTranslation()
    const enums = useEnums(); const send = useAdminSend()
    const [f, setF] = useState<Rec>({})
    const [id, setId] = useState<number | 'new' | null>(null)
    const detail = useAdminList('product', `/api/admin/products/${id}`, undefined, typeof id === 'number')
    const stores = useAdminList('stores-opt', '/api/admin/stores'); const cats = useAdminList('cats-opt', '/api/admin/categories')
    const list = useAdminList('products-reload', '/api/admin/products', undefined, false)
    const [v, setV] = useState<Rec>({}); const [error, setError] = useState(''); const [files, setFiles] = useState<FileList | null>(null); const [tick, setTick] = useState(0)

    const open = (x: number | 'new') => { setId(x); setError(''); setFiles(null); setV(x === 'new' ? { colors: [], occasions: 0, isActive: true, allowsCustomText: false, preparationDays: 1, customTextMaxLength: 30, sortOrder: 0 } : {}) }
    const cur: Rec = id === 'new' ? v : { ...((detail.res.data as Rec) ?? {}), ...v }
    const set = (k: string, x: unknown) => setV({ ...v, [k]: x })
    const refresh = () => { setTick((n) => n + 1); list.reload() }

    const save = async (e: React.FormEvent) => {
        e.preventDefault()
        const body: Rec = { ...cur, colors: (cur.colors ?? []).map((c: Rec) => ({ id: c.id, name: c.name, hexCode: c.hexCode, isAvailable: c.isAvailable !== false })) }
        for (const k of ['price', 'oldPrice', 'costPrice', 'stockQuantity', 'storeId', 'categoryId', 'preparationDays', 'customTextMaxLength', 'sortOrder']) body[k] = body[k] === '' || body[k] == null ? undefined : Number(body[k])
        try {
            const r = await send({ path: id === 'new' ? '/api/admin/products' : `/api/admin/products/${id}`, method: id === 'new' ? 'POST' : 'PUT', body }) as Rec
            const pid = id === 'new' ? r.id : id
            if (files?.length) { const form = new FormData(); Array.from(files).forEach((x) => form.append('images', x)); await send({ path: `/api/admin/products/${pid}/images`, form }) }
            setId(null); refresh()
        } catch (err) { setError(err as string) }
    }
    const images: Rec[] = cur.images ?? []
    const occs = enumOf(enums, 'Occasion').filter((o) => o.value > 0)
    const numFields = ['price', 'oldPrice', 'costPrice', 'stockQuantity', 'preparationDays', 'sortOrder'] as const

    return (
        <PageWrap title={t('adm-products')} actions={<Button onClick={() => open('new')}>{t('add')}</Button>}>
            <Filters>
                <input className={inputCls} placeholder={t('search')} onKeyDown={(e) => e.key === 'Enter' && setF({ ...f, search: e.currentTarget.value })} />
                <select className={inputCls} onChange={(e) => setF({ ...f, storeId: e.target.value })}><option value="">{t('all-stores')}</option>{asItems(stores.res.data).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" onChange={(e) => setF({ ...f, lowStock: e.target.checked ? 'true' : '' })} />{t('low-stock')}</label>
            </Filters>
            <PagedList k={`products-${tick}`} path="/api/admin/products" query={f}>{(rows) => (
                <Table rows={rows} onRow={(r) => open(r.id)} cols={[{ key: 'name', label: t('f-name') }, { key: 'price', label: t('f-price'), render: (r) => formatPrice(r.price) }, { key: 'stockQuantity', label: t('stock'), render: (r) => r.stockQuantity ?? '∞' }, { key: 'isActive', label: t('f-active'), render: (r) => t(r.isActive ? 'yes' : 'no') }]}
                    extra={(r) => <Button variant="danger" onClick={async () => { if (confirm(t('confirm-delete'))) { await send({ path: `/api/admin/products/${r.id}`, method: 'DELETE' }); refresh() } }}>{t('delete')}</Button>} />
            )}</PagedList>
            <Modal open={id !== null} onClose={() => setId(null)} title={t(id === 'new' ? 'add' : 'edit')}>
                <form className="space-y-3" onSubmit={save}>
                    <Field label={t('f-name')}><input className={inputCls} value={cur.name ?? ''} onChange={(e) => set('name', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('store')}><select className={inputCls} value={cur.storeId ?? ''} onChange={(e) => set('storeId', e.target.value)}><option value="">—</option>{asItems(stores.res.data).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
                        <Field label={t('category')}><select className={inputCls} value={cur.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value)}><option value="">—</option>{asItems(cats.res.data).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
                        {numFields.map((k) => <Field key={k} label={t(`p-${k}`)}><input type="number" className={inputCls} value={cur[k] ?? ''} onChange={(e) => set(k, e.target.value)} /></Field>)}
                    </div>
                    <Field label={t('f-description')}><textarea rows={3} className={inputCls} value={cur.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
                    <div><span className="text-sm font-medium">{t('any-occasion')}</span>
                        <div className="mt-1 flex flex-wrap gap-2">{occs.map((o) => <label key={o.name} className="rounded-lg border border-line px-3 py-1 text-sm"><input type="checkbox" className="me-1 accent-brand" checked={((cur.occasions ?? 0) & o.value) !== 0} onChange={(e) => set('occasions', e.target.checked ? (cur.occasions ?? 0) | o.value : (cur.occasions ?? 0) & ~o.value)} />{t(`enum-${o.name}`, o.name)}</label>)}</div></div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={!!cur.allowsCustomText} onChange={(e) => set('allowsCustomText', e.target.checked)} />{t('allows-custom-text')}</label>
                    {cur.allowsCustomText && <div className="grid grid-cols-2 gap-3"><input className={inputCls} placeholder={t('field-label')} value={cur.customTextLabel ?? ''} onChange={(e) => set('customTextLabel', e.target.value)} /><input type="number" className={inputCls} placeholder={t('max-length')} value={cur.customTextMaxLength ?? ''} onChange={(e) => set('customTextMaxLength', e.target.value)} /></div>}
                    <div className="flex gap-4 text-sm"><label><input type="checkbox" className="me-1 accent-brand" checked={!!cur.isActive} onChange={(e) => set('isActive', e.target.checked)} />{t('f-active')}</label><label><input type="checkbox" className="me-1 accent-brand" checked={!!cur.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />{t('featured')}</label></div>
                    <div><span className="text-sm font-medium">{t('color')}</span>
                        {(cur.colors ?? []).map((c: Rec, i: number) => (
                            <div key={i} className="mt-1 flex gap-2">
                                <input className={inputCls} placeholder={t('f-name')} value={c.name ?? ''} onChange={(e) => set('colors', cur.colors.map((x: Rec, j: number) => (j === i ? { ...x, name: e.target.value } : x)))} />
                                <input type="color" value={c.hexCode ?? '#B80662'} onChange={(e) => set('colors', cur.colors.map((x: Rec, j: number) => (j === i ? { ...x, hexCode: e.target.value } : x)))} />
                                <button type="button" onClick={() => set('colors', cur.colors.filter((_: Rec, j: number) => j !== i))}>×</button>
                            </div>
                        ))}
                        <Button type="button" variant="ghost" className="mt-2" onClick={() => set('colors', [...(cur.colors ?? []), { name: '', hexCode: '#B80662', isAvailable: true }])}>{t('add-color')}</Button></div>
                    <Field label={t('images-max')}><input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} /></Field>
                    {id !== 'new' && <div className="flex flex-wrap gap-2">{images.map((im, i) => (
                        <div key={im.id} className="relative"><img src={im.url ?? im.imageUrl} className="size-16 rounded-xl object-cover" alt="" />
                            <button type="button" className="absolute -end-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white" onClick={async () => { await send({ path: `/api/admin/products/${id}/images/${im.id}`, method: 'DELETE' }); detail.reload() }}>×</button>
                            {i > 0 && <button type="button" className="absolute inset-x-0 bottom-0 bg-black/50 text-[10px] text-white" onClick={async () => { await send({ path: `/api/admin/products/${id}/images/order`, method: 'PUT', body: { imageIds: [im.id, ...images.filter((x) => x.id !== im.id).map((x) => x.id)] } }); detail.reload() }}>{t('main-image')}</button>}</div>
                    ))}</div>}
                    {error && <p className="text-sm text-red-600">{t(error)}</p>}<Button>{t('save')}</Button>
                </form>
            </Modal>
        </PageWrap>
    )
}

// ------------------------------- Design requests -------------------------------
export const AdminDesigns = () => {
    const { t } = useTranslation()
    const nav = useNavigate()
    return (
        <PageWrap title={t('adm-designs')}>
            <PagedList k="design-requests" path="/api/admin/design-requests" query={{}}>{(rows) => (
                <Table rows={rows} onRow={(r) => nav(`/admin/designs/${r.id}`)} cols={[{ key: 'id', label: '#' }, { key: 'names', label: t('names') }, { key: 'status', label: t('status') }, { key: 'paymentStatus', label: t('payment') }, { key: 'createdAt', label: t('date'), render: (r) => toDate(r.createdAt) }]} />
            )}</PagedList>
        </PageWrap>
    )
}

export const AdminDesignDetail = () => {
    const { t } = useTranslation()
    const { id } = useParams()
    const send = useAdminSend()
    const { res, reload } = useAdminList('design-request', `/api/admin/design-requests/${id}`)
    const [files, setFiles] = useState<FileList | null>(null); const [reason, setReason] = useState(''); const [error, setError] = useState('')
    const run = (fn: () => Promise<unknown>) => async () => { setError(''); try { await fn(); reload() } catch (e) { setError(e as string) } }
    const post = (p: string, body?: unknown) => () => send({ path: `/api/admin/design-requests/${id}/${p}`, body })
    return (
        <PageWrap title={t('adm-design')}>
            <Async res={res}>{(r: Rec) => (
                <div className="grid gap-5 md:grid-cols-2">
                    <Card className="space-y-2 text-sm"><b className="text-lg">{r.names}</b><p>{r.venue} {r.eventDate}</p><p>{r.details}</p><p>{t('preferred-colors')}: {r.preferredColors}</p>
                        <div className="flex flex-wrap gap-2">{(r.files ?? []).map((f: Rec) => <Button key={f.id} variant="ghost" onClick={() => openFile(`/api/files/design-requests/${id}/files/${f.id}`)}>{t('round', { n: f.round })}</Button>)}
                            <Button variant="ghost" onClick={() => openFile(`/api/files/design-requests/${id}/reference`)}>{t('reference-image')}</Button><Button variant="ghost" onClick={() => openFile(`/api/files/design-requests/${id}/receipt`)}>{t('receipt')}</Button></div></Card>
                    <div className="space-y-3">
                        <Card className="flex flex-wrap gap-2"><Button onClick={run(post('verify-payment'))}>{t('verify-payment')}</Button><Button onClick={run(post('start'))}>{t('start-work')}</Button></Card>
                        <Card className="space-y-2"><input className={inputCls} placeholder={t('reason')} onChange={(e) => setReason(e.target.value)} /><div className="flex gap-2"><Button variant="danger" onClick={run(post('reject-payment', { reason }))}>{t('reject-payment')}</Button><Button variant="danger" onClick={run(post('cancel', { reason }))}>{t('cancel')}</Button></div></Card>
                        <Card className="space-y-2"><input type="file" multiple onChange={(e) => setFiles(e.target.files)} /><Button disabled={!files?.length} onClick={run(() => { const form = new FormData(); Array.from(files!).forEach((x) => form.append('files', x)); return send({ path: `/api/admin/design-requests/${id}/deliver`, form }) })}>{t('deliver-files')}</Button></Card>
                        {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    </div>
                </div>
            )}</Async>
        </PageWrap>
    )
}

// ------------------------------- Settings -------------------------------
export const AdminSettings = () => {
    const { t } = useTranslation()
    const send = useAdminSend()
    const { res, reload } = useAdminList('settings', '/api/admin/settings')
    const [v, setV] = useState<Rec>({}); const [msg, setMsg] = useState('')
    const logo = async (kind: 'Light' | 'Dark', file?: File) => { if (!file) return; const form = new FormData(); form.append('logo', file); try { await send({ path: `/api/admin/settings/logo/${kind}`, form }); setMsg('saved') } catch (e) { setMsg(e as string) } }
    return (
        <PageWrap title={t('adm-settings')}>
            <Async res={res}>{(d: Rec) => {
                const cur = { ...d, ...v }
                return (
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card className="space-y-3">
                            {Object.entries(d).filter(([k, x]) => (typeof x !== 'object' || x === null) && !/logo/i.test(k)).map(([k, x]) => (
                                <Field key={k} label={t(`set-${k}`, k)}>{typeof x === 'boolean'
                                    ? <input type="checkbox" className="size-5 accent-brand" checked={!!cur[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} />
                                    : <input className={inputCls} type={typeof x === 'number' ? 'number' : 'text'} value={cur[k] ?? ''} onChange={(e) => setV({ ...v, [k]: typeof x === 'number' ? Number(e.target.value) : e.target.value })} />}</Field>
                            ))}
                            <Button onClick={async () => { try { await send({ path: '/api/admin/settings', method: 'PUT', body: cur }); setMsg('saved'); reload() } catch (e) { setMsg(e as string) } }}>{t('save')}</Button>
                        </Card>
                        <Card className="space-y-3"><h3 className="text-lg">{t('logo')}</h3>
                            <Field label={t('logo-light')}><input type="file" accept="image/*" onChange={(e) => logo('Light', e.target.files?.[0])} /></Field>
                            <Field label={t('logo-dark')}><input type="file" accept="image/*" onChange={(e) => logo('Dark', e.target.files?.[0])} /></Field>
                            {msg && <p className="text-sm">{t(msg)}</p>}</Card>
                    </div>
                )
            }}</Async>
        </PageWrap>
    )
}

// ------------------------------- Customers / Tickets / Audit -------------------------------
export const AdminCustomers = () => {
    const { t } = useTranslation()
    const send = useAdminSend()
    const [f, setF] = useState<Rec>({}); const [tick, setTick] = useState(0)
    return (
        <PageWrap title={t('adm-customers')}>
            <Filters><input className={inputCls} placeholder={t('search')} onKeyDown={(e) => e.key === 'Enter' && setF({ ...f, search: e.currentTarget.value })} /></Filters>
            <PagedList k={`customers-${tick}`} path="/api/admin/customers" query={f}>{(rows) => (
                <Table rows={rows} cols={[{ key: 'fullName', label: t('full-name') }, { key: 'phone', label: t('f-phone') }, { key: 'ordersCount', label: t('adm-orders') }, { key: 'totalSpent', label: t('total-spent'), render: (r) => (r.totalSpent != null ? formatPrice(r.totalSpent) : '') }, { key: 'isActive', label: t('f-active'), render: (r) => t(r.isActive ? 'yes' : 'no') }]}
                    extra={(r) => <Button variant="ghost" onClick={async () => { await send({ path: `/api/admin/customers/${r.id}/active`, method: 'PUT', body: { isActive: !r.isActive } }); setTick((n) => n + 1) }}>{t(r.isActive ? 'deactivate' : 'activate')}</Button>} />
            )}</PagedList>
        </PageWrap>
    )
}

export const AdminTickets = () => {
    const { t } = useTranslation()
    const { res } = useAdminList('tickets', '/api/tickets')
    return (
        <PageWrap title={t('adm-tickets')}>
            <Async res={res}>{(d) => <Table rows={asItems(d)} cols={[{ key: 'id', label: '#' }, { key: 'subject', label: t('subject') }, { key: 'status', label: t('status') }, { key: 'createdAt', label: t('date'), render: (r) => toDate(r.createdAt) }]} extra={(r) => <Link className="font-semibold text-brand" to={`/admin/tickets/${r.id}`}>{t('open')}</Link>} />}</Async>
        </PageWrap>
    )
}
export const AdminTicket = TicketDetail

export const AdminAudit = () => {
    const { t } = useTranslation()
    const [f, setF] = useState<Rec>({})
    return (
        <PageWrap title={t('adm-audit')}>
            <Filters>
                <input className={inputCls} placeholder={t('entity')} onKeyDown={(e) => e.key === 'Enter' && setF({ ...f, entityName: e.currentTarget.value })} />
                <input type="date" className={inputCls} onChange={(e) => setF({ ...f, from: e.target.value })} /><input type="date" className={inputCls} onChange={(e) => setF({ ...f, to: e.target.value })} />
            </Filters>
            <PagedList k="audit" path="/api/admin/audit-logs" query={f}>{(rows) => <Table rows={rows} cols={[{ key: 'createdAt', label: t('date'), render: (r) => toDate(r.createdAt ?? r.timestamp) }, { key: 'userName', label: t('user') }, { key: 'entityName', label: t('entity') }, { key: 'entityId', label: '#' }, { key: 'action', label: t('action') }]} />}</PagedList>
        </PageWrap>
    )
}
