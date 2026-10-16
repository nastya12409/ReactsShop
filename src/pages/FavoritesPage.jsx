import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { removeFavorite } from '../features/favorites/favoritesSlice';
import { addToCart } from '../features/cart/cartSlice';
import { money } from '../shared/utils/money';
import Rating from '../shared/ui/Rating';

// Сторінка обраного: список збережених товарів + швидке додавання в кошик
export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);

  if (favorites.length === 0) {
    return (
      <div className="page empty-state">
        <h1>♡ Обране порожнє</h1>
        <p className="muted">Натисніть ♡ на товарі в каталозі, щоб зберегти його тут.</p>
        <Link to="/" className="btn">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>❤ Обране ({favorites.length})</h1>
      <ul className="fav-list">
        {favorites.map((p) => (
          <li key={p.id} className="card fav-row">
            <img src={p.thumbnail} alt={p.title} loading="lazy" width={72} height={72} />
            <div className="fav-info">
              <Link to={`/products/${p.id}`} className="cart-row-title">
                {p.title}
              </Link>
              <span className="muted small-text">{p.brand ?? p.category}</span>
              <Rating value={p.rating ?? 0} />
            </div>
            <strong>{money(p.price * (1 - (p.discountPercentage ?? 0) / 100))}</strong>
            <button type="button" className="btn small" onClick={() => dispatch(addToCart(p))}>
              🛒 У кошик
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dispatch(removeFavorite(p.id))}
              aria-label={`Прибрати ${p.title} з обраного`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
