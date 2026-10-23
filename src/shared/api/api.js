import { createApi } from '@reduxjs/toolkit/query/react';
import { http } from './http';
import { axiosBaseQuery } from './axiosBaseQuery';


export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ instance: http }),
  tagTypes: ['Products', 'Product'],
  endpoints: (builder) => ({
    
    getProducts: builder.query({
      query: () => ({ url: '/products', params: { limit: 0 } }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    addProduct: builder.mutation({
      query: (body) => ({ url: '/products/add', method: 'POST', body }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            api.util.updateQueryData('getProducts', undefined, (draft) => {
              draft.products.unshift({
                rating: 0,
                images: [],
                thumbnail: '',
                ...body,
                id: data?.id ?? Date.now(),
              });
            }),
          );
        } catch {
          /* помилку покаже isError у компонента */
        }
      },
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/products/${id}`, method: 'PUT', body: patch }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('getProducts', undefined, (draft) => {
              const product = draft.products.find((p) => p.id === id);
              if (product) Object.assign(product, patch);
            }),
          );
        } catch {
          /* див. вище */
        }
      },
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('getProducts', undefined, (draft) => {
              draft.products = draft.products.filter((p) => p.id !== id);
            }),
          );
        } catch {
          /* див. вище */
        }
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api;
