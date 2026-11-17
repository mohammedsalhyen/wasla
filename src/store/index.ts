import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import siteReducer from '../features/site/siteSlice'
import catalogReducer from '../features/catalog/catalogSlice'
import cartReducer from '../features/cart/cartSlice'
import ordersReducer from '../features/orders/ordersSlice'
import designsReducer from '../features/designs/designsSlice'
import accountReducer from '../features/account/accountSlice'
import adminReducer from '../features/admin/adminSlice'

export const store = configureStore({
    reducer: { auth: authReducer, site: siteReducer, catalog: catalogReducer, cart: cartReducer, orders: ordersReducer, designs: designsReducer, account: accountReducer, admin: adminReducer },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
