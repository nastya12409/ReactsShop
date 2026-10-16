// Пагінація: кнопки-номери з "трьома крапками" для великої кількості сторінок
function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) result.push('…');
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Пагінація каталогу">
      <button
        type="button"
        className="btn ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹ Назад
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="pagination-gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`btn page-btn ${p === page ? 'active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Сторінка ${p}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="btn ghost"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Далі ›
      </button>
    </nav>
  );
}
