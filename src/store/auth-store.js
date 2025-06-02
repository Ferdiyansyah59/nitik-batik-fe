// src/store/auth-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// API URL
const API_URL = process.env.API_ROUTE || 'http://localhost:8081/api';

// Create auth store dengan persistensi
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      store: null,
      isLoading: false,
      isLoadingStore: false,
      error: null,

      // Login action
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          // Call API
          const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
          });

          const token = response.data.data.token;
          const user = response.data.data;
          console.log('User logged in:', user);

          // Set auth header untuk requests berikutnya
          axios.defaults.headers.common['Authorization'] = `${token}`;

          // Update state dengan data user dan token dulu
          set({
            user,
            token,
            isLoading: false,
          });

          // ✅ Jika user adalah penjual, coba fetch data toko
          if (user.role === 'penjual') {
            await get().fetchUserStore(user.id);
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Login failed. Please try again.';
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            token: null,
            store: null,
          });
          throw error;
        }
      },

      // ✅ DIPERBAIKI: Fetch store data menggunakan endpoint yang benar
      fetchUserStore: async (userId) => {
        set({ isLoadingStore: true });

        try {
          console.log('Fetching store for user ID:', userId);

          // ✅ Gunakan endpoint yang sudah ada di backend
          const response = await axios.get(`${API_URL}/store/user/${userId}`);

          if (response.data.status && response.data.data) {
            const storeData = response.data.data;
            console.log('Store data found:', storeData);

            set({ store: storeData, isLoadingStore: false });
            return storeData;
          } else {
            // Tidak ada toko untuk user ini (normal untuk user baru)
            console.log('No store found for user ID:', userId);
            set({ store: null, isLoadingStore: false });
            return null;
          }
        } catch (error) {
          console.log('Error fetching store data:', error);

          // ✅ Jika error 404 (store not found), itu normal untuk user baru
          if (error.response?.status === 404) {
            console.log('User does not have a store yet (404 response)');
            set({ store: null, isLoadingStore: false });
            return null;
          }

          // Error lain (connection, server error, etc.)
          console.error('Unexpected error fetching store:', error);
          set({ store: null, isLoadingStore: false });
          return null;
        }
      },

      // Register action
      register: async (name, email, password, role = 'penjual') => {
        try {
          set({ isLoading: true, error: null });

          const response = await axios.post(`${API_URL}/register`, {
            name,
            email,
            password,
            role,
          });

          const token = response.data.data.token;
          const user = response.data.data;

          set({
            user,
            token,
            store: null, // Store null untuk user baru
            isLoading: false,
          });

          axios.defaults.headers.common['Authorization'] = `${token}`;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            'Registration failed. Please try again.';
          set({
            error: errorMessage,
            isLoading: false,
            store: null,
          });
          throw error;
        }
      },

      // Method untuk update data store setelah user membuat toko
      updateStore: async () => {
        const { user, token } = get();
        if (!user || user.role !== 'penjual' || !token) {
          return null;
        }
        return await get().fetchUserStore(user.id);
      },

      // Method untuk set store data (digunakan setelah create store)
      setStore: (storeData) => {
        set({ store: storeData });
      },

      // Method untuk clear data store
      clearStore: () => {
        set({ store: null });
      },

      // Logout action
      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          store: null,
          error: null,
          isLoadingStore: false,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Helper untuk cek autentikasi
      isAuthenticated: () => {
        const token = get().token;
        if (!token) return false;

        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          return decoded.exp > currentTime;
        } catch {
          return false;
        }
      },

      // Helper untuk cek role
      isAdmin: () => {
        return get().user?.role === 'admin';
      },

      isPenjual: () => {
        return get().user?.role === 'penjual';
      },

      isPembeli: () => {
        return get().user?.role === 'pembeli';
      },

      // Helper untuk cek apakah user punya toko
      hasStore: () => {
        const { user, store } = get();
        return (
          user?.role === 'penjual' && store !== null && store !== undefined
        );
      },

      // Helper untuk get store data
      getStore: () => {
        return get().store;
      },

      // Helper untuk cek loading state
      isStoreLoading: () => {
        return get().isLoadingStore;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const cookies = document.cookie.split(';');
          const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : null;
        },
        setItem: (name, value) => {
          document.cookie = `${name}=${value};path=/;max-age=86400`;
        },
        removeItem: (name) => {
          document.cookie = `${name}=;path=/;max-age=0`;
        },
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        store: state.store,
      }),
    },
  ),
);

// Set auth header dari storage saat aplikasi dimuat
if (typeof window !== 'undefined') {
  const token = useAuthStore.getState().token;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `${token}`;
  }
}
