import { createSlice } from '@reduxjs/toolkit';


export const CHECKOUT_STEPS = ['Дані одержувача', 'Доставка', 'Оплата'];

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    step: 0,
    data: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      delivery: 'nova',
      payment: 'card',
    },
  },
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
    },
    fillData(state, action) {
      Object.assign(state.data, action.payload);
    },
    resetCheckout(state) {
      state.step = 0;
      state.data = { ...checkoutSlice.getInitialState().data };
    },
  },
});

export const { setStep, fillData, resetCheckout } = checkoutSlice.actions;

export default checkoutSlice.reducer;
