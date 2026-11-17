import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, errKey, type Rec } from '../../api/client'
import { addRes, idle, type Res } from '../../store/resource'

// ------------------------------- Thunks -------------------------------
export const getFavorites = createAsyncThunk('account/getFavorites', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/favorites') } catch (e) { return rejectWithValue(errKey(e)) }
})
export const getNotifications = createAsyncThunk('account/getNotifications', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/notifications') } catch (e) { return rejectWithValue(errKey(e)) }
})
export const getUnreadCount = createAsyncThunk('account/getUnreadCount', async (_: void, { rejectWithValue }) => {
    try { const d = await api<Rec | number>('/api/notifications/unread-count'); return typeof d === 'number' ? d : Number(d.count ?? d.unreadCount ?? 0) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const markRead = createAsyncThunk('account/markRead', async (id: number | 'all', { dispatch, rejectWithValue }) => {
    try { await api(id === 'all' ? '/api/notifications/read-all' : `/api/notifications/${id}/read`, { method: 'POST' }); dispatch(getNotifications()); dispatch(getUnreadCount()) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const getTickets = createAsyncThunk('account/getTickets', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/tickets') } catch (e) { return rejectWithValue(errKey(e)) }
})
export const getTicket = createAsyncThunk('account/getTicket', async (id: string, { rejectWithValue }) => {
    try { return await api(`/api/tickets/${id}`) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const createTicket = createAsyncThunk('account/createTicket', async (body: Rec, { dispatch, rejectWithValue }) => {
    try { const r = await api('/api/tickets', { method: 'POST', body }); dispatch(getTickets()); return r } catch (e) { return rejectWithValue(errKey(e)) }
})
export const replyTicket = createAsyncThunk('account/replyTicket', async ({ id, body }: { id: string; body: string }, { dispatch, rejectWithValue }) => {
    try { await api(`/api/tickets/${id}/messages`, { method: 'POST', body: { body } }); dispatch(getTicket(id)) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const closeTicket = createAsyncThunk('account/closeTicket', async (id: string, { dispatch, rejectWithValue }) => {
    try { await api(`/api/tickets/${id}/close`, { method: 'POST' }); dispatch(getTicket(id)) } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const accountSlice = createSlice({
    name: 'account',
    initialState: { favorites: idle() as Res, notifications: idle() as Res, unread: 0, tickets: idle() as Res, ticket: idle() as Res },
    reducers: {},
    extraReducers: (b) => {
        addRes(b, getFavorites, 'favorites')
        addRes(b, getNotifications, 'notifications')
        addRes(b, getTickets, 'tickets')
        addRes(b, getTicket, 'ticket')
        b.addCase(getUnreadCount.fulfilled, (s, a) => { s.unread = a.payload })
    },
})
export default accountSlice.reducer
