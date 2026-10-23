import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { decQty, incQty, removeFromCart, setQty } from './cartSlice';
import { money, unitPrice } from '../../shared/utils/money';


export function CartItemRow({ item }) {
  const dispatch = useAppDispatch();

  return (
    <li className="cart-row">
      <img src={item.thumbnail} alt={item.title} loading="lazy" width={72} height={72} />
      <div className="cart-row-info">
        <Link to={`/products/${item.id}`} className="cart-row-title">
          {item.title}
        </Link>
        <span className="muted small-text">{money(unitPrice(item))} за шт.</span>
      </div>

      <div className="qty">
        <button
          type="button"
          className="btn small"
          onClick={() => dispatch(decQty(item.id))}
          aria-label={`Зменшити кількість ${item.title}`}
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="99"
          value={item.qty}
          aria-label={`Кількість ${item.title}`}
          onChange={(e) => dispatch(setQty({ id: item.id, qty: Number(e.target.value) || 1 }))}
        />
        <button
          type="button"
          className="btn small"
          onClick={() => dispatch(incQty(item.id))}
          aria-label={`Збільшити кількість ${item.title}`}
        >
          +
        </button>
      </div>

      <strong className="cart-row-total">{money(unitPrice(item) * item.qty)}</strong>

      <button
        type="button"
        className="icon-btn"
        onClick={() => dispatch(removeFromCart(item.id))}
        aria-label={`Видалити ${item.title} з кошика`}
      >
        ✕
      </button>
    </li>
  );
}
