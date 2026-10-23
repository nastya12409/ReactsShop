import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectOrderById } from '../features/orders/ordersSlice';
import { money } from '../shared/utils/money';

const DELIVERY_LABEL = { nova: 'Нова Пошта', courier: 'Кур’єр', pickup: 'Самовивіз' };
const PAYMENT_LABEL = { card: 'Карта онлайн', cash: 'Готівкою при отриманні' };


export default function OrderPage() {
  const { id } = useParams();
  const order = useAppSelector(selectOrderById(id));

  if (!order) {
    return (
      <div className="page empty-state">
        <h1>Замовлення не знайдено</h1>
        <p className="muted">Можливо, його було створено до очищення історії браузера.</p>
        <Link to="/" className="btn">
          До каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="page order-page">
      <div className="card order-card">
        <h1>✅ Дякуємо за замовлення!</h1>
        <p className="muted">
          Номер замовлення: <strong>{order.id}</strong> від{' '}
          {new Date(order.createdAt).toLocaleDateString('uk-UA')}
        </p>

        <h2 className="section-title">Склад замовлення</h2>
        <ul className="order-items">
          {order.items.map((i) => (
            <li key={i.id} className="summary-row">
              <Link to={`/products/${i.id}`}>{i.title}</Link> × {i.qty}
              <span>{money(i.price * (1 - (i.discountPercentage ?? 0) / 100) * i.qty)}</span>
            </li>
          ))}
        </ul>

        {order.discount > 0 && (
          <div className="summary-row discount-row">
            <span>Знижка за промокодом {order.promo}</span>
            <span>−{money(order.discount)}</span>
          </div>
        )}
        <div className="summary-row total-row">
          <span>Сплачено</span>
          <strong>{money(order.total)}</strong>
        </div>

        <dl className="specs">
          <div>
            <dt>Одержувач</dt>
            <dd>
              {order.customer.firstName} {order.customer.lastName}
            </dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{order.customer.phone}</dd>
          </div>
          <div>
            <dt>Доставка</dt>
            <dd>
              {DELIVERY_LABEL[order.customer.delivery]} — {order.customer.city},{' '}
              {order.customer.address}
            </dd>
          </div>
          <div>
            <dt>Оплата</dt>
            <dd>{PAYMENT_LABEL[order.customer.payment]}</dd>
          </div>
        </dl>

        <Link to="/profile" className="btn ghost">
          Перейти в профіль
        </Link>
        <Link to="/" className="btn">
          Продовжити покупки
        </Link>
      </div>
    </div>
  );
}
