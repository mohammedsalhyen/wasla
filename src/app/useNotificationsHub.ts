import { useEffect } from 'react'
import * as signalR from '@microsoft/signalr'
import Cookies from 'js-cookie'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getNotifications, getUnreadCount } from '../features/account/accountSlice'

/** SignalR: refresh the bell count and the notification list when the backend pushes `notification`. */
const useNotificationsHub = () => {
    const dispatch = useAppDispatch()
    const token = useAppSelector((s) => s.auth.token)
    useEffect(() => {
        if (!token) return
        const c = new signalR.HubConnectionBuilder().withUrl('/hubs/notifications', { accessTokenFactory: () => Cookies.get('token') ?? '' }).withAutomaticReconnect().build()
        c.on('notification', () => { dispatch(getUnreadCount()); dispatch(getNotifications()); window.dispatchEvent(new Event('wasla:notification')) })
        c.start().catch(() => undefined)
        return () => { c.stop() }
    }, [token, dispatch])
}
export default useNotificationsHub
