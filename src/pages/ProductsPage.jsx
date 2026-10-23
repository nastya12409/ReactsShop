import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../shared/api/api';
import { useDebounce } from '../shared/hooks/useDebounce';
import ProductCard from '../features/products/ProductCard';
import Filters from '../features/products/Filters';
import Pagination from '../shared/ui/Pagination';
import { ProductGridSkeleton } from '../shared/ui/Skeleton';

const PAGE_SIZE = 12;
const DEFAULT_MAX_PRICE = 2000;


export default function ProductsPage() {
  const { data, isFetching, isError, error, refetch } = useGetProductsQuery();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const price = Number(params.get('price') ?? 0);
  const rating = Number(params.get('rating') ?? 0);
  const sort = params.get('sort') ?? 'default';
  const page = Math.max(1, Number(params.get('page') ?? 1));

  
  const [text, setText] = useState(q);
  const debounced = useDebounce(text, 300);
  useEffect(() => {
    if (debounced === q) return;
    const next = new URLSearchParams(params);
    if (debounced) next.set('q', debounced);
    else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const products = useMemo(() => data?.products ?? [], [data]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const haystack = `${p.title} ${p.description} ${p.brand ?? ''}`.toLowerCase();
      if (q && !haystack.includes(q.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (price && p.price > price) return false;
      if (rating && (p.rating ?? 0) < rating) return false;
      return true;
    });

    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'title-asc':
        return [...list].sort((a, b) => a.title.localeCompare(b.title, 'uk'));
      default:
        return list;
    }
  }, [products, q, category, price, rating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    const isEmpty = value === '' || value === 0 || value == null;
    if (!isEmpty) next.set(key, String(value));
    else next.delete(key);
    next.delete('page'); 
    setParams(next);
  };

  const resetFilters = () => setParams(new URLSearchParams());

  return (
    <div className="page catalog-page">
      <Filters
        categories={categories}
        filters={{ category, price, rating, sort }}
        maxPrice={DEFAULT_MAX_PRICE}
        text={text}
        onTextChange={setText}
        onChange={setFilter}
        onReset={resetFilters}
      />

      <section className="catalog-main" aria-label="Каталог товарів">
        <div className="catalog-head">
          <h1>Каталог товарів</h1>
          <span className="muted" aria-live="polite">
            {isFetching && !data
              ? 'Завантаження…'
              : `Знайдено: ${filtered.length} із ${data?.total ?? 0}`}
          </span>
        </div>

        {isError && (
          <div className="alert error" role="alert">
            <span>Не вдалося завантажити товари: {error?.message ?? 'невідома помилка'}</span>
            <button type="button" className="btn small" onClick={refetch}>
              Повторити
            </button>
          </div>
        )}

        {isFetching && !data && <ProductGridSkeleton count={8} />}

        {!isError && filtered.length === 0 && data && (
          <div className="empty-state">
            <h2>Нічого не знайдено 😕</h2>
            <p className="muted">Спробуйте змінити фільтри або скинути їх.</p>
            <button type="button" className="btn" onClick={resetFilters}>
              Скинути фільтри
            </button>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="product-grid">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <Pagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onChange={(p) => setFilter('page', p)}
        />
      </section>
    </div>
  );
}
