import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE || 'http://localhost:8081/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const useUserStore = create((set) => ({
  users: [],
  user: null,
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,

  // Get all users
  fetchUsers: async (page = 1, limit = 10, search = '') => {
    set({ loading: true, error: null });
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search) {
        params.search = search;
      }

      const response = await axiosInstance.get('/all-users', { params });

      if (response.data.status) {
        set({
          users: response.data.data.users,
          pagination: response.data.data.pagination,
          loading: false,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch articles',
        loading: false,
      });
      console.error('Error fetching articles:', error);
    }
  },
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

export default useUserStore;
