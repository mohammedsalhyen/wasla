import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/brand/Logo'

const NotFound = () => {
    const { t } = useTranslation()
    return (
        <main className="flex-center min-h-[70dvh] flex-col gap-5 px-4 text-center">
            <Logo className="w-36" />
            <h1 className="text-3xl">{t('not-found')}</h1>
            <Link to="/" className="rounded-xl bg-ink px-6 py-3 font-semibold text-white">{t('back-home')}</Link>
        </main>
    )
}
export default NotFound
