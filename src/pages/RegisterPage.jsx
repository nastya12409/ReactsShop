import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { register as registerUser } from '../features/auth/authSlice';
import { registerSchema } from '../shared/utils/validation';


export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, error, user } = useAppSelector((state) => state.auth);
  const from = location.state?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const onSubmit = (values) => {
    dispatch(registerUser(values))
      .unwrap()
      .then(() => navigate(from, { replace: true }))
      .catch(() => {});
  };

  return (
    <div className="page auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Реєстрація</h1>

        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}

        <div className="field-row">
          <label className="field">
            <span>Ім’я</span>
            <input {...register('firstName')} autoComplete="given-name" />
            {errors.firstName && <em className="field-error">{errors.firstName.message}</em>}
          </label>
          <label className="field">
            <span>Прізвище</span>
            <input {...register('lastName')} autoComplete="family-name" />
            {errors.lastName && <em className="field-error">{errors.lastName.message}</em>}
          </label>
        </div>

        <label className="field">
          <span>Email</span>
          <input type="email" {...register('email')} autoComplete="email" />
          {errors.email && <em className="field-error">{errors.email.message}</em>}
        </label>

        <label className="field">
          <span>Логін</span>
          <input {...register('username')} autoComplete="username" />
          {errors.username && <em className="field-error">{errors.username.message}</em>}
        </label>

        <div className="field-row">
          <label className="field">
            <span>Пароль</span>
            <input type="password" {...register('password')} autoComplete="new-password" />
            {errors.password && <em className="field-error">{errors.password.message}</em>}
          </label>
          <label className="field">
            <span>Повторіть пароль</span>
            <input type="password" {...register('confirm')} autoComplete="new-password" />
            {errors.confirm && <em className="field-error">{errors.confirm.message}</em>}
          </label>
        </div>

        <button type="submit" className="btn big w-100" disabled={status === 'loading'}>
          {status === 'loading' ? 'Створення акаунта…' : 'Зареєструватись'}
        </button>

        <p className="muted small-text">
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </p>
      </form>
    </div>
  );
}
