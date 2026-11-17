import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, errKey, type Rec } from '../../api/client'
import { addRes, idle, type Res } from '../../store/resource'

const call = (path: string, init?: Parameters<typeof api>[1]) => api(path, init)

// ------------------------------- Thunks -------------------------------
export const getOrders = createAsyncThunk('orders/getOrders', async (_: void, { rejectWithValue }) => {
    try { return await call('/api/orders') } catch (e) { return rejectWithValue(errKey(e)) }
})
export const getOrder = createAsyncThunk('orders/getOrder', async (id: string, { rejectWithValue }) => {
    try { return await call(`/api/orders/${id}`) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const createOrder = createAsyncThunk('orders/createOrder', async (body: Rec, { rejectWithValue }) => {
    try { return await call('/api/orders', { method: 'POST', body }) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const payOrder = createAsyncThunk('orders/payOrder', async ({ id, form }: { id: string; form: FormData }, { rejectWithValue }) => {
    try { return await call(`/api/orders/${id}/payment`, { method: 'POST', form }) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (id: string, { rejectWithValue }) => {
    try { return await call(`/api/orders/${id}/cancel`, { method: 'POST' }) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const rateOrder = createAsyncThunk('orders/rateOrder', async ({ id, rating, comment }: { id: string; rating: number; comment?: string }, { rejectWithValue }) => {
    try { return await call(`/api/orders/${id}/rate`, { method: 'POST', body: { rating, comment } }) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const uploadRevealMessage = createAsyncThunk('orders/uploadRevealMessage', async ({ id, media }: { id: string; media: File }, { rejectWithValue }) => {
    try { const form = new FormData(); form.append('media', media); return await call(`/api/orders/${id}/reveal/message`, { method: 'POST', form }) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const deleteRevealMessage = createAsyncThunk('orders/deleteRevealMessage', async (id: string, { rejectWithValue }) => {
    try { return await call(`/api/orders/${id}/reveal/message`, { method: 'DELETE' }) } catch (e) { return rejectWithValue(errKey(e)) }
})
/** Public gift page: no login. */
export const getGift = createAsyncThunk('orders/getGift', async (token: string, { rejectWithValue }) => {
    try { return await call(`/api/gifts/${token}`) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const unlockGift = createAsyncThunk('orders/unlockGift', async (token: string, { rejectWithValue }) => {
    try { return await call(`/api/gifts/${token}/unlock`, { method: 'POST' }) } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const ordersSlice = createSlice({
    name: 'orders',
    initialState: { list: idle() as Res, order: idle() as Res, gift: idle() as Res },
    reducers: {},
    extraReducers: (b) => {
        addRes(b, getOrders, 'list')
        addRes(b, getOrder, 'order')
        addRes(b, getGift, 'gift')
    },
})
export default ordersSlice.reducer
