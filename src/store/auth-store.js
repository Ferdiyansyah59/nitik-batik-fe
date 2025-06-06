// src/store/auth-store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// API URL
const API_URL = process.env.API_ROUTE || 'http://localhost:8081/api';

// ✅ Token validation helper dengan auto-logout
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp > currentTime;

    // ✅ Auto logout jika token expired
    if (!isValid) {
      console.log('🔒 Token expired, auto-logout');
      useAuthStore.getState().logout();
      return false;
    }

    return true;
  } catch (error) {
    console.log('🔒 Invalid token, auto-logout');
    useAuthStore.getState().logout();
    return false;
  }
};

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

      // ✅ Enhanced login with better error handling
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
          });

          const token = response.data.data.token;
          const user = response.data.data;

          // ✅ Validate token before storing
          if (!isTokenValid(token)) {
            throw new Error('Received invalid token from server');
          }

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

      // ✅ Enhanced logout dengan complete cleanup
      logout: () => {
        console.log('🔒 Logging out user');

        // Clear axios auth header
        delete axios.defaults.headers.common['Authorization'];

        // Clear auth state
        set({
          user: null,
          token: null,
          store: null,
          error: null,
          isLoadingStore: false,
        });

        // ✅ Force clear cookies dan localStorage
        if (typeof window !== 'undefined') {
          // Clear cookies
          document.cookie =
            'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

          // Clear localStorage sebagai backup
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('token');
        }
      },

      // ✅ Enhanced authentication check dengan auto-logout
      isAuthenticated: () => {
        const { token, user } = get();

        if (!token || !user) {
          return false;
        }

        // ✅ Validate token expiry dengan auto-logout
        return isTokenValid(token);
      },

      // ✅ Setup auto token validation check
      startTokenValidationTimer: () => {
        // Check token validity every minute
        const interval = setInterval(() => {
          const { token } = get();
          if (token && !isTokenValid(token)) {
            clearInterval(interval);
          }
        }, 60000); // Check setiap 1 menit

        return interval;
      },

      // ... rest of the store methods remain the same
      fetchUserStore: async (userId) => {
        set({ isLoadingStore: true });

        try {
          const response = await axios.get(`${API_URL}/store/user/${userId}`);

          if (response.data.status && response.data.data) {
            const storeData = response.data.data;
            set({ store: storeData, isLoadingStore: false });
            return storeData;
          } else {
            set({ store: null, isLoadingStore: false });
            return null;
          }
        } catch (error) {
          if (error.response?.status === 404) {
            set({ store: null, isLoadingStore: false });
            return null;
          }

          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch store';

          set({
            error: errorMessage,
            isLoadingStore: false,
            store: null,
          });

          return null;
        }
      },

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

          // ✅ Validate token before storing
          if (!isTokenValid(token)) {
            throw new Error('Received invalid token from server');
          }

          set({
            user,
            token,
            store: null,
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

      updateStore: async () => {
        const { user, token } = get();
        if (!user || user.role !== 'penjual' || !token) {
          return null;
        }
        return await get().fetchUserStore(user.id);
      },

      setStore: (storeData) => {
        set({ store: storeData });
      },

      clearStore: () => {
        set({ store: null });
      },

      clearError: () => {
        set({ error: null });
      },

      isAdmin: () => {
        return get().user?.role === 'admin';
      },

      isPenjual: () => {
        return get().user?.role === 'penjual';
      },

      isPembeli: () => {
        return get().user?.role === 'pembeli';
      },

      hasStore: () => {
        const { user, store } = get();
        return (
          user?.role === 'penjual' && store !== null && store !== undefined
        );
      },

      getStore: () => {
        return get().store;
      },

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

// ✅ Setup axios interceptor untuk handle 401 responses
let isSettingUpInterceptor = false;

export const setupAxiosInterceptor = () => {
  if (isSettingUpInterceptor) return;
  isSettingUpInterceptor = true;

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const { token } = useAuthStore.getState();
      if (token && isTokenValid(token)) {
        config.headers.Authorization = `${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor untuk handle 401
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('🔒 Received 401, logging out');
        useAuthStore.getState().logout();

        // Redirect to login if not already there
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );
};

// ✅ Initialize auth dan setup interceptor
if (typeof window !== 'undefined') {
  // Setup interceptor
  setupAxiosInterceptor();

  // Set auth header dari storage saat aplikasi dimuat
  const token = useAuthStore.getState().token;
  if (token && isTokenValid(token)) {
    axios.defaults.headers.common['Authorization'] = `${token}`;

    // Start token validation timer
    useAuthStore.getState().startTokenValidationTimer();
  } else if (token) {
    // Token ada tapi invalid, logout
    useAuthStore.getState().logout();
  }
}
