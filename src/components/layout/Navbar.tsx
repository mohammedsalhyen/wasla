import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoBagHandleOutline, IoNotificationsOutline, IoMenu, IoClose } from 'react-icons/io5'
import Logo from '../brand/Logo'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { cartCount } from '../../features/cart/cartSlice'
import { getUnreadCount } from '../../features/account/accountSlice'
import { navLinks } from '../../constant'

const Navbar = () => {
    const { t, i18n } = useTranslation()
    const dispatch = useAppDispatch()
    const [open, setOpen] = useState(false)
    const token = useAppSelector((s) => s.auth.token)
    const items = useAppSelector((s) => s.cart.items)
    const unread = useAppSelector((s) => s.account.unread)
    const count = cartCount(items)

    useEffect(() => { if (token) dispatch(getUnreadCount()) }, [token, dispatch])

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
            <div className="max-container flex h-16 items-center justify-between gap-4">
                <Link to="/" aria-label="Wasla"><Logo className="h-9 w-[4.5rem]" /></Link>

                <nav className="hidden items-center gap-7 md:flex">
                    {navLinks.map((l) => (
                        <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-brand' : 'text-muted hover:text-ink'}`}>{t(l.label)}</NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-1.5 text-xl">
                    <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:text-ink">{i18n.language === 'ar' ? 'EN' : 'ع'}</button>
                    {token && (
                        <Link to="/notifications" aria-label={t('notifications')} className="relative rounded-lg p-2 hover:bg-soft">
                            <IoNotificationsOutline />
                            {unread > 0 && <b className="absolute end-0.5 top-0.5 flex-center size-4 rounded-full bg-brand text-[10px] text-white">{unread}</b>}
                        </Link>
                    )}
                    <Link to="/cart" aria-label={t('cart')} className="relative rounded-lg p-2 hover:bg-soft">
                        <IoBagHandleOutline />
                        {count > 0 && <b className="absolute end-0.5 top-0.5 flex-center size-4 rounded-full bg-brand text-[10px] text-white">{count}</b>}
                    </Link>
                    <Link to={token ? '/profile' : '/login'} className="ms-1 hidden rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white sm:block">{t(token ? 'account' : 'login')}</Link>
                    <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="menu">{open ? <IoClose /> : <IoMenu />}</button>
                </div>
            </div>

            {open && (
                <nav className="border-t border-line bg-white px-4 py-3 md:hidden">
                    {[...navLinks, { to: token ? '/profile' : '/login', label: token ? 'account' : 'login' }].map((l) => (
                        <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium">{t(l.label)}</NavLink>
                    ))}
                </nav>
            )}
        </header>
    )
}
export default Navbar
