import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api, errKey, type Rec } from '../../api/client'
import { addRes, idle, type Res } from '../../store/resource'

export interface CartItem {
    key: string; productId: number; name: string; price: number; imageUrl?: string
    quantity: number; colorId?: number; colorName?: string; customText?: string
}
const KEY = 'wasla.cart'
const load = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] } }
const persist = (items: CartItem[]) => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignore */ } }

export const quoteItems = (items: CartItem[]) => items.map((i) => ({ productId: i.productId, quantity: i.quantity, colorId: i.colorId, customText: i.customText }))

// ------------------------------- Thunks -------------------------------
/** POST /api/orders/quote works without login; also returns earliestDeliveryDate. */
export const getQuote = createAsyncThunk('cart/getQuote', async (extra: Rec, { getState, rejectWithValue }) => {
    try {
        const items = (getState() as { cart: { items: CartItem[] } }).cart.items
        return await api('/api/orders/quote', { method: 'POST', body: { items: quoteItems(items), ...extra } })
    } catch (e) { return rejectWithValue(errKey(e)) }
})

// ------------------------------- Slice -------------------------------
const cartSlice = createSlice({
    name: 'cart',
    initialState: { items: load(), quote: idle() as Res },
    reducers: {
        addItem: (s, a: PayloadAction<Omit<CartItem, 'key'>>) => {
            const key = `${a.payload.productId}:${a.payload.colorId ?? ''}:${a.payload.customText ?? ''}`
            const ex = s.items.find((x) => x.key === key)
            if (ex) ex.quantity += a.payload.quantity
            else s.items.push({ ...a.payload, key })
            persist(s.items)
        },
        setQty: (s, a: PayloadAction<{ key: string; qty: number }>) => {
            s.items = a.payload.qty <= 0 ? s.items.filter((x) => x.key !== a.payload.key) : s.items.map((x) => (x.key === a.payload.key ? { ...x, quantity: a.payload.qty } : x))
            persist(s.items)
        },
        removeItem: (s, a: PayloadAction<string>) => { s.items = s.items.filter((x) => x.key !== a.payload); persist(s.items) },
        clearCart: (s) => { s.items = []; persist([]) },
    },
    extraReducers: (b) => { addRes(b, getQuote, 'quote') },
})

export const { addItem, setQty, removeItem, clearCart } = cartSlice.actions
export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0)
export default cartSlice.reducer
