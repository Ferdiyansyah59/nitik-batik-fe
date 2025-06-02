// src/store/storeStore.js
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './auth-store';

const API_URL = process.env.API_ROUTE || 'http://localhost:8081/api';

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
    const token =
      localStorage.getItem('token') || useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const useStoreStore = create((set, get) => ({
  store: null,
  loading: false,
  error: null,

  // Get current store from auth store
  getCurrentStore: () => {
    return useAuthStore.getState().store;
  },

  // Check if user has store
  hasStore: () => {
    const store = useAuthStore.getState().store;
    return store !== null && store !== undefined;
  },

  // Create store
  createStore: async (storeData) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating store with data:', storeData);

      const response = await axiosInstance.post('/store', storeData);
      console.log('Create store response:', response.data);

      if (response.data.status) {
        const newStore = response.data.data;
        set({ store: newStore, loading: false });

        // Update auth store dengan data toko baru
        useAuthStore.getState().setStore(newStore);
        console.log('Store created and synced to auth store:', newStore);

        return newStore;
      } else {
        throw new Error(response.data.message || 'Failed to create store');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Gagal Membuat Toko';

      set({
        error: errorMessage,
        loading: false,
      });

      throw new Error(errorMessage);
    }
  },

  // Update store
  updateStore: async (storeId, storeData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/store/${storeId}`, storeData);

      if (response.data.status) {
        const updatedStore = response.data.data;
        set({ store: updatedStore, loading: false });

        // Update auth store juga
        useAuthStore.getState().setStore(updatedStore);

        return updatedStore;
      } else {
        throw new Error(response.data.message || 'Failed to update store');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Gagal Update Toko';

      set({
        error: errorMessage,
        loading: false,
      });

      throw new Error(errorMessage);
    }
  },

  // Delete store
  deleteStore: async (storeId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/store/${storeId}`);

      if (response.data.status) {
        set({ store: null, loading: false });

        // Clear store dari auth store juga
        useAuthStore.getState().clearStore();

        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete store');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Gagal Hapus Toko';

      set({
        error: errorMessage,
        loading: false,
      });

      throw new Error(errorMessage);
    }
  },

  // ✅ DIPERBAIKI: Fetch store data menggunakan endpoint yang benar
  fetchStoreByUserId: async (userId) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching store for user ID:', userId);

      // ✅ Gunakan endpoint yang sudah ada di backend
      const response = await axiosInstance.get(`/store/user/${userId}`);

      if (response.data.status && response.data.data) {
        const storeData = response.data.data;
        console.log('Store found:', storeData);

        set({ store: storeData, loading: false });

        // Update auth store juga
        useAuthStore.getState().setStore(storeData);

        return storeData;
      } else {
        // No store found (OK untuk user baru)
        console.log('No store found for user ID:', userId);
        set({ store: null, loading: false });
        return null;
      }
    } catch (error) {
      console.log('Error fetching store:', error);

      // ✅ Jika error 404, itu normal untuk user yang belum punya toko
      if (error.response?.status === 404) {
        console.log('User does not have a store yet (404 response)');
        set({ store: null, loading: false });
        return null;
      }

      // Error lain
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch store',
        loading: false,
        store: null,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Sync store dengan auth store
  syncWithAuthStore: () => {
    const authStore = useAuthStore.getState().store;
    set({ store: authStore });
  },

  // Force refresh store data
  refreshStore: async () => {
    const user = useAuthStore.getState().user;
    if (user && user.role === 'penjual') {
      try {
        await get().fetchStoreByUserId(user.id);
      } catch (error) {
        console.error('Error refreshing store:', error);
      }
    }
  },
}));

export default useStoreStore;
