import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE || 'http://localhost:8081/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

const useCategoryProductStore = create((set, get) => ({
  productCategories: [],
  loading: false,
  error: null,

  fetchProductCategory: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.get('/product-category');
      if (res.data.status) {
        set({ productCategories: res.data.data, loading: false });
        console.log('SUKSES LOG DATA ', res);
      } else {
        console.log('API Fetching success but no product categories data');
        set({ store: null, loading: false });
      }
    } catch (err) {
      console.log('🔍 Product Category fetch error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // ✅ Clear products
  clearProductcategories: () => {
    set({
      categories: [],
      product: null,
      error: null,
    });
  },
}));

export default useCategoryProductStore;
