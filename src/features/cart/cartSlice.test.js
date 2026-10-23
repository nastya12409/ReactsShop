import { describe, expect, it } from 'vitest';
import cartReducer, {
  addToCart,
  applyPromo,
  clearCart,
  decQty,
  incQty,
  removeFromCart,
  selectCartCount,
  selectCartDiscount,
  selectCartSubtotal,
  selectCartTotal,
  setQty,
} from './cartSlice';

const product = {
  id: 1,
  title: 'iPhone 15',
  price: 1000,
  thumbnail: 'x.jpg',
  discountPercentage: 10, 
};

const initial = { items: [], promo: null };

describe('cartSlice', () => {
  it('додає товар у кошик', () => {
    const state = cartReducer(initial, addToCart(product));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ id: 1, qty: 1, title: 'iPhone 15' });
  });

  it('та сама картка збільшує кількість, а не дублюється', () => {
    let state = cartReducer(initial, addToCart(product));
    state = cartReducer(state, addToCart(product));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(2);
  });

  it('кількість не опускається нижче 1; інкремент/декремент працюють', () => {
    let state = cartReducer(initial, addToCart(product));
    state = cartReducer(state, incQty(1));
    expect(state.items[0].qty).toBe(2);
    state = cartReducer(state, decQty(1));
    expect(state.items[0].qty).toBe(1);
    state = cartReducer(state, decQty(1)); 
    expect(state.items).toHaveLength(0);
  });

  it('setQty обмежує значення діапазоном 1…99', () => {
    let state = cartReducer(initial, addToCart(product));
    state = cartReducer(state, setQty({ id: 1, qty: 0 }));
    expect(state.items[0].qty).toBe(1);
    state = cartReducer(state, setQty({ id: 1, qty: 500 }));
    expect(state.items[0].qty).toBe(99);
  });

  it('видалення та очищення кошика', () => {
    let state = cartReducer(initial, addToCart(product));
    state = cartReducer(state, removeFromCart(1));
    expect(state.items).toHaveLength(0);

    state = cartReducer(state, addToCart(product));
    state = cartReducer(state, applyPromo('sale10'));
    state = cartReducer(state, clearCart());
    expect(state).toEqual({ items: [], promo: null });
  });

  it('невідомий промокод не застосовується', () => {
    const state = cartReducer(initial, applyPromo('HACK'));
    expect(state.promo).toBeNull();
  });

  it('селектори рахують суми зі знижкою товару і промокодом', () => {
    let state = { cart: cartReducer(initial, addToCart(product)) };
    state = cartReducer(state.cart, incQty(1)); 
    const withQty = { cart: state };

    expect(selectCartCount(withQty)).toBe(2);
    expect(selectCartSubtotal(withQty)).toBe(1800); 
    const promoState = {
      cart: cartReducer(state, applyPromo('SALE10')), 
    };
    expect(selectCartDiscount(promoState)).toBeCloseTo(180);
    expect(selectCartTotal(promoState)).toBeCloseTo(1620);
  });
});
