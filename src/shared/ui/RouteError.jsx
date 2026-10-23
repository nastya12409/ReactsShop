import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="page error-page" role="alert">
      <h1>{notFound ? 'Сторінку не знайдено (404)' : 'Помилка завантаження сторінки'}</h1>
      <p className="muted">
        {notFound
          ? 'Такої сторінки не існує або товар видалено.'
          : 'Спробуйте перезавантажити сторінку або повернутись на головну.'}
      </p>
      <Link to="/" className="btn">
        ← До каталогу
      </Link>
    </div>
  );
}
