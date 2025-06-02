// src/store/storeStore.js
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './auth-store';

const API_URL =
  process.env.NEXT_PUBLIC_API_ROUTE ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8081/api';

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

  // ✅ Get current store - prioritas ke local store, fallback ke auth store
  getCurrentStore: () => {
    const localStore = get().store;
    const authStore = useAuthStore.getState().store;

    // Prioritas ke local store yang terbaru
    return localStore || authStore;
  },

  // ✅ Check if user has store - lebih robust
  hasStore: () => {
    const localStore = get().store;
    const authStore = useAuthStore.getState().store;

    // Check keduanya, pastikan ada dan valid
    const currentStore = localStore || authStore;
    return (
      currentStore !== null &&
      currentStore !== undefined &&
      (currentStore.id || currentStore.store_id)
    );
  },

  // ✅ Get store ID helper
  getStoreId: () => {
    const store = get().getCurrentStore();
    return store?.id || store?.store_id;
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

        // ✅ Sync dengan auth store
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

        // ✅ Sync dengan auth store
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

        // ✅ Clear store dari auth store juga
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

  // ✅ Fetch store data dengan error handling yang lebih baik
  fetchStoreByUserId: async (userId) => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 Fetching store for user ID:', userId);

      const response = await axiosInstance.get(`/store/user/${userId}`);
      console.log('📡 Store API response:', response.data);

      if (response.data.status && response.data.data) {
        const storeData = response.data.data;
        console.log('✅ Store found:', storeData);

        set({ store: storeData, loading: false });

        // ✅ Sync dengan auth store
        useAuthStore.getState().setStore(storeData);

        return storeData;
      } else {
        // Response sukses tapi tidak ada data
        console.log('ℹ️ API response success but no store data');
        set({ store: null, loading: false });
        return null;
      }
    } catch (error) {
      console.log('🔍 Store fetch error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error,
      });

      // ✅ Handle specific error cases
      if (error.response?.status === 404) {
        console.log(
          'ℹ️ No store found for user (404) - this is normal for new users',
        );
        set({ store: null, loading: false, error: null });

        // ✅ Clear auth store juga jika tidak ada toko
        useAuthStore.getState().clearStore();

        return null;
      }

      // ✅ Error lain yang serius
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch store';

      console.error('❌ Serious error fetching store:', errorMessage);

      set({
        error: errorMessage,
        loading: false,
        store: null,
      });

      throw error;
    }
  },

  // ✅ Fetch store dengan retry mechanism
  fetchStoreWithRetry: async (userId, maxRetries = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch store`);
        const result = await get().fetchStoreByUserId(userId);
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${attempt}s...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    console.error('❌ All fetch attempts failed');
    throw lastError;
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // ✅ Sync store dengan auth store - force update
  syncWithAuthStore: () => {
    const authStore = useAuthStore.getState().store;
    console.log('🔄 Syncing with auth store:', authStore);
    set({ store: authStore });
  },

  // ✅ Force refresh store data dengan user check
  refreshStore: async () => {
    const user = useAuthStore.getState().user;
    console.log('🔄 Refreshing store for user:', user);

    if (user && user.role === 'penjual' && user.id) {
      try {
        await get().fetchStoreByUserId(user.id);
      } catch (error) {
        console.error('❌ Error refreshing store:', error);
        // Don't throw, just log the error
      }
    } else {
      console.log('ℹ️ Cannot refresh store - user not valid or not penjual');
    }
  },

  // ✅ Initialize store data on app start
  initializeStore: async () => {
    const user = useAuthStore.getState().user;

    if (user?.role === 'penjual' && user.id && !get().store) {
      console.log('🚀 Initializing store on app start');
      try {
        await get().fetchStoreByUserId(user.id);
      } catch (error) {
        console.log('ℹ️ Could not initialize store:', error.message);
      }
    }
  },

  // ✅ Clear all store data
  clearStore: () => {
    set({ store: null, error: null, loading: false });
    useAuthStore.getState().clearStore();
  },

  // ✅ Check store validation
  isStoreValid: () => {
    const store = get().getCurrentStore();
    return (
      store &&
      (store.id || store.store_id) &&
      store.name &&
      store.name.trim() !== ''
    );
  },
}));

export default useStoreStore;
