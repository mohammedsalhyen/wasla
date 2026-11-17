import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, errKey, type Rec } from '../../api/client'
import { addRes, idle, type Res } from '../../store/resource'

// ------------------------------- Thunks -------------------------------
export const getProducts = createAsyncThunk('catalog/getProducts', async (query: Rec, { rejectWithValue }) => {
    try { return await api('/api/catalog/products', { query }) } catch (e) { return rejectWithValue(errKey(e)) }
})

export const getProduct = createAsyncThunk('catalog/getProduct', async (id: string, { rejectWithValue }) => {
    try { return await api(`/api/catalog/products/${id}`) } catch (e) { return rejectWithValue(errKey(e)) }
})

export const getCategories = createAsyncThunk('catalog/getCategories', async (section: string | undefined, { rejectWithValue }) => {
    try { return await api('/api/catalog/categories', { query: { section } }) } catch (e) { return rejectWithValue(errKey(e)) }
})

export const getStores = createAsyncThunk('catalog/getStores', async (_: void, { rejectWithValue }) => {
    try { return await api('/api/catalog/stores') } catch (e) { return rejectWithValue(errKey(e)) }
})

export const toggleFavorite = createAsyncThunk('catalog/toggleFavorite', async ({ id, on }: { id: number; on: boolean }, { rejectWithValue }) => {
    try { await api(`/api/favorites/${id}`, { method: on ? 'DELETE' : 'POST' }); return { id, on: !on } } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const catalogSlice = createSlice({
    name: 'catalog',
    initialState: { products: idle() as Res, product: idle() as Res, categories: idle() as Res, stores: idle() as Res },
    reducers: {},
    extraReducers: (b) => {
        addRes(b, getProducts, 'products')
        addRes(b, getProduct, 'product')
        addRes(b, getCategories, 'categories')
        addRes(b, getStores, 'stores')
        // keep the heart in sync without refetching
        b.addCase(toggleFavorite.fulfilled, (s, a) => {
            const list = s.products.data?.items as Rec[] | undefined
            list?.forEach((p) => { if (p.id === a.payload.id) p.isFavorite = a.payload.on })
            if (s.product.data?.id === a.payload.id) s.product.data.isFavorite = a.payload.on
        })
    },
})
export default catalogSlice.reducer
