import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, errKey, type Rec } from '../../api/client'
import type { Res } from '../../store/resource'

// ------------------------------- Thunks -------------------------------
/** Loads any admin list/detail into state.lists[key]. */
export const adminGet = createAsyncThunk('admin/get', async ({ key, path, query }: { key: string; path: string; query?: Rec }, { rejectWithValue }) => {
    try { return { key, data: await api(path, { query }) } } catch (e) { return rejectWithValue({ key, error: errKey(e) }) }
})

/** POST / PUT / DELETE against an admin route (json body or multipart form). */
export const adminSend = createAsyncThunk('admin/send', async ({ path, method = 'POST', body, form }: { path: string; method?: string; body?: unknown; form?: FormData }, { rejectWithValue }) => {
    try { return await api(path, { method, body, form }) } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const adminSlice = createSlice({
    name: 'admin',
    initialState: { lists: {} as Record<string, Res> },
    reducers: {},
    extraReducers: (b) => {
        b.addCase(adminGet.pending, (s, a) => { s.lists[a.meta.arg.key] = { ...s.lists[a.meta.arg.key], status: 'loading' } })
        b.addCase(adminGet.fulfilled, (s, a) => { s.lists[a.payload.key] = { status: 'succeeded', data: a.payload.data } })
        b.addCase(adminGet.rejected, (s, a) => { const p = a.payload as { key: string; error: string }; s.lists[p.key] = { status: 'failed', error: p.error } })
    },
})
export default adminSlice.reducer
