import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import Layout from './Layout';
import { PrivateRoute } from '../features/auth/PrivateRoute';
import RouteError from '../shared/ui/RouteError';
import Spinner from '../shared/ui/Spinner';

// Ледаче завантаження кожної сторінки: React.lazy + Suspense
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderPage = lazy(() => import('../pages/OrderPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

const page = (Component) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(ProductsPage) },
      { path: '/products/:id', element: page(ProductPage) },
      { path: '/cart', element: page(CartPage) },
      { path: '/favorites', element: page(FavoritesPage) },
      { path: '/login', element: page(LoginPage) },
      { path: '/register', element: page(RegisterPage) },
      {
        element: <PrivateRoute />,
        children: [
          { path: '/profile', element: page(ProfilePage) },
          { path: '/checkout', element: page(CheckoutPage) },
          { path: '/order/:id', element: page(OrderPage) },
        ],
      },
      {
        element: <PrivateRoute role="admin" />,
        children: [{ path: '/admin', element: page(AdminPage) }],
      },
      {
        path: '*',
        element: (
          <div className="page empty-state">
            <h1>404 — сторінку не знайдено</h1>
            <Link to="/" className="btn">
              До каталогу
            </Link>
          </div>
        ),
      },
    ],
  },
]);
