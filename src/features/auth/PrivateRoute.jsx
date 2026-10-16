import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

// Захищений маршрут: пропускає лише залогінених (і за роллю, якщо передана).
// Термін дії токена контролює useAutoLogout у Layout, а початковий стан
// сховища вже "відсікає" прострочену сесію — тут лишаємося чистими під час рендеру.
// Куди повернутись після входу — зберігаємо в location.state.
export function PrivateRoute({ role }) {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}
