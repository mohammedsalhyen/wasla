import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import { api, clearAuthCookies, errKey, type Rec } from '../../api/client'
import { addRes, idle, type Res } from '../../store/resource'

// ------------------------------- Thunks -------------------------------
const saveSession = (d: Rec) => {
    const expires = new Date(d.expiresAtUtc)
    Cookies.set('token', d.accessToken, { expires })
    Cookies.set('role', d.role, { expires })
    return { token: d.accessToken as string, role: d.role as string }
}

export const login = createAsyncThunk('auth/login', async (body: { login: string; password: string }, { rejectWithValue }) => {
    try { return saveSession(await api('/api/auth/login', { method: 'POST', body })) } catch (e) { return rejectWithValue(errKey(e)) }
})

export const register = createAsyncThunk('auth/register', async (body: Rec, { rejectWithValue }) => {
    try { return saveSession(await api('/api/auth/register', { method: 'POST', body })) } catch (e) { return rejectWithValue(errKey(e)) }
})

export const getMe = createAsyncThunk('auth/getMe', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/auth/me') } catch (e) { return rejectWithValue(errKey(e)) }
})

export const updateMe = createAsyncThunk('auth/updateMe', async (body: Rec, { rejectWithValue }) => {
    try { return await api('/api/auth/me', { method: 'PUT', body }) } catch (e) { return rejectWithValue(errKey(e)) }
})

export const changePassword = createAsyncThunk('auth/changePassword', async (body: Rec, { rejectWithValue }) => {
    try { return await api('/api/auth/change-password', { method: 'POST', body }) } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
interface AuthState { token: string | null; role: string | null; submit: Res; me: Res }
const initialState: AuthState = { token: Cookies.get('token') ?? null, role: Cookies.get('role') ?? null, submit: idle(), me: idle() }

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (s) => { clearAuthCookies(); s.token = null; s.role = null },
    },
    extraReducers: (b) => {
        for (const th of [login, register]) {
            b.addCase(th.pending, (s) => { s.submit = { status: 'loading' } })
            b.addCase(th.fulfilled, (s, a) => { s.token = a.payload.token; s.role = a.payload.role; s.submit = { status: 'succeeded' } })
            b.addCase(th.rejected, (s, a) => { s.submit = { status: 'failed', error: a.payload as string } })
        }
        addRes(b, getMe, 'me')
    },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
