import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../store/hooks'
import { login, register } from './authSlice'
import { Button, Card, Field, inputCls } from '../../components/ui'

const phoneRx = /^(\+?\d{10,15}|[٠-٩]{11})$/

export const LoginPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const nav = useNavigate()
    const loc = useLocation()
    const [form, setForm] = useState({ login: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.login.length < 3 || form.password.length < 6) return setError('val-login')
        setLoading(true); setError('')
        try {
            const r = await dispatch(login(form)).unwrap()
            nav(r.role === 'PlatformAdmin' ? '/admin' : (loc.state as { from?: string } | null)?.from ?? '/', { replace: true })
        } catch (err) { setError(err as string) } finally { setLoading(false) }
    }

    return (
        <main className="max-container flex-center py-14">
            <Card className="w-full max-w-md p-8">
                <h1 className="mb-6 text-3xl">{t('login-title')}</h1>
                <form className="space-y-4" onSubmit={submit}>
                    <Field label={t('login-id')}><input className={inputCls} dir="ltr" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} /></Field>
                    <Field label={t('password')}><input type="password" className={inputCls} dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
                    {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    <Button className="w-full" disabled={loading}>{t('login')}</Button>
                </form>
                <p className="mt-5 text-center text-sm text-muted">{t('no-account')} <Link className="font-semibold text-brand" to="/register">{t('register')}</Link></p>
            </Card>
        </main>
    )
}

export const RegisterPage = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const nav = useNavigate()
    const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.fullName.length < 3) return setError('val-name')
        if (!phoneRx.test(form.phone)) return setError('val-phone')
        if (form.password.length < 6) return setError('val-password')
        setLoading(true); setError('')
        try { await dispatch(register({ ...form, email: form.email || undefined })).unwrap(); nav('/', { replace: true }) }
        catch (err) { setError(err as string) } finally { setLoading(false) }
    }

    return (
        <main className="max-container flex-center py-14">
            <Card className="w-full max-w-md p-8">
                <h1 className="mb-6 text-3xl">{t('register-title')}</h1>
                <form className="space-y-4" onSubmit={submit}>
                    <Field label={t('full-name')}><input className={inputCls} value={form.fullName} onChange={set('fullName')} /></Field>
                    <Field label={t('phone-hint')}><input className={inputCls} dir="ltr" value={form.phone} onChange={set('phone')} /></Field>
                    <Field label={t('email-optional')}><input className={inputCls} dir="ltr" value={form.email} onChange={set('email')} /></Field>
                    <Field label={t('password')}><input type="password" className={inputCls} dir="ltr" value={form.password} onChange={set('password')} /></Field>
                    {error && <p className="text-sm text-red-600">{t(error)}</p>}
                    <Button className="w-full" disabled={loading}>{t('register')}</Button>
                </form>
                <p className="mt-5 text-center text-sm text-muted">{t('have-account')} <Link className="font-semibold text-brand" to="/login">{t('login')}</Link></p>
            </Card>
        </main>
    )
}
