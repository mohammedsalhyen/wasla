import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getGift, unlockGift } from '../features/orders/ordersSlice'
import Logo from '../components/brand/Logo'
import { Button } from '../components/ui'
import type { Rec } from '../api/client'

/** Public, no login. Reveal: envelope → journey video → sender message → card → lock code. */
const Gift = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { token = '' } = useParams()
    const res = useAppSelector((s) => s.orders.gift)
    const [opened, setOpened] = useState(false)
    const [code, setCode] = useState<string>()
    const [msg, setMsg] = useState('')

    useEffect(() => { dispatch(getGift(token)) }, [token, dispatch])

    const shell = (c: React.ReactNode) => <div className="flex-center min-h-dvh flex-col gap-6 bg-night px-4 py-10 text-center text-white">{c}</div>
    if (res.status === 'failed') return shell(<><Logo tone="light" className="w-28" /><p className="max-w-sm text-lg">{t(res.error === 'err-404' ? 'gift-invalid' : 'err-500')}</p></>)
    if (!res.data) return shell(<Logo tone="light" animate className="w-48" />)
    const g = res.data as Rec

    const unlock = async () => {
        setMsg('')
        try { const r = (await dispatch(unlockGift(token)).unwrap()) as Rec; setCode(String(r?.unlockCode ?? r?.code ?? r)) }
        catch (e) { setMsg(e === 'err-409' ? 'gift-not-arrived' : 'err-500') }
    }

    if (!opened) return shell(
        <>
            <Logo tone="light" className="w-32" />
            <motion.button onClick={() => setOpened(true)} whileTap={{ scale: 0.92 }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="text-8xl" aria-label={t('open-gift')}>🎁</motion.button>
            <h1 className="text-3xl md:text-4xl">{g.recipientName ? t('gift-for', { name: g.recipientName }) : t('gift-for-you')}</h1>
            <p className="text-white/70">{g.senderName ? t('gift-from', { name: g.senderName }) : t('gift-anonymous')} — {t('tap-to-open')}</p>
        </>,
    )

    return (
        <div className="min-h-dvh bg-night px-4 py-10 text-white">
            <div className="mx-auto max-w-lg space-y-8 text-center">
                <Logo tone="light" className="mx-auto w-24" />
                {g.hasJourneyVideo && <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}><h2 className="mb-3 text-xl text-white/80">{t('gift-journey')}</h2><video className="w-full rounded-2xl" src={`/api/gifts/${token}/video`} controls playsInline preload="metadata" /></motion.section>}
                {g.hasSenderMedia && <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><h2 className="mb-3 text-xl text-white/80">{t('gift-message')}</h2><video className="w-full rounded-2xl" src={`/api/gifts/${token}/message`} controls playsInline preload="metadata" /></motion.section>}
                {g.cardMessage && <motion.blockquote initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-2xl bg-white/10 p-6 text-xl leading-loose">{g.cardMessage}</motion.blockquote>}
                <section className="space-y-3">
                    <AnimatePresence mode="wait">
                        {code ? (
                            <motion.div key="c" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
                                <p className="mb-3 text-white/70">{t('lock-code')}</p>
                                <div className="flex justify-center gap-3" dir="ltr">{code.split('').map((d, i) => <motion.span key={i} initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.15 * i }} className="flex-center size-16 rounded-xl bg-white font-mono text-4xl font-bold text-night">{d}</motion.span>)}</div>
                            </motion.div>
                        ) : <motion.div key="b"><Button onClick={unlock} className="px-8 py-4 text-base">{t('unlock-box')}</Button></motion.div>}
                    </AnimatePresence>
                    {msg && <p className="text-sm text-white/70">{t(msg)}</p>}
                </section>
            </div>
        </div>
    )
}
export default Gift
