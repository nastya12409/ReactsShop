import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useGetProductQuery, useGetProductsQuery } from '../shared/api/api';
import { addToCart } from '../features/cart/cartSlice';
import { selectIsFavorite, toggleFavorite } from '../features/favorites/favoritesSlice';
import ProductCard from '../features/products/ProductCard';
import { money } from '../shared/utils/money';
import Rating from '../shared/ui/Rating';
import { Skeleton } from '../shared/ui/Skeleton';

// Сторінка товару: галерея, характеристики, відгуки, схожі товари
export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const { data: product, isFetching, isError, refetch } = useGetProductQuery(id);
  const { data: catalog } = useGetProductsQuery();

  const isFavorite = useAppSelector(selectIsFavorite(Number(id)));

  const [activeImage, setActiveImage] = useState('');
  // Скидаємо галерею при зміні товару: pattern "коригування стану під час рендеру"
  const [prevThumb, setPrevThumb] = useState(undefined);
  if (product?.thumbnail !== prevThumb) {
    setPrevThumb(product?.thumbnail);
    setActiveImage(product?.thumbnail ?? '');
  }

  const similar = (catalog?.products ?? [])
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (isError) {
    return (
      <div className="page error-page" role="alert">
        <h1>Не вдалося завантажити товар</h1>
        <button type="button" className="btn" onClick={refetch}>
          Повторити
        </button>
        <Link to="/" className="btn ghost">
          ← До каталогу
        </Link>
      </div>
    );
  }

  if (isFetching || !product) {
    return (
      <div className="page product-page">
        <div className="product-gallery">
          <Skeleton height={380} radius={16} />
        </div>
        <div className="product-details">
          <Skeleton width="60%" height={32} />
          <Skeleton width="35%" height={24} />
          <Skeleton width="90%" height={80} />
          <Skeleton width="220px" height={44} />
        </div>
      </div>
    );
  }

  const images = [product.thumbnail, ...(product.images ?? [])].filter(Boolean);
  const finalPrice = product.price * (1 - (product.discountPercentage ?? 0) / 100);

  return (
    <div className="page product-page">
      <nav aria-label="Хлібні крихти" className="breadcrumbs">
        <Link to="/">Каталог</Link>
        <span aria-hidden="true"> / </span>
        <span>{product.category}</span>
      </nav>

      <div className="product-top">
        <div className="product-gallery">
          <img
            src={activeImage || product.thumbnail}
            alt={product.title}
            width={420}
            height={420}
            className="gallery-main"
          />
          <div className="gallery-thumbs" role="group" aria-label="Галерея зображень">
            {images.map((img) => (
              <button
                key={img}
                type="button"
                className={`gallery-thumb ${img === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
                aria-pressed={img === activeImage}
                aria-label={`Зображення ${product.title}`}
              >
                <img src={img} alt="" loading="lazy" width={64} height={64} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-details">
          <span className="product-brand muted">{product.brand}</span>
          <h1>{product.title}</h1>
          <Rating value={product.rating ?? 0} count={product.reviews?.length} />

          <div className="product-price big">
            <strong>{money(finalPrice)}</strong>
            {product.discountPercentage > 0 && (
              <>
                <s className="muted">{money(product.price)}</s>
                <span className="discount">−{Math.round(product.discountPercentage)}%</span>
              </>
            )}
          </div>

          <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
            {product.stock > 0 ? `✔ В наявності (${product.stock} шт.)` : '✘ Немає в наявності'}
          </p>

          <p className="product-description">{product.description}</p>

          <div className="product-actions">
            <button
              type="button"
              className="btn big"
              disabled={product.stock <= 0}
              onClick={() => dispatch(addToCart(product))}
            >
              🛒 Додати до кошика
            </button>
            <button
              type="button"
              className="icon-btn fav-btn big"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати до обраного'}
              onClick={() => dispatch(toggleFavorite(product))}
            >
              {isFavorite ? '❤ Обране' : '♡ В обране'}
            </button>
          </div>

          <h2 className="section-title">Характеристики</h2>
          <dl className="specs">
            <div>
              <dt>Категорія</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Вага</dt>
              <dd>{product.weight ?? '—'} г</dd>
            </div>
            <div>
              <dt>Габарити</dt>
              <dd>
                {product.dimensions
                  ? `${product.dimensions.width}×${product.dimensions.height}×${product.dimensions.depth} см`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Гарантія</dt>
              <dd>{product.warrantyInformation ?? '—'}</dd>
            </div>
            <div>
              <dt>Доставка</dt>
              <dd>{product.shippingInformation ?? '—'}</dd>
            </div>
            <div>
              <dt>Повернення</dt>
              <dd>{product.returnPolicy ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="reviews" aria-label="Відгуки">
        <h2 className="section-title">Відгуки ({product.reviews?.length ?? 0})</h2>
        {product.reviews?.length ? (
          <ul className="review-list">
            {product.reviews.map((r, i) => (
              <li key={i} className="card review">
                <div className="review-head">
                  <strong>{r.reviewerName}</strong>
                  <Rating value={r.rating} />
                </div>
                <p className="muted small-text">{new Date(r.date).toLocaleDateString('uk-UA')}</p>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Відгуків поки немає.</p>
        )}
      </section>

      {similar.length > 0 && (
        <section aria-label="Схожі товари">
          <h2 className="section-title">Схожі товари</h2>
          <div className="product-grid">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
