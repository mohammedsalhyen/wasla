import { lazy, Suspense } from 'react'
import HeroUnwrap from './HeroUnwrap'
import Occasions from './Occasions'
import Featured from './Featured'
import Story from './Story'

// the heavy pinned scroll scene loads after the first screen (better LCP)
const QrJourney = lazy(() => import('./QrJourney'))

const Landing = () => (
    <main>
        <HeroUnwrap />
        <Occasions />
        <Suspense fallback={<div className="min-h-dvh bg-night" />}><QrJourney /></Suspense>
        <Featured />
        <Story />
    </main>
)
export default Landing
