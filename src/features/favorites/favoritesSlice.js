import { createSlice } from '@reduxjs/toolkit';
import { load } from '../../shared/utils/storage';


const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: load('reactshop:favorites', []),
  reducers: {
    toggleFavorite(state, action) {
      const product = action.payload;
      const index = state.findIndex((f) => f.id === product.id);
      if (index >= 0) state.splice(index, 1);
      else
        state.push({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          discountPercentage: product.discountPercentage,
          rating: product.rating,
          brand: product.brand,
          category: product.category,
        });
    },
    removeFavorite(state, action) {
      return state.filter((f) => f.id !== action.payload);
    },
  },
});

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions;

export default favoritesSlice.reducer;

export const selectIsFavorite = (id) => (state) => state.favorites.some((f) => f.id === id);
