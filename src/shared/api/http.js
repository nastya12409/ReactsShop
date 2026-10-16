import axios from 'axios';

// Централізований шар API: один екземпляр axios для всіх запитів.
// Базова адреса — зі змінної середовища .env.

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dummyjson.com',
  timeout: 15000,
});

// Запит: підставляємо токен, якщо користувач залогінений
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('reactshop:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Відповідь: приводимо помилки до єдиного вигляду { status, message }
http.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject({
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message ?? 'Помилка мережі',
    }),
);
