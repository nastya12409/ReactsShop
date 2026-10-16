import { http } from './http';

// Міст між RTK Query і axios: дозволяє використовувати кешування
// RTK Query разом з інтерсепторами власного екземпляра axios.
export const axiosBaseQuery =
  ({ instance = http } = {}) =>
  async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await instance({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      return { error: { status: error.status ?? 0, data: error.data, message: error.message } };
    }
  };
