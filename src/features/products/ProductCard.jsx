import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCart } from '../cart/cartSlice';
import { selectIsFavorite, toggleFavorite } from '../favorites/favoritesSlice';
import { money } from '../../shared/utils/money';
import Rating from '../../shared/ui/Rating';


const ProductCard = memo(function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector(selectIsFavorite(product.id));

  return (
    <article className="card product-card">
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          width={280}
          height={200}
          className="product-image"
        />
      </Link>

      <div className="product-card-body">
        {product.brand && <span className="product-brand">{product.brand}</span>}
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <Rating value={product.rating ?? 0} count={product.reviews?.length} />

        <div className="product-card-foot">
          <div className="product-price">
            <strong>{money(product.price * (1 - (product.discountPercentage ?? 0) / 100))}</strong>
            {product.discountPercentage > 0 && (
              <>
                <s className="muted">{money(product.price)}</s>
                <span className="discount">−{Math.round(product.discountPercentage)}%</span>
              </>
            )}
          </div>
          <button
            type="button"
            className="icon-btn fav-btn"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати до обраного'}
            onClick={() => dispatch(toggleFavorite(product))}
          >
            {isFavorite ? '❤' : '♡'}
          </button>
        </div>

        <button type="button" className="btn w-100" onClick={() => dispatch(addToCart(product))}>
          🛒 До кошика
        </button>
      </div>
    </article>
  );
});

export default ProductCard;
