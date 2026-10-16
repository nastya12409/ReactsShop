import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
import { loginSchema } from '../shared/utils/validation';

// Вхід: форма zodResolver + залогінення через власний сервіс-імітацію.
// Після входу повертаємось на сторінку, з якої прийшли.
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, error, user } = useAppSelector((state) => state.auth);
  const from = location.state?.from ?? '/';
  const expired = location.state?.expired;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const onSubmit = (values) => {
    dispatch(login(values))
      .unwrap()
      .then(() => navigate(from, { replace: true }))
      .catch(() => {});
  };

  return (
    <div className="page auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Вхід до акаунта</h1>

        {expired && (
          <p className="alert warn" role="status">
            ⏰ Час сесії вичерпано — увійдіть ще раз.
          </p>
        )}
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}

        <label className="field">
          <span>Логін</span>
          <input {...register('username')} placeholder="admin" autoComplete="username" />
          {errors.username && <em className="field-error">{errors.username.message}</em>}
        </label>

        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && <em className="field-error">{errors.password.message}</em>}
        </label>

        <button type="submit" className="btn big w-100" disabled={status === 'loading'}>
          {status === 'loading' ? 'Вхід…' : 'Увійти'}
        </button>

        <p className="muted small-text">
          Немає акаунта? <Link to="/register">Зареєструватись</Link>
        </p>
        <p className="muted small-text">
          Демо-дані: admin/admin123 (адмін) або user/user123 (клієнт)
        </p>
      </form>
    </div>
  );
}
