import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../brand/Logo'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { getSite } from '../../features/site/siteSlice'

const Footer = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const site = useAppSelector((s) => s.site.info)
    useEffect(() => { if (site.status === 'idle') dispatch(getSite()) }, [site.status, dispatch])
    // Contact link field names are not documented: show any string field named like a contact channel.
    const contacts = Object.entries((site.data ?? {}) as Record<string, unknown>)
        .filter(([k, v]) => typeof v === 'string' && v && /whatsapp|instagram|facebook|tiktok|phone|email|telegram|contact/i.test(k) && !/logo/i.test(k)) as [string, string][]
    const href = (v: string) => (/^(https?:|mailto:|tel:)/.test(v) ? v : /@/.test(v) ? `mailto:${v}` : /^[+\d\s]+$/.test(v) ? `tel:${v}` : undefined)

    return (
        <footer className="border-t border-line bg-soft">
            <div className="max-container flex flex-col items-center gap-5 py-10 text-center text-sm text-muted md:flex-row md:justify-between md:text-start">
                <div><Logo className="mx-auto h-10 w-20 md:mx-0" /><p className="mt-2">{t('footer-tagline')}</p></div>
                <nav className="flex gap-5"><Link to="/shop">{t('nav-shop')}</Link><Link to="/designs">{t('nav-designs')}</Link><Link to="/support">{t('nav-support')}</Link></nav>
                <div className="flex flex-wrap justify-center gap-4">{contacts.map(([k, v]) => <a key={k} href={href(v)} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">{k}</a>)}</div>
            </div>
        </footer>
    )
}
export default Footer
