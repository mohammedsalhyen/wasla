import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, errKey } from '../../api/client'
import { normalizeEnums, type EnumMap } from '../../lib/enums'
import { addRes, idle, type Res } from '../../store/resource'

// ------------------------------- Thunks -------------------------------
export const getSite = createAsyncThunk('site/getSite', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/site') } catch (e) { return rejectWithValue(errKey(e)) }
})

export const getEnums = createAsyncThunk('site/getEnums', async (_: void, { rejectWithValue }) => {
    try { return normalizeEnums(await api('/api/lookups/enums')) } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const siteSlice = createSlice({
    name: 'site',
    initialState: { info: idle() as Res, enums: idle<EnumMap>() as Res<EnumMap> },
    reducers: {},
    extraReducers: (b) => {
        addRes(b, getSite, 'info')
        addRes(b, getEnums, 'enums')
    },
})
export default siteSlice.reducer
