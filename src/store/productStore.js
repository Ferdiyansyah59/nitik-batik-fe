import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE || 'http://localhost:8081/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or get from auth store
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const useProductStore = create((set) => ({
  products: [],
  product: null,
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,

  // Get all articles

  // Change pagination
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useProductStore;
