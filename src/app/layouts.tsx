import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import useNotificationsHub from './useNotificationsHub'
import { ease, useLenis, useReducedMotion } from '../motion'
import { adminLinks } from '../constant'

export const PublicLayout = () => {
    useLenis()
    useNotificationsHub()
    const { pathname } = useLocation()
    const reduced = useReducedMotion()
    return (
        <>
            <Navbar />
            <motion.div key={pathname} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
                <Outlet />
            </motion.div>
            <Footer />
        </>
    )
}

export const AdminLayout = () => {
    const { t } = useTranslation()
    useNotificationsHub()
    return (
        <div className="min-h-dvh bg-soft">
            <header className="flex h-14 items-center justify-between bg-night px-4 text-white">
                <Link to="/admin" className="font-bold">{t('adm-title')}</Link>
                <Link to="/" className="text-sm opacity-80">{t('adm-to-site')}</Link>
            </header>
            <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white px-2 py-2 text-sm">
                {adminLinks.map((l) => <NavLink key={l.to} end={l.to === '/admin'} to={l.to} className={({ isActive }) => `shrink-0 rounded-lg px-4 py-1.5 ${isActive ? 'bg-ink text-white' : 'text-muted hover:bg-soft'}`}>{t(l.label)}</NavLink>)}
            </nav>
            <Outlet />
        </div>
    )
}
