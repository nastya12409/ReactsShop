import { Component } from 'react';

// Error Boundary на рівні застосунку: ловить будь-яку помилку рендеру
// і показує зрозуміле повідомлення замість білого екрана.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page error-page" role="alert">
          <h1>Щось пішло не так 😔</h1>
          <p className="muted">Сталася неочікувана помилка застосунку.</p>
          <details className="error-details">
            <summary>Деталі помилки</summary>
            <pre>{String(this.state.error)}</pre>
          </details>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Перезавантажити сторінку
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
