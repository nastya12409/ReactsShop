import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { makeStore } from '../../app/store';
import ProductCard from './ProductCard';

const product = {
  id: 42,
  title: 'Маршрутизатор TP-Link',
  brand: 'TP-Link',
  category: 'networking',
  price: 100,
  discountPercentage: 0,
  rating: 4.5,
  thumbnail: 'router.jpg',
  reviews: [],
};

const renderCard = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    </Provider>,
  );

describe('ProductCard', () => {
  it('відображає назву, бренд і ціну', () => {
    renderCard();
    expect(screen.getByText('Маршрутизатор TP-Link')).toBeInTheDocument();
    expect(screen.getByText('TP-Link')).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument(); // ціна після форматування валютою
  });

  it('кнопка «До кошика» додає товар у стан Redux', () => {
    const store = makeStore();
    renderCard(store);

    fireEvent.click(screen.getByRole('button', { name: /до кошика/i }));
    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().cart.items[0]).toMatchObject({ id: 42, qty: 1 });
  });

  it('кнопка обраного перемикає aria-pressed і міняє стан favorites', () => {
    const store = makeStore();
    renderCard(store);

    const fav = screen.getByRole('button', { name: /обраного/i });
    expect(fav).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(fav);
    expect(store.getState().favorites).toHaveLength(1);
    expect(screen.getByRole('button', { name: /прибрати з обраного/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
