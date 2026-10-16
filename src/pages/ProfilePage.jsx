import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateProfile } from '../features/auth/authSlice';
import { selectOrdersByUser } from '../features/orders/ordersSlice';
import { money } from '../shared/utils/money';

const DELIVERY_LABEL = { nova: 'Нова Пошта', courier: 'Кур’єр', pickup: 'Самовивіз' };

// Профіль: дані користувача (редагування) + історія замовлень
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const orders = useAppSelector(selectOrdersByUser(user.username));

  const onSave = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    dispatch(
      updateProfile({
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        email: form.get('email'),
        address: form.get('address'),
      }),
    );
    alert('Профіль оновлено ✔');
  };

  return (
    <div className="page profile-page">
      <h1>👤 Профіль</h1>

      <div className="profile-layout">
        <form className="card profile-card" onSubmit={onSave}>
          <h2>Мої дані</h2>
          <p className="muted small-text">
            Логін: <strong>{user.username}</strong> · Роль: <strong>{user.role}</strong>
          </p>

          <label className="field">
            <span>Ім’я</span>
            <input name="firstName" defaultValue={user.firstName} required minLength={2} />
          </label>
          <label className="field">
            <span>Прізвище</span>
            <input name="lastName" defaultValue={user.lastName} required minLength={2} />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" defaultValue={user.email} required />
          </label>
          <label className="field">
            <span>Адреса доставки</span>
            <input name="address" defaultValue={user.address} placeholder="Місто, вулиця, №" />
          </label>

          <button type="submit" className="btn">
            Зберегти зміни
          </button>
        </form>

        <section className="card profile-card" aria-label="Історія замовлень">
          <h2>Історія замовлень ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="muted">
              Замовлень ще немає. <Link to="/">До каталогу</Link>
            </p>
          ) : (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.id} className="order-row">
                  <Link to={`/order/${order.id}`}>
                    <strong>{order.id}</strong>
                  </Link>
                  <span className="muted small-text">
                    {new Date(order.createdAt).toLocaleDateString('uk-UA')} ·{' '}
                    {DELIVERY_LABEL[order.delivery] ?? order.delivery}
                  </span>
                  <span>{money(order.total)}</span>
                  <span className="order-status">
                    {order.status === 'new' ? 'Нове' : order.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
