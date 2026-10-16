// Рейтинг зірочками з aria-підписом для скрінрідерів
export default function Rating({ value = 0, count }) {
  const full = Math.round(value);
  return (
    <span
      className="rating"
      title={`Рейтинг ${value.toFixed(1)} з 5`}
      aria-label={`Рейтинг ${value.toFixed(1)} з 5`}
    >
      <span aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(5 - full)}
      </span>
      <span className="rating-num">{value.toFixed(1)}</span>
      {count !== undefined && <span className="muted">({count})</span>}
    </span>
  );
}
