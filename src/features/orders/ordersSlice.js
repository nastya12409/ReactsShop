import { createSlice } from '@reduxjs/toolkit';
import { load } from '../../shared/utils/storage';

// Історія замовлень зберігається локально (наш "сервіс замовлень")
const ordersSlice = createSlice({
  name: 'orders',
  initialState: load('reactshop:orders', []),
  reducers: {
    placeOrder: {
      reducer(state, action) {
        state.unshift(action.payload);
      },
      prepare(order) {
        return {
          payload: { ...order, id: `RS-${Date.now()}`, createdAt: Date.now(), status: 'new' },
        };
      },
    },
  },
});

export const { placeOrder } = ordersSlice.actions;

export default ordersSlice.reducer;

export const selectOrderById = (id) => (state) => state.orders.find((o) => o.id === id);

export const selectOrdersByUser = (username) => (state) =>
  state.orders.filter((o) => o.customer?.username === username);
