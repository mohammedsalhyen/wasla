import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { asItems, type Paged, type Rec } from '../api/client'
import { Async, Button, Card, Empty, Field, inputCls, Modal, PageWrap, Pager } from '../components/ui'
import { enumOf } from '../lib/enums'
import { useEnums } from '../features/site/hooks'
import { useAdminList, useAdminSend } from './hooks'

export interface FieldDef { name: string; label: string; type?: 'text' | 'number' | 'checkbox' | 'textarea' | 'enum'; enumType?: string; optional?: boolean }
export interface CrudCfg { title: string; path: string; fields: FieldDef[]; columns: string[]; upload?: { suffix: string; field: string; label: string } }

export const Table = ({ rows, cols, onRow, extra }: { rows: Rec[]; cols: { key: string; label: string; render?: (r: Rec) => ReactNode }[]; onRow?: (r: Rec) => void; extra?: (r: Rec) => ReactNode }) => {
    const { t } = useTranslation()
    return (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-max text-sm">
                <thead className="bg-soft"><tr>{cols.map((c) => <th key={c.key} className="p-3 text-start font-semibold">{c.label}</th>)}{extra && <th />}</tr></thead>
                <tbody>{rows.map((r, i) => (
                    <tr key={r.id ?? i} className={`border-t border-line ${onRow ? 'cursor-pointer hover:bg-soft' : ''}`} onClick={() => onRow?.(r)}>
                        {cols.map((c) => <td key={c.key} className="p-3">{c.render ? c.render(r) : String(r[c.key] ?? '—')}</td>)}
                        {extra && <td className="p-3" onClick={(e) => e.stopPropagation()}>{extra(r)}</td>}
                    </tr>
                ))}</tbody>
            </table>
            {rows.length === 0 && <div className="p-6"><Empty>{t('no-data')}</Empty></div>}
        </div>
    )
}

export const Filters = ({ children }: { children: ReactNode }) => <Card className="mb-4 grid gap-3 sm:grid-cols-4">{children}</Card>

/** Paged admin list with a render prop for the rows. */
export const PagedList = ({ k, path, query, children }: { k: string; path: string; query: Rec; children: (items: Rec[]) => ReactNode }) => {
    const [page, setPage] = useState(1)
    const { res } = useAdminList(k, path, { ...query, page, pageSize: 20 })
    return <Async res={res}>{(d) => <>{children(asItems(d))}<Pager data={d as Paged} onPage={setPage} /></>}</Async>
}

export const CrudPage = ({ cfg }: { cfg: CrudCfg }) => {
    const { t } = useTranslation()
    const enums = useEnums()
    const send = useAdminSend()
    const { res, reload } = useAdminList(cfg.path, cfg.path)
    const [edit, setEdit] = useState<Rec | null>(null)
    const [v, setV] = useState<Rec>({})
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState('')

    const open = (r: Rec | null) => { setEdit(r ?? {}); setV(r ? { ...r } : {}); setFile(null); setError('') }

    const save = async (e: React.FormEvent) => {
        e.preventDefault()
        const body: Rec = {}
        for (const f of cfg.fields) {
            const x = v[f.name]
            body[f.name] = f.type === 'number' || f.type === 'enum' ? (x === '' || x == null ? (f.optional ? undefined : 0) : Number(x)) : f.type === 'checkbox' ? !!x : x === '' ? undefined : x
        }
        try {
            const r = await send({ path: edit?.id ? `${cfg.path}/${edit.id}` : cfg.path, method: edit?.id ? 'PUT' : 'POST', body }) as Rec
            const id = edit?.id ?? r?.id
            if (file && cfg.upload && id) { const form = new FormData(); form.append(cfg.upload.field, file); await send({ path: `${cfg.path}/${id}/${cfg.upload.suffix}`, form }) }
            setEdit(null); reload()
        } catch (err) { setError(err as string) }
    }
    const remove = async (id: number) => { if (!confirm(t('confirm-delete'))) return; try { await send({ path: `${cfg.path}/${id}`, method: 'DELETE' }); reload() } catch (err) { alert(t(err as string)) } }

    const cols = cfg.columns.map((k) => ({ key: k, label: t(cfg.fields.find((f) => f.name === k)?.label ?? k, k), render: (r: Rec) => String(typeof r[k] === 'boolean' ? t(r[k] ? 'yes' : 'no') : r[k] ?? '—') }))
    return (
        <PageWrap title={t(cfg.title)} actions={<Button onClick={() => open(null)}>{t('add')}</Button>}>
            <Async res={res}>{(d) => <Table rows={asItems(d)} cols={cols} onRow={open} extra={(r) => <Button variant="danger" onClick={() => remove(r.id)}>{t('delete')}</Button>} />}</Async>
            <Modal open={!!edit} onClose={() => setEdit(null)} title={t(edit?.id ? 'edit' : 'add')}>
                <form className="space-y-3" onSubmit={save}>
                    {cfg.fields.map((f) => (
                        <Field key={f.name} label={t(f.label)}>
                            {f.type === 'checkbox' ? <input type="checkbox" className="size-5 accent-brand" checked={!!v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.checked })} />
                                : f.type === 'textarea' ? <textarea className={inputCls} rows={3} value={v[f.name] ?? ''} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
                                : f.type === 'enum' ? <select className={inputCls} value={v[f.name] ?? ''} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}><option value="">{t('choose')}</option>{enumOf(enums, f.enumType!).map((o) => <option key={o.name} value={o.value}>{t(`enum-${o.name}`, o.name)}</option>)}</select>
                                : <input className={inputCls} type={f.type === 'number' ? 'number' : 'text'} step="any" value={v[f.name] ?? ''} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />}
                        </Field>
                    ))}
                    {cfg.upload && edit?.id && <Field label={t(cfg.upload.label)}><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>}
                    {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    <Button>{t('save')}</Button>
                </form>
            </Modal>
        </PageWrap>
    )
}
