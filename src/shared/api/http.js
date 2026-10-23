import axios from 'axios';



export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dummyjson.com',
  timeout: 15000,
});


http.interceptors.request.use((config) => {
  const token = localStorage.getItem('reactshop:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject({
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message ?? 'Помилка мережі',
    }),
);
