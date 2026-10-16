import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks';
import { logout } from '../features/auth/authSlice';
import { useAutoLogout } from '../features/auth/useAutoLogout';
import { selectCartCount } from '../features/cart/cartSlice';

// Каркас застосунку: шапка з навігацією, лічильниками та входом.
// Тут же "висить" автоматичний вихід по завершенню токена.
export default function Layout() {
  useAutoLogout();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const cartCount = useAppSelector(selectCartCount);
  const favCount = useAppSelector((state) => state.favorites.length);
  const user = useAppSelector((state) => state.auth.user);

  // Скидаємо стан повідомлень між сторінками (напр., expired у LoginPage)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo" aria-label="ReactShop — на головну">
          🛍 <strong>React</strong>Shop
        </Link>

        <nav className="nav" aria-label="Головна навігація">
          <NavLink to="/">Каталог</NavLink>
          <NavLink to="/favorites">
            Обране
            {favCount > 0 && <span className="badge">{favCount}</span>}
          </NavLink>
          <NavLink to="/cart">
            Кошик
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Адмін</NavLink>}
        </nav>

        <div className="header-auth">
          {user ? (
            <>
              <Link to="/profile" className="header-user">
                👤 {user.firstName} {user.lastName}
              </Link>
              <button type="button" className="btn ghost small" onClick={() => dispatch(logout())}>
                Вийти
              </button>
            </>
          ) : (
            <Link to="/login" className="btn small">
              Увійти
            </Link>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">ReactShop — навчальний проєкт. Товари з API dummyjson.com</footer>
    </div>
  );
}
