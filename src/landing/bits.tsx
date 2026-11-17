import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const SectionTitle = ({ eyebrow, title, children, light = false }: { eyebrow?: string; title: string; children?: ReactNode; light?: boolean }) => (
    <div className="mx-auto mb-12 max-w-2xl text-center">
        {eyebrow && <span className="text-sm font-semibold text-brand">{eyebrow}</span>}
        <h2 className={`mt-2 text-3xl md:text-5xl ${light ? 'text-white' : ''}`}>{title}</h2>
        {children && <p className={`mt-4 leading-8 ${light ? 'text-white/70' : 'text-muted'}`}>{children}</p>}
    </div>
)

export const CtaLink = ({ to, children, tone = 'brand' }: { to: string; children: ReactNode; tone?: 'brand' | 'dark' | 'light' }) => (
    <Link to={to} className={`inline-flex items-center rounded-xl px-7 py-3.5 font-semibold transition hover:-translate-y-0.5 active:scale-95 ${{ brand: 'bg-brand text-white hover:bg-brand-hover', dark: 'bg-ink text-white', light: 'bg-white text-ink' }[tone]}`}>{children}</Link>
)

/** Clearly marked spot for real content: nothing here is invented. */
export const Placeholder = ({ label }: { label: string }) => (
    <div className="rounded-2xl border-2 border-dashed border-line p-8 text-center text-sm text-muted">{label}</div>
)
