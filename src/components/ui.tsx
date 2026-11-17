import { useEffect, type ComponentProps, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoClose } from 'react-icons/io5'
import type { Res } from '../store/resource'
import type { Paged } from '../api/client'

export const Button = ({ variant = 'primary', className = '', ...p }: ComponentProps<'button'> & { variant?: 'primary' | 'ghost' | 'danger' | 'dark' }) => (
    <button
        {...p}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-[0.97] disabled:opacity-50 ${{
            primary: 'bg-brand text-white hover:bg-brand-hover',
            dark: 'bg-ink text-white hover:bg-black',
            ghost: 'bg-white text-ink ring-1 ring-line hover:bg-soft',
            danger: 'bg-red-600 text-white hover:bg-red-700',
        }[variant]} ${className}`}
    />
)

export const LinkButton = ({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: 'primary' | 'ghost' | 'dark' }) => (
    <Link to={to} className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${variant === 'primary' ? 'bg-brand text-white hover:bg-brand-hover' : variant === 'dark' ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line'}`}>{children}</Link>
)

export const inputCls = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

export const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
    <label className="block text-sm">
        <span className="mb-1.5 block font-medium">{label}</span>
        {children}
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
)

export const Spinner = () => <div className="flex-center py-16"><div className="size-8 animate-spin rounded-full border-[3px] border-line border-t-brand" /></div>
export const ErrorBox = ({ error }: { error?: string }) => { const { t } = useTranslation(); return <p className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">{t(error ?? 'err-500')}</p> }
export const Empty = ({ children }: { children: ReactNode }) => <p className="rounded-2xl border border-dashed border-line bg-soft p-10 text-center text-muted">{children}</p>
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`rounded-2xl border border-line bg-white p-5 ${className}`}>{children}</div>

export const PageWrap = ({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) => (
    <main className="max-container py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl md:text-4xl">{title}</h1>{actions}</div>
        {children}
    </main>
)

/** Renders a Res: spinner while loading, error box on failure, children(data) on success. */
export const Async = ({ res, children }: { res: Res; children: (d: any) => ReactNode }) =>
    res.status === 'failed' ? <ErrorBox error={res.error} /> : res.data === undefined ? <Spinner /> : <>{children(res.data)}</>

export const Pager = ({ data, onPage }: { data?: Paged; onPage: (p: number) => void }) => {
    const { t } = useTranslation()
    return !data || data.totalPages <= 1 ? null : (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <Button variant="ghost" disabled={!data.hasPrevious} onClick={() => onPage(data.page - 1)}>{t('previous')}</Button>
            <span>{data.page} / {data.totalPages}</span>
            <Button variant="ghost" disabled={!data.hasNext} onClick={() => onPage(data.page + 1)}>{t('next')}</Button>
        </div>
    )
}

export const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) => {
    useEffect(() => {
        if (!open) return
        const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        addEventListener('keydown', h)
        return () => removeEventListener('keydown', h)
    }, [open, onClose])
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
            <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
                <div className="mb-4 flex items-center justify-between"><h2 className="text-xl">{title}</h2><button onClick={onClose} aria-label="close" className="text-2xl"><IoClose /></button></div>
                {children}
            </div>
        </div>
    )
}

export const Img = ({ src, alt = '', className = '' }: { src?: string | null; alt?: string; className?: string }) =>
    src ? <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} /> : <div className={`flex-center bg-soft text-3xl text-muted ${className}`} aria-hidden>🎁</div>
