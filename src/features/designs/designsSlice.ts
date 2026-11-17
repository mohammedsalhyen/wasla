import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, errKey } from '../../api/client'
import { addRes, idle, type Res } from '../../store/resource'

// ------------------------------- Thunks -------------------------------
export const getDesigns = createAsyncThunk('designs/getDesigns', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/design-requests') } catch (e) { return rejectWithValue(errKey(e)) }
})
export const getDesign = createAsyncThunk('designs/getDesign', async (id: string, { rejectWithValue }) => {
    try { return await api(`/api/design-requests/${id}`) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const createDesign = createAsyncThunk('designs/createDesign', async (form: FormData, { rejectWithValue }) => {
    try { return await api('/api/design-requests', { method: 'POST', form }) } catch (e) { return rejectWithValue(errKey(e)) }
})
export const payDesign = createAsyncThunk('designs/payDesign', async ({ id, form }: { id: string; form: FormData }, { rejectWithValue }) => {
    try { return await api(`/api/design-requests/${id}/payment`, { method: 'POST', form }) } catch (e) { return rejectWithValue(errKey(e)) }
})
/** action: revision (body {note}) | complete | cancel */
export const designAction = createAsyncThunk('designs/designAction', async ({ id, action, note }: { id: string; action: 'revision' | 'complete' | 'cancel'; note?: string }, { rejectWithValue }) => {
    try { return await api(`/api/design-requests/${id}/${action}`, { method: 'POST', body: note ? { note } : undefined }) } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const designsSlice = createSlice({
    name: 'designs',
    initialState: { list: idle() as Res, current: idle() as Res },
    reducers: {},
    extraReducers: (b) => { addRes(b, getDesigns, 'list'); addRes(b, getDesign, 'current') },
})
export default designsSlice.reducer
