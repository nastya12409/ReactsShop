import { configureStore } from '@reduxjs/toolkit';
import { api } from '../shared/api/api';
import { save } from '../shared/utils/storage';
import cart from '../features/cart/cartSlice';
import favorites from '../features/favorites/favoritesSlice';
import auth from '../features/auth/authSlice';
import checkout from '../features/checkout/checkoutSlice';
import orders from '../features/orders/ordersSlice';


export const makeStore = () => {
  const store = configureStore({
    reducer: {
      cart,
      favorites,
      auth,
      checkout,
      orders,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  
  store.subscribe(() => {
    const state = store.getState();
    save('reactshop:cart', state.cart);
    save('reactshop:favorites', state.favorites);
    save('reactshop:orders', state.orders);
    save('reactshop:session', {
      user: state.auth.user,
      token: state.auth.token,
      exp: state.auth.exp,
    });
    if (state.auth.token) localStorage.setItem('reactshop:token', state.auth.token);
    else localStorage.removeItem('reactshop:token');
  });

  return store;
};

export const store = makeStore();
