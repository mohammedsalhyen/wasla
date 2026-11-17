import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { closeTicket, createTicket, getFavorites, getNotifications, getTicket, getTickets, markRead, replyTicket } from '../features/account/accountSlice'
import { changePassword, getMe, logout, updateMe } from '../features/auth/authSlice'
import { useEnums } from '../features/site/hooks'
import { asItems, type Rec } from '../api/client'
import { enumOf } from '../lib/enums'
import { toDate } from '../lib/format'
import { Async, Button, Card, Empty, Field, inputCls, PageWrap } from '../components/ui'
import { ProductCard } from './Shop'

export const FavoritesPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const res = useAppSelector((s) => s.account.favorites)
    useEffect(() => { dispatch(getFavorites()) }, [dispatch])
    return <PageWrap title={t('favorites')}><Async res={res}>{(d) => asItems(d).length === 0 ? <Empty>{t('no-favorites')}</Empty> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{asItems(d).map((p) => <ProductCard key={p.id} p={{ ...p, isFavorite: true }} />)}</div>}</Async></PageWrap>
}

export const NotificationsPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const nav = useNavigate()
    const res = useAppSelector((s) => s.account.notifications)
    useEffect(() => { dispatch(getNotifications()) }, [dispatch])
    const open = (n: Rec) => {
        dispatch(markRead(n.id))
        if (n.relatedOrderId) nav(`/orders/${n.relatedOrderId}`)
        else if (n.relatedDesignRequestId) nav(`/designs/${n.relatedDesignRequestId}`)
        else if (n.relatedTicketId) nav(`/support/${n.relatedTicketId}`)
    }
    return (
        <PageWrap title={t('notifications')} actions={<Button variant="ghost" onClick={() => dispatch(markRead('all'))}>{t('mark-all-read')}</Button>}>
            <Async res={res}>{(d) => asItems(d).length === 0 ? <Empty>{t('no-notifications')}</Empty> : (
                <div className="space-y-2">{asItems(d).map((n) => (
                    <Card key={n.id} className={`cursor-pointer transition hover:border-brand ${n.isRead ? 'opacity-60' : ''}`}><div onClick={() => open(n)}><b>{n.title}</b><p className="text-sm text-muted">{n.body}</p><span className="text-xs text-muted">{toDate(n.createdAt)}</span></div></Card>
                ))}</div>
            )}</Async>
        </PageWrap>
    )
}

export const SupportPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const enums = useEnums()
    const tickets = useAppSelector((s) => s.account.tickets)
    const [v, setV] = useState<Rec>({})
    const [error, setError] = useState('')
    useEffect(() => { dispatch(getTickets()) }, [dispatch])
    const send = async () => { try { await dispatch(createTicket({ subject: v.subject, body: v.body, category: Number(v.category) })).unwrap(); setV({}); setError('') } catch (e) { setError(e as string) } }
    return (
        <PageWrap title={t('nav-support')}>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="space-y-3"><h2 className="text-lg">{t('new-ticket')}</h2>
                    <select className={inputCls} value={v.category ?? ''} onChange={(e) => setV({ ...v, category: e.target.value })}><option value="">{t('ticket-category')}</option>{enumOf(enums, 'TicketCategory').map((o) => <option key={o.name} value={o.value}>{t(`enum-${o.name}`, o.name)}</option>)}</select>
                    <input className={inputCls} placeholder={t('subject')} value={v.subject ?? ''} onChange={(e) => setV({ ...v, subject: e.target.value })} />
                    <textarea className={inputCls} rows={4} placeholder={t('describe-issue')} value={v.body ?? ''} onChange={(e) => setV({ ...v, body: e.target.value })} />
                    {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    <Button disabled={!v.subject || !v.body || !v.category} onClick={send}>{t('send')}</Button></Card>
                <Async res={tickets}>{(d) => asItems(d).length === 0 ? <Empty>{t('no-tickets')}</Empty> : <div>{asItems(d).map((x) => <Link key={x.id} to={`/support/${x.id}`}><Card className="mb-2 flex justify-between hover:border-brand"><b>{x.subject}</b><span className="text-xs text-muted">{toDate(x.createdAt)}</span></Card></Link>)}</div>}</Async>
            </div>
        </PageWrap>
    )
}

export const TicketDetail = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { id = '' } = useParams()
    const res = useAppSelector((s) => s.account.ticket)
    const [body, setBody] = useState('')
    useEffect(() => { dispatch(getTicket(id)) }, [id, dispatch])
    return (
        <PageWrap title={t('ticket')} actions={<Button variant="ghost" onClick={() => dispatch(closeTicket(id))}>{t('close-ticket')}</Button>}>
            <Async res={res}>{(x: Rec) => (
                <div className="space-y-3"><Card><b>{x.subject}</b><p className="text-sm">{x.body}</p></Card>
                    {(x.messages ?? []).map((m: Rec) => <Card key={m.id} className={m.isFromAdmin ? 'bg-brand-soft' : ''}><b className="text-xs">{m.senderName ?? (m.isFromAdmin ? t('wasla-team') : t('me'))}</b><p>{m.body}</p><span className="text-xs text-muted">{toDate(m.createdAt)}</span></Card>)}
                    <textarea className={inputCls} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('your-reply')} />
                    <Button disabled={!body} onClick={async () => { await dispatch(replyTicket({ id, body })); setBody('') }}>{t('send')}</Button></div>
            )}</Async>
        </PageWrap>
    )
}

export const ProfilePage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const nav = useNavigate()
    const res = useAppSelector((s) => s.auth.me)
    const [v, setV] = useState<Rec>({}); const [pw, setPw] = useState<Rec>({}); const [msg, setMsg] = useState('')
    useEffect(() => { dispatch(getMe()) }, [dispatch])
    const save = async (me: Rec) => { try { await dispatch(updateMe({ fullName: v.fullName ?? me.fullName, email: (v.email ?? me.email) || undefined })).unwrap(); setMsg('saved') } catch (e) { setMsg(e as string) } }
    const change = async () => { try { await dispatch(changePassword(pw)).unwrap(); setMsg('password-changed') } catch (e) { setMsg(e as string) } }
    return (
        <PageWrap title={t('account')} actions={<Button variant="ghost" onClick={() => { dispatch(logout()); nav('/') }}>{t('logout')}</Button>}>
            <Async res={res}>{(me: Rec) => (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="space-y-3"><Field label={t('full-name')}><input className={inputCls} defaultValue={me.fullName} onChange={(e) => setV({ ...v, fullName: e.target.value })} /></Field><Field label={t('email')}><input className={inputCls} dir="ltr" defaultValue={me.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field><p className="text-sm text-muted" dir="ltr">{me.phone}</p><Button onClick={() => save(me)}>{t('save')}</Button></Card>
                    <Card className="space-y-3"><h3 className="text-lg">{t('change-password')}</h3><input type="password" className={inputCls} placeholder={t('current-password')} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /><input type="password" className={inputCls} placeholder={t('new-password')} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /><Button onClick={change}>{t('change')}</Button></Card>
                    {msg && <p className="text-sm">{t(msg)}</p>}
                </div>
            )}</Async>
            <div className="mt-8 flex gap-5 text-sm font-medium text-brand"><Link to="/orders">{t('my-orders')}</Link><Link to="/favorites">{t('favorites')}</Link><Link to="/notifications">{t('notifications')}</Link></div>
        </PageWrap>
    )
}
