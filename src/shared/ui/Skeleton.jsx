
export function Skeleton({ width = '100%', height = 16, radius = 8, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card product-card skeleton-card">
      <Skeleton height={200} radius={12} />
      <Skeleton width="70%" height={18} />
      <Skeleton width="40%" height={14} />
      <Skeleton width="55%" height={22} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="product-grid" role="status" aria-label="Завантаження товарів">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
