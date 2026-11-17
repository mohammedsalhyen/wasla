import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { getEnums, getSite } from './siteSlice'
import type { EnumMap } from '../../lib/enums'
import type { Rec } from '../../api/client'

export const useEnums = (): EnumMap | undefined => {
    const dispatch = useAppDispatch()
    const enums = useAppSelector((s) => s.site.enums)
    useEffect(() => { if (enums.status === 'idle') dispatch(getEnums()) }, [enums.status, dispatch])
    return enums.data
}

export const useSite = (): Rec | undefined => {
    const dispatch = useAppDispatch()
    const info = useAppSelector((s) => s.site.info)
    useEffect(() => { if (info.status === 'idle') dispatch(getSite()) }, [info.status, dispatch])
    return info.data
}
