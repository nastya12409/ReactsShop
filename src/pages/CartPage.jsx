import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  applyPromo,
  removePromo,
  selectCartDiscount,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
} from '../features/cart/cartSlice';
import { CartItemRow } from '../features/cart/CartItemRow';
import { PROMOS, money } from '../shared/utils/money';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector(selectCartDiscount);
  const total = useAppSelector(selectCartTotal);
  const promo = useAppSelector((state) => state.cart.promo);
  const user = useAppSelector((state) => state.auth.user);

  const [code, setCode] = useState('');

  if (items.length === 0) {
    return (
      <div className="page empty-state">
        <h1>🛒 Кошик порожній</h1>
        <p className="muted">Додайте товари з каталогу — вони з’являться тут.</p>
        <Link to="/" className="btn">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1>🛒 Кошик</h1>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </ul>

        <aside className="card summary" aria-label="Підсумок замовлення">
          <h2>Підсумок</h2>

          <div className="summary-row">
            <span>Товари ({items.length})</span>
            <span>{money(subtotal)}</span>
          </div>

          {promo ? (
            <div className="summary-row discount-row">
              <span>
                Промокод <strong>{promo}</strong>{' '}
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => dispatch(removePromo())}
                  aria-label="Прибрати промокод"
                >
                  ✕
                </button>
              </span>
              <span>−{money(discount)}</span>
            </div>
          ) : (
            <form
              className="promo-form"
              onSubmit={(e) => {
                e.preventDefault();
                dispatch(applyPromo(code));
                setCode('');
              }}
            >
              <label className="field">
                <span>Промокод</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SALE10"
                  aria-label="Промокод"
                />
              </label>
              <button type="submit" className="btn small">
                Застосувати
              </button>
            </form>
          )}

          <div className="summary-row total-row">
            <span>До сплати</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            type="button"
            className="btn big w-100"
            onClick={() =>
              navigate(user ? '/checkout' : '/login', { state: { from: '/checkout' } })
            }
          >
            Оформити замовлення →
          </button>

          <p className="muted small-text">Доступні промокоди: {Object.keys(PROMOS).join(', ')}</p>
        </aside>
      </div>
    </div>
  );
}
