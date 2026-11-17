import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export const RequireAuth = () => {
    const token = useAppSelector((s) => s.auth.token)
    const loc = useLocation()
    return token ? <Outlet /> : <Navigate to="/login" state={{ from: loc.pathname }} replace />
}

export const RequireAdmin = () => {
    const { token, role } = useAppSelector((s) => s.auth)
    if (!token) return <Navigate to="/login" replace />
    return role === 'PlatformAdmin' ? <Outlet /> : <Navigate to="/" replace />
}
