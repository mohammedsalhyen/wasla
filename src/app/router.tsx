import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout, AdminLayout } from './layouts'
import { RequireAdmin, RequireAuth } from './guards'
import NotFound from './ComingSoon'
import Landing from '../landing/Landing'
import { LoginPage, RegisterPage } from '../features/auth/AuthPages'
import Shop from '../pages/Shop'
import Product from '../pages/Product'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import { OrdersPage, OrderDetail } from '../pages/Orders'
import Gift from '../pages/Gift'
import { DesignsPage, NewDesign, DesignDetail } from '../pages/Designs'
import { FavoritesPage, NotificationsPage, SupportPage, TicketDetail, ProfilePage } from '../pages/Account'
import { CrudPage } from '../admin/crud'
import { categoriesCfg, storesCfg, zonesCfg, paymentsCfg, packagesCfg } from '../admin/cfgs'
import { Overview, AdminOrders, AdminOrderDetail, AdminProducts, AdminDesigns, AdminDesignDetail, AdminSettings, AdminCustomers, AdminTickets, AdminTicket, AdminAudit } from '../admin/pages'

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/shop', element: <Shop /> },
      { path: '/shop/:id', element: <Product /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/cart', element: <Cart /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/checkout', element: <Checkout /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetail /> },
          { path: '/designs', element: <DesignsPage /> },
          { path: '/designs/new', element: <NewDesign /> },
          { path: '/designs/:id', element: <DesignDetail /> },
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/support', element: <SupportPage /> },
          { path: '/support/:id', element: <TicketDetail /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  // Public, no login: printed QR codes point here.
  { path: '/gift/:token', element: <Gift /> },
  {
    path: '/admin',
    element: <RequireAdmin />,
    children: [{
      element: <AdminLayout />,
      children: [
        { index: true, element: <Overview /> },
        { path: 'orders', element: <AdminOrders /> }, { path: 'orders/:id', element: <AdminOrderDetail /> },
        { path: 'products', element: <AdminProducts /> },
        { path: 'categories', element: <CrudPage cfg={categoriesCfg} /> },
        { path: 'stores', element: <CrudPage cfg={storesCfg} /> },
        { path: 'packages', element: <CrudPage cfg={packagesCfg} /> },
        { path: 'designs', element: <AdminDesigns /> }, { path: 'designs/:id', element: <AdminDesignDetail /> },
        { path: 'zones', element: <CrudPage cfg={zonesCfg} /> },
        { path: 'payments', element: <CrudPage cfg={paymentsCfg} /> },
        { path: 'settings', element: <AdminSettings /> },
        { path: 'customers', element: <AdminCustomers /> },
        { path: 'tickets', element: <AdminTickets /> }, { path: 'tickets/:id', element: <AdminTicket /> },
        { path: 'audit', element: <AdminAudit /> },
      ],
    }],
  },
  { path: '*', element: <NotFound /> },
])
export default router
