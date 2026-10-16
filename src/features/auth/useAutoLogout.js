import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from './authSlice';

// Автоматичний вихід, коли "термін дії" токена минув:
// ставимо таймер на час, що лишився, і розлогіновуємо.
export function useAutoLogout() {
  const { user, exp } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !exp) return;

    const expire = () => {
      dispatch(logout());
      navigate('/login', { state: { expired: true } });
    };

    const ms = exp - Date.now();
    if (ms <= 0) {
      expire();
      return;
    }
    const timer = setTimeout(expire, ms);
    return () => clearTimeout(timer);
  }, [user, exp, dispatch, navigate, location.pathname]);
}
