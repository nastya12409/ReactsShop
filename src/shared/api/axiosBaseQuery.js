import { http } from './http';


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
