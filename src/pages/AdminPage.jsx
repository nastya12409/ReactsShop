import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import {
  useAddProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '../shared/api/api';
import ProductsTable from '../features/admin/ProductsTable';
import ProductForm from '../features/admin/ProductForm';
import { ProductGridSkeleton } from '../shared/ui/Skeleton';

// Адмін-розділ: таблиця товарів з сортуванням за стовпцями,
// додаванням, редагуванням і видаленням через API-шар.
export default function AdminPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isFetching, isError, refetch } = useGetProductsQuery();

  const [addProduct, addState] = useAddProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [sort, setSort] = useState({ key: 'title', dir: 'asc' });
  const [editing, setEditing] = useState(null); // null | product | 'new'
  const [formError, setFormError] = useState(null);

  const rows = useMemo(() => {
    const list = [...(data?.products ?? [])];
    const { key, dir } = sort;
    list.sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      const cmp = typeof av === 'string' ? av.localeCompare(bv, 'uk') : av - bv;
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [data, sort]);

  const onSort = (key) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      if (editing === 'new') await addProduct(values).unwrap();
      else await updateProduct({ id: editing.id, ...values }).unwrap();
      setEditing(null);
    } catch (e) {
      setFormError(e?.message ?? 'Не вдалося зберегти товар');
    }
  };

  const onDelete = async (product) => {
    if (!window.confirm(`Видалити товар «${product.title}»?`)) return;
    try {
      await deleteProduct(product.id).unwrap();
    } catch {
      /* DummyJSON не зберігає зміни; кеш уже оновлено оптимістично */
    }
  };

  return (
    <div className="page admin-page">
      <div className="catalog-head">
        <h1>🛠 Адмін-розділ</h1>
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          ＋ Додати товар
        </button>
      </div>
      <p className="muted small-text">
        Ви увійшли як <strong>{user.username}</strong> (роль: {user.role}). API: dummyjson.com —
        фейковий, зміни живуть до перезавантаження.
      </p>

      {isError && (
        <div className="alert error" role="alert">
          <span>Не вдалося завантажити товари</span>
          <button type="button" className="btn small" onClick={refetch}>
            Повторити
          </button>
        </div>
      )}

      {isFetching && !data && <ProductGridSkeleton count={4} />}

      {data && (
        <ProductsTable
          rows={rows}
          sort={sort}
          onSort={onSort}
          onEdit={setEditing}
          onDelete={onDelete}
        />
      )}

      {addState.isError && (
        <p className="alert error" role="alert">
          Додавання не вдалося: {addState.error?.message}
        </p>
      )}
      {updateState.isError && (
        <p className="alert error" role="alert">
          Оновлення не вдалося: {updateState.error?.message}
        </p>
      )}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={onSubmit}
          saving={addState.isLoading || updateState.isLoading}
          error={formError}
        />
      )}

      <p className="muted small-text">
        <Link to="/">← Повернутись у магазин</Link>
      </p>
    </div>
  );
}
