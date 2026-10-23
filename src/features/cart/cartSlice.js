import { createSelector, createSlice } from '@reduxjs/toolkit';
import { load } from '../../shared/utils/storage';
import { PROMOS, unitPrice } from '../../shared/utils/money';


const cartSlice = createSlice({
  name: 'cart',
  initialState: load('reactshop:cart', { items: [], promo: null }),
  reducers: {
  
    addToCart(state, action) {
      const product = action.payload;
      const item = state.items.find((i) => i.id === product.id);
      if (item) {
        item.qty += 1;
      } else {
        state.items.push({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          discountPercentage: product.discountPercentage,
          qty: 1,
        });
      }
    },
    setQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.qty = Math.min(99, Math.max(1, qty));
    },
    incQty(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.qty < 99) item.qty += 1;
    },
    decQty(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      if (item.qty > 1) item.qty -= 1;
      else state.items = state.items.filter((i) => i.id !== action.payload);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
      state.promo = null;
    },
    applyPromo(state, action) {
      const code = String(action.payload ?? '')
        .trim()
        .toUpperCase();
      state.promo = PROMOS[code] ? code : null;
    },
    removePromo(state) {
      state.promo = null;
    },
  },
});

export const {
  addToCart,
  setQty,
  incQty,
  decQty,
  removeFromCart,
  clearCart,
  applyPromo,
  removePromo,
} = cartSlice.actions;

export default cartSlice.reducer;


const selectItems = (state) => state.cart.items;

export const selectCartItems = selectItems;

export const selectCartCount = createSelector([selectItems], (items) =>
  items.reduce((n, i) => n + i.qty, 0),
);

export const selectCartSubtotal = createSelector([selectItems], (items) =>
  items.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0),
);

export const selectCartDiscount = createSelector(
  [selectCartSubtotal, (state) => state.cart.promo],
  (subtotal, promo) => (promo ? (subtotal * PROMOS[promo]) / 100 : 0),
);

export const selectCartTotal = createSelector([selectCartSubtotal, selectCartDiscount], (s, d) =>
  Math.max(0, s - d),
);
