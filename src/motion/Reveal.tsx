import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { ease, useReducedMotion } from '.'

const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
    const reduced = useReducedMotion()
    return (
        <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.65, delay, ease }}>
            {children}
        </motion.div>
    )
}
export default Reveal
