const SORT_OPTIONS = [
  { value: 'default', label: 'За замовчуванням' },
  { value: 'price-asc', label: 'Ціна: від дешевших' },
  { value: 'price-desc', label: 'Ціна: від дорожчих' },
  { value: 'rating-desc', label: 'Рейтинг: від вищих' },
  { value: 'title-asc', label: 'Назва: А → Я' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Будь-який' },
  { value: 3, label: 'Від 3★' },
  { value: 4, label: 'Від 4★' },
  { value: 4.5, label: 'Від 4,5★' },
];


export default function Filters({
  categories,
  filters,
  maxPrice,
  onChange,
  onReset,
  text,
  onTextChange,
}) {
  return (
    <aside className="filters" aria-label="Фільтри каталогу">
      <div className="filters-head">
        <h2 className="filters-title">Фільтри</h2>
        <button type="button" className="btn ghost small" onClick={onReset}>
          Скинути
        </button>
      </div>

      <label className="field">
        <span>Пошук</span>
        <input
          type="search"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Назва, опис або бренд…"
        />
      </label>

      <label className="field">
        <span>Категорія</span>
        <select value={filters.category} onChange={(e) => onChange('category', e.target.value)}>
          <option value="">Усі категорії</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Ціна до: {filters.price ? money_short(filters.price) : '∞'}</span>
        <input
          type="range"
          min="0"
          max={maxPrice}
          step="10"
          value={filters.price}
          onChange={(e) => onChange('price', Number(e.target.value))}
          aria-label="Максимальна ціна"
        />
      </label>

      <fieldset className="field radio-group">
        <legend>Рейтинг від</legend>
        {RATING_OPTIONS.map((opt) => (
          <label key={opt.value} className="radio-row">
            <input
              type="radio"
              name="rating"
              value={opt.value}
              checked={Number(filters.rating) === opt.value}
              onChange={() => onChange('rating', opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <label className="field">
        <span>Сортування</span>
        <select value={filters.sort} onChange={(e) => onChange('sort', e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}


function money_short(value) {
  return `$${value}`;
}
