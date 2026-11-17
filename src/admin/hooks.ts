import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { adminGet, adminSend } from '../features/admin/adminSlice'
import type { Rec } from '../api/client'
import { idle } from '../store/resource'

/** Loads an admin route into state.admin.lists[key]; reload() refetches (after a save/delete). */
export const useAdminList = (key: string, path: string, query?: Rec, enabled = true) => {
    const dispatch = useAppDispatch()
    const res = useAppSelector((s) => s.admin.lists[key]) ?? idle()
    const dep = JSON.stringify(query ?? {})
    const reload = useCallback(() => dispatch(adminGet({ key, path, query })), [dispatch, key, path, dep]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { if (enabled) reload() }, [reload, enabled])
    return { res, reload }
}

/** send({path, method, body|form}) -> resolves with data, rejects with an i18n error key. */
export const useAdminSend = () => {
    const dispatch = useAppDispatch()
    return useCallback((a: { path: string; method?: string; body?: unknown; form?: FormData }) => dispatch(adminSend(a)).unwrap(), [dispatch])
}
