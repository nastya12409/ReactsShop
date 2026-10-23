import { money } from '../../shared/utils/money';

const COLUMNS = [
  { key: 'title', label: 'Назва' },
  { key: 'category', label: 'Категорія' },
  { key: 'price', label: 'Ціна' },
  { key: 'rating', label: 'Рейтинг' },
  { key: 'stock', label: 'Кількість' },
];


export default function ProductsTable({ rows, sort, onSort, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <caption className="sr-only">Товари магазину</caption>
        <thead>
          <tr>
            <th scope="col">Фото</th>
            {COLUMNS.map((col) => (
              <th key={col.key} scope="col" aria-sort={sort.key === col.key ? sort.dir : 'none'}>
                <button type="button" className="th-sort" onClick={() => onSort(col.key)}>
                  {col.label}
                  <span aria-hidden="true">
                    {sort.key === col.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                  </span>
                </button>
              </th>
            ))}
            <th scope="col">Дії</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>
                <img src={p.thumbnail} alt="" loading="lazy" width={40} height={40} />
              </td>
              <td>{p.title}</td>
              <td>{p.category}</td>
              <td>{money(p.price)}</td>
              <td>{(p.rating ?? 0).toFixed(1)}</td>
              <td>{p.stock ?? '—'}</td>
              <td className="table-actions">
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={() => onEdit(p)}
                  aria-label={`Редагувати ${p.title}`}
                >
                  ✏
                </button>
                <button
                  type="button"
                  className="btn small ghost danger"
                  onClick={() => onDelete(p)}
                  aria-label={`Видалити ${p.title}`}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
